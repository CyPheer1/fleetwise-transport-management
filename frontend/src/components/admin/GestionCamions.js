import React from 'react';
import GestionTableau from './GestionTableau';
import Heroicon from '../ui/Heroicons';

const GestionCamions = () => {
  return (
    <div className="param-card">
      <h3 className="param-card-title" style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        paddingBottom: 'var(--space-4)',
        borderBottom: '1px solid var(--border-color)',
        marginBottom: 'var(--space-6)'
      }}>
        <Heroicon icon="truck" size={20} className="text-primary" />
        Gestion de la Flotte de Camions
      </h3>
      
      <div>
        <GestionTableau
          endpoint="camions"
          title="Camions"
          colonnes={[
            { key: 'nom', label: 'Nom', type: 'text', required: true, placeholder: 'Camion 12T' },
            { key: 'consommation', label: 'Consommation (L/100km)', type: 'number', required: true, step: 0.1, placeholder: '35.0' },
          ]}
          validationRules={{
            consommation: (v) => isNaN(parseFloat(v)) || parseFloat(v) <= 0 ? 'La consommation doit être un nombre positif' : '',
          }}
        />
      </div>
    </div>
  );
};

export default GestionCamions;
