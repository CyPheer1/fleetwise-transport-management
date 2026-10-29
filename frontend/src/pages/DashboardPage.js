/**
 * FleetWise Enterprise Dashboard - Main Dashboard Page
 * Professional UI for route calculation and dispatch management
 */

import React, { useState } from 'react';
import FormulaireRecherche from '../components/dashboard/FormulaireRecherche';
import ResultatsAnalyse from '../components/dashboard/ResultatsAnalyse';
import ModalAssignation from '../components/dashboard/ModalAssignation';
import Heroicon from '../components/ui/Heroicons';
import '../styles/resultats.css';

const DashboardPage = () => {
  const [resultatsItineraires, setResultatsItineraires] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [erreurMessage, setErreurMessage] = useState('');
  const [modalAssignationOpen, setModalAssignationOpen] = useState(false);
  const [itineraireSelectionne, setItineraireSelectionne] = useState(null);

  const handleCalculCompleted = (resultats) => {
    setResultatsItineraires(resultats);
    setErreurMessage('');
    setIsLoading(false);
  };

  const handleCalculError = (erreur) => {
    setErreurMessage(erreur);
    setResultatsItineraires([]);
    setIsLoading(false);
  };

  const handleCalculStarted = () => {
    setIsLoading(true);
    setErreurMessage('');
    setResultatsItineraires([]);
  };

  const handleAssignerRoute = (itineraire) => {
    setItineraireSelectionne(itineraire);
    setModalAssignationOpen(true);
  };

  const handleCloseModal = () => {
    setModalAssignationOpen(false);
    setItineraireSelectionne(null);
  };

  const handleMissionEnvoyee = () => {
    // Mission successfully sent
    handleCloseModal();
    // Optional: display success notification
  };

  // Route stats calculation
  const getRouteStats = () => {
    if (!resultatsItineraires.length) return null;
    
    return {
      routeCount: resultatsItineraires.length,
      avgDistance: Math.round(resultatsItineraires.reduce((sum, route) => sum + route.distance_km, 0) / resultatsItineraires.length),
      avgDuration: Math.round(resultatsItineraires.reduce((sum, route) => sum + route.duree_heures, 0) / resultatsItineraires.length * 60), // in minutes
      bestPrice: Math.min(...resultatsItineraires.map(route => route.prix_client))
    };
  };
  
  const routeStats = getRouteStats();

  return (
    <div className="dashboard-page">
      {/* Calculator Section */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Calculateur d'Itinéraires</h2>
          <p className="card-subtitle">
            Saisissez les détails du trajet pour calculer les options optimales
        </p>
      </div>
        <div className="card-body">
            <FormulaireRecherche
              onCalculStarted={handleCalculStarted}
              onCalculCompleted={handleCalculCompleted}
              onCalculError={handleCalculError}
              isLoading={isLoading}
            />
          </div>
      </div>

      {/* Error Display */}
        {erreurMessage && (
        <div className="card" style={{borderLeft: '4px solid var(--color-error)', marginTop: 'var(--space-6)'}}>
          <div className="card-body">
            <div style={{display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)'}}>
              <Heroicon icon="exclamation-triangle" size={24} className="text-error" />
              <div>
                <h3 style={{marginBottom: 'var(--space-2)', color: 'var(--color-error)', fontWeight: 'var(--font-weight-semibold)'}}>Erreur</h3>
                <p style={{color: 'var(--text-secondary)'}}>{erreurMessage}</p>
              </div>
            </div>
          </div>
        </div>
        )}

      {/* Loading Indicator */}
        {isLoading && (
        <div className="card" style={{marginTop: 'var(--space-6)', textAlign: 'center', padding: 'var(--space-8)'}}>
          <div className="loading-spinner" style={{margin: '0 auto var(--space-4)', width: '32px', height: '32px'}}></div>
          <h3 style={{marginBottom: 'var(--space-3)'}}>Calcul d'Itinéraires en Cours</h3>
          <p style={{color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto'}}>
            Analyse des données géographiques, calcul des coûts et optimisation des options de route...
          </p>
        </div>
        )}

      {/* Results Display */}
        {resultatsItineraires.length > 0 && !isLoading && (
        <div style={{marginTop: 'var(--space-8)'}}>
          <ResultatsAnalyse
            itineraires={resultatsItineraires}
            onAssignerRoute={handleAssignerRoute}
          />
        </div>
        )}

      {/* FieldOps Welcome Section */}
        {resultatsItineraires.length === 0 && !isLoading && !erreurMessage && (
        <div className="card" style={{marginTop: 'var(--space-6)', textAlign: 'center', padding: 'var(--space-8)'}}>
          <Heroicon icon="truck" size={48} className="text-secondary" style={{margin: '0 auto var(--space-6)'}} />
          <h2 style={{marginBottom: 'var(--space-4)', fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)'}}>
            Bienvenue dans FleetWise Enterprise
          </h2>
          <p style={{
            maxWidth: '600px', 
            margin: '0 auto var(--space-8)', 
            color: 'var(--text-secondary)',
            fontSize: 'var(--text-base)',
            lineHeight: '1.6'
          }}>
            Utilisez le calculateur ci-dessus pour planifier vos missions de transport. 
            Saisissez une ville de départ, une ville d'arrivée et sélectionnez un camion 
            pour obtenir des options d'itinéraires optimisées.
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 'var(--space-6)',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)'}}>
              <Heroicon icon="currency-dollar" size={24} className="text-primary" />
              <span style={{fontWeight: 'var(--font-weight-medium)'}}>Calcul automatique des coûts</span>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)'}}>
              <Heroicon icon="map" size={24} className="text-primary" />
              <span style={{fontWeight: 'var(--font-weight-medium)'}}>Multiples options d'itinéraires</span>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)'}}>
              <Heroicon icon="paper-airplane" size={24} className="text-primary" />
              <span style={{fontWeight: 'var(--font-weight-medium)'}}>Assignation directe aux chauffeurs</span>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)'}}>
              <Heroicon icon="chart-bar-square" size={24} className="text-primary" />
              <span style={{fontWeight: 'var(--font-weight-medium)'}}>Recommandations intelligentes</span>
            </div>
          </div>
        </div>
        )}

      {/* Assignment Modal */}
      {modalAssignationOpen && itineraireSelectionne && (
        <div className="modal-overlay">
          <div className="modal">
        <ModalAssignation
          itineraire={itineraireSelectionne}
          onClose={handleCloseModal}
          onMissionEnvoyee={handleMissionEnvoyee}
        />
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
