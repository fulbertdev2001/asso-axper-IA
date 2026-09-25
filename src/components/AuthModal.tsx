import React, { useState, useEffect } from 'react';
import { Organization } from '../types';
import { 
  Building2, 
  Mail, 
  X, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Compass
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizations: Organization[];
  onSelectExistingOrg: (org: Organization) => void;
  onStartOnboarding: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  organizations,
  onSelectExistingOrg,
  onStartOnboarding
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'magic_link_sent'>('login');
  const [emailInput, setEmailInput] = useState('');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleMagicLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setAuthMode('magic_link_sent');
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(7, 22, 38, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: '16px'
      }}
    >
      <div
        className="card animate-fade-in"
        style={{
          maxWidth: 520,
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '24px 28px',
          boxShadow: 'var(--shadow-float)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Sticky-friendly Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '18px',
          paddingBottom: '12px',
          borderBottom: '1px solid var(--color-border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--color-blue) 0%, #003680 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 8px rgba(0, 74, 173, 0.25)'
            }}>
              <Compass size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', color: 'var(--color-navy)', margin: 0, lineHeight: 1.2 }}>
                Connexion Association
              </h2>
              <p style={{ fontSize: '11px', color: 'var(--color-navy-muted)', margin: 0 }}>
                Authentification Better Auth multi-tenant
              </p>
            </div>
          </div>

          {/* Prominent Close Button */}
          <button
            onClick={onClose}
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              backgroundColor: 'var(--color-surface-subtle)',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-navy)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.15s ease'
            }}
            title="Fermer (Échap)"
          >
            <X size={18} />
          </button>
        </div>

        {authMode === 'login' ? (
          <div>
            {/* Quick Demo Login Option for Boss / Testers */}
            <div style={{
              backgroundColor: 'var(--color-surface-hover)',
              border: '1.5px solid var(--color-border)',
              borderRadius: '14px',
              padding: '12px 14px',
              marginBottom: '16px'
            }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-blue)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.04em' }}>
                Accès direct (Comptes de test pré-configurés) :
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {organizations.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => {
                      onSelectExistingOrg(org);
                      onClose();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      backgroundColor: '#ffffff',
                      border: '1px solid var(--color-border)',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                    className="card-hover"
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--color-navy)' }}>
                        {org.name.split('(')[0].trim()}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--color-navy-muted)' }}>
                        {org.ccn.split('(')[0].trim()} &bull; {org.employeesCount} sal.
                      </div>
                    </div>
                    <ArrowRight size={14} style={{ color: 'var(--color-blue)' }} />
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '14px 0', color: 'var(--color-navy-muted)', fontSize: '11px' }}>
              <div style={{ flexGrow: 1, height: 1, backgroundColor: 'var(--color-border)' }}></div>
              <span>OU PAR MAGIC LINK</span>
              <div style={{ flexGrow: 1, height: 1, backgroundColor: 'var(--color-border)' }}></div>
            </div>

            {/* Magic Link Form */}
            <form onSubmit={handleMagicLinkSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label className="form-label" style={{ fontSize: '12px', marginBottom: '4px' }}>
                  Email du responsable :
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    className="input"
                    placeholder="direction@votre-association.org"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    style={{ height: 42, fontSize: '13px' }}
                    required
                  />
                  <Mail size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-navy-muted)' }} />
                </div>
              </div>

              <button type="submit" className="btn btn-secondary btn-sm" style={{ width: '100%', height: 40, fontWeight: 700 }}>
                <span>Recevoir un lien de connexion magique</span>
                <ArrowRight size={14} />
              </button>
            </form>

            {/* Create new account CTA */}
            <div style={{
              marginTop: '16px',
              paddingTop: '14px',
              borderTop: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <button
                onClick={() => {
                  onClose();
                  onStartOnboarding();
                }}
                className="btn btn-primary btn-sm"
                style={{ width: '100%', height: 42, fontSize: '13px' }}
              >
                <Sparkles size={14} />
                <span>Créer le compte de mon association (Nouveau)</span>
              </button>

              <button
                onClick={onClose}
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', height: 36, fontSize: '12px', color: 'var(--color-navy-muted)' }}
              >
                Fermer
              </button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              backgroundColor: 'var(--color-lime-glow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              color: 'var(--color-lime-dark)'
            }}>
              <CheckCircle2 size={26} />
            </div>
            <h3 style={{ fontSize: '16px', color: 'var(--color-navy)', marginBottom: '6px' }}>
              Lien magique envoyé !
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--color-navy-muted)', lineHeight: 1.5, marginBottom: '16px' }}>
              Un lien a été envoyé à <strong>{emailInput}</strong>.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => {
                  onSelectExistingOrg(organizations[0]);
                  onClose();
                }}
                className="btn btn-primary btn-sm"
                style={{ width: '100%' }}
              >
                <span>Simuler le clic sur le lien magique (Entrer)</span>
                <ArrowRight size={14} />
              </button>
              <button
                onClick={onClose}
                className="btn btn-secondary btn-sm"
                style={{ width: '100%' }}
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
