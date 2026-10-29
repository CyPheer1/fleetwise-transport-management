/**
 * Gestion des paramètres généraux - FleetWise
 * Configuration des variables économiques du système
 */

import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const GestionParametres = () => {
  const [parametres, setParametres] = useState({
    prix_carburant: '',
    tarif_horaire_chauffeur: '',
    marge_benefice_par_defaut: ''
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  const [errors, setErrors] = useState({});

  // Chargement des paramètres au montage
  useEffect(() => {
    chargerParametres();
  }, []);

  const chargerParametres = async () => {
    try {
      setIsLoading(true);
      const data = await api.getParametres();
      setParametres(data);
    } catch (error) {
      console.error('Erreur chargement paramètres:', error);
      setMessage({ 
        type: 'error', 
        content: 'Impossible de charger les paramètres' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setParametres(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Nettoyer l'erreur pour ce champ
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Nettoyer le message
    setMessage({ type: '', content: '' });
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validation prix carburant
    const prixCarburant = parseFloat(parametres.prix_carburant);
    if (!parametres.prix_carburant || isNaN(prixCarburant) || prixCarburant <= 0) {
      newErrors.prix_carburant = 'Le prix du carburant doit être un nombre positif';
    } else if (prixCarburant > 50) {
      newErrors.prix_carburant = 'Prix du carburant semble trop élevé (max 50 MAD/L)';
    }
    
    // Validation tarif horaire chauffeur
    const tarifHoraire = parseFloat(parametres.tarif_horaire_chauffeur);
    if (!parametres.tarif_horaire_chauffeur || isNaN(tarifHoraire) || tarifHoraire <= 0) {
      newErrors.tarif_horaire_chauffeur = 'Le tarif horaire doit être un nombre positif';
    } else if (tarifHoraire > 500) {
      newErrors.tarif_horaire_chauffeur = 'Tarif horaire semble trop élevé (max 500 MAD/h)';
    }
    
    // Validation marge bénéfice
    const margeBenefice = parseFloat(parametres.marge_benefice_par_defaut);
    if (!parametres.marge_benefice_par_defaut || isNaN(margeBenefice) || margeBenefice < 0) {
      newErrors.marge_benefice_par_defaut = 'La marge de bénéfice doit être un nombre positif ou nul';
    } else if (margeBenefice > 1) {
      newErrors.marge_benefice_par_defaut = 'La marge doit être entre 0 et 1 (ex: 0.20 pour 20%)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSaving(true);
      
      const parametresFormattes = {
        prix_carburant: parseFloat(parametres.prix_carburant),
        tarif_horaire_chauffeur: parseFloat(parametres.tarif_horaire_chauffeur),
        marge_benefice_par_defaut: parseFloat(parametres.marge_benefice_par_defaut)
      };
      
      await api.updateParametres(parametresFormattes);
      
      setMessage({ 
        type: 'success', 
        content: 'Paramètres mis à jour avec succès !' 
      });
      
    } catch (error) {
      console.error('Erreur sauvegarde paramètres:', error);
      setMessage({ 
        type: 'error', 
        content: error.message || 'Erreur lors de la sauvegarde' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    chargerParametres();
    setErrors({});
    setMessage({ type: '', content: '' });
  };

  // Fonction pour calculer les exemples en temps réel
  const calculerExemples = () => {
    const prixCarburant = parseFloat(parametres.prix_carburant) || 0;
    const tarifHoraire = parseFloat(parametres.tarif_horaire_chauffeur) || 0;
    const marge = parseFloat(parametres.marge_benefice_par_defaut) || 0;
    
    // Exemple : voyage 200km, 3h, consommation 40L/100km
    const coutCarburant = (200 / 100) * 40 * prixCarburant;
    const coutChauffeur = 3 * tarifHoraire;
    const coutTotal = coutCarburant + coutChauffeur;
    const prixClient = coutTotal * (1 + marge);
    const benefice = prixClient - coutTotal;
    
    return {
      coutCarburant: coutCarburant.toFixed(2),
      coutChauffeur: coutChauffeur.toFixed(2),
      coutTotal: coutTotal.toFixed(2),
      prixClient: prixClient.toFixed(2),
      benefice: benefice.toFixed(2)
    };
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement des paramètres...</p>
      </div>
    );
  }

  const exemples = calculerExemples();

  return (
    <div className="gestion-parametres">
      {/* Messages */}
      {message.content && (
        <div className={`message ${message.type}`}>
          <span className="message-icon">
            {message.type === 'success' ? '✅' : '❌'}
          </span>
          <span>{message.content}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="parametres-form">
        {/* Prix du carburant */}
        <div className="form-group">
          <label htmlFor="prix_carburant" className="form-label">
            ⛽ Prix du Carburant (MAD/Litre)
          </label>
          <input
            type="number"
            id="prix_carburant"
            name="prix_carburant"
            value={parametres.prix_carburant}
            onChange={handleInputChange}
            placeholder="Ex: 14.50"
            step="0.01"
            min="0"
            max="50"
            className={`form-input ${errors.prix_carburant ? 'error' : ''}`}
            disabled={isSaving}
          />
          {errors.prix_carburant && (
            <span className="error-message">{errors.prix_carburant}</span>
          )}
          <div className="field-help">
            Prix actuel d'un litre de carburant (essence ou diesel)
          </div>
        </div>

        {/* Tarif horaire chauffeur */}
        <div className="form-group">
          <label htmlFor="tarif_horaire_chauffeur" className="form-label">
            👨‍💼 Tarif Horaire Chauffeur (MAD/Heure)
          </label>
          <input
            type="number"
            id="tarif_horaire_chauffeur"
            name="tarif_horaire_chauffeur"
            value={parametres.tarif_horaire_chauffeur}
            onChange={handleInputChange}
            placeholder="Ex: 50.00"
            step="0.01"
            min="0"
            max="500"
            className={`form-input ${errors.tarif_horaire_chauffeur ? 'error' : ''}`}
            disabled={isSaving}
          />
          {errors.tarif_horaire_chauffeur && (
            <span className="error-message">{errors.tarif_horaire_chauffeur}</span>
          )}
          <div className="field-help">
            Coût horaire d'un chauffeur (salaire + charges sociales)
          </div>
        </div>

        {/* Marge de bénéfice */}
        <div className="form-group">
          <label htmlFor="marge_benefice_par_defaut" className="form-label">
            📈 Marge de Bénéfice Par Défaut
          </label>
          <input
            type="number"
            id="marge_benefice_par_defaut"
            name="marge_benefice_par_defaut"
            value={parametres.marge_benefice_par_defaut}
            onChange={handleInputChange}
            placeholder="Ex: 0.20 (pour 20%)"
            step="0.001"
            min="0"
            max="1"
            className={`form-input ${errors.marge_benefice_par_defaut ? 'error' : ''}`}
            disabled={isSaving}
          />
          {errors.marge_benefice_par_defaut && (
            <span className="error-message">{errors.marge_benefice_par_defaut}</span>
          )}
          <div className="field-help">
            Marge de bénéfice en décimal (0.20 = 20%, 0.15 = 15%)
          </div>
          <div className="percentage-display">
            {parametres.marge_benefice_par_defaut && 
              !isNaN(parseFloat(parametres.marge_benefice_par_defaut)) && (
              <span className="percentage">
                = {(parseFloat(parametres.marge_benefice_par_defaut) * 100).toFixed(1)}%
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={handleReset}
            className="btn-secondary"
            disabled={isSaving}
          >
            🔄 Réinitialiser
          </button>
          
          <button
            type="submit"
            className="btn-primary"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <span className="loading-spinner small"></span>
                Sauvegarde...
              </>
            ) : (
              <>
                💾 Sauvegarder
              </>
            )}
          </button>
        </div>
      </form>

      {/* Simulation en temps réel */}
      <div className="parametres-simulation">
        <h3>📊 Simulation de Calcul</h3>
        <p className="simulation-description">
          Exemple pour un voyage de 200 km, 3 heures, avec un camion consommant 40L/100km :
        </p>
        
        <div className="simulation-details">
          <div className="simulation-row">
            <span className="sim-label">⛽ Coût carburant:</span>
            <span className="sim-value">{exemples.coutCarburant} MAD</span>
          </div>
          <div className="simulation-row">
            <span className="sim-label">👨‍💼 Coût chauffeur:</span>
            <span className="sim-value">{exemples.coutChauffeur} MAD</span>
          </div>
          <div className="simulation-separator"></div>
          <div className="simulation-row total">
            <span className="sim-label">💼 Coût total:</span>
            <span className="sim-value">{exemples.coutTotal} MAD</span>
          </div>
          <div className="simulation-row prix">
            <span className="sim-label">💰 Prix client:</span>
            <span className="sim-value">{exemples.prixClient} MAD</span>
          </div>
          <div className="simulation-row benefice">
            <span className="sim-label">📈 Bénéfice:</span>
            <span className="sim-value">{exemples.benefice} MAD</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GestionParametres;
