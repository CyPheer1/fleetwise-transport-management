/**
 * FleetWise Enterprise Dashboard
 * Premium interface for transport logistics management
 */

import React, { useState, useEffect } from 'react';
import './styles/fieldops-design-system.css';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import Heroicon from './components/ui/Heroicons';
import api from './services/api';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [apiStatus, setApiStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  useEffect(() => {
    // Check API status on startup
    checkApiStatus();
    
    // Handle responsive sidebar
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarExpanded(false);
      } else {
        setSidebarExpanded(true);
      }
    };
    
    // Initial check
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const checkApiStatus = async () => {
    try {
      const status = await api.getApiStatus();
      setApiStatus(status);
    } catch (error) {
      console.error('API non accessible:', error);
      setApiStatus({ status: 'ERROR', message: 'API non accessible' });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };
  
  // Page title based on current page
  const getPageTitle = () => {
    switch (currentPage) {
      case 'dashboard':
        return 'Tableau de Bord';
      case 'admin':
        return 'Administration';
      default:
        return 'FleetWise';
    }
  };

  if (isLoading) {
    return (
      <div className="card" style={{margin: '100px auto', maxWidth: '400px', textAlign: 'center'}}>
        <div className="card-body" style={{padding: '40px'}}>
          <div className="loading-spinner" style={{width: '40px', height: '40px', margin: '0 auto 20px'}}></div>
          <h2 style={{marginBottom: '16px'}}>Chargement de FleetWise</h2>
          <p className="text-secondary">Connexion au serveur en cours...</p>
        </div>
      </div>
    );
  }

  if (apiStatus?.status === 'ERROR') {
    return (
      <div className="card" style={{margin: '100px auto', maxWidth: '500px', border: '1px solid var(--border-color)'}}>
        <div className="card-body" style={{padding: '40px', textAlign: 'center'}}>
          <Heroicon icon="exclamation-triangle" size={48} className="text-error" style={{marginBottom: '16px'}} />
          <h2 style={{marginBottom: '16px', color: 'var(--color-error)'}}>Erreur de Connexion</h2>
          <p style={{marginBottom: '24px'}}>Impossible de se connecter au serveur FleetWise. Veuillez vérifier que le serveur Django est démarré.</p>
          <button onClick={checkApiStatus} className="btn btn-primary">
            <Heroicon icon="arrow-path" size={18} style={{marginRight: '8px'}} />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      {/* Vertical Sidebar */}
      <aside className={`sidebar ${sidebarExpanded ? 'expanded' : ''}`}>
        <div className="sidebar-logo">
          <Heroicon icon="truck" size={24} className="text-white" />
          <h1>FleetWise</h1>
        </div>
        
        <nav className="nav-menu">
          <div 
            className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentPage('dashboard')}
          >
            <span className="nav-icon">
              <Heroicon icon="chart-bar" size={20} />
            </span>
            <span className="nav-label">Tableau de Bord</span>
          </div>
          
          <div 
            className={`nav-item ${currentPage === 'admin' ? 'active' : ''}`}
            onClick={() => setCurrentPage('admin')}
          >
            <span className="nav-icon">
              <Heroicon icon="cog" size={20} />
            </span>
            <span className="nav-label">Administration</span>
          </div>
        </nav>
        
        <div className="sidebar-footer">
          <div className={`status-indicator ${apiStatus?.status === 'OK' ? 'text-success' : 'text-danger'}`}>
            {apiStatus?.status === 'OK' ? 'API Connectée' : 'API Déconnectée'}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-content">
        {/* Header */}
        <header className="header">
          <div className="d-flex align-center">
            <button 
              onClick={toggleSidebar}
              className="btn btn-secondary"
              style={{
                padding: 'var(--space-2)',
                marginRight: 'var(--space-4)',
                minWidth: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Heroicon icon="bars-3" size={20} />
            </button>
            <h1 className="page-title">{getPageTitle()}</h1>
          </div>
          
          <div className="header-actions">
            {currentPage === 'dashboard' && (
              <button className="btn btn-primary">
                <Heroicon icon="chart-bar" size={18} style={{marginRight: '8px'}} />
                Nouvelle Analyse
              </button>
            )}
            {currentPage === 'admin' && (
              <button className="btn btn-primary">
                <Heroicon icon="cog" size={18} style={{marginRight: '8px'}} />
                Gérer Paramètres
              </button>
            )}
            <div className="header-icon">
              <Heroicon icon="user" size={20} />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="content-container">
        {currentPage === 'dashboard' && <DashboardPage />}
        {currentPage === 'admin' && <AdminPage />}
        </div>
        
        {/* FieldOps Footer */}
        <footer style={{
          padding: 'var(--space-5)',
          borderTop: '1px solid var(--border-color)',
          textAlign: 'center',
          fontSize: 'var(--text-sm)',
          color: 'var(--text-secondary)',
          backgroundColor: 'var(--bg-card)'
        }}>
          © 2025 FleetWise - Solution de Gestion de Transport Intelligente
        </footer>
      </div>
    </div>
  );
}

export default App;
