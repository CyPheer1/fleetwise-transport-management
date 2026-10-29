/**
 * FleetWise Enterprise - Mission Assignment Modal Component
 * Professional modal for driver assignment and mission dispatch
 */

import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Icon from '../../components/ui/Icons';

const ModalAssignation = ({ itineraire, onClose, onMissionEnvoyee }) => {
  const [chauffeurId, setChauffeurId] = useState('');
  const [notes, setNotes] = useState('');
  const [chauffeursList, setChauffeursList] = useState([]);
  const [loadingChauffeurs, setLoadingChauffeurs] = useState(true);
  const [isEnvoyant, setIsEnvoyant] = useState(false);
  const [erreur, setErreur] = useState('');

  // Load drivers list on component mount
  useEffect(() => {
    chargerChauffeurs();
  }, []);

  const chargerChauffeurs = async () => {
    try {
      setLoadingChauffeurs(true);
      const chauffeurs = await api.getChauffeurs();
      setChauffeursList(chauffeurs);
    } catch (error) {
      console.error('Erreur chargement chauffeurs:', error);
      setErreur('Impossible de charger la liste des chauffeurs');
    } finally {
      setLoadingChauffeurs(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!chauffeurId) {
      setErreur('Veuillez sélectionner un chauffeur');
      return;
    }

    try {
      setIsEnvoyant(true);
      setErreur('');

      await api.envoyerMission(
        parseInt(chauffeurId),
        itineraire,
        notes.trim()
      );

      // Success
      onMissionEnvoyee();
      
    } catch (error) {
      console.error('Erreur envoi mission:', error);
      setErreur(error.message || 'Erreur lors de l\'envoi de la mission');
    } finally {
      setIsEnvoyant(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const chauffeurSelectionne = chauffeursList.find(c => c.id === parseInt(chauffeurId));

  return (
    <>
      {/* Modal Header */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <h2 style={{
          fontSize: 'var(--text-xl)',
          fontWeight: 'var(--font-semibold)',
          color: 'var(--color-text-primary)',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Icon name="send" />
          <span>Assigner la Mission</span>
        </h2>
        
        <button 
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: 'var(--color-text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            transition: 'all 0.15s ease'
          }}
        >
          ×
        </button>
      </div>
      
      {/* Route Summary */}
      <div style={{
        padding: '20px',
        backgroundColor: 'var(--color-background)',
        borderBottom: '1px solid var(--color-border)'
      }}>
        <h3 style={{
          fontSize: 'var(--text-lg)',
          fontWeight: 'var(--font-semibold)',
          marginBottom: '16px',
          color: 'var(--color-text-primary)'
        }}>
          Récapitulatif de l'Itinéraire
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          <div style={{
            backgroundColor: 'var(--color-card)',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)'
          }}>
            <div style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-secondary)',
              marginBottom: '4px'
            }}>
              Itinéraire
            </div>
            <div style={{
              fontSize: 'var(--text-md)',
              fontWeight: 'var(--font-medium)',
              color: 'var(--color-text-primary)'
            }}>
              {itineraire.nom_itineraire}
            </div>
          </div>
          
          <div style={{
            backgroundColor: 'var(--color-card)',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)'
          }}>
            <div style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-secondary)',
              marginBottom: '4px'
            }}>
              Distance
            </div>
            <div style={{
              fontSize: 'var(--text-md)',
              fontWeight: 'var(--font-medium)',
              color: 'var(--color-text-primary)'
            }}>
              {itineraire.distance_km} km
            </div>
        </div>

          <div style={{
            backgroundColor: 'var(--color-card)',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)'
          }}>
            <div style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-secondary)',
              marginBottom: '4px'
            }}>
              Durée estimée
            </div>
            <div style={{
              fontSize: 'var(--text-md)',
              fontWeight: 'var(--font-medium)',
              color: 'var(--color-text-primary)'
            }}>
              {itineraire.duree_formattee}
            </div>
            </div>
          
          <div style={{
            backgroundColor: 'var(--color-card)',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)'
          }}>
            <div style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-secondary)',
              marginBottom: '4px'
            }}>
              Niveau de risque
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: 'var(--text-md)',
              fontWeight: 'var(--font-medium)',
              color: itineraire.niveau_risque === 'Faible' 
                ? 'var(--color-success)' 
                : itineraire.niveau_risque === 'Moyen' 
                  ? 'var(--color-warning)' 
                  : 'var(--color-error)'
            }}>
              <span style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '4px',
                backgroundColor: itineraire.niveau_risque === 'Faible'
                  ? 'var(--color-success)'
                  : itineraire.niveau_risque === 'Moyen'
                    ? 'var(--color-warning)'
                    : 'var(--color-error)'
              }}></span>
              {itineraire.niveau_risque}
            </div>
          </div>
            </div>
        
        {/* Recommended Tag */}
            {itineraire.recommande && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '16px',
            backgroundColor: 'rgba(221, 107, 32, 0.1)',
            color: 'var(--color-warning)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--font-medium)',
          }}>
            <Icon name="star" />
            <span>ITINÉRAIRE RECOMMANDÉ</span>
              </div>
            )}
        </div>

      {/* Assignment Form */}
      <form onSubmit={handleSubmit}>
        <div style={{padding: '24px'}}>
          {/* Driver Selection */}
          <div style={{marginBottom: '24px'}}>
            <label style={{
              display: 'block',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)',
              color: 'var(--color-text-primary)',
              marginBottom: '8px'
            }}>
              <span style={{display:'inline-flex',alignItems:'center',gap:'8px'}}>
                <Icon name="driver" /> Sélectionner un Chauffeur
              </span>
            </label>
            
            {loadingChauffeurs ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                backgroundColor: 'var(--color-background)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)'
              }}>
                <div className="loading-spinner dark" style={{width: '20px', height: '20px'}}></div>
                <span style={{color: 'var(--color-text-secondary)'}}>Chargement des chauffeurs...</span>
              </div>
            ) : chauffeursList.length === 0 ? (
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px 16px',
                backgroundColor: 'rgba(229, 62, 62, 0.05)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(229, 62, 62, 0.2)',
                color: 'var(--color-text-primary)'
              }}>
                <span style={{fontSize: '20px', color: 'var(--color-error)'}}><Icon name="alert" /></span>
                <div>
                  <div style={{marginBottom: '4px', fontWeight: 'var(--font-medium)'}}>
                    Aucun chauffeur disponible
                  </div>
                  <div style={{fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)'}}>
                    Veuillez d'abord ajouter des chauffeurs dans la section Administration.
                  </div>
                </div>
              </div>
            ) : (
              <select
                value={chauffeurId}
                onChange={(e) => setChauffeurId(e.target.value)}
                disabled={isEnvoyant}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: 'var(--text-md)',
                  border: erreur && !chauffeurId
                    ? '1px solid var(--color-error)'
                    : '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-card)',
                  color: chauffeurId ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                  transition: 'all var(--transition-fast)',
                  appearance: 'none',
                  backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%238A94A6\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 16px center',
                  backgroundSize: '16px'
                }}
              >
                <option value="">-- Choisissez un chauffeur --</option>
                {chauffeursList.map((chauffeur) => (
                  <option key={chauffeur.id} value={chauffeur.id}>
                    {chauffeur.nom} ({chauffeur.email})
                  </option>
                ))}
              </select>
            )}
            
            {erreur && !chauffeurId && (
              <div style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-error)',
                marginTop: '6px'
              }}>
                Veuillez sélectionner un chauffeur
              </div>
            )}
          </div>

          {/* Driver Information */}
          {chauffeurSelectionne && (
            <div style={{
              backgroundColor: 'var(--color-background)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <h4 style={{
                fontSize: 'var(--text-md)',
                fontWeight: 'var(--font-semibold)',
                marginBottom: '12px',
                color: 'var(--color-text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Icon name="info" />
                <span>Informations du Chauffeur</span>
              </h4>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px'
              }}>
                <div>
                  <div style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-secondary)',
                    marginBottom: '4px'
                  }}>
                    Nom
                  </div>
                  <div style={{
                    fontSize: 'var(--text-md)',
                    fontWeight: 'var(--font-medium)',
                    color: 'var(--color-text-primary)'
                  }}>
                    {chauffeurSelectionne.nom}
                  </div>
                </div>
                
                <div>
                  <div style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-secondary)',
                    marginBottom: '4px'
                  }}>
                    Email
                  </div>
                  <div style={{
                    fontSize: 'var(--text-md)',
                    fontWeight: 'var(--font-medium)',
                    color: 'var(--color-primary)'
                  }}>
                    {chauffeurSelectionne.email}
                </div>
                </div>
              </div>
            </div>
          )}

          {/* Notes Field */}
          <div style={{marginBottom: '24px'}}>
            <label style={{
              display: 'block',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)',
              color: 'var(--color-text-primary)',
              marginBottom: '8px'
            }}>
              <span style={{display:'inline-flex',alignItems:'center',gap:'8px'}}>
                <Icon name="note" /> Notes spéciales (optionnel)
              </span>
            </label>
            
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isEnvoyant}
              placeholder="Instructions particulières, informations client, consignes spéciales..."
              maxLength={1000}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: 'var(--text-md)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-card)',
                color: 'var(--color-text-primary)',
                transition: 'all var(--transition-fast)',
                height: '120px',
                resize: 'vertical',
                fontFamily: 'var(--font-family)'
              }}
            />
            
            <div style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-secondary)',
              textAlign: 'right',
              marginTop: '6px'
            }}>
              {notes.length}/1000 caractères
            </div>
          </div>

          {/* Email Preview */}
          <div style={{
            backgroundColor: 'var(--color-background)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <h4 style={{
              fontSize: 'var(--text-md)',
              fontWeight: 'var(--font-semibold)',
              marginBottom: '12px',
              color: 'var(--color-text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Icon name="send" />
              <span>Aperçu de l'Email</span>
            </h4>
            
            <div style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-secondary)',
            }}>
              <div style={{marginBottom: '8px'}}>
                <strong style={{color: 'var(--color-text-primary)'}}>Destinataire:</strong> {chauffeurSelectionne?.email || 'Sélectionnez un chauffeur'}
              </div>
              <div style={{marginBottom: '8px'}}>
                <strong style={{color: 'var(--color-text-primary)'}}>Sujet:</strong> Nouvelle Mission de Transport: {itineraire.ville_depart} → {itineraire.ville_arrivee}
              </div>
              <div style={{marginBottom: '0px'}}>
                <strong style={{color: 'var(--color-text-primary)'}}>Contenu:</strong> Détails de l'itinéraire (sans informations financières), lien de navigation et notes spéciales
              </div>
            </div>
          </div>

          {/* Error Message */}
          {erreur && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '12px 16px',
              backgroundColor: 'rgba(229, 62, 62, 0.05)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(229, 62, 62, 0.2)',
              marginBottom: '24px'
            }}>
              <span style={{fontSize: '20px', color: 'var(--color-error)'}}><Icon name="alert" /></span>
              <div style={{color: 'var(--color-error)', fontWeight: 'var(--font-medium)'}}>
                {erreur}
              </div>
            </div>
          )}

          {/* Warning Message */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            padding: '12px 16px',
            backgroundColor: 'rgba(221, 107, 32, 0.05)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(221, 107, 32, 0.2)',
          }}>
            <span style={{fontSize: '20px', color: 'var(--color-warning)'}}><Icon name="alert" /></span>
            <div>
              <div style={{fontWeight: 'var(--font-medium)', marginBottom: '4px', color: 'var(--color-warning)'}}>
                Important
              </div>
              <div style={{fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)'}}>
                L'email envoyé ne contiendra aucune information financière (coûts, prix, bénéfices). 
                Seuls les détails opérationnels seront communiqués au chauffeur.
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '16px'
        }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isEnvoyant}
            style={{
              padding: '10px 24px',
              backgroundColor: 'transparent',
              color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              opacity: isEnvoyant ? 0.7 : 1
            }}
          >
            Annuler
            </button>
            
            <button
              type="submit"
              disabled={isEnvoyant || !chauffeurId || chauffeursList.length === 0}
            style={{
              padding: '10px 24px',
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              border: '1px solid var(--color-primary)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              boxShadow: 'var(--shadow-sm)',
              opacity: isEnvoyant || !chauffeurId || chauffeursList.length === 0 ? 0.7 : 1
            }}
            >
              {isEnvoyant ? (
                <>
                <div className="loading-spinner" style={{width: '16px', height: '16px'}}></div>
                <span>Envoi en cours...</span>
                </>
              ) : (
                <>
                <Icon name="send" />
                <span>Confirmer et Envoyer</span>
                </>
              )}
            </button>
          </div>
        </form>
    </>
  );
};

export default ModalAssignation;
