"""
Services métier pour FleetWise - Logique principale de l'application.
Implémente les fonctionnalités CalculateurDeCout et EnvoyeurEmailChauffeur.
"""

import requests
import logging
from decimal import Decimal, ROUND_HALF_UP
from typing import List, Dict, Any, Optional
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from .models import Camion, Chauffeur, TrajetPeage, ParametresGeneraux

logger = logging.getLogger(__name__)

class OpenRouteServiceClient:
    """Client pour l'API OpenRouteService."""
    
    def __init__(self):
        self.api_key = settings.OPENROUTESERVICE_API_KEY
        self.base_url = settings.OPENROUTESERVICE_BASE_URL
        self.headers = {
            'Authorization': self.api_key,
            'Content-Type': 'application/json'
        }
    
    def geocode_city(self, city_name: str) -> Optional[tuple]:
        """
        Convertit un nom de ville en coordonnées géographiques.
        Retourne (longitude, latitude) ou None si erreur.
        """
        try:
            url = f"{self.base_url}/geocode/search"
            params = {
                'text': city_name,
                'boundary.country': 'MA',  # Limiter au Maroc
                'size': 1
            }
            
            response = requests.get(url, params=params, headers=self.headers, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            features = data.get('features', [])
            
            if not features:
                logger.error(f"Aucun résultat de géocodage pour: {city_name}")
                return None
            
            coords = features[0]['geometry']['coordinates']
            return (coords[0], coords[1])  # (longitude, latitude)
            
        except requests.RequestException as e:
            logger.error(f"Erreur géocodage pour {city_name}: {e}")
            if hasattr(e, 'response') and e.response is not None:
                logger.error(f"Code d'erreur: {e.response.status_code}")
                logger.error(f"Réponse: {e.response.text}")
            return None
    
    def get_routes(self, start_coords: tuple, end_coords: tuple) -> Optional[Dict]:
        """
        Récupère les itinéraires entre deux points avec alternatives.
        Adapte automatiquement la configuration selon la distance estimée.
        """
        try:
            # Calcul approximatif de la distance pour choisir la stratégie
            distance_approx = self._calculate_distance_km(start_coords, end_coords)
            use_alternatives = distance_approx < 120  # Alternatives seulement pour < 120km
            
            url = f"{self.base_url}/v2/directions/driving-hgv"
            
            payload = {
                'coordinates': [list(start_coords), list(end_coords)],
                'extra_info': ['tollways', 'waytype']
            }
            
            # Ajouter alternatives seulement pour les courtes distances
            if use_alternatives:
                payload['alternative_routes'] = {
                    'target_count': 2,
                    'weight_factor': 1.2,
                    'share_factor': 0.6
                }
                logger.info(f"Distance courte ({distance_approx:.1f}km) - alternatives activées")
            else:
                logger.info(f"Distance longue ({distance_approx:.1f}km) - route simple uniquement")
            
            response = requests.post(url, json=payload, headers=self.headers, timeout=20)
            
            # Si le profil HGV échoue, essayer driving-car
            if response.status_code == 400:
                logger.warning("Limite HGV dépassée, essai avec le profil driving-car")
                url = f"{self.base_url}/v2/directions/driving-car"
                response = requests.post(url, json=payload, headers=self.headers, timeout=20)
            
            response.raise_for_status()
            return response.json()
            
        except requests.RequestException as e:
            logger.error(f"Erreur récupération itinéraires: {e}")
            if hasattr(e, 'response') and e.response is not None:
                logger.error(f"Code d'erreur: {e.response.status_code}")
                logger.error(f"Réponse: {e.response.text}")
            return None
    
    def _calculate_distance_km(self, start_coords: tuple, end_coords: tuple) -> float:
        """
        Calcule la distance approximative entre deux points (formule de Haversine).
        Retourne la distance en kilomètres.
        """
        import math
        
        lon1, lat1 = start_coords
        lon2, lat2 = end_coords
        
        # Conversion en radians
        lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
        
        # Formule de Haversine
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        r = 6371  # Rayon de la Terre en kilomètres
        
        return c * r

class CalculateurDeCout:
    """
    Moteur de calcul des coûts d'itinéraires.
    Cœur du système FleetWise.
    """
    
    def __init__(self):
        self.ors_client = OpenRouteServiceClient()
    
    def calculer_itineraires(self, ville_depart: str, ville_arrivee: str, camion_id: int) -> List[Dict[str, Any]]:
        """
        Calcule tous les itinéraires possibles avec leurs coûts.
        
        Args:
            ville_depart: Nom de la ville de départ
            ville_arrivee: Nom de la ville d'arrivée  
            camion_id: ID du camion sélectionné
            
        Returns:
            Liste des itinéraires analysés avec coûts et recommandations
        """
        try:
            # Validation des entrées
            if not ville_depart.strip() or not ville_arrivee.strip():
                raise ValueError("Les villes ne peuvent pas être vides")
            
            # Récupération du camion
            try:
                camion = Camion.objects.get(id=camion_id)
            except Camion.DoesNotExist:
                raise ValueError(f"Camion avec ID {camion_id} introuvable")
            
            # Récupération des paramètres économiques
            parametres = ParametresGeneraux.load()
            
            # Géocodage des villes
            logger.info(f"Géocodage: {ville_depart} -> {ville_arrivee}")
            
            coords_depart = self.ors_client.geocode_city(ville_depart)
            if not coords_depart:
                raise ValueError(f"Impossible de localiser la ville: {ville_depart}")
            
            coords_arrivee = self.ors_client.geocode_city(ville_arrivee)
            if not coords_arrivee:
                raise ValueError(f"Impossible de localiser la ville: {ville_arrivee}")
            
            # Récupération des itinéraires
            routes_data = self.ors_client.get_routes(coords_depart, coords_arrivee)
            if not routes_data:
                raise ValueError("Impossible de calculer les itinéraires")
            
            # Analyse des itinéraires
            itineraires_analyses = []
            routes = routes_data.get('routes', [])
            
            if not routes:
                raise ValueError("Aucun itinéraire trouvé")
            
            for idx, route in enumerate(routes):
                analyse = self._analyser_itineraire(
                    route, 
                    camion, 
                    parametres, 
                    ville_depart, 
                    ville_arrivee,
                    idx
                )
                itineraires_analyses.append(analyse)
            
            # Déterminer l'itinéraire recommandé
            self._determiner_recommandation(itineraires_analyses)
            
            logger.info(f"Analyse terminée: {len(itineraires_analyses)} itinéraires")
            return itineraires_analyses
            
        except Exception as e:
            logger.error(f"Erreur calcul itinéraires: {e}")
            raise
    
    def _analyser_itineraire(self, route: Dict, camion: Camion, parametres: ParametresGeneraux, 
                           ville_depart: str, ville_arrivee: str, index: int) -> Dict[str, Any]:
        """Analyse détaillée d'un itinéraire spécifique."""
        
        # Extraction des données brutes de l'API
        distance_metres = route['summary']['distance']
        duree_secondes = route['summary']['duration']
        
        # Conversions d'unités
        distance_km = distance_metres / 1000
        duree_heures = duree_secondes / 3600
        
        # Calcul du coût carburant
        cout_carburant = self._calculer_cout_carburant(distance_km, camion, parametres)
        
        # Calcul du coût chauffeur
        cout_chauffeur = self._calculer_cout_chauffeur(duree_heures, parametres)
        
        # Calcul du coût péage
        cout_peage = self._calculer_cout_peage(route, ville_depart, ville_arrivee)
        
        # Évaluation du niveau de risque
        niveau_risque = self._evaluer_risque(route)
        
        # Calculs financiers finaux
        cout_total = cout_carburant + cout_chauffeur + cout_peage
        prix_client = cout_total * (1 + parametres.marge_benefice_par_defaut)
        benefice = prix_client - cout_total
        
        # Score pour la recommandation (coût prioritaire)
        score_recommandation = (float(cout_total) * 0.6) + (duree_heures * 50 * 0.4)
        
        return {
            'index': index,
            'nom_itineraire': self._generer_nom_itineraire(route, index),
            'distance_km': round(distance_km, 1),
            'duree_heures': round(duree_heures, 2),
            'duree_formattee': self._formater_duree(duree_heures),
            'cout_carburant': float(cout_carburant),
            'cout_chauffeur': float(cout_chauffeur),
            'cout_peage': float(cout_peage),
            'cout_total': float(cout_total),
            'prix_client': float(prix_client),
            'benefice': float(benefice),
            'niveau_risque': niveau_risque,
            'score_recommandation': score_recommandation,
            'recommande': False,  # Sera mis à jour après comparaison
            'details_route': route  # Pour l'envoi d'email
        }
    
    def _calculer_cout_carburant(self, distance_km: float, camion: Camion, parametres: ParametresGeneraux) -> Decimal:
        """Calcul précis du coût carburant."""
        distance_decimal = Decimal(str(distance_km))
        consommation_voyage = (distance_decimal / 100) * camion.consommation
        cout = consommation_voyage * parametres.prix_carburant
        return cout.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    
    def _calculer_cout_chauffeur(self, duree_heures: float, parametres: ParametresGeneraux) -> Decimal:
        """Calcul du coût chauffeur basé sur la durée."""
        cout = Decimal(str(duree_heures)) * parametres.tarif_horaire_chauffeur
        return cout.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    
    def _calculer_cout_peage(self, route: Dict, ville_depart: str, ville_arrivee: str) -> Decimal:
        """
        Calcul intelligent du coût péage basé sur la détection d'autoroutes.
        Inclut un mécanisme de fallback pour les trajets connus.
        """
        cout_peage = Decimal('0.00')
        
        # Vérifier la présence d'autoroutes dans l'itinéraire
        a_autoroute = self._detecter_autoroute(route)
        logger.info(f"Détection autoroute pour {ville_depart}->{ville_arrivee}: {a_autoroute}")
        
        # Recherche dans la base de données des péages
        try:
            # Recherche insensible à la casse
            trajet_peage = TrajetPeage.objects.filter(
                ville_depart__iexact=ville_depart.strip(),
                ville_arrivee__iexact=ville_arrivee.strip()
            ).first()
            
            if trajet_peage:
                if a_autoroute:
                    # Autoroute détectée ET péage configuré - appliquer le péage
                    cout_peage = trajet_peage.prix
                    logger.info(f"Péage trouvé avec autoroute détectée: {ville_depart}->{ville_arrivee}: {cout_peage} MAD")
                else:
                    # Péage configuré mais autoroute non détectée - fallback intelligent
                    # Appliquer quand même le péage car il est configuré dans notre base
                    cout_peage = trajet_peage.prix
                    logger.warning(f"Péage appliqué en fallback (autoroute non détectée): {ville_depart}->{ville_arrivee}: {cout_peage} MAD")
            else:
                logger.info(f"Aucun péage configuré pour: {ville_depart}->{ville_arrivee}")
                    
        except Exception as e:
            logger.error(f"Erreur recherche péage: {e}")
        
        return cout_peage
    
    def _detecter_autoroute(self, route: Dict) -> bool:
        """Détecte si l'itinéraire utilise des autoroutes."""
        try:
            extras = route.get('extras', {})
            waytype_info = extras.get('waytype', {})
            values = waytype_info.get('values', [])
            summary = waytype_info.get('summary', [])
            
            logger.debug(f"Analyse waytype - summary: {summary}")
            
            # Vérifier dans les segments si il y a des autoroutes
            total_motorway_distance = 0
            for segment_info in summary:
                if segment_info.get('value') == 1:  # 1 = motorway dans ORS
                    distance = segment_info.get('distance', 0)
                    total_motorway_distance += distance
                    logger.debug(f"Segment autoroute trouvé: {distance}m")
            
            # Réduire le seuil à 500m pour être moins restrictif
            # et détecter même les courtes sections d'autoroute
            has_motorway = total_motorway_distance > 500
            logger.info(f"Distance totale autoroute: {total_motorway_distance}m, seuil: 500m, détecté: {has_motorway}")
            
            return has_motorway
            
        except Exception as e:
            logger.error(f"Erreur détection autoroute: {e}")
            logger.error(f"Structure route reçue: {route.keys()}")
            return False
    
    def _evaluer_risque(self, route: Dict) -> str:
        """Évalue le niveau de risque basé sur les types de routes."""
        try:
            extras = route.get('extras', {})
            waytype_info = extras.get('waytype', {})
            summary = waytype_info.get('summary', [])
            
            total_distance = route['summary']['distance']
            distance_autoroute = 0
            distance_nationale = 0
            
            for segment_info in summary:
                distance = segment_info.get('distance', 0)
                way_type = segment_info.get('value', 0)
                
                if way_type == 1:  # Motorway
                    distance_autoroute += distance
                elif way_type in [2, 3]:  # Primary/Secondary roads
                    distance_nationale += distance
            
            pourcentage_autoroute = (distance_autoroute / total_distance) * 100
            
            if pourcentage_autoroute > 70:
                return "Faible"
            elif pourcentage_autoroute > 30:
                return "Moyen"
            else:
                return "Élevé"
                
        except Exception:
            return "Moyen"
    
    def _generer_nom_itineraire(self, route: Dict, index: int) -> str:
        """Génère un nom descriptif pour l'itinéraire."""
        try:
            extras = route.get('extras', {})
            waytype_info = extras.get('waytype', {})
            summary = waytype_info.get('summary', [])
            
            # Analyser les types de routes dominants
            total_distance = route['summary']['distance']
            distance_autoroute = 0
            
            for segment_info in summary:
                if segment_info.get('value') == 1:  # Motorway
                    distance_autoroute += segment_info.get('distance', 0)
            
            pourcentage_autoroute = (distance_autoroute / total_distance) * 100
            
            if pourcentage_autoroute > 70:
                return f"Itinéraire Autoroute (A{index + 1})"
            elif pourcentage_autoroute > 30:
                return f"Itinéraire Mixte (M{index + 1})"
            else:
                return f"Route Nationale (N{index + 1})"
                
        except Exception:
            return f"Itinéraire {index + 1}"
    
    def _formater_duree(self, duree_heures: float) -> str:
        """Formate la durée en format lisible."""
        heures = int(duree_heures)
        minutes = int((duree_heures - heures) * 60)
        
        if heures > 0:
            return f"{heures}h {minutes}min"
        else:
            return f"{minutes}min"
    
    def _determiner_recommandation(self, itineraires: List[Dict]) -> None:
        """Détermine l'itinéraire recommandé basé sur le score."""
        if not itineraires:
            return
        
        # Trouver l'itinéraire avec le meilleur score (plus bas)
        meilleur = min(itineraires, key=lambda x: x['score_recommandation'])
        meilleur['recommande'] = True

class EnvoyeurEmailChauffeur:
    """
    Service d'envoi d'emails de mission aux chauffeurs.
    """
    
    def envoyer_mission(self, chauffeur_id: int, details_route: Dict, notes: str = "") -> bool:
        """
        Envoie un email de mission à un chauffeur.
        
        Args:
            chauffeur_id: ID du chauffeur destinataire
            details_route: Détails complets de l'itinéraire sélectionné
            notes: Notes optionnelles du gestionnaire
            
        Returns:
            True si envoi réussi, False sinon
        """
        try:
            # Récupération du chauffeur
            try:
                chauffeur = Chauffeur.objects.get(id=chauffeur_id)
            except Chauffeur.DoesNotExist:
                raise ValueError(f"Chauffeur avec ID {chauffeur_id} introuvable")
            
            # Validation de l'email
            if not chauffeur.email:
                raise ValueError("Le chauffeur n'a pas d'adresse email configurée")
            
            # Composition du contenu email
            sujet = self._composer_sujet(details_route)
            contenu_html = self._composer_contenu_html(chauffeur, details_route, notes)
            contenu_text = self._composer_contenu_text(chauffeur, details_route, notes)
            
            # Envoi de l'email
            reussi = send_mail(
                subject=sujet,
                message=contenu_text,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[chauffeur.email],
                html_message=contenu_html,
                fail_silently=False,
            )
            
            if reussi:
                logger.info(f"Mission envoyée avec succès à {chauffeur.email}")
                return True
            else:
                logger.error(f"Échec envoi mission à {chauffeur.email}")
                return False
                
        except Exception as e:
            logger.error(f"Erreur envoi email mission: {e}")
            return False
    
    def _composer_sujet(self, details_route: Dict) -> str:
        """Compose le sujet de l'email."""
        # Extraire les villes depuis les détails de route (peut nécessiter adaptation)
        return "Nouvelle Mission de Transport - FleetWise"
    
    def _composer_contenu_html(self, chauffeur: Chauffeur, details_route: Dict, notes: str) -> str:
        """Compose le contenu HTML de l'email."""
        from datetime import datetime
        
        # Génération du lien Google Maps
        lien_maps = self._generer_lien_google_maps(details_route)
        
        contexte = {
            'chauffeur': chauffeur,
            'details_route': details_route,
            'notes': notes,
            'lien_maps': lien_maps,
            'date_assignation': datetime.now().strftime('%d/%m/%Y à %H:%M'),
        }
        
        # Template HTML simple (sera créé séparément)
        template_html = """
        <html>
        <body style="font-family: Arial, sans-serif;">
            <h2>🚛 Nouvelle Mission de Transport</h2>
            
            <p>Bonjour <strong>{{ chauffeur.nom }}</strong>,</p>
            
            <p>Vous avez une nouvelle mission de transport :</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
                <h3>📍 Détails de la Mission</h3>
                <p><strong>📏 Distance:</strong> {{ details_route.distance_km }} km</p>
                <p><strong>⏱️ Temps estimé:</strong> {{ details_route.duree_formattee }}</p>
                <p><strong>🛣️ Itinéraire:</strong> {{ details_route.nom_itineraire }}</p>
                <p><strong>⚠️ Niveau de risque:</strong> {{ details_route.niveau_risque }}</p>
            </div>
            
            {% if notes %}
            <div style="background-color: #e7f3ff; padding: 10px; border-radius: 5px; margin-top: 15px;">
                <h4>📝 Notes spéciales:</h4>
                <p>{{ notes }}</p>
            </div>
            {% endif %}
            
            <p><strong>🗺️ Lien de navigation:</strong></p>
            <p><a href="{{ lien_maps }}" style="color: #007bff;">Ouvrir dans Google Maps</a></p>
            
            <hr style="margin: 20px 0;">
            <p style="font-size: 12px; color: #666;">
                Mission assignée le {{ date_assignation }}<br>
                Bon voyage et soyez prudent !<br>
                <strong>Équipe FleetWise</strong>
            </p>
        </body>
        </html>
        """
        
        # Rendu simple du template
        from django.template import Template, Context
        template = Template(template_html)
        return template.render(Context(contexte))
    
    def _composer_contenu_text(self, chauffeur: Chauffeur, details_route: Dict, notes: str) -> str:
        """Compose le contenu texte de l'email."""
        from datetime import datetime
        
        lien_maps = self._generer_lien_google_maps(details_route)
        
        contenu = f"""
Bonjour {chauffeur.nom},

Vous avez une nouvelle mission de transport :

DÉTAILS DE LA MISSION
==================
Distance: {details_route['distance_km']} km
Temps estimé: {details_route['duree_formattee']}
Itinéraire: {details_route['nom_itineraire']}
Niveau de risque: {details_route['niveau_risque']}

"""
        
        if notes:
            contenu += f"""
NOTES SPÉCIALES
==============
{notes}

"""
        
        contenu += f"""
NAVIGATION
=========
Lien Google Maps: {lien_maps}

---
Mission assignée le {datetime.now().strftime('%d/%m/%Y à %H:%M')}
Bon voyage et soyez prudent !
Équipe FleetWise
"""
        
        return contenu
    
    def _generer_lien_google_maps(self, details_route: Dict) -> str:
        """Génère un lien Google Maps pour la navigation."""
        # Note: Ceci est une implémentation simplifiée
        # En pratique, il faudrait extraire les coordonnées de début/fin depuis details_route
        return "https://www.google.com/maps/dir/StartCity/EndCity"

