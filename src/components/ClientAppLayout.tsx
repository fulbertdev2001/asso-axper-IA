import React, { useState } from 'react';
import { Organization, Plan, Subscription, ExpertTicket, Domain, AiUsageRecord } from '../types';
import { 
  MessageSquare, 
  UserCheck, 
  Building2, 
  CreditCard, 
  Sparkles, 
  Award, 
  Compass, 
  LogOut,
  Bell,
  CheckCircle2
} from 'lucide-react';
import { AiChatView } from './AiChatView';
import { ExpertEscalationView } from './ExpertEscalationView';
import { OrgProfileView } from './OrgProfileView';
import { SubscriptionView } from './SubscriptionView';

interface ClientAppLayoutProps {
  currentOrg: Organization;
  onUpdateOrg: (org: Organization) => void;
  currentPlan: Plan;
  plans: Plan[];
  subscription: Subscription;
  onUpdateSubscription: (sub: Partial<Subscription>) => void;
  onSelectPlan: (planCode: 'initiale' | 'pro' | 'expert') => void;
  tickets: ExpertTicket[];
  onAddTicket: (ticket: ExpertTicket) => void;
  onUpdateTicket: (ticket: ExpertTicket) => void;
  onTrackAiUsage: (tokens: number, cost: number) => void;
  onLogoutToPublic: () => void;
  prefillEscalation: { domain: Domain; question: string } | null;
  onClearPrefillEscalation: () => void;
}

