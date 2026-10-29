from django.db import models
from django.core.exceptions import ValidationError

class Camion(models.Model):
    """Table pour gérer l'inventaire des véhicules de la flotte."""
    nom = models.CharField(max_length=100, unique=True, help_text="Nom ou identifiant du camion")
    consommation = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        help_text="Consommation en litres pour 100km"
    )
    
    class Meta:
        db_table = 'camion'
        verbose_name = 'Camion'
        verbose_name_plural = 'Camions'
    
    def __str__(self):
        return self.nom

class Chauffeur(models.Model):
    """Table pour gérer la liste des chauffeurs et leurs informations de contact."""
    nom = models.CharField(max_length=100, help_text="Nom complet du chauffeur")
    email = models.EmailField(unique=True, help_text="Email utilisé pour l'envoi des missions")
    
    class Meta:
        db_table = 'chauffeur'
        verbose_name = 'Chauffeur'
        verbose_name_plural = 'Chauffeurs'
    
    def __str__(self):
        return self.nom

class TrajetPeage(models.Model):
    """Base de connaissance interne pour les tarifs de péage."""
    ville_depart = models.CharField(max_length=100, help_text="Ville de départ du tronçon")
    ville_arrivee = models.CharField(max_length=100, help_text="Ville d'arrivée du tronçon")
    prix = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        help_text="Prix du péage en Dirhams (MAD)"
    )
    
    class Meta:
        db_table = 'trajet_peage'
        verbose_name = 'Trajet Péage'
        verbose_name_plural = 'Trajets Péage'
    
    def __str__(self):
        return f"{self.ville_depart} → {self.ville_arrivee} ({self.prix} MAD)"

class ParametresGeneraux(models.Model):
    """
    Variables économiques de l'application - TABLE SINGLETON.
    Cette table ne doit contenir qu'une seule et unique ligne.
    """
    id = models.IntegerField(primary_key=True, default=1, editable=False)
    prix_carburant = models.DecimalField(
        max_digits=6, 
        decimal_places=2, 
        help_text="Prix actuel d'un litre de carburant"
    )
    tarif_horaire_chauffeur = models.DecimalField(
        max_digits=6, 
        decimal_places=2, 
        help_text="Coût horaire d'un chauffeur"
    )
    marge_benefice_par_defaut = models.DecimalField(
        max_digits=4, 
        decimal_places=3, 
        help_text="Marge de bénéfice par défaut (ex: 0.20 pour 20%)"
    )
    
    class Meta:
        db_table = 'parametres_generaux'
        verbose_name = 'Paramètres Généraux'
        verbose_name_plural = 'Paramètres Généraux'
    
    def save(self, *args, **kwargs):
        """Garantir qu'il n'y ait qu'une seule instance (singleton)."""
        self.pk = 1
        super().save(*args, **kwargs)
    
    def delete(self, *args, **kwargs):
        """Empêcher la suppression de l'instance singleton."""
        raise ValidationError("Les paramètres généraux ne peuvent pas être supprimés.")
    
    @classmethod
    def load(cls):
        """Récupérer ou créer l'instance singleton."""
        obj, created = cls.objects.get_or_create(pk=1)
        if created:
            # Valeurs par défaut si première création
            obj.prix_carburant = 14.50
            obj.tarif_horaire_chauffeur = 50.00
            obj.marge_benefice_par_defaut = 0.200
            obj.save()
        return obj
    
    def __str__(self):
        return f"Paramètres - Carburant: {self.prix_carburant} MAD/L"
