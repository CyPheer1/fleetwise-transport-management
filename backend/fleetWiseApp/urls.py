"""
Configuration des URLs pour l'API FleetWise.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Configuration du routeur DRF pour les ViewSets CRUD
router = DefaultRouter()
router.register(r'camions', views.CamionViewSet)
router.register(r'chauffeurs', views.ChauffeurViewSet)
router.register(r'peages', views.TrajetPeageViewSet)

# URLs spécifiques
urlpatterns = [
    # Endpoints CRUD automatiques via le routeur
    path('', include(router.urls)),
    
    # Endpoints spécialisés selon les spécifications
    path('calculer-itineraire/', views.calculer_itineraire, name='calculer-itineraire'),
    path('envoyer-mission/', views.envoyer_mission, name='envoyer-mission'),
    path('parametres/', views.ParametresGenerauxView.as_view(), name='parametres'),
    
    # Endpoints utilitaires
    path('status/', views.api_status, name='api-status'),
    path('health/', views.api_health, name='api-health'),
    path('cities/autocomplete/', views.cities_autocomplete, name='cities-autocomplete'),
]