export const ClientAppLayout: React.FC<ClientAppLayoutProps> = ({
  currentOrg,
  onUpdateOrg,
  currentPlan,
  plans,
  subscription,
  onUpdateSubscription,
  onSelectPlan,
  tickets,
  onAddTicket,
  onUpdateTicket,
  onTrackAiUsage,
  onLogoutToPublic,
  prefillEscalation,
  onClearPrefillEscalation
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'escalation' | 'profile' | 'subscription'>('chat');
  const [dismissedNotice, setDismissedNotice] = useState(false);

  const quotaTotal = currentPlan.features.expertQuestionsMonth;
  const quotaUsed = subscription.questionsUsedThisMonth;
  const quotaRemaining = Math.max(0, quotaTotal - quotaUsed);

  const answeredTickets = tickets.filter(t => t.orgId === currentOrg.id && t.status === 'answered');

  const handleEscalateFromChat = (domain: Domain, question: string) => {
    setActiveTab('escalation');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      {/* Client Specific Header & Top Navigation (All on 1 single row) */}
      <header style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--color-border)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: '0 2px 8px rgba(10, 37, 64, 0.04)',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        height: '62px'
      }}>
        {/* Left: Structure Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-blue)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 3px 10px rgba(0, 74, 173, 0.25)',
            flexShrink: 0
          }}>
            <Building2 size={19} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 800, fontSize: '14px', color: 'var(--color-navy)', maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentOrg.name.split('(')[0].trim()}
              </span>
              <span className="badge badge-blue" style={{ fontSize: '9px', padding: '1px 6px' }}>
                {currentPlan.label}
              </span>
            </div>
            <div className="hide-on-mobile" style={{ fontSize: '11px', color: 'var(--color-navy-muted)' }}>
              SIREN {currentOrg.siren} &bull; {currentOrg.employeesCount} sal.
            </div>
          </div>
        </div>

        {/* Center: Navigation Menu Tabs (On the SAME row) */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          scrollbarWidth: 'none',
          height: '100%',
          flex: 1,
          justifyContent: 'center',
          minWidth: 0
        }}>
          {/* Tab 1: Assistant IA */}
          <button
            onClick={() => {
              onClearPrefillEscalation();
              setActiveTab('chat');
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0 14px',
              height: '100%',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              border: 'none',
              backgroundColor: 'transparent',
              color: activeTab === 'chat' ? 'var(--color-blue)' : 'var(--color-navy-muted)',
              borderBottom: activeTab === 'chat' ? '3px solid var(--color-blue)' : '3px solid transparent',
              transition: 'all 0.15s ease',
              flexShrink: 0
            }}
          >
            <MessageSquare size={16} />
            <span>Assistant IA (4 briques)</span>
          </button>

          {/* Tab 2: Experte 48h */}
          <button
            onClick={() => setActiveTab('escalation')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0 14px',
              height: '100%',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              border: 'none',
              backgroundColor: 'transparent',
              color: activeTab === 'escalation' ? 'var(--color-blue)' : 'var(--color-navy-muted)',
              borderBottom: activeTab === 'escalation' ? '3px solid var(--color-blue)' : '3px solid transparent',
              transition: 'all 0.15s ease',
              flexShrink: 0
            }}
          >
            <UserCheck size={16} />
            <span>Questions Expertes 48h</span>
            <span className="badge badge-lime" style={{ fontSize: '9px', padding: '1px 5px' }}>
              {quotaRemaining} dispo
            </span>
            {answeredTickets.length > 0 && (
              <span style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: 'var(--color-lime)',
                border: '1.5px solid #ffffff'
              }} />
            )}
          </button>

          {/* Tab 3: Profil Asso */}
          <button
            onClick={() => setActiveTab('profile')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0 14px',
              height: '100%',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              border: 'none',
              backgroundColor: 'transparent',
              color: activeTab === 'profile' ? 'var(--color-blue)' : 'var(--color-navy-muted)',
              borderBottom: activeTab === 'profile' ? '3px solid var(--color-blue)' : '3px solid transparent',
              transition: 'all 0.15s ease',
              flexShrink: 0
            }}
          >
            <Building2 size={16} />
            <span>Fiche Association & Membres</span>
          </button>

          {/* Tab 4: Abonnement */}
          <button
            onClick={() => setActiveTab('subscription')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0 14px',
              height: '100%',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              border: 'none',
              backgroundColor: 'transparent',
              color: activeTab === 'subscription' ? 'var(--color-blue)' : 'var(--color-navy-muted)',
              borderBottom: activeTab === 'subscription' ? '3px solid var(--color-blue)' : '3px solid transparent',
              transition: 'all 0.15s ease',
              flexShrink: 0
            }}
          >
            <CreditCard size={16} />
            <span>Abonnement & Facturation</span>
          </button>
        </nav>

        {/* Right: Quota badge + User avatar + Logout (On the SAME row) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <div className="hide-on-mobile" style={{
            backgroundColor: 'var(--color-surface-subtle)',
            padding: '5px 12px',
            borderRadius: 'var(--radius-pill)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px'
          }}>
            <Award size={14} style={{ color: 'var(--color-blue)' }} />
            <span>Quota : <strong style={{ color: quotaRemaining > 0 ? 'var(--color-lime-dark)' : 'var(--color-orange-dark)' }}>{quotaRemaining}/{quotaTotal}</strong></span>
          </div>

          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: 'var(--color-navy)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '11px'
          }}>
            DIR
          </div>

          <button
            onClick={onLogoutToPublic}
            className="btn btn-sm"
            style={{
              fontSize: '12px',
              padding: '3px 10px',
              height: '30px',
              color: 'var(--color-red)',
              backgroundColor: 'var(--color-red-light)',
              border: '1px solid rgba(229, 62, 62, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="Se déconnecter"
          >
            <LogOut size={13} />
            <span className="hide-on-mobile">Déconnexion</span>
          </button>
        </div>
      </header>

      {/* Main Client Area */}
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        padding: '16px 20px 0',
        width: '100%'
      }}>
        {/* Answered notification alert banner */}
        {answeredTickets.length > 0 && !dismissedNotice && (
          <div style={{
            backgroundColor: 'var(--color-lime-glow)',
            border: '1.5px solid var(--color-lime)',
            borderRadius: '12px',
            padding: '12px 18px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={20} style={{ color: 'var(--color-lime-dark)' }} />
              <div>
                <span style={{ fontWeight: 800, color: 'var(--color-navy)', fontSize: '13px' }}>
                  Réponse experte disponible !
                </span>
                <span style={{ fontSize: '13px', color: 'var(--color-navy-muted)', marginLeft: '6px' }}>
                  Laetitia Badji (Cabinet Maé) a répondu à votre question : <strong>{answeredTickets[0].object}</strong>
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setActiveTab('escalation')}
                className="btn btn-sm btn-primary"
                style={{ fontSize: '12px', padding: '6px 14px' }}
              >
                Consulter la réponse
              </button>
              <button
                onClick={() => setDismissedNotice(true)}
                className="btn btn-sm"
                style={{ fontSize: '11px', background: 'none', border: 'none', color: 'var(--color-navy-muted)', cursor: 'pointer' }}
              >
                Masquer
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tab Content */}
      <div style={{ flexGrow: 1 }}>
        {activeTab === 'chat' && (
          <AiChatView
            currentOrg={currentOrg}
            currentPlan={currentPlan}
            onEscalateToExpert={(dom, q) => {
              handleEscalateFromChat(dom, q);
            }}
            onUpgradePlan={() => setActiveTab('subscription')}
            onTrackUsage={onTrackAiUsage}
          />
        )}

        {activeTab === 'escalation' && (
          <ExpertEscalationView
            currentOrg={currentOrg}
            currentPlan={currentPlan}
            subscription={subscription}
            tickets={tickets}
            onAddTicket={onAddTicket}
            onUpgradePlan={() => setActiveTab('subscription')}
            prefillDomain={prefillEscalation?.domain}
            prefillQuestion={prefillEscalation?.question}
            onUpdateTicket={onUpdateTicket}
          />
        )}

        {activeTab === 'profile' && (
          <OrgProfileView
            currentOrg={currentOrg}
            onUpdateOrg={onUpdateOrg}
          />
        )}

        {activeTab === 'subscription' && (
          <SubscriptionView
            currentOrg={currentOrg}
            currentPlan={currentPlan}
            plans={plans}
            subscription={subscription}
            onUpdateSubscription={onUpdateSubscription}
            onSelectPlan={onSelectPlan}
          />
        )}
      </div>
    </div>
  );
};
