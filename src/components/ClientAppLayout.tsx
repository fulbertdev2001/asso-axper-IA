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
  onTrackAiUsage,
  onLogoutToPublic,
  prefillEscalation,
  onClearPrefillEscalation
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'escalation' | 'profile' | 'subscription'>('chat');

  const quotaTotal = currentPlan.features.expertQuestionsMonth;
  const quotaUsed = subscription.questionsUsedThisMonth;
  const quotaRemaining = Math.max(0, quotaTotal - quotaUsed);

  const handleEscalateFromChat = (domain: Domain, question: string) => {
    setActiveTab('escalation');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 46px)' }}>
      {/* Client Specific Header */}
      <header style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--color-border)',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Structure Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-blue)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(0, 74, 173, 0.25)'
          }}>
            <Building2 size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 800, fontSize: '18px', color: 'var(--color-navy)' }}>
                {currentOrg.name}
              </span>
              <span className="badge badge-blue" style={{ fontSize: '10px' }}>
                {currentOrg.ccn.split('(')[0].trim()}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-navy-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>SIREN {currentOrg.siren}</span>
              <span>&bull;</span>
              <span>{currentOrg.employeesCount} salariés déclarés</span>
              <span>&bull;</span>
              <span>Budget : {currentOrg.annualBudget.toLocaleString('fr-FR')} €</span>
            </div>
          </div>
        </div>

        {/* User profile & Quota summary */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            backgroundColor: 'var(--color-surface-subtle)',
            padding: '6px 14px',
            borderRadius: 'var(--radius-pill)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px'
          }}>
            <Award size={15} style={{ color: 'var(--color-blue)' }} />
            <span>Formule : <strong>{currentPlan.label}</strong></span>
            <span style={{ color: 'var(--color-navy-muted)' }}>|</span>
            <span>Questions expertes restantes : <strong style={{ color: quotaRemaining > 0 ? 'var(--color-lime-dark)' : 'var(--color-orange-dark)' }}>{quotaRemaining} / {quotaTotal}</strong></span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: 'var(--color-navy)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '13px'
            }}>
              DIR
            </div>
            <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-navy)' }}>Directeur Asso</div>
              <button
                onClick={onLogoutToPublic}
                style={{ fontSize: '11px', color: 'var(--color-blue)', background: 'none', padding: 0, textDecoration: 'underline' }}
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Client Area with Tabs Navigation */}
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        padding: '16px 24px 0',
        width: '100%'
      }}>
        {/* Clean Client Navigation Bar */}
        <div style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '2px solid var(--color-border)',
          paddingBottom: '2px',
          marginBottom: '16px'
        }}>
          <button
            onClick={() => {
              onClearPrefillEscalation();
              setActiveTab('chat');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '8px 8px 0 0',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              border: 'none',
              backgroundColor: activeTab === 'chat' ? '#ffffff' : 'transparent',
              color: activeTab === 'chat' ? 'var(--color-blue)' : 'var(--color-navy-muted)',
              borderBottom: activeTab === 'chat' ? '3px solid var(--color-blue)' : '3px solid transparent'
            }}
          >
            <MessageSquare size={17} />
            <span>Assistant IA (4 briques RH, Gouv, Fin, Conf)</span>
          </button>

          <button
            onClick={() => setActiveTab('escalation')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '8px 8px 0 0',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              border: 'none',
              backgroundColor: activeTab === 'escalation' ? '#ffffff' : 'transparent',
              color: activeTab === 'escalation' ? 'var(--color-blue)' : 'var(--color-navy-muted)',
              borderBottom: activeTab === 'escalation' ? '3px solid var(--color-blue)' : '3px solid transparent'
            }}
          >
            <UserCheck size={17} />
            <span>Mes Questions Expertes 48h</span>
            <span className="badge badge-lime" style={{ fontSize: '10px', padding: '1px 6px' }}>
              {quotaRemaining} dispo
            </span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '8px 8px 0 0',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              border: 'none',
              backgroundColor: activeTab === 'profile' ? '#ffffff' : 'transparent',
              color: activeTab === 'profile' ? 'var(--color-blue)' : 'var(--color-navy-muted)',
              borderBottom: activeTab === 'profile' ? '3px solid var(--color-blue)' : '3px solid transparent'
            }}
          >
            <Building2 size={17} />
            <span>Fiche Association & Convention</span>
          </button>

          <button
            onClick={() => setActiveTab('subscription')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '8px 8px 0 0',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              border: 'none',
              backgroundColor: activeTab === 'subscription' ? '#ffffff' : 'transparent',
              color: activeTab === 'subscription' ? 'var(--color-blue)' : 'var(--color-navy-muted)',
              borderBottom: activeTab === 'subscription' ? '3px solid var(--color-blue)' : '3px solid transparent'
            }}
          >
            <CreditCard size={17} />
            <span>Abonnement & Facturation Stripe</span>
          </button>
        </div>
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
