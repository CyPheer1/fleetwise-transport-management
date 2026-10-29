/**
 * FleetWise Enterprise - Route Calculator Form Component
 * Professional form for route calculations
 */

import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import AutocompleteInput from './AutocompleteInput';
import Heroicon from '../../components/ui/Heroicons';

const FormulaireRecherche = ({ 
  onCalculStarted, 
  onCalculCompleted, 
  onCalculError, 
  isLoading 
}) => {
  const [formData, setFormData] = useState({
    villeDepart: '',
    villeArrivee: '',
    camionId: ''
  });
  
  const [camionsList, setCamionsList] = useState([]);
  const [loadingCamions, setLoadingCamions] = useState(true);
  const [formErrors, setFormErrors] = useState({});

  // Load trucks list on component mount
  useEffect(() => {
    chargerCamions();
  }, []);

  const chargerCamions = async () => {
    try {
      setLoadingCamions(true);
      const camions = await api.getCamions();
      setCamionsList(camions);
    } catch (error) {
      console.error('Erreur chargement camions:', error);
      onCalculError('Impossible de charger la liste des camions');
    } finally {
      setLoadingCamions(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.villeDepart.trim()) {
      errors.villeDepart = 'La ville de départ est obligatoire';
    } else if (formData.villeDepart.trim().length < 2) {
      errors.villeDepart = 'Le nom de ville doit contenir au moins 2 caractères';
    }
    
    if (!formData.villeArrivee.trim()) {
      errors.villeArrivee = 'La ville d\'arrivée est obligatoire';
    } else if (formData.villeArrivee.trim().length < 2) {
      errors.villeArrivee = 'Le nom de ville doit contenir au moins 2 caractères';
    }
    
    if (formData.villeDepart.trim().toLowerCase() === formData.villeArrivee.trim().toLowerCase()) {
      errors.villeArrivee = 'La ville d\'arrivée doit être différente de la ville de départ';
    }
    
    if (!formData.camionId) {
      errors.camionId = 'Veuillez sélectionner un camion';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      onCalculStarted();
      
      const resultats = await api.calculerItineraire(
        formData.villeDepart.trim(),
        formData.villeArrivee.trim(),
        parseInt(formData.camionId)
      );
      
      onCalculCompleted(resultats);
      
    } catch (error) {
      onCalculError(error.message || 'Erreur lors du calcul des itinéraires');
    }
  };

  const handleReset = () => {
    setFormData({
      villeDepart: '',
      villeArrivee: '',
      camionId: ''
    });
    setFormErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className="search-form">
      {/* Cities Row */}
      <div className="form-row">
        {/* Departure City */}
        <AutocompleteInput
          id="villeDepart"
          name="villeDepart"
          value={formData.villeDepart}
          onChange={handleInputChange}
          placeholder="Ex: Casablanca"
          disabled={isLoading}
          error={formErrors.villeDepart}
          label="Ville de Départ"
          icon="map-pin"
        />

        {/* Arrival City */}
        <AutocompleteInput
          id="villeArrivee"
          name="villeArrivee"
          value={formData.villeArrivee}
          onChange={handleInputChange}
          placeholder="Ex: Marrakech"
          disabled={isLoading}
          error={formErrors.villeArrivee}
          label="Ville d'Arrivée"
          icon="map"
        />
      </div>

      {/* Truck Selection */}
      <div className="form-group">
        <label htmlFor="camionId" className="form-label" style={{display:'flex',alignItems:'center',gap:'8px',fontWeight:'500'}}>
          <Heroicon icon="truck" size={20} className="text-secondary" />
          Sélection du Camion
        </label>
        
            {loadingCamions ? (
          <div className="loading-select">
            <div className="loading-spinner dark" style={{width: '20px', height: '20px', marginRight: 'var(--space-3)'}}></div>
            <span>Chargement des camions...</span>
          </div>
            ) : (
              <select
                id="camionId"
                name="camionId"
                value={formData.camionId}
                onChange={handleInputChange}
                disabled={isLoading}
                className={`form-control ${formErrors.camionId ? 'error' : ''}`}
                style={{
                  appearance: 'none',
                  backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%236B7280\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right var(--space-4) center',
                  backgroundSize: '16px'
                }}
              >
                <option value="">-- Choisissez un camion --</option>
                {camionsList.map((camion) => (
                  <option key={camion.id} value={camion.id}>
                    {camion.nom} (Consommation: {camion.consommation}L/100km)
                  </option>
                ))}
              </select>
            )}
        
            {formErrors.camionId && (
          <div className="error-message">
            {formErrors.camionId}
          </div>
        )}
      </div>

      {/* Messages */}
      {camionsList.length === 0 && !loadingCamions && (
        <div className="message warning">
          <div className="message-icon"><Heroicon icon="exclamation-triangle" size={20} /></div>
          <div>
            <div style={{fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--space-1)'}}>
              Aucun camion disponible
            </div>
            <div style={{fontSize: 'var(--text-sm)', color: 'var(--text-secondary)'}}>
              Veuillez d'abord ajouter des camions dans la section Administration.
            </div>
          </div>
        </div>
      )}

      <div className="help-message">
        <div className="help-icon"><Heroicon icon="information-circle" size={20} /></div>
        <div>
          <div style={{fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--space-1)'}}>
            Conseil pour des résultats optimaux:
          </div>
          <div style={{fontSize: 'var(--text-sm)', color: 'var(--text-secondary)'}}>
            Utilisez les noms des villes principales du Maroc et vérifiez l'orthographe pour garantir la précision du calcul.
          </div>
        </div>
      </div>

        {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={handleReset}
            disabled={isLoading}
            className="btn"
            style={{ 
              background: 'transparent', 
              border: '1px solid var(--border-color)'
            }}
        >
          <Heroicon icon="arrow-path" size={18} />
          <span>Réinitialiser</span>
          </button>
          
          <button
            type="submit"
            disabled={isLoading || loadingCamions || camionsList.length === 0}
            className="btn"
            style={{ 
              background: '#2563EB',
              color: 'white',
              border: '1px solid #2563EB'
            }}
          >
            {isLoading ? (
              <>
              <div className="loading-spinner light" style={{width: '16px', height: '16px', marginRight: 'var(--space-2)'}}></div>
              <span>Calcul en cours...</span>
              </>
            ) : (
              <span>Calculer les Itinéraires</span>
            )}
          </button>
        </div>
      </form>
  );
};

export default FormulaireRecherche;
