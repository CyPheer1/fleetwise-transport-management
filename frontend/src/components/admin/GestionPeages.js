import React from 'react';
import GestionTableau from './GestionTableau';
import Heroicon from '../ui/Heroicons';

const GestionPeages = () => {
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
        <Heroicon icon="map" size={20} className="text-primary" />
        Gestion des Tarifs de Péage
      </h3>
      
      <div>
        <GestionTableau
          endpoint="peages"
          title="Péages"
          colonnes={[
            { key: 'ville_depart', label: 'Ville de Départ', type: 'text', required: true, placeholder: 'Casablanca' },
            { key: 'ville_arrivee', label: 'Ville d\'Arrivée', type: 'text', required: true, placeholder: 'Rabat' },
            { key: 'prix', label: 'Prix (MAD)', type: 'number', required: true, step: 0.01, placeholder: '23.00' },
          ]}
          validationRules={{
            prix: (v) => isNaN(parseFloat(v)) || parseFloat(v) < 0 ? 'Le prix doit être un nombre positif' : '',
          }}
        />
      </div>
    </div>
  );
};

export default GestionPeages;
