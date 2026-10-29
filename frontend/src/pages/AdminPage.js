/**
 * Page d'administration FleetWise
 * Gestion des paramètres, camions, chauffeurs et péages
 */

import React, { useState } from 'react';
import '../styles/admin.css';
import ParametresGeneraux from '../components/admin/ParametresGeneraux';
import GestionCamions from '../components/admin/GestionCamions';
import GestionChauffeurs from '../components/admin/GestionChauffeurs';
import GestionPeages from '../components/admin/GestionPeages';
import Heroicon from '../components/ui/Heroicons';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('parametres');

  const renderContent = () => {
    switch (activeTab) {
      case 'parametres':
        return <ParametresGeneraux />;
      case 'camions':
        return <GestionCamions />;
      case 'chauffeurs':
        return <GestionChauffeurs />;
      case 'peages':
        return <GestionPeages />;
      default:
        return <ParametresGeneraux />;
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="admin-title">Administration FleetWise</h1>
        <p className="admin-description">Gérez les paramètres système, la flotte de camions, les chauffeurs et les tarifs de péage.</p>
      </div>

      <div className="tab-navigation">
        <button 
          className={`tab-item ${activeTab === 'parametres' ? 'active' : ''}`}
          onClick={() => setActiveTab('parametres')}
        >
          <Heroicon icon="cog" size={18} className="tab-icon" />
          <span>Paramètres Généraux</span>
        </button>
        <button 
          className={`tab-item ${activeTab === 'camions' ? 'active' : ''}`}
          onClick={() => setActiveTab('camions')}
        >
          <Heroicon icon="truck" size={18} className="tab-icon" />
          <span>Gestion des Camions</span>
        </button>
        <button 
          className={`tab-item ${activeTab === 'chauffeurs' ? 'active' : ''}`}
          onClick={() => setActiveTab('chauffeurs')}
        >
          <Heroicon icon="user" size={18} className="tab-icon" />
          <span>Gestion des Chauffeurs</span>
        </button>
        <button
          className={`tab-item ${activeTab === 'peages' ? 'active' : ''}`}
          onClick={() => setActiveTab('peages')}
        >
          <Heroicon icon="map" size={18} className="tab-icon" />
          <span>Tarifs des Péages</span>
        </button>
      </div>
      
      <div className="tab-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminPage;
