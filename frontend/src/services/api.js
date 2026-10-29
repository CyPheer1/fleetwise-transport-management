/**
 * Service API pour la communication avec le backend Django FleetWise.
 * Module centralisé pour tous les appels API.
 */

import axios from 'axios';

// Configuration de base pour axios
const API_BASE_URL = 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour la gestion globale des erreurs
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Erreur API:', error);
    return Promise.reject(error);
  }
);

/**
 * Service principal de l'API FleetWise
 */
class FleetWiseAPI {
  
  // ========================
  // ENDPOINT PRINCIPAL - CALCUL D'ITINÉRAIRE
  // ========================
  
  /**
   * Calcule les itinéraires entre deux villes avec un camion spécifique
   * @param {string} villeDepart - Ville de départ
   * @param {string} villeArrivee - Ville d'arrivée
   * @param {number} camionId - ID du camion sélectionné
   * @returns {Promise<Array>} Liste des itinéraires calculés
   */
  async calculerItineraire(villeDepart, villeArrivee, camionId) {
    try {
      const response = await apiClient.post('/calculer-itineraire/', {
        ville_depart: villeDepart,
        ville_arrivee: villeArrivee,
        camion_id: camionId
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Erreur lors du calcul des itinéraires');
    }
  }

  // ========================
  // ENDPOINT ENVOI DE MISSION
  // ========================
  
  /**
   * Envoie une mission par email à un chauffeur
   * @param {number} chauffeurId - ID du chauffeur
   * @param {Object} detailsRoute - Détails complets de l'itinéraire
   * @param {string} notes - Notes optionnelles du gestionnaire
   * @returns {Promise<Object>} Confirmation d'envoi
   */
  async envoyerMission(chauffeurId, detailsRoute, notes = '') {
    try {
      const response = await apiClient.post('/envoyer-mission/', {
        chauffeur_id: chauffeurId,
        details_route: detailsRoute,
        notes: notes
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Erreur lors de l\'envoi de la mission');
    }
  }

  // ========================
  // GESTION DES CAMIONS
  // ========================
  
  /**
   * Récupère la liste de tous les camions
   * @returns {Promise<Array>} Liste des camions
   */
  async getCamions() {
    try {
      const response = await apiClient.get('/camions/');
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Erreur lors de la récupération des camions');
    }
  }

  /**
   * Crée un nouveau camion
   * @param {Object} camionData - Données du camion
   * @returns {Promise<Object>} Camion créé
   */
  async createCamion(camionData) {
    try {
      const response = await apiClient.post('/camions/', camionData);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Erreur lors de la création du camion');
    }
  }

  /**
   * Met à jour un camion existant
   * @param {number} id - ID du camion
   * @param {Object} camionData - Données mises à jour
   * @returns {Promise<Object>} Camion mis à jour
   */
  async updateCamion(id, camionData) {
    try {
      const response = await apiClient.put(`/camions/${id}/`, camionData);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Erreur lors de la mise à jour du camion');
    }
  }

  /**
   * Supprime un camion
   * @param {number} id - ID du camion à supprimer
   * @returns {Promise<void>}
   */
  async deleteCamion(id) {
    try {
      await apiClient.delete(`/camions/${id}/`);
    } catch (error) {
      throw this.handleError(error, 'Erreur lors de la suppression du camion');
    }
  }

  // ========================
  // GESTION DES CHAUFFEURS
  // ========================
  
  /**
   * Récupère la liste de tous les chauffeurs
   * @returns {Promise<Array>} Liste des chauffeurs
   */
  async getChauffeurs() {
    try {
      const response = await apiClient.get('/chauffeurs/');
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Erreur lors de la récupération des chauffeurs');
    }
  }

  /**
   * Crée un nouveau chauffeur
   * @param {Object} chauffeurData - Données du chauffeur
   * @returns {Promise<Object>} Chauffeur créé
   */
  async createChauffeur(chauffeurData) {
    try {
      const response = await apiClient.post('/chauffeurs/', chauffeurData);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Erreur lors de la création du chauffeur');
    }
  }

  /**
   * Met à jour un chauffeur existant
   * @param {number} id - ID du chauffeur
   * @param {Object} chauffeurData - Données mises à jour
   * @returns {Promise<Object>} Chauffeur mis à jour
   */
  async updateChauffeur(id, chauffeurData) {
    try {
      const response = await apiClient.put(`/chauffeurs/${id}/`, chauffeurData);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Erreur lors de la mise à jour du chauffeur');
    }
  }

  /**
   * Supprime un chauffeur
   * @param {number} id - ID du chauffeur à supprimer
   * @returns {Promise<void>}
   */
  async deleteChauffeur(id) {
    try {
      await apiClient.delete(`/chauffeurs/${id}/`);
    } catch (error) {
      throw this.handleError(error, 'Erreur lors de la suppression du chauffeur');
    }
  }

  // ========================
  // GESTION DES PÉAGES
  // ========================
  
  /**
   * Récupère la liste de tous les trajets péage
   * @returns {Promise<Array>} Liste des trajets péage
   */
  async getPeages() {
    try {
      const response = await apiClient.get('/peages/');
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Erreur lors de la récupération des péages');
    }
  }

  /**
   * Crée un nouveau trajet péage
   * @param {Object} peageData - Données du péage
   * @returns {Promise<Object>} Péage créé
   */
  async createPeage(peageData) {
    try {
      const response = await apiClient.post('/peages/', peageData);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Erreur lors de la création du péage');
    }
  }

  /**
   * Met à jour un trajet péage existant
   * @param {number} id - ID du péage
   * @param {Object} peageData - Données mises à jour
   * @returns {Promise<Object>} Péage mis à jour
   */
  async updatePeage(id, peageData) {
    try {
      const response = await apiClient.put(`/peages/${id}/`, peageData);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Erreur lors de la mise à jour du péage');
    }
  }

  /**
   * Supprime un trajet péage
   * @param {number} id - ID du péage à supprimer
   * @returns {Promise<void>}
   */
  async deletePeage(id) {
    try {
      await apiClient.delete(`/peages/${id}/`);
    } catch (error) {
      throw this.handleError(error, 'Erreur lors de la suppression du péage');
    }
  }

  // ========================
  // GESTION DES PARAMÈTRES
  // ========================
  
  /**
   * Récupère les paramètres généraux (singleton)
   * @returns {Promise<Object>} Paramètres généraux
   */
  async getParametres() {
    try {
      const response = await apiClient.get('/parametres/');
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Erreur lors de la récupération des paramètres');
    }
  }

  /**
   * Met à jour les paramètres généraux
   * @param {Object} parametresData - Nouvelles données des paramètres
   * @returns {Promise<Object>} Paramètres mis à jour
   */
  async updateParametres(parametresData) {
    try {
      const response = await apiClient.put('/parametres/', parametresData);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Erreur lors de la mise à jour des paramètres');
    }
  }

  // ========================
  // ENDPOINTS UTILITAIRES
  // ========================
  
  /**
   * Vérifie le statut de l'API
   * @returns {Promise<Object>} Statut de l'API
   */
  async getApiStatus() {
    try {
      const response = await apiClient.get('/status/');
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Erreur lors de la vérification du statut');
    }
  }

  /**
   * Recherche autocomplete des noms de villes
   * @param {string} term - Terme de recherche
   * @returns {Promise<Array>} Liste des villes correspondantes
   */
  async getCitiesAutocomplete(term) {
    try {
      const response = await apiClient.get(`/cities/autocomplete/?term=${encodeURIComponent(term)}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Erreur lors de la recherche des villes');
    }
  }

  // ========================
  // GESTION DES ERREURS
  // ========================
  
  /**
   * Gère les erreurs API de manière centralisée
   * @param {Object} error - Erreur Axios
   * @param {string} defaultMessage - Message par défaut
   * @returns {Error} Erreur formatée
   */
  handleError(error, defaultMessage) {
    let errorMessage = defaultMessage;

    if (error.response) {
      // Erreur de réponse du serveur
      const { status, data } = error.response;
      
      if (data && data.erreur) {
        errorMessage = data.erreur;
      } else if (data && data.detail) {
        errorMessage = data.detail;
      } else if (status === 404) {
        errorMessage = 'Ressource introuvable';
      } else if (status === 500) {
        errorMessage = 'Erreur interne du serveur';
      } else if (status >= 400 && status < 500) {
        errorMessage = 'Erreur de requête';
      }
    } else if (error.request) {
      // Erreur de réseau
      errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
    }

    return new Error(errorMessage);
  }
}

// Export de l'instance singleton
export default new FleetWiseAPI();
