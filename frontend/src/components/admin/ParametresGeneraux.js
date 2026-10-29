import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Heroicon from '../ui/Heroicons';

const ParametresGeneraux = () => {
  const [formData, setFormData] = useState({
    prix_carburant: '',
    tarif_horaire_chauffeur: '',
    marge_benefice_par_defaut: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchParams = async () => {
      try {
        const params = await api.getParametres();
        setFormData(params);
      } catch (e) {
        setMessage(e.message || 'Impossible de charger les paramètres');
      } finally {
        setLoading(false);
      }
    };
    fetchParams();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFormData({ prix_carburant: '', tarif_horaire_chauffeur: '', marge_benefice_par_defaut: '' });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        prix_carburant: parseFloat(formData.prix_carburant),
        tarif_horaire_chauffeur: parseFloat(formData.tarif_horaire_chauffeur),
        marge_benefice_par_defaut: parseFloat(formData.marge_benefice_par_defaut)
      };
      await api.updateParametres(payload);
      setMessage('Paramètres sauvegardés');
    } catch (e) {
      setMessage(e.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="params-form">
      {/* Card 1: Configuration Économique du Système */}
      <div className="param-card">
        <h3 className="param-card-title">Configuration Économique du Système</h3>

        {message && (
          <div className={`message ${message.includes('sauvegardés') ? 'success' : 'error'}`} style={{ marginBottom: 'var(--space-6)' }}>
            <span className="message-icon">
              <Heroicon 
                icon={message.includes('sauvegardés') ? 'check' : 'exclamation-triangle'} 
                size={20}
                className={message.includes('sauvegardés') ? 'text-success' : 'text-error'}
              />
            </span>
            <span>{message}</span>
          </div>
        )}

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner" style={{width: '32px', height: '32px', marginBottom: 'var(--space-4)'}}></div>
            <p>Chargement des paramètres...</p>
          </div>
        ) : (
          <>
            <div className="param-grid">
              <div className="form-group">
                <label className="form-label">
                  <div style={{display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)'}}>
                    <Heroicon icon="beaker" size={18} className="text-secondary" />
                    <span>Prix du Carburant (MAD/Litre)</span>
                  </div>
                </label>
                <input 
                  name="prix_carburant" 
                  type="number" 
                  step="0.01" 
                  value={formData.prix_carburant || ''} 
                  onChange={handleChange} 
                  placeholder="13.50"
                  className="form-control" 
                />
                <div className="param-help">Prix actuel d'un litre de carburant (essence ou diesel)</div>
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  <div style={{display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)'}}>
                    <Heroicon icon="user" size={18} className="text-secondary" />
                    <span>Tarif Horaire Chauffeur (MAD/Heure)</span>
                  </div>
                </label>
                <input 
                  name="tarif_horaire_chauffeur" 
                  type="number" 
                  step="0.01" 
                  value={formData.tarif_horaire_chauffeur || ''} 
                  onChange={handleChange} 
                  placeholder="50.00"
                  className="form-control" 
                />
                <div className="param-help">Coût horaire d'un chauffeur (salaire + charges sociales)</div>
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  <div style={{display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)'}}>
                    <Heroicon icon="chart-bar-square" size={18} className="text-secondary" />
                    <span>Marge de Bénéfice Par Défaut</span>
                  </div>
                </label>
                <input 
                  name="marge_benefice_par_defaut" 
                  type="number" 
                  step="0.001" 
                  value={formData.marge_benefice_par_defaut || ''} 
                  onChange={handleChange} 
                  placeholder="0.350"
                  className="form-control" 
                />
                <div className="param-help">Marge de bénéfice en décimal (0.20 = 20%, 0.15 = 15%)</div>
              </div>
            </div>

            <div className="param-form-actions">
              <button className="btn btn-secondary" onClick={handleReset} disabled={saving}>
                <Heroicon icon="arrow-path" size={18} style={{marginRight: 'var(--space-2)'}} />
                Réinitialiser
              </button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <span className="loading-spinner light" style={{width: '18px', height: '18px', marginRight: 'var(--space-2)'}}></span>
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Heroicon icon="check" size={18} style={{marginRight: 'var(--space-2)'}} />
                    Sauvegarder
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Card 2: Simulation de Calcul & Aide */}
      <div className="param-card">
        <h3 className="param-card-title">Simulation & Aide</h3>
        
        <div style={{backgroundColor: 'rgba(59, 130, 246, 0.05)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-6)', border: '1px solid rgba(59, 130, 246, 0.1)'}}>
          <h4 style={{fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)'}}>
            <Heroicon icon="information-circle" size={18} className="text-primary" />
            Exemple pour un voyage de 200 km, 3 heures, avec un camion consommant 40L/100km:
          </h4>
          
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-4)'}}>
            <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--space-1)'}}>
              <div style={{fontSize: 'var(--text-sm)', color: 'var(--text-secondary)'}}>Coût carburant</div>
              <div style={{fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-semibold)'}}>1080.00 MAD</div>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--space-1)'}}>
              <div style={{fontSize: 'var(--text-sm)', color: 'var(--text-secondary)'}}>Coût chauffeur</div>
              <div style={{fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-semibold)'}}>150.00 MAD</div>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--space-1)'}}>
              <div style={{fontSize: 'var(--text-sm)', color: 'var(--text-secondary)'}}>Coût total</div>
              <div style={{fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-semibold)'}}>1230.00 MAD</div>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--space-1)'}}>
              <div style={{fontSize: 'var(--text-sm)', color: 'var(--text-secondary)'}}>Prix client</div>
              <div style={{fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--primary)'}}>1660.50 MAD</div>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--space-1)'}}>
              <div style={{fontSize: 'var(--text-sm)', color: 'var(--text-secondary)'}}>Bénéfice</div>
              <div style={{fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-success)'}}>430.50 MAD</div>
            </div>
          </div>
        </div>
        
        <div>
          <h4 style={{fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)'}}>
            <Heroicon icon="information-circle" size={20} className="text-primary" />
            Aide
          </h4>
          <p style={{color: 'var(--text-secondary)', maxWidth: '800px'}}>
            Les paramètres généraux affectent tous les calculs de coût. Modifiez-les pour refléter les conditions économiques actuelles.
            Les modifications sont immédiatement appliquées à tous les calculs d'itinéraires.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ParametresGeneraux;
