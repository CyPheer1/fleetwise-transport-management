/**
 * FleetWise Enterprise - Route Detail Component
 * Professional display of route details with assignment functionality
 */

import React from 'react';
import Heroicon from '../../components/ui/Heroicons';

const DetailItineraire = ({ itineraire, onAssigner, isRecommended = false, isCompact = false }) => {
  if (!itineraire) return null;

  const getRiskClass = (niveau) => {
    switch (niveau?.toLowerCase()) {
      case 'faible':
        return 'low';
      case 'moyen':
        return 'medium';
      case 'élevé':
        return 'high';
      default:
        return 'medium';
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
    <div className={`route-detail-card ${isRecommended ? 'recommended' : ''} ${isCompact ? 'compact' : ''}`}>
      <div className="card-header">
        <div className="header-content">
          <h3 className="route-title">
            <Heroicon icon="star" size={18} className="route-title-icon" />
            {itineraire.nom_itineraire}
          </h3>
          
          <div className={`risk-indicator risk-${riskClass}`}>
            <span className="risk-dot"></span>
            <span className="risk-text">Risque {itineraire.niveau_risque}</span>
          </div>
        </div>
        
        {isRecommended && (
          <div className="badge badge-recommended">RECOMMANDÉ</div>
        )}
      </div>

      <div className="card-body">
        {/* Key Metrics Section - Side by Side */}
        <div className="key-metrics-section">
          <div className="metric-item">
            <div className="metric-icon">
              <Heroicon icon="map-pin" size={18} />
            </div>
            <div className="metric-content">
              <div className="metric-label">Distance</div>
              <div className="metric-value">{itineraire.distance_km} km</div>
            </div>
          </div>
          
          <div className="metric-item">
            <div className="metric-icon">
              <Heroicon icon="clock" size={18} />
            </div>
            <div className="metric-content">
              <div className="metric-label">Durée</div>
              <div className="metric-value">{itineraire.duree_formattee}</div>
            </div>
          </div>
        </div>

        {/* Cost Breakdown Section - Table Layout with Right Alignment */}
        <div className="costs-section">
          <h4 className="section-subtitle">
            <Heroicon icon="currency-dollar" size={16} className="section-subtitle-icon" />
            Détail des Coûts
          </h4>
          
          <div className="costs-table">
            {/* Individual Cost Items */}
            <div className="cost-row">
              <div className="cost-label">
                <Heroicon icon="beaker" size={16} className="cost-icon" />
                <span>Carburant:</span>
              </div>
              <div className="cost-value">
                {formatCurrency(itineraire.cout_carburant)}
              </div>
            </div>
          
            <div className="cost-row">
              <div className="cost-label">
                <Heroicon icon="user" size={16} className="cost-icon" />
                <span>Chauffeur:</span>
              </div>
              <div className="cost-value">
                {formatCurrency(itineraire.cout_chauffeur)}
              </div>
            </div>
          
            <div className="cost-row">
              <div className="cost-label">
                <Heroicon icon="tag" size={16} className="cost-icon" />
                <span>Péages:</span>
              </div>
              <div className="cost-value">
                {itineraire.cout_peage > 0 ? formatCurrency(itineraire.cout_peage) : 'Gratuit'}
              </div>
            </div>

            {/* Total Cost - Visual Separation */}
            <div className="cost-row total">
              <div className="cost-label">
                <Heroicon icon="currency-dollar" size={16} className="cost-icon" />
                <span>Coût Total:</span>
              </div>
              <div className="cost-value">
                {formatCurrency(itineraire.cout_total)}
              </div>
            </div>

            {/* Highlighted Rows for Important Data */}
            <div className="cost-row sale-price">
              <div className="cost-label">
                <Heroicon icon="tag" size={16} className="cost-icon" />
                <span>Prix de Vente:</span>
              </div>
              <div className="cost-value highlight">
                {formatCurrency(itineraire.prix_client)}
              </div>
            </div>
            
            <div className="cost-row profit">
              <div className="cost-label">
                <Heroicon icon="chart-bar" size={16} className="cost-icon" />
                <span>Bénéfice:</span>
              </div>
              <div className="cost-value success">
                {formatCurrency(itineraire.benefice)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card-footer">
        <button
          onClick={handleAssignerClick}
          className="btn-assign"
        >
          <Heroicon icon="paper-airplane" size={16} className="btn-icon" />
          <span>Assigner cette Mission</span>
        </button>
        
        <div className="assignment-note">
          Un email sera envoyé au chauffeur avec les détails de la mission
        </div>
      </div>
    </div>
  );
};

export default DetailItineraire;
