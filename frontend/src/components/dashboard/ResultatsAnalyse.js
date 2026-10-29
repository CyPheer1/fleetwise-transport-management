/**
 * FleetWise Enterprise - Results Display Component
 * Professional dashboard presentation of route analysis results
 */

import React from 'react';
import Heroicon from '../ui/Heroicons';

const ResultatsAnalyse = ({ itineraires, onAssignerRoute }) => {
  if (!itineraires || itineraires.length === 0) {
    return null;
  }

  // Sort routes: recommended first
  const itinerairesTries = [...itineraires].sort((a, b) => {
    if (a.recommande && !b.recommande) return -1;
    if (!a.recommande && b.recommande) return 1;
    return a.score_recommandation - b.score_recommandation;
  });

  const itineraireRecommande = itinerairesTries.find(it => it.recommande);

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

  // Format currency 
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="resultats-section">
      <header className="resultats-header">
        <h2 className="resultats-title">Résultats d'Analyse</h2>
        <p className="resultats-subtitle">
          {itineraires.length} itinéraire{itineraires.length > 1 ? 's' : ''} trouvé{itineraires.length > 1 ? 's' : ''} 
        </p>
      </header>

      {/* PRINCIPLE 1: STRUCTURE - Four distinct cards for summary metrics */}
      <div className="summary-metrics">
        {/* Card 1: Options d'Itinéraires */}
        <div className="metric-card">
          <div className="metric-icon">
            <Heroicon icon="map" size={24} />
          </div>
          <div className="metric-value">{itineraires.length}</div>
          <div className="metric-label">Options d'Itinéraires</div>
        </div>

        {/* Card 2: Distance Moyenne */}
        <div className="metric-card">
          <div className="metric-icon">
            <Heroicon icon="map-pin" size={24} />
          </div>
          <div className="metric-value">{distanceMoyenne} km</div>
          <div className="metric-label">Distance Moyenne</div>
        </div>

        {/* Card 3: Durée Moyenne */}
        <div className="metric-card">
          <div className="metric-icon">
            <Heroicon icon="clock" size={24} />
          </div>
          <div className="metric-value">{dureeMoyenne}h</div>
          <div className="metric-label">Durée Moyenne</div>
        </div>

        {/* Card 4: Coût Moyen */}
        <div className="metric-card">
          <div className="metric-icon">
            <Heroicon icon="currency-dollar" size={24} />
          </div>
          <div className="metric-value">{coutMoyen} MAD</div>
          <div className="metric-label">Coût Moyen</div>
        </div>
      </div>

      {/* PRINCIPLE 1: STRUCTURE - Single primary card for recommended route */}
      {itineraireRecommande && (
        <div className="itineraire-card">
          {/* Card Header with Title and Badge */}
          <div className="itineraire-header">
            <div className="itineraire-title-container">
              <h3 className="itineraire-title">
                <Heroicon icon="star" size={20} className="title-icon" />
                {itineraireRecommande.nom_itineraire}
              </h3>
              <div className="risk-indicator">
                <span className={`risk-dot risk-${itineraireRecommande.niveau_risque.toLowerCase()}`}></span>
                <span className="risk-label">Risque {itineraireRecommande.niveau_risque}</span>
              </div>
            </div>
            <div className="badge-recommande">RECOMMANDÉ</div>
          </div>

          {/* PRINCIPLE 2: CLARITY - Key metrics side by side */}
          <div className="key-metrics">
            <div className="metric-block">
              <div className="metric-block-icon">
                <Heroicon icon="map-pin" size={20} />
              </div>
              <div className="metric-block-content">
                <div className="metric-block-label">Distance</div>
                <div className="metric-block-value">{itineraireRecommande.distance_km} km</div>
              </div>
            </div>
            
            <div className="metric-block">
              <div className="metric-block-icon">
                <Heroicon icon="clock" size={20} />
              </div>
              <div className="metric-block-content">
                <div className="metric-block-label">Durée</div>
                <div className="metric-block-value">{itineraireRecommande.duree_formattee}</div>
              </div>
            </div>
          </div>

          {/* PRINCIPLE 2: CLARITY - Financial data in two-column layout */}
          <div className="cost-section">
            <h4 className="section-subtitle">
              <Heroicon icon="currency-dollar" size={18} />
              Détail des Coûts
            </h4>
            
            <div className="cost-table">
              {/* Regular costs */}
              <div className="cost-row">
                <div className="cost-label">
                  <Heroicon icon="beaker" size={16} />
                  <span>Carburant</span>
                </div>
                <div className="cost-value">{formatCurrency(itineraireRecommande.cout_carburant)}</div>
              </div>
              
              <div className="cost-row">
                <div className="cost-label">
                  <Heroicon icon="user" size={16} />
                  <span>Chauffeur</span>
                </div>
                <div className="cost-value">{formatCurrency(itineraireRecommande.cout_chauffeur)}</div>
              </div>
              
              <div className="cost-row">
                <div className="cost-label">
                  <Heroicon icon="tag" size={16} />
                  <span>Péages</span>
                </div>
                <div className="cost-value">
                  {itineraireRecommande.cout_peage > 0 ? formatCurrency(itineraireRecommande.cout_peage) : 'Gratuit'}
                </div>
              </div>
              
              {/* PRINCIPLE 3: HIERARCHY - Visual separation for total */}
              <div className="cost-row total">
                <div className="cost-label">
                  <Heroicon icon="calculator" size={16} />
                  <span>Coût Total</span>
                </div>
                <div className="cost-value">{formatCurrency(itineraireRecommande.cout_total)}</div>
              </div>
              
              {/* PRINCIPLE 3: HIERARCHY - Highlighting important values */}
              <div className="cost-row price">
                <div className="cost-label">
                  <Heroicon icon="cash" size={16} />
                  <span>Prix de Vente</span>
                </div>
                <div className="cost-value primary">{formatCurrency(itineraireRecommande.prix_client)}</div>
              </div>
              
              <div className="cost-row profit">
                <div className="cost-label">
                  <Heroicon icon="chart-bar" size={16} />
                  <span>Bénéfice</span>
                </div>
                <div className="cost-value success">{formatCurrency(itineraireRecommande.benefice)}</div>
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="itineraire-action">
            <button
              onClick={() => onAssignerRoute(itineraireRecommande)}
              className="btn-primary"
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

      {/* Supporting information in cards */}
      <div className="support-section">
        {/* Legend Card */}
        <div className="support-card">
          <div className="support-card-header">
            <Heroicon icon="information-circle" size={18} />
            <h4>Légende des Risques</h4>
          </div>
          <div className="support-card-body">
            <div className="legend-item">
              <span className="risk-dot risk-faible"></span>
              <span>Risque Faible : Principalement autoroutes</span>
            </div>
            
            <div className="legend-item">
              <span className="risk-dot risk-moyen"></span>
              <span>Risque Moyen : Routes mixtes</span>
            </div>
            
            <div className="legend-item">
              <span className="risk-dot risk-élevé"></span>
              <span>Risque Élevé : Routes nationales</span>
            </div>
          </div>
        </div>

        {/* Tips Card */}
        <div className="support-card">
          <div className="support-card-header">
            <Heroicon icon="light-bulb" size={18} />
            <h4>Conseils de Sélection</h4>
          </div>
          <div className="support-card-body">
            <div className="tip-item">
              <strong>Pour la rentabilité :</strong> Choisissez l'itinéraire avec le bénéfice le plus élevé
            </div>
            
            <div className="tip-item">
              <strong>Pour la rapidité :</strong> Privilégiez les itinéraires avec moins de temps de trajet
            </div>
            
            <div className="tip-item">
              <strong>Pour la sécurité :</strong> Optez pour les itinéraires à faible risque
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultatsAnalyse;

