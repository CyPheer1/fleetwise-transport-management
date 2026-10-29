/**
 * Composant réutilisable de gestion de tableau CRUD - FleetWise
 * Fournit une interface complète pour gérer n'importe quelle ressource
 */

import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Heroicon from '../../components/ui/Heroicons';

const GestionTableau = ({ 
  endpoint, 
  title, 
  colonnes, 
  validationRules = {} 
}) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [message, setMessage] = useState({ type: '', content: '' });

  // Chargement des données au montage
  useEffect(() => {
    chargerDonnees();
  }, [endpoint]);

  // Initialiser le formulaire quand on ouvre le modal
  useEffect(() => {
    if (showModal) {
      if (editingItem) {
        // Mode édition
        setFormData(editingItem);
      } else {
        // Mode création - initialiser avec des valeurs vides
        const initialData = {};
        colonnes.forEach(col => {
          initialData[col.key] = '';
        });
        setFormData(initialData);
      }
      setFormErrors({});
    }
  }, [showModal, editingItem, colonnes]);

  const chargerDonnees = async () => {
    try {
      setIsLoading(true);
      let result;
      
      // Appel API selon l'endpoint
      switch (endpoint) {
        case 'camions':
          result = await api.getCamions();
          break;
        case 'chauffeurs':
          result = await api.getChauffeurs();
          break;
        case 'peages':
          result = await api.getPeages();
          break;
        default:
          throw new Error(`Endpoint non supporté: ${endpoint}`);
      }
      
      setData(result);
      setMessage({ type: '', content: '' });
      
    } catch (error) {
      console.error(`Erreur chargement ${endpoint}:`, error);
      setMessage({ 
        type: 'error', 
        content: `Impossible de charger les données: ${error.message}` 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Nettoyer l'erreur pour ce champ
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Validation des champs requis
    colonnes.forEach(colonne => {
      if (colonne.required && (!formData[colonne.key] || !formData[colonne.key].toString().trim())) {
        errors[colonne.key] = `Le champ ${colonne.label} est obligatoire`;
      }
    });
    
    // Validation personnalisée
    Object.keys(validationRules).forEach(field => {
      if (formData[field] !== undefined) {
        const error = validationRules[field](formData[field]);
        if (error) {
          errors[field] = error;
        }
      }
    });
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Préparer les données
      const dataToSend = { ...formData };
      
      // Convertir les types si nécessaire
      colonnes.forEach(colonne => {
        if (colonne.type === 'number' && dataToSend[colonne.key]) {
          dataToSend[colonne.key] = parseFloat(dataToSend[colonne.key]);
        }
      });
      
      if (editingItem) {
        // Mode édition
        switch (endpoint) {
          case 'camions':
            await api.updateCamion(editingItem.id, dataToSend);
            break;
          case 'chauffeurs':
            await api.updateChauffeur(editingItem.id, dataToSend);
            break;
          case 'peages':
            await api.updatePeage(editingItem.id, dataToSend);
            break;
        }
        setMessage({ 
          type: 'success', 
          content: 'Élément mis à jour avec succès !' 
        });
      } else {
        // Mode création
        switch (endpoint) {
          case 'camions':
            await api.createCamion(dataToSend);
            break;
          case 'chauffeurs':
            await api.createChauffeur(dataToSend);
            break;
          case 'peages':
            await api.createPeage(dataToSend);
            break;
        }
        setMessage({ 
          type: 'success', 
          content: 'Élément créé avec succès !' 
        });
      }
      
      // Fermer le modal et recharger les données
      setShowModal(false);
      setEditingItem(null);
      await chargerDonnees();
      
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      setMessage({ 
        type: 'error', 
        content: error.message || 'Erreur lors de la sauvegarde' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer cet élément ?`)) {
      return;
    }
    
    try {
      switch (endpoint) {
        case 'camions':
          await api.deleteCamion(item.id);
          break;
        case 'chauffeurs':
          await api.deleteChauffeur(item.id);
          break;
        case 'peages':
          await api.deletePeage(item.id);
          break;
      }
      
      setMessage({ 
        type: 'success', 
        content: 'Élément supprimé avec succès !' 
      });
      
      await chargerDonnees();
      
    } catch (error) {
      console.error('Erreur suppression:', error);
      setMessage({ 
        type: 'error', 
        content: error.message || 'Erreur lors de la suppression' 
      });
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormErrors({});
  };

  const renderFieldInput = (colonne) => {
    const { key, type, placeholder, min, max, step } = colonne;
    const value = formData[key] || '';
    const hasError = !!formErrors[key];
    
    switch (type) {
      case 'number':
        return (
          <input
            type="number"
            name={key}
            value={value}
            onChange={handleInputChange}
            placeholder={placeholder}
            min={min}
            max={max}
            step={step}
            className={`form-input ${hasError ? 'error' : ''}`}
            disabled={isSubmitting}
          />
        );
      
      case 'email':
        return (
          <input
            type="email"
            name={key}
            value={value}
            onChange={handleInputChange}
            placeholder={placeholder}
            className={`form-input ${hasError ? 'error' : ''}`}
            disabled={isSubmitting}
          />
        );
      
      case 'text':
      default:
        return (
          <input
            type="text"
            name={key}
            value={value}
            onChange={handleInputChange}
            placeholder={placeholder}
            className={`form-input ${hasError ? 'error' : ''}`}
            disabled={isSubmitting}
          />
        );
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement des données...</p>
      </div>
    );
  }

  return (
    <div className="gestion-tableau">
      {/* Messages */}
      {message.content && (
        <div className={`message ${message.type}`}>
          <span className="message-icon">
            <Heroicon 
              icon={message.type === 'success' ? 'check' : 'x-mark'} 
              size={20}
              className={message.type === 'success' ? 'text-success' : 'text-error'}
            />
          </span>
          <span>{message.content}</span>
        </div>
      )}

      {/* En-tête avec bouton d'ajout */}
      <div className="tableau-header">
        <div className="header-info">
          <h3>{title}</h3>
          <p>{data.length} élément{data.length > 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary"
        >
          <Heroicon icon="plus" size={18} />
          <span style={{marginLeft: '8px'}}>Ajouter</span>
        </button>
      </div>

      {/* Tableau des données */}
      {data.length === 0 ? (
        <div className="no-data">
          <div className="no-data-icon">
            <Heroicon icon="document" size={36} className="text-tertiary" />
          </div>
          <h3>Aucune donnée</h3>
          <p>Commencez par ajouter votre premier élément.</p>
        </div>
      ) : (
        <div className="tableau-container">
          <table className="data-table">
            <thead>
              <tr>
                {colonnes.map(colonne => (
                  <th key={colonne.key}>{colonne.label}</th>
                ))}
                <th className="actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map(item => (
                <tr key={item.id}>
                  {colonnes.map(colonne => (
                    <td key={colonne.key}>
                      {colonne.type === 'number' 
                        ? parseFloat(item[colonne.key]).toFixed(colonne.step?.toString().includes('.') ? colonne.step.toString().split('.')[1].length : 0)
                        : item[colonne.key]
                      }
                    </td>
                  ))}
                  <td className="actions-col">
                    <button
                      onClick={() => handleEdit(item)}
                      className="btn-edit"
                      title="Modifier"
                    >
                      <Heroicon icon="pencil" size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="btn-delete"
                      title="Supprimer"
                    >
                      <Heroicon icon="trash" size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de création/édition */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                <Heroicon 
                  icon={editingItem ? "pencil" : "plus"} 
                  size={20} 
                  className="text-primary"
                  style={{marginRight: '8px'}}
                />
                {editingItem ? 'Modifier' : 'Ajouter'} - {title}
              </h2>
              <button className="modal-close" onClick={handleCloseModal}>
                <Heroicon icon="x-mark" size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              {colonnes.map(colonne => (
                <div key={colonne.key} className="form-group">
                  <label htmlFor={colonne.key} className="form-label">
                    {colonne.label} {colonne.required && <span className="required">*</span>}
                  </label>
                  {renderFieldInput(colonne)}
                  {formErrors[colonne.key] && (
                    <span className="error-message">{formErrors[colonne.key]}</span>
                  )}
                </div>
              ))}

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn btn-secondary"
                  disabled={isSubmitting}
                >
                  <Heroicon icon="x-mark" size={16} style={{marginRight: '6px'}} />
                  Annuler
                </button>
                
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="loading-spinner light" style={{width: '16px', height: '16px', marginRight: '8px'}}></span>
                      Sauvegarde...
                    </>
                  ) : (
                    <>
                      <Heroicon icon="check" size={16} style={{marginRight: '6px'}} />
                      {editingItem ? 'Mettre à jour' : 'Créer'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionTableau;
