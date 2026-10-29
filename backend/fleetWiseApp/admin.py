from django.contrib import admin
from .models import Camion, Chauffeur, TrajetPeage, ParametresGeneraux

@admin.register(Camion)
class CamionAdmin(admin.ModelAdmin):
    list_display = ('nom', 'consommation')
    search_fields = ('nom',)
    list_filter = ('consommation',)

@admin.register(Chauffeur)
class ChauffeurAdmin(admin.ModelAdmin):
    list_display = ('nom', 'email')
    search_fields = ('nom', 'email')

@admin.register(TrajetPeage)
class TrajetPeageAdmin(admin.ModelAdmin):
    list_display = ('ville_depart', 'ville_arrivee', 'prix')
    search_fields = ('ville_depart', 'ville_arrivee')
    list_filter = ('prix',)

@admin.register(ParametresGeneraux)
class ParametresGenerauxAdmin(admin.ModelAdmin):
    list_display = ('prix_carburant', 'tarif_horaire_chauffeur', 'marge_benefice_par_defaut')
    
    def has_add_permission(self, request):
        # Empêcher l'ajout de nouvelles instances (singleton)
        return not ParametresGeneraux.objects.exists()
    
    def has_delete_permission(self, request, obj=None):
        # Empêcher la suppression de l'instance singleton
        return False
