"""
Configuration des URLs principales pour le projet FleetWise.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    # Interface d'administration Django
    path('admin/', admin.site.urls),
    
    # API REST FleetWise
    path('api/', include('fleetWiseApp.urls')),
]
