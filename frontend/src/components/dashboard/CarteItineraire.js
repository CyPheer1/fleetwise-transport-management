/**
 * FleetWise Enterprise - Route Card Component
 * Professional display of route details with assignment functionality
 */

import React from 'react';
import Icon from '../../components/ui/Icons';

const CarteItineraire = ({ itineraire, onAssigner, isRecommended = false }) => {
  if (!itineraire) return null;

  const getRiskClass = (niveau) => {
    switch (niveau?.toLowerCase()) {
      case 'faible':
        return 'success';
      case 'moyen':
        return 'warning';
      case 'élevé':
        return 'error';
      default:
        return 'warning';
    }
  };

  const getRiskDotStyle = (niveau) => {
    const size = 8;
    const base = { width: size, height: size, borderRadius: size / 2 };
    switch (niveau?.toLowerCase()) {
      case 'faible':
        return { ...base, background: 'var(--color-success)' };
      case 'moyen':
        return { ...base, background: 'var(--color-warning)' };
      case 'élevé':
        return { ...base, background: 'var(--color-error)' };
      default:
        return { ...base, background: 'var(--color-warning)' };
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

  const handleAssignerClick = () => {
    onAssigner(itineraire);
  };
  
  const riskClass = getRiskClass(itineraire.niveau_risque);

  return (
    <div className={`route-card ${isRecommended ? 'recommended' : ''}`}>
      {/* Recommended Badge */}
      {isRecommended && (
        <div className="recommended-badge">
          <Icon name="star" />
          <span>RECOMMANDÉ</span>
        </div>
      )}

      {/* Header */}
      <div className="route-header">
        <h3 className="route-title">
          {itineraire.nom_itineraire}
        </h3>
        
        <div className={`risk-indicator risk-${riskClass}`} style={{display:'inline-flex',alignItems:'center',gap:'8px'}}>
          <span className="risk-dot" style={getRiskDotStyle(itineraire.niveau_risque)}></span>
          <span className="risk-text">Risque {itineraire.niveau_risque}</span>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="route-body">
        <div className="info-row">
          <div className="info-item">
            <span className="info-icon"><Icon name="distance" /></span>
            <div className="info-content">
              <div className="info-label">Distance</div>
              <div className="info-value">{itineraire.distance_km} km</div>
            </div>
          </div>
          
          <div className="info-item">
            <span className="info-icon"><Icon name="time" /></span>
            <div className="info-content">
              <div className="info-label">Durée</div>
              <div className="info-value">{itineraire.duree_formattee}</div>
            </div>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="carte-couts">
          <h4 className="couts-title" style={{display:'flex',alignItems:'center',gap:'8px'}}>
            <Icon name="cost" />
            <span>Détail des Coûts</span>
          </h4>
          
          <div className="couts-details">
            <div className="cout-item">
              <div className="cout-label">
                <span><Icon name="fuel" /></span>
                <span>Carburant:</span>
              </div>
              <div className="cout-value">
                {formatCurrency(itineraire.cout_carburant)}
              </div>
            </div>
          
            <div className="cout-item">
              <div className="cout-label">
                <span><Icon name="driver" /></span>
                <span>Chauffeur:</span>
              </div>
              <div className="cout-value">
                {formatCurrency(itineraire.cout_chauffeur)}
              </div>
            </div>
          
            <div className="cout-item">
              <div className="cout-label">
                <span><Icon name="toll" /></span>
                <span>Péages:</span>
              </div>
              <div className="cout-value">
                {itineraire.cout_peage > 0 ? formatCurrency(itineraire.cout_peage) : 'Gratuit'}
              </div>
            </div>

            <div className="cout-separator"></div>
            
            <div className="cout-total">
              <div className="cout-label">
                <span><Icon name="cost" /></span>
                <span>Coût Total:</span>
              </div>
              <div className="cout-value">
                {formatCurrency(itineraire.cout_total)}
              </div>
            </div>
          </div>
        </div>

        {/* Client Price Section */}
        <div className="carte-client">
          <div className="client-item prix">
            <div className="client-label">
              <span><Icon name="price" /></span>
              <span>Prix de Vente:</span>
            </div>
            <div className="client-value">
              {formatCurrency(itineraire.prix_client)}
            </div>
          </div>
          
          <div className="client-item benefice">
            <div className="client-label">
              <span><Icon name="profit" /></span>
              <span>Bénéfice:</span>
            </div>
            <div className="client-value">
              {formatCurrency(itineraire.benefice)}
            </div>
          </div>
        </div>

        {/* Route Advantages */}
        <div className="carte-avantages">
          <h4 className="avantages-title" style={{display:'flex',alignItems:'center',gap:'8px'}}>
            <Icon name="check" />
            <span>Avantages</span>
          </h4>
          <div className="avantages-liste">
            {itineraire.niveau_risque === 'Faible' && (
              <div className="avantage-item">
                <span className="avantage-icon"><Icon name="shield" /></span>
                <span>Route sécurisée</span>
              </div>
            )}
            
            {itineraire.cout_peage === 0 && (
              <div className="avantage-item">
                <span className="avantage-icon"><Icon name="cost" /></span>
                <span>Sans péages</span>
              </div>
            )}
            
            {itineraire.benefice > 150 && (
              <div className="avantage-item">
                <span className="avantage-icon"><Icon name="profit" /></span>
                <span>Bénéfice élevé</span>
              </div>
            )}
            
            {itineraire.duree_heures < 3 && (
              <div className="avantage-item">
                <span className="avantage-icon"><Icon name="speed" /></span>
                <span>Trajet rapide</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="carte-actions">
        <button
          onClick={handleAssignerClick}
          className={`btn-assigner ${isRecommended ? 'recommended' : ''}`}
        >
          <span className="btn-icon"><Icon name="send" /></span>
          <span className="btn-text">Assigner cette Mission</span>
        </button>
        
        <div className="action-info">
          <div className="info-text">
            Un email sera envoyé au chauffeur avec les détails de la mission
          </div>
        </div>
      </div>
    </div>
  );
};

// Add CSS variables for the component
CarteItineraire.defaultProps = {
  style: {
    '--color-success-rgb': '56, 161, 105',
    '--color-warning-rgb': '221, 107, 32',
    '--color-error-rgb': '229, 62, 62',
    '--color-info-rgb': '49, 130, 206'
  }
};

export default CarteItineraire;
