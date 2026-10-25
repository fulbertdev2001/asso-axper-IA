import React from 'react';
import { Organization, Subscription, Plan } from '../types';
import { 
  Compass, 
  Building2, 
  MessageSquare, 
  UserCheck, 
  CreditCard, 
  Settings2, 
  Globe2,
  ChevronDown,
  Smartphone,
  Monitor
} from 'lucide-react';

interface HeaderProps {
  currentView: string;
  onViewChange: (view: string) => void;
  organizations: Organization[];
  currentOrg: Organization;
  onOrgChange: (org: Organization) => void;
  subscription: Subscription;
  currentPlan: Plan;
  isMobileSimulator: boolean;
  onToggleMobileSimulator: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  organizations,
  currentOrg,
  onOrgChange,
  subscription,
  currentPlan,
  isMobileSimulator,
  onToggleMobileSimulator
}) => {
  return (
    <header style={{
      backgroundColor: 'rgba(255, 255, 255, 0.96)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--color-border)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 2px 10px rgba(10, 37, 64, 0.04)'
    }}>
      {/* Top Banner with Org Switcher and Smartphone Simulator toggle */}
      <div style={{
        background: 'linear-gradient(90deg, #07192b 0%, #0A2540 60%, #103358 100%)',
        color: '#ffffff',
        padding: '8px 24px',
        fontSize: 'var(--text-xs)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="live-dot"></span>
            <span style={{
              backgroundColor: 'var(--color-lime)',
              color: 'var(--color-navy)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-pill)',
              fontWeight: 800,
              fontSize: '10px',
              letterSpacing: '0.05em'
            }}>
              PILOT ASSO DESIGN SYSTEM
            </span>
          </div>
          <span style={{ color: '#cbd5e1', fontWeight: 500 }}>
            AssoExpert IA &bull; Next.js 16 + Payload CMS Architecture
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          {/* Smartphone Simulator Toggle */}
          <button
            onClick={onToggleMobileSimulator}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: isMobileSimulator ? 'var(--color-lime)' : 'rgba(255, 255, 255, 0.12)',
              color: isMobileSimulator ? 'var(--color-navy)' : '#ffffff',
              border: isMobileSimulator ? 'none' : '1px solid rgba(255, 255, 255, 0.25)',
              padding: '4px 12px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            title="Basculez entre le mode d'affichage Desktop et le simulateur Smartphone mobile"
          >
            {isMobileSimulator ? (
              <>
                <Monitor size={14} />
                <span>Plein Écran Web</span>
              </>
            ) : (
              <>
                <Smartphone size={14} />
                <span>Simulateur Mobile</span>
              </>
            )}
          </button>

          {/* Quick Org Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#94a3b8', fontSize: '11px' }}>Structure :</span>
            <div style={{ position: 'relative' }}>
              <select
                value={currentOrg.id}
                onChange={(e) => {
                  const selected = organizations.find(o => o.id === e.target.value);
                  if (selected) onOrgChange(selected);
                }}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.22)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '4px 28px 4px 10px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  appearance: 'none',
                  outline: 'none'
                }}
              >
                {organizations.map(org => (
                  <option key={org.id} value={org.id} style={{ color: 'var(--color-navy)', backgroundColor: '#ffffff' }}>
                    {org.name.split('(')[0].trim()} ({org.ccn.split('(')[0].trim()})
                  </option>
                ))}
              </select>
              <ChevronDown size={13} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#94a3b8' }} />
            </div>
          </div>

          {/* Plan indicator */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(193, 255, 114, 0.12)',
            border: '1px solid rgba(193, 255, 114, 0.4)',
            color: 'var(--color-lime)',
            padding: '2px 10px',
            borderRadius: 'var(--radius-pill)',
            fontSize: '11px',
            fontWeight: 700
          }}>
            <span>{currentPlan.label} ({currentPlan.priceMonthly}&nbsp;€/m)</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Brand */}
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', userSelect: 'none' }} 
          onClick={() => onViewChange('landing')}
        >
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--color-blue) 0%, #003680 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 14px rgba(0, 74, 173, 0.3)'
          }}>
            <Compass size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '22px',
                color: 'var(--color-navy)',
                letterSpacing: '-0.03em'
              }}>
                AssoExpert<span style={{ color: 'var(--color-blue)' }}>.IA</span>
              </span>
              <span className="badge badge-lime" style={{ fontSize: '10px', padding: '2px 8px' }}>
                Cabinet Maé
              </span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-navy-muted)', fontWeight: 500 }}>
              Assistance juridique & sociale &bull; Associations employeuses
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          backgroundColor: 'var(--color-bg-app)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => onViewChange('landing')}
            className="btn btn-sm"
            style={{
              backgroundColor: currentView === 'landing' ? '#ffffff' : 'transparent',
              color: currentView === 'landing' ? 'var(--color-blue)' : 'var(--color-navy)',
              boxShadow: currentView === 'landing' ? 'var(--shadow-card)' : 'none',
              fontWeight: currentView === 'landing' ? 700 : 600
            }}
          >
            <Globe2 size={16} />
            <span>Site Public SEO</span>
          </button>

          <button
            onClick={() => onViewChange('chat')}
            className="btn btn-sm"
            style={{
              backgroundColor: currentView === 'chat' ? '#ffffff' : 'transparent',
              color: currentView === 'chat' ? 'var(--color-blue)' : 'var(--color-navy)',
              boxShadow: currentView === 'chat' ? 'var(--shadow-card)' : 'none',
              fontWeight: currentView === 'chat' ? 700 : 600
            }}
          >
            <MessageSquare size={16} />
            <span>Assistant IA (4 briques)</span>
          </button>

          <button
            onClick={() => onViewChange('escalation')}
            className="btn btn-sm"
            style={{
              backgroundColor: currentView === 'escalation' ? '#ffffff' : 'transparent',
              color: currentView === 'escalation' ? 'var(--color-blue)' : 'var(--color-navy)',
              boxShadow: currentView === 'escalation' ? 'var(--shadow-card)' : 'none',
              fontWeight: currentView === 'escalation' ? 700 : 600
            }}
          >
            <UserCheck size={16} />
            <span>Question Experte 48h</span>
            <span style={{
              backgroundColor: currentView === 'escalation' ? 'var(--color-blue-light)' : 'rgba(10, 37, 64, 0.08)',
              color: currentView === 'escalation' ? 'var(--color-blue)' : 'var(--color-navy)',
              fontSize: '11px',
              padding: '1px 6px',
              borderRadius: 'var(--radius-pill)',
              fontWeight: 800
            }}>
              {currentPlan.features.expertQuestionsMonth - subscription.questionsUsedThisMonth}
            </span>
          </button>

          <button
            onClick={() => onViewChange('profile')}
            className="btn btn-sm"
            style={{
              backgroundColor: currentView === 'profile' ? '#ffffff' : 'transparent',
              color: currentView === 'profile' ? 'var(--color-blue)' : 'var(--color-navy)',
              boxShadow: currentView === 'profile' ? 'var(--shadow-card)' : 'none',
              fontWeight: currentView === 'profile' ? 700 : 600
            }}
          >
            <Building2 size={16} />
            <span>Profil Asso</span>
          </button>

          <button
            onClick={() => onViewChange('subscription')}
            className="btn btn-sm"
            style={{
              backgroundColor: currentView === 'subscription' ? '#ffffff' : 'transparent',
              color: currentView === 'subscription' ? 'var(--color-blue)' : 'var(--color-navy)',
              boxShadow: currentView === 'subscription' ? 'var(--shadow-card)' : 'none',
              fontWeight: currentView === 'subscription' ? 700 : 600
            }}
          >
            <CreditCard size={16} />
            <span>Abonnement</span>
          </button>

          <button
            onClick={() => onViewChange('admin')}
            className="btn btn-sm"
            style={{
              backgroundColor: currentView === 'admin' ? 'var(--color-navy)' : 'transparent',
              color: currentView === 'admin' ? '#ffffff' : 'var(--color-navy-muted)',
              borderRadius: 'var(--radius-sm)',
              fontWeight: currentView === 'admin' ? 700 : 500
            }}
          >
            <Settings2 size={15} />
            <span>Back-Office (Payload)</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
