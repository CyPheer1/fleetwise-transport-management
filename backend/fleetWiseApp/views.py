"""
Vues API pour FleetWise - Endpoints REST avec Django REST Framework.
"""

import logging
import unicodedata
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from django.http import Http404
from django.db.models import Q

from .models import Camion, Chauffeur, TrajetPeage, ParametresGeneraux
from .serializers import (
    CamionSerializer, ChauffeurSerializer, TrajetPeageSerializer, 
    ParametresGenerauxSerializer, CalculerItineraireRequestSerializer,
    EnvoyerMissionRequestSerializer, ItineraireResponseSerializer,
    ErrorResponseSerializer, SuccessResponseSerializer
)
from .services import CalculateurDeCout, EnvoyeurEmailChauffeur

logger = logging.getLogger(__name__)

# ViewSets CRUD standards

class CamionViewSet(viewsets.ModelViewSet):
    """
    API endpoints pour la gestion des camions.
    Fournit les opérations CRUD complètes.
    """
    queryset = Camion.objects.all().order_by('nom')
    serializer_class = CamionSerializer
    permission_classes = [AllowAny]

class ChauffeurViewSet(viewsets.ModelViewSet):
    """
    API endpoints pour la gestion des chauffeurs.
    Fournit les opérations CRUD complètes.
    """
    queryset = Chauffeur.objects.all().order_by('nom')
    serializer_class = ChauffeurSerializer
    permission_classes = [AllowAny]

class TrajetPeageViewSet(viewsets.ModelViewSet):
    """
    API endpoints pour la gestion des trajets péage.
    Fournit les opérations CRUD complètes.
    """
    queryset = TrajetPeage.objects.all().order_by('ville_depart')
    serializer_class = TrajetPeageSerializer
    permission_classes = [AllowAny]

# Vues spécialisées

