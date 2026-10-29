/**
 * FleetWise Enterprise - Route Results Display Component
 * Professional presentation of calculated routes with assignment functionality
 */

import React from 'react';
import Heroicon from '../../components/ui/Heroicons';
import { formatCurrency } from '../../utils/formatters';

const AffichageResultats = ({ itineraires, onAssignerRoute }) => {
  if (!itineraires || itineraires.length === 0) {
    return null;
  }

  // Sort routes: recommended first, then by recommendation score
  const itinerairesTries = [...itineraires].sort((a, b) => {
    if (a.recommande && !b.recommande) return -1;
    if (!a.recommande && b.recommande) return 1;
    return a.score_recommandation - b.score_recommandation;
  });

  const itineraireRecommande = itinerairesTries.find(it => it.recommande);
  const autresItineraires = itinerairesTries.filter(it => !it.recommande);

  // Calculate summary stats
  const distanceMoyenne = Math.round(
    itineraires.reduce((acc, route) => acc + route.distance_km, 0) / itineraires.length
  );

  const dureeMoyenne = Math.round(
    itineraires.reduce((acc, route) => acc + route.duree_heures, 0) / itineraires.length
  );

  const coutMoyen = Math.round(
    itineraires.reduce((acc, route) => acc + route.cout_total, 0) / itineraires.length
  );
  
  // Helper function for currency formatting
  const formatMoney = (amount) => {
    return formatCurrency ? formatCurrency(amount) : `${amount.toFixed(2)} MAD`;
  };
  
  // Get risk class based on level
  const getRiskClass = (niveau) => {
    switch (niveau?.toLowerCase()) {
      case 'faible': return 'low';
      case 'moyen': return 'medium';
      case 'élevé': return 'high';
      default: return 'medium';
    }
  };

  return (
    <div className="results-container">
      <header className="results-header">
        <h2 className="results-title">Résultats d'Analyse</h2>
        <p className="results-subtitle">
          {itineraires.length} itinéraire{itineraires.length > 1 ? 's' : ''} trouvé{itineraires.length > 1 ? 's' : ''} 
          - Sélectionnez l'option qui convient le mieux à vos besoins
        </p>
      </header>

      {/* Part 1: Summary Cards - Horizontal Grid Container */}
      <div className="summary-grid-container">
        {/* Card 1: Options d'Itinéraires */}
        <div className="summary-card">
          <div className="card-icon">
            <Heroicon icon="map" size={24} />
          </div>
          <div className="card-value">{itineraires.length}</div>
          <div className="card-label">Options d'Itinéraires</div>
        </div>

        {/* Card 2: Distance Moyenne */}
        <div className="summary-card">
          <div className="card-icon">
            <Heroicon icon="map-pin" size={24} />
          </div>
          <div className="card-value">{distanceMoyenne} km</div>
          <div className="card-label">Distance Moyenne</div>
        </div>

        {/* Card 3: Durée Moyenne */}
        <div className="summary-card">
          <div className="card-icon">
            <Heroicon icon="clock" size={24} />
          </div>
          <div className="card-value">{dureeMoyenne}h</div>
          <div className="card-label">Durée Moyenne</div>
        </div>

        {/* Card 4: Coût Moyen */}
        <div className="summary-card">
          <div className="card-icon">
            <Heroicon icon="currency-dollar" size={24} />
          </div>
          <div className="card-value">{coutMoyen} MAD</div>
          <div className="card-label">Coût Moyen</div>
        </div>
      </div>

      {/* Part 2: Main Detail Card for Recommended Route */}
      {itineraireRecommande && (
        <div className="detail-card">
          {/* Section A: Header with Title and Badge */}
          <div className="detail-header">
            <div className="detail-header-content">
              <h3 className="detail-title">
                <Heroicon icon="star" size={20} className="detail-title-icon" />
                {itineraireRecommande.nom_itineraire}
              </h3>
              <div className={`risk-indicator risk-${getRiskClass(itineraireRecommande.niveau_risque)}`}>
                <span className="risk-dot"></span>
                <span className="risk-label">Risque {itineraireRecommande.niveau_risque}</span>
              </div>
            </div>
            <div className="badge-recommended">RECOMMANDÉ</div>
          </div>

          {/* Section B: Key Metrics (Distance and Duration) Side by Side */}
          <div className="detail-metrics">
            {/* Distance Metric */}
            <div className="metric-item">
              <div className="metric-icon">
                <Heroicon icon="map-pin" size={18} />
              </div>
              <div className="metric-content">
                <div className="metric-label">Distance</div>
                <div className="metric-value">{itineraireRecommande.distance_km} km</div>
              </div>
            </div>
            
            {/* Duration Metric */}
            <div className="metric-item">
              <div className="metric-icon">
                <Heroicon icon="clock" size={18} />
              </div>
              <div className="metric-content">
                <div className="metric-label">Durée</div>
                <div className="metric-value">{itineraireRecommande.duree_formattee}</div>
              </div>
            </div>
          </div>

          {/* Section C: Cost Breakdown with Two-Column Layout */}
          <div className="detail-costs">
            <h4 className="costs-title">
              <Heroicon icon="currency-dollar" size={16} className="costs-title-icon" />
              Détail des Coûts
            </h4>
            
            <div className="costs-table">
              {/* Fuel Cost Row */}
              <div className="cost-row">
                <div className="cost-label">
                  <Heroicon icon="beaker" size={16} />
                  <span>Carburant:</span>
                </div>
                <div className="cost-value">
                  {formatMoney(itineraireRecommande.cout_carburant)}
                </div>
              </div>
              
              {/* Driver Cost Row */}
              <div className="cost-row">
                <div className="cost-label">
                  <Heroicon icon="user" size={16} />
                  <span>Chauffeur:</span>
                </div>
                <div className="cost-value">
                  {formatMoney(itineraireRecommande.cout_chauffeur)}
                </div>
              </div>
              
              {/* Toll Cost Row */}
              <div className="cost-row">
                <div className="cost-label">
                  <Heroicon icon="tag" size={16} />
                  <span>Péages:</span>
                </div>
                <div className="cost-value">
                  {itineraireRecommande.cout_peage > 0 ? formatMoney(itineraireRecommande.cout_peage) : 'Gratuit'}
                </div>
              </div>

              {/* Total Cost Row - Visual separator */}
              <div className="cost-row total">
                <div className="cost-label">
                  <Heroicon icon="currency-dollar" size={16} />
                  <span>Coût Total:</span>
                </div>
                <div className="cost-value">
                  {formatMoney(itineraireRecommande.cout_total)}
                </div>
              </div>

              {/* Sale Price Row - Highlighted */}
              <div className="cost-row sale-price">
                <div className="cost-label">
                  <Heroicon icon="tag" size={16} />
                  <span>Prix de Vente:</span>
                </div>
                <div className="cost-value">
                  {formatMoney(itineraireRecommande.prix_client)}
                </div>
              </div>
              
              {/* Profit Row - Highlighted */}
              <div className="cost-row profit">
                <div className="cost-label">
                  <Heroicon icon="chart-bar" size={16} />
                  <span>Bénéfice:</span>
                </div>
                <div className="cost-value">
                  {formatMoney(itineraireRecommande.benefice)}
                </div>
              </div>
            </div>
          </div>

          {/* Section D: Action Button */}
          <div className="detail-actions">
            <button
              onClick={() => onAssignerRoute(itineraireRecommande)}
              className="action-button"
            >
              <Heroicon icon="paper-airplane" size={16} />
              <span>Assigner cette Mission</span>
            </button>
            
            <div className="action-note">
              Un email sera envoyé au chauffeur avec les détails de la mission
            </div>
          </div>
        </div>
      )}

      {/* Alternative Routes Section */}
      {autresItineraires.length > 0 && (
        <div className="alternative-routes">
          <h3 className="section-title">
            <Heroicon icon="map" size={20} />
            Autres Options d'Itinéraires
          </h3>
          
          <div className="routes-grid">
            {autresItineraires.map((itineraire, index) => (
              <div key={itineraire.index || index} className="alternative-card">
                {/* Alternative Card Header */}
                <div className="alt-card-header">
                  <h4 className="alt-card-title">{itineraire.nom_itineraire}</h4>
                  <div className={`risk-indicator risk-${getRiskClass(itineraire.niveau_risque)}`}>
                    <span className="risk-dot"></span>
                    <span className="risk-label">Risque {itineraire.niveau_risque}</span>
                  </div>
                </div>

                {/* Alternative Card Metrics */}
                <div className="alt-card-metrics">
                  <div className="alt-metric">
                    <Heroicon icon="map-pin" size={14} />
                    <span className="alt-metric-label">Distance:</span>
                    <span className="alt-metric-value">{itineraire.distance_km} km</span>
                  </div>
                  <div className="alt-metric">
                    <Heroicon icon="clock" size={14} />
                    <span className="alt-metric-label">Durée:</span>
                    <span className="alt-metric-value">{itineraire.duree_formattee}</span>
                  </div>
                  <div className="alt-metric">
                    <Heroicon icon="currency-dollar" size={14} />
                    <span className="alt-metric-label">Prix:</span>
                    <span className="alt-metric-value">{formatMoney(itineraire.prix_client)}</span>
                  </div>
                </div>

                {/* Alternative Card Action */}
                <button
                  onClick={() => onAssignerRoute(itineraire)}
                  className="alt-action-button"
                >
                  Assigner
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend and Tips Section - Two Column Layout */}
      <div className="info-grid-container">
        {/* Risk Legend Card */}
        <div className="info-card">
          <div className="info-card-header">
            <Heroicon icon="shield-check" size={18} />
            <h4>Légende des Risques</h4>
          </div>
          <div className="info-card-body">
            <div className="info-item">
              <span className="risk-dot risk-low"></span>
              <span>Risque Faible : Principalement autoroutes</span>
            </div>
            
            <div className="info-item">
              <span className="risk-dot risk-medium"></span>
              <span>Risque Moyen : Routes mixtes</span>
            </div>
            
            <div className="info-item">
              <span className="risk-dot risk-high"></span>
              <span>Risque Élevé : Routes nationales</span>
            </div>
            
            <div className="info-item">
              <div className="badge-recommended small">RECOMMANDÉ</div>
              <span>Meilleur équilibre coût/temps</span>
            </div>
          </div>
        </div>

        {/* Selection Tips Card */}
        <div className="info-card">
          <div className="info-card-header">
            <Heroicon icon="information-circle" size={18} />
            <h4>Conseils de Sélection</h4>
          </div>
          <div className="info-card-body">
            <div className="info-item">
              <strong>Pour la rentabilité :</strong> Choisissez l'itinéraire avec le bénéfice le plus élevé
            </div>
            
            <div className="info-item">
              <strong>Pour la rapidité :</strong> Privilégiez les itinéraires avec moins de temps de trajet
            </div>
            
            <div className="info-item">
              <strong>Pour la sécurité :</strong> Optez pour les itinéraires à faible risque
            </div>
            
            <div className="info-item">
              <strong>Pour l'équilibre :</strong> Suivez notre recommandation automatique
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AffichageResultats;
