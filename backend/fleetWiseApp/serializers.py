"""
Serializers pour l'API REST FleetWise.
"""

from rest_framework import serializers
from .models import Camion, Chauffeur, TrajetPeage, ParametresGeneraux

class CamionSerializer(serializers.ModelSerializer):
    """Serializer pour les camions."""
    
    class Meta:
        model = Camion
        fields = ['id', 'nom', 'consommation']
        
    def validate_consommation(self, value):
        """Validation de la consommation."""
        if value <= 0:
            raise serializers.ValidationError("La consommation doit être positive.")
        if value > 100:
            raise serializers.ValidationError("La consommation semble trop élevée.")
        return value

class ChauffeurSerializer(serializers.ModelSerializer):
    """Serializer pour les chauffeurs."""
    
    class Meta:
        model = Chauffeur
        fields = ['id', 'nom', 'email']
        
    def validate_email(self, value):
        """Validation de l'email."""
        if not value:
            raise serializers.ValidationError("L'email est obligatoire.")
        return value.lower()

class TrajetPeageSerializer(serializers.ModelSerializer):
    """Serializer pour les trajets péage."""
    
    class Meta:
        model = TrajetPeage
        fields = ['id', 'ville_depart', 'ville_arrivee', 'prix']
        
    def validate_prix(self, value):
        """Validation du prix."""
        if value < 0:
            raise serializers.ValidationError("Le prix ne peut pas être négatif.")
        return value
        
    def validate(self, data):
        """Validation au niveau objet."""
        if data.get('ville_depart') and data.get('ville_arrivee'):
            if data['ville_depart'].lower() == data['ville_arrivee'].lower():
                raise serializers.ValidationError("Les villes de départ et d'arrivée doivent être différentes.")
        return data

class ParametresGenerauxSerializer(serializers.ModelSerializer):
    """Serializer pour les paramètres généraux."""
    
    class Meta:
        model = ParametresGeneraux
        fields = ['prix_carburant', 'tarif_horaire_chauffeur', 'marge_benefice_par_defaut']
        
    def validate_prix_carburant(self, value):
        """Validation du prix carburant."""
        if value <= 0:
            raise serializers.ValidationError("Le prix carburant doit être positif.")
        return value
        
    def validate_tarif_horaire_chauffeur(self, value):
        """Validation du tarif horaire."""
        if value <= 0:
            raise serializers.ValidationError("Le tarif horaire doit être positif.")
        return value
        
    def validate_marge_benefice_par_defaut(self, value):
        """Validation de la marge bénéfice."""
        if value < 0 or value > 1:
            raise serializers.ValidationError("La marge doit être entre 0 et 1 (ex: 0.20 pour 20%).")
        return value

# Serializers pour les endpoints spéciaux

class CalculerItineraireRequestSerializer(serializers.Serializer):
    """Serializer pour la requête de calcul d'itinéraire."""
    ville_depart = serializers.CharField(max_length=100)
    ville_arrivee = serializers.CharField(max_length=100)
    camion_id = serializers.IntegerField()
    
    def validate_ville_depart(self, value):
        """Validation ville départ."""
        if not value.strip():
            raise serializers.ValidationError("La ville de départ ne peut pas être vide.")
        return value.strip()
        
    def validate_ville_arrivee(self, value):
        """Validation ville arrivée."""
        if not value.strip():
            raise serializers.ValidationError("La ville d'arrivée ne peut pas être vide.")
        return value.strip()
        
    def validate_camion_id(self, value):
        """Validation de l'existence du camion."""
        try:
            Camion.objects.get(id=value)
        except Camion.DoesNotExist:
            raise serializers.ValidationError("Le camion spécifié n'existe pas.")
        return value

class EnvoyerMissionRequestSerializer(serializers.Serializer):
    """Serializer pour la requête d'envoi de mission."""
    chauffeur_id = serializers.IntegerField()
    details_route = serializers.DictField()
    notes = serializers.CharField(required=False, allow_blank=True, max_length=1000)
    
    def validate_chauffeur_id(self, value):
        """Validation de l'existence du chauffeur."""
        try:
            Chauffeur.objects.get(id=value)
        except Chauffeur.DoesNotExist:
            raise serializers.ValidationError("Le chauffeur spécifié n'existe pas.")
        return value

class ItineraireResponseSerializer(serializers.Serializer):
    """Serializer pour la réponse d'itinéraire calculé."""
    index = serializers.IntegerField()
    nom_itineraire = serializers.CharField()
    distance_km = serializers.FloatField()
    duree_heures = serializers.FloatField()
    duree_formattee = serializers.CharField()
    cout_carburant = serializers.FloatField()
    cout_chauffeur = serializers.FloatField()
    cout_peage = serializers.FloatField()
    cout_total = serializers.FloatField()
    prix_client = serializers.FloatField()
    benefice = serializers.FloatField()
    niveau_risque = serializers.CharField()
    recommande = serializers.BooleanField()

class ErrorResponseSerializer(serializers.Serializer):
    """Serializer pour les réponses d'erreur."""
    erreur = serializers.CharField()
    
class SuccessResponseSerializer(serializers.Serializer):
    """Serializer pour les réponses de succès."""
    message = serializers.CharField()
