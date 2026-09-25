import React from 'react';
import { Organization } from '../types';
import { 
  Building2, 
  UserCheck, 
  Globe2, 
  HelpCircle,
  Shield,
  Layers
} from 'lucide-react';

export type PersonaRole = 'public' | 'client_asso' | 'admin_laetitia';

interface PersonaSwitcherProps {
  currentRole: PersonaRole;
  onRoleChange: (role: PersonaRole) => void;
  currentOrg: Organization;
  organizations: Organization[];
  onOrgChange: (org: Organization) => void;
  onOpenTestGuide: () => void;
}

export const PersonaSwitcher: React.FC<PersonaSwitcherProps> = ({
  currentRole,
  onRoleChange,
  currentOrg,
  organizations,
  onOrgChange,
  onOpenTestGuide
}) => {
  return (
    <div style={{
      backgroundColor: '#071626',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      color: '#ffffff',
      padding: '8px 20px',
      fontSize: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '12px',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Role Selection Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{
          fontSize: '11px',
          fontWeight: 800,
          color: '#94a3b8',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <Layers size={14} style={{ color: 'var(--color-lime)' }} />
          <span>Espace actif :</span>
        </span>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          borderRadius: 'var(--radius-pill)',
          padding: '2px',
          border: '1px solid rgba(255, 255, 255, 0.15)'
        }}>
          {/* 1. Public Visitor */}
          <button
            onClick={() => onRoleChange('public')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              backgroundColor: currentRole === 'public' ? 'var(--color-blue)' : 'transparent',
              color: currentRole === 'public' ? '#ffffff' : '#cbd5e1'
            }}
          >
            <Globe2 size={13} />
            <span>1. Site Public (SEO)</span>
          </button>

          {/* 2. Client Association */}
          <button
            onClick={() => onRoleChange('client_asso')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 14px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              backgroundColor: currentRole === 'client_asso' ? '#ffffff' : 'transparent',
              color: currentRole === 'client_asso' ? 'var(--color-navy)' : '#cbd5e1'
            }}
          >
            <Building2 size={13} style={{ color: currentRole === 'client_asso' ? 'var(--color-blue)' : '#cbd5e1' }} />
            <span>2. Espace Client (Association)</span>
          </button>

          {/* 3. Admin Laetitia Badji */}
          <button
            onClick={() => onRoleChange('admin_laetitia')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 14px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              backgroundColor: currentRole === 'admin_laetitia' ? 'var(--color-lime)' : 'transparent',
              color: currentRole === 'admin_laetitia' ? 'var(--color-navy)' : '#cbd5e1'
            }}
          >
            <Shield size={13} style={{ color: currentRole === 'admin_laetitia' ? 'var(--color-navy)' : 'var(--color-lime)' }} />
            <span>3. Back-Office (Laetitia Badji)</span>
          </button>
        </div>
      </div>

      {/* Center status / Connected persona details */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
        {currentRole === 'client_asso' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#94a3b8', fontSize: '11px' }}>Simuler une autre structure :</span>
            <select
              value={currentOrg.id}
              onChange={(e) => {
                const selected = organizations.find(o => o.id === e.target.value);
                if (selected) onOrgChange(selected);
              }}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                borderRadius: 'var(--radius-sm)',
                padding: '3px 8px',
                fontSize: '11px',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {organizations.map(org => (
                <option key={org.id} value={org.id} style={{ color: 'var(--color-navy)', backgroundColor: '#ffffff' }}>
                  {org.name.split('(')[0].trim()} ({org.ccn.split('(')[0].trim()})
                </option>
              ))}
            </select>
          </div>
        )}

        {currentRole === 'admin_laetitia' && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(193, 255, 114, 0.15)',
            border: '1px solid var(--color-lime)',
            color: 'var(--color-lime)',
            padding: '2px 8px',
            borderRadius: 'var(--radius-pill)',
            fontSize: '11px',
            fontWeight: 700
          }}>
            <span>Connecté : Laetitia Badji &bull; Cabinet Maé / AKILIGUE SAS</span>
          </div>
        )}


        {/* Boss Demo Guide Modal trigger */}
        <button
          onClick={onOpenTestGuide}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(0, 74, 173, 0.4)',
            color: '#60a5fa',
            border: '1px solid rgba(96, 165, 250, 0.4)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-pill)',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <HelpCircle size={12} />
          <span>Scénarios de test (Boss)</span>
        </button>
      </div>
    </div>
  );
};