class ParametresGenerauxView(APIView):
    """
    API endpoint pour la gestion des paramètres généraux (singleton).
    GET: Récupère les paramètres actuels
    PUT/PATCH: Met à jour les paramètres
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        """Récupère l'instance singleton des paramètres."""
        try:
            parametres = ParametresGeneraux.load()
            serializer = ParametresGenerauxSerializer(parametres)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Erreur récupération paramètres: {e}")
            return Response(
                {"erreur": "Erreur lors de la récupération des paramètres."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def put(self, request):
        """Met à jour les paramètres généraux."""
        try:
            parametres = ParametresGeneraux.load()
            serializer = ParametresGenerauxSerializer(parametres, data=request.data)
            
            if serializer.is_valid():
                serializer.save()
                logger.info("Paramètres généraux mis à jour avec succès")
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Erreur mise à jour paramètres: {e}")
            return Response(
                {"erreur": "Erreur lors de la mise à jour des paramètres."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def patch(self, request):
        """Met à jour partiellement les paramètres généraux."""
        return self.put(request)  # Même logique pour PUT et PATCH dans ce cas

@api_view(['POST'])
@permission_classes([AllowAny])
def calculer_itineraire(request):
    """
    Endpoint principal: /api/calculer-itineraire/
    
    Calcule les itinéraires entre deux villes avec un camion spécifique.
    Retourne une liste d'options avec coûts détaillés et recommandation.
    """
    try:
        # Validation des données d'entrée
        serializer = CalculerItineraireRequestSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                {"erreur": f"Données invalides: {serializer.errors}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Extraction des données validées
        ville_depart = serializer.validated_data['ville_depart']
        ville_arrivee = serializer.validated_data['ville_arrivee']
        camion_id = serializer.validated_data['camion_id']
        
        logger.info(f"Calcul itinéraire: {ville_depart} -> {ville_arrivee} (Camion: {camion_id})")
        
        # Utilisation du service de calcul
        calculateur = CalculateurDeCout()
        itineraires = calculateur.calculer_itineraires(ville_depart, ville_arrivee, camion_id)
        
        # Sérialisation de la réponse
        response_serializer = ItineraireResponseSerializer(itineraires, many=True)
        
        logger.info(f"Calcul terminé: {len(itineraires)} itinéraires trouvés")
        return Response(response_serializer.data, status=status.HTTP_200_OK)
        
    except ValueError as ve:
        logger.warning(f"Erreur validation calcul itinéraire: {ve}")
        return Response(
            {"erreur": str(ve)},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        logger.error(f"Erreur inattendue calcul itinéraire: {e}")
        return Response(
            {"erreur": "Erreur interne du serveur lors du calcul."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def envoyer_mission(request):
    """
    Endpoint: /api/envoyer-mission/
    
    Envoie un email de mission à un chauffeur sélectionné.
    Ne contient aucune information financière, uniquement les détails opérationnels.
    """
    try:
        # Validation des données d'entrée
        serializer = EnvoyerMissionRequestSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                {"erreur": f"Données invalides: {serializer.errors}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Extraction des données validées
        chauffeur_id = serializer.validated_data['chauffeur_id']
        details_route = serializer.validated_data['details_route']
        notes = serializer.validated_data.get('notes', '')
        
        logger.info(f"Envoi mission au chauffeur {chauffeur_id}")
        
        # Utilisation du service d'envoi d'email
        envoyeur = EnvoyeurEmailChauffeur()
        succes = envoyeur.envoyer_mission(chauffeur_id, details_route, notes)
        
        if succes:
            return Response(
                {"message": "Mission envoyée avec succès."},
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                {"erreur": "Échec de l'envoi de l'email."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
    except ValueError as ve:
        logger.warning(f"Erreur validation envoi mission: {ve}")
        return Response(
            {"erreur": str(ve)},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        logger.error(f"Erreur inattendue envoi mission: {e}")
        return Response(
            {"erreur": "Erreur interne du serveur lors de l'envoi."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# Vues utilitaires pour le statut de l'API

@api_view(['GET'])
@permission_classes([AllowAny])
def api_status(request):
    """
    Endpoint de vérification du statut de l'API.
    Utile pour les tests de connectivité frontend.
    """
    return Response(
        {
            "status": "OK",
            "message": "API FleetWise opérationnelle",
            "version": "1.0.0"
        },
        status=status.HTTP_200_OK
    )

@api_view(['GET'])
@permission_classes([AllowAny])
def api_health(request):
    """
    Endpoint de vérification de santé de l'API.
    Vérifie la connectivité à la base de données.
    """
    try:
        # Test de connectivité DB
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            
        # Vérification des paramètres système
        parametres = ParametresGeneraux.load()
        
        return Response(
            {
                "status": "Healthy",
                "database": "Connected",
                "settings": "Loaded"
            },
            status=status.HTTP_200_OK
        )
    except Exception as e:
        logger.error(f"Erreur health check: {e}")
        return Response(
            {
                "status": "Unhealthy",
                "error": str(e)
            },
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

def normalize_text(text):
    """
    Normalise le texte en supprimant les accents et en convertissant en minuscules.
    Utilisé pour améliorer la correspondance des noms de villes.
    """
    if not text:
        return ""
    
    # Supprimer les accents
    normalized = unicodedata.normalize('NFD', text)
    without_accents = ''.join(char for char in normalized if unicodedata.category(char) != 'Mn')
    
    return without_accents.lower().strip()

@api_view(['GET'])
@permission_classes([AllowAny])
def cities_autocomplete(request):
    """
    Endpoint d'autocomplétion pour les noms de villes avec gestion des accents.
    
    Paramètres:
        term (str): Terme de recherche pour filtrer les villes
        
    Retourne:
        JSON array des noms de villes correspondants
        
    Exemple:
        GET /api/cities/autocomplete/?term=Casa
        → ["Casablanca", "Casablanca Centre"]
        
        GET /api/cities/autocomplete/?term=Fes (sans accent)
        → ["Fès"] (avec accent)
    """
    try:
        # Récupération du terme de recherche
        term = request.GET.get('term', '').strip()
        
        # Validation du terme de recherche
        if not term:
            return Response([], status=status.HTTP_200_OK)
        
        if len(term) < 2:
            return Response([], status=status.HTTP_200_OK)
        
        # Normaliser le terme de recherche pour la comparaison
        normalized_term = normalize_text(term)
        
        # Récupérer toutes les villes distinctes de la base de données
        departure_cities = TrajetPeage.objects.values_list('ville_depart', flat=True).distinct()
        arrival_cities = TrajetPeage.objects.values_list('ville_arrivee', flat=True).distinct()
        
        # Combinaison et déduplication des résultats
        all_cities = set(departure_cities) | set(arrival_cities)
        
        # Filtrage avec gestion des accents
        matching_cities = []
        for city in all_cities:
            if city:  # S'assurer que la ville n'est pas None
                # Vérification exacte (avec accents)
                if city.lower().startswith(term.lower()):
                    matching_cities.append(city)
                # Vérification sans accents (fallback)
                elif normalize_text(city).startswith(normalized_term):
                    matching_cities.append(city)
        
        # Tri alphabétique des résultats
        sorted_cities = sorted(matching_cities)
        
        # Limitation à 10 résultats maximum pour les performances
        limited_cities = sorted_cities[:10]
        
        logger.info(f"Autocomplete recherche: '{term}' (normalisé: '{normalized_term}') → {len(limited_cities)} résultats")
        
        return Response(limited_cities, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Erreur autocomplete villes: {e}")
        return Response(
            {"erreur": "Erreur lors de la recherche des villes."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
