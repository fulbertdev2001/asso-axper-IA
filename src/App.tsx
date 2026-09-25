import React, { useState } from 'react';
import { 
  Organization, 
  Plan, 
  Subscription, 
  ExpertTicket, 
  AiUsageRecord, 
  Domain 
} from './types';
import { 
  INITIAL_ORGANIZATIONS, 
  INITIAL_PLANS, 
  INITIAL_TICKETS, 
  INITIAL_AI_USAGE 
} from './data/mockData';
import { PersonaSwitcher, PersonaRole } from './components/PersonaSwitcher';
import { PublicLandingView } from './components/PublicLandingView';
import { ClientAppLayout } from './components/ClientAppLayout';
import { AdminPayloadView } from './components/AdminPayloadView';
import { BossTestGuideModal } from './components/BossTestGuideModal';
import { AuthModal } from './components/AuthModal';
import { OnboardingFlow } from './components/OnboardingFlow';

export const App: React.FC = () => {
  // Default start on Public Site for natural visitor journey
  const [currentRole, setCurrentRole] = useState<PersonaRole>('public');
  const [organizations, setOrganizations] = useState<Organization[]>(INITIAL_ORGANIZATIONS);
  const [currentOrg, setCurrentOrg] = useState<Organization>(INITIAL_ORGANIZATIONS[0]);
  const [plans, setPlans] = useState<Plan[]>(INITIAL_PLANS);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  // Modals & Flows
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isOnboardingActive, setIsOnboardingActive] = useState<boolean>(false);

  // Subscriptions per org
  const [subscriptions, setSubscriptions] = useState<Record<string, Subscription>>({
    'org-1': {
      planCode: 'pro',
      status: 'active',
      currentPeriodEnd: '30 septembre 2026',
      graceUntil: null,
      stripeCustomerId: 'cus_AkiligueEspoir75',
      questionsUsedThisMonth: 0
    },
    'org-2': {
      planCode: 'initiale',
      status: 'active',
      currentPeriodEnd: '30 septembre 2026',
      graceUntil: null,
      stripeCustomerId: 'cus_MptLilas93',
      questionsUsedThisMonth: 0
    },
    'org-3': {
      planCode: 'expert',
      status: 'active',
      currentPeriodEnd: '30 septembre 2026',
      graceUntil: null,
      stripeCustomerId: 'cus_PasserelleLyon69',
      questionsUsedThisMonth: 1
    }
  });

  const [tickets, setTickets] = useState<ExpertTicket[]>(INITIAL_TICKETS);
  const [aiUsageRecords, setAiUsageRecords] = useState<AiUsageRecord[]>(INITIAL_AI_USAGE);
  const [prefillEscalation, setPrefillEscalation] = useState<{ domain: Domain; question: string } | null>(null);

  const currentSubscription = subscriptions[currentOrg.id] || {
    planCode: 'pro',
    status: 'active',
    currentPeriodEnd: '30 septembre 2026',
    graceUntil: null,
    stripeCustomerId: 'cus_default',
    questionsUsedThisMonth: 0
  };

  const currentPlan = plans.find(p => p.code === currentSubscription.planCode) || plans[1];

  const handleUpdateOrg = (updatedOrg: Organization) => {
    setOrganizations(prev => prev.map(o => o.id === updatedOrg.id ? updatedOrg : o));
    setCurrentOrg(updatedOrg);
  };

  const handleUpdateSubscription = (partialSub: Partial<Subscription>) => {
    setSubscriptions(prev => ({
      ...prev,
      [currentOrg.id]: {
        ...prev[currentOrg.id],
        ...partialSub
      }
    }));
  };

  const handleSelectPlan = (planCode: 'initiale' | 'pro' | 'expert') => {
    setSubscriptions(prev => ({
      ...prev,
      [currentOrg.id]: {
        ...prev[currentOrg.id],
        planCode
      }
    }));
    setCurrentRole('client_asso');
  };

  const handleAddTicket = (newTicket: ExpertTicket) => {
    setTickets(prev => [newTicket, ...prev]);
    setSubscriptions(prev => ({
      ...prev,
      [currentOrg.id]: {
        ...prev[currentOrg.id],
        questionsUsedThisMonth: (prev[currentOrg.id]?.questionsUsedThisMonth || 0) + 1
      }
    }));
  };

  const handleUpdateTicket = (updatedTicket: ExpertTicket) => {
    setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
  };

  const handleTrackAiUsage = (tokens: number, cost: number) => {
    const newRecord: AiUsageRecord = {
      id: 'usage-' + Date.now(),
      orgId: currentOrg.id,
      orgName: currentOrg.name.split('(')[0].trim(),
      model: currentPlan.features.aiModel.toLowerCase().replace(/\s+/g, '-'),
      promptVersion: 'v2.4-active',
      inputTokens: Math.round(tokens * 0.4),
      outputTokens: Math.round(tokens * 0.6),
      costEstimateEur: cost,
      createdAt: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };
    setAiUsageRecords(prev => [newRecord, ...prev]);
  };

  // Complete Onboarding Handler (creates org, stripe subscription, connects to /app)
  const handleCompleteOnboarding = (newOrg: Organization, selectedPlanCode: 'initiale' | 'pro' | 'expert') => {
    setOrganizations(prev => [newOrg, ...prev]);
    setCurrentOrg(newOrg);

    const renewalDate = new Date();
    renewalDate.setDate(renewalDate.getDate() + 30);

    setSubscriptions(prev => ({
      ...prev,
      [newOrg.id]: {
        planCode: selectedPlanCode,
        status: 'active',
        currentPeriodEnd: renewalDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
        graceUntil: null,
        stripeCustomerId: `cus_${newOrg.id}`,
        questionsUsedThisMonth: 0
      }
    }));

    setIsOnboardingActive(false);
    setCurrentRole('client_asso');
  };

  const renderActiveWorkspace = () => {
    if (isOnboardingActive) {
      return (
        <OnboardingFlow
          plans={plans}
          onCompleteOnboarding={handleCompleteOnboarding}
          onCancel={() => setIsOnboardingActive(false)}
        />
      );
    }

    if (currentRole === 'public') {
      return (
        <PublicLandingView
          plans={plans}
          onOpenLogin={() => setIsAuthModalOpen(true)}
          onStartOnboarding={(preferredPlan) => {
            setIsOnboardingActive(true);
          }}
          currentOrg={currentOrg}
        />
      );
    }

    if (currentRole === 'client_asso') {
      return (
        <ClientAppLayout
          currentOrg={currentOrg}
          onUpdateOrg={handleUpdateOrg}
          currentPlan={currentPlan}
          plans={plans}
          subscription={currentSubscription}
          onUpdateSubscription={handleUpdateSubscription}
          onSelectPlan={handleSelectPlan}
          tickets={tickets}
          onAddTicket={handleAddTicket}
          onTrackAiUsage={handleTrackAiUsage}
          onLogoutToPublic={() => setCurrentRole('public')}
          prefillEscalation={prefillEscalation}
          onClearPrefillEscalation={() => setPrefillEscalation(null)}
        />
      );
    }

    // currentRole === 'admin_laetitia'
    return (
      <AdminPayloadView
        plans={plans}
        onUpdatePlans={(updated) => setPlans(updated)}
        tickets={tickets}
        onUpdateTicket={handleUpdateTicket}
        aiUsageRecords={aiUsageRecords}
      />
    );
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Universal Persona Switcher Top Bar (Permet au boss de tester n'importe quel rôle à tout moment) */}
      <PersonaSwitcher
        currentRole={isOnboardingActive ? 'client_asso' : currentRole}
        onRoleChange={(role) => {
          setIsOnboardingActive(false);
          setPrefillEscalation(null);
          setCurrentRole(role);
        }}
        currentOrg={currentOrg}
        organizations={organizations}
        onOrgChange={(org) => setCurrentOrg(org)}
        onOpenTestGuide={() => setIsGuideOpen(true)}
      />

      {/* Main Workspace Area */}
      <main style={{ flexGrow: 1 }}>
        {renderActiveWorkspace()}
      </main>

      {/* Login & Magic Link Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        organizations={organizations}
        onSelectExistingOrg={(org) => {
          setCurrentOrg(org);
          setCurrentRole('client_asso');
        }}
        onStartOnboarding={() => {
          setIsOnboardingActive(true);
        }}
      />

      {/* Boss Demo & Validation Guide Modal */}
      <BossTestGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onSelectRole={(role) => {
          setIsOnboardingActive(false);
          setCurrentRole(role);
        }}
      />
    </div>
  );
};
