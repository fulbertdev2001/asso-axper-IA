import React, { useState } from 'react';
import { Organization, Plan, Subscription, ExpertTicket, Domain, AiUsageRecord } from '../types';
import {
  MessageSquare,
  UserCheck,
  Building2,
  CreditCard,
  Sparkles,
  X
} from 'lucide-react';
import { AiChatView } from './AiChatView';
import { ExpertEscalationView } from './ExpertEscalationView';
import { OrgProfileView } from './OrgProfileView';
import { SubscriptionView } from './SubscriptionView';
import { AppShell, AppShellNavItem } from './AppShell';

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

type ClientTab = 'chat' | 'escalation' | 'profile' | 'subscription';

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
  const [activeTab, setActiveTab] = useState<ClientTab>('chat');
  const [dismissedNotice, setDismissedNotice] = useState(false);

  const quotaTotal = currentPlan.features.expertQuestionsMonth;
  const quotaUsed = subscription.questionsUsedThisMonth;
  const quotaRemaining = Math.max(0, quotaTotal - quotaUsed);

  const answeredTickets = tickets.filter(t => t.orgId === currentOrg.id && t.status === 'answered');

  const handleEscalateFromChat = (domain: Domain, question: string) => {
    setActiveTab('escalation');
  };

  const handleSelectTab = (tab: ClientTab) => {
    if (tab === 'chat') onClearPrefillEscalation();
    setActiveTab(tab);
  };

  const orgShortName = currentOrg.name.split('(')[0].trim();
  const planShortName = currentPlan.label.replace(/\s*\(.*\)\s*/, '');

  const navItems: AppShellNavItem<ClientTab>[] = [
    { key: 'chat', label: 'Assistant', shortLabel: 'Assistant', icon: MessageSquare },
    {
      key: 'escalation',
      label: 'Experte 48 h',
      shortLabel: 'Experte',
      icon: UserCheck,
      count: quotaRemaining,
      countTone: quotaRemaining > 0 ? 'lime' : 'neutral',
      dot: answeredTickets.length > 0 ? 'lime' : undefined
    },
    { key: 'profile', label: 'Mon association', shortLabel: 'Association', icon: Building2 },
    { key: 'subscription', label: 'Abonnement', shortLabel: 'Abonnement', icon: CreditCard }
  ];

  const banner = answeredTickets.length > 0 && !dismissedNotice && activeTab !== 'escalation' ? (
    <div className="ax-alert ax-alert-success" style={{ marginBottom: 20, alignItems: 'center' }}>
      <Sparkles size={18} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <span className="ax-alert-title">Nouvelle réponse de l’experte</span>
        <span className="ax-muted ax-hide-sm"> · {answeredTickets[0].object}</span>
      </div>
      <button onClick={() => setActiveTab('escalation')} className="ax-btn ax-btn-primary ax-btn-sm">
        Consulter
      </button>
      <button
        onClick={() => setDismissedNotice(true)}
        className="ax-btn ax-btn-ghost ax-btn-icon"
        style={{ width: 32, height: 32 }}
        aria-label="Masquer"
      >
        <X size={16} />
      </button>
    </div>
  ) : null;

  return (
    <AppShell
      spaceLabel="Espace association"
      contextCard={{
        title: orgShortName,
        meta: `${currentOrg.employeesCount} salariés · ${currentOrg.ccn.split('(')[0].trim()}`,
        badge: <span className="ax-badge ax-badge-blue">{planShortName}</span>
      }}
      navItems={navItems}
      activeKey={activeTab}
      onSelect={handleSelectTab}
      user={{ initials: 'DIR', name: 'Direction', role: orgShortName }}
      onLogout={onLogoutToPublic}
      banner={banner}
    >
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
    </AppShell>
  );
};
