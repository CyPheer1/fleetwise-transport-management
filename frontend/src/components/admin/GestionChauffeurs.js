import React from 'react';
import GestionTableau from './GestionTableau';
import Heroicon from '../ui/Heroicons';

const GestionChauffeurs = () => {
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
        <Heroicon icon="user" size={20} className="text-primary" />
        Gestion des Chauffeurs
      </h3>
      
      <div>
        <GestionTableau
          endpoint="chauffeurs"
          title="Chauffeurs"
          colonnes={[
            { key: 'nom', label: 'Nom', type: 'text', required: true, placeholder: 'Ahmed Ben Ali' },
            { key: 'email', label: 'Email', type: 'email', required: true, placeholder: 'ahmed@example.com' },
          ]}
          validationRules={{
            email: (v) => /.+@.+\..+/.test(v) ? '' : 'Adresse email invalide',
          }}
        />
      </div>
    </div>
  );
};

export default GestionChauffeurs;
