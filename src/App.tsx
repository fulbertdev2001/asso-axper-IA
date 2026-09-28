import React, { useState, useEffect } from 'react';
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
import { PublicLandingView } from './components/PublicLandingView';
import { ClientAppLayout } from './components/ClientAppLayout';
import { AdminPayloadView } from './components/AdminPayloadView';
import { LoginPage } from './components/LoginPage';
import { OnboardingFlow } from './components/OnboardingFlow';

type AppRole = 'public' | 'login' | 'client_asso' | 'admin_laetitia';

const DEFAULT_SUBSCRIPTIONS: Record<string, Subscription> = {
  'org-1': {
    planCode: 'pro',
    status: 'active',
    currentPeriodEnd: '30 octobre 2026',
    graceUntil: null,
    stripeCustomerId: 'cus_AkiligueEspoir75',
    questionsUsedThisMonth: 1
  },
  'org-2': {
    planCode: 'initiale',
    status: 'active',
    currentPeriodEnd: '30 octobre 2026',
    graceUntil: null,
    stripeCustomerId: 'cus_MptLilas93',
    questionsUsedThisMonth: 1
  },
  'org-3': {
    planCode: 'expert',
    status: 'active',
    currentPeriodEnd: '30 octobre 2026',
    graceUntil: null,
    stripeCustomerId: 'cus_PasserelleLyon69',
    questionsUsedThisMonth: 0
  }
};

export const App: React.FC = () => {
  // 1. Initial State with LocalStorage Persistence
  const [currentRole, setCurrentRole] = useState<AppRole>(() => {
    const saved = localStorage.getItem('asso_expert_role');
    return (saved as AppRole) || 'public';
  });

  const [organizations, setOrganizations] = useState<Organization[]>(() => {
    const saved = localStorage.getItem('asso_expert_orgs');
    if (saved) {
      try {
        const parsed: Organization[] = JSON.parse(saved);
        return parsed.map(o => {
          const init = INITIAL_ORGANIZATIONS.find(io => io.id === o.id);
          return {
            ...o,
            accountEmail: o.accountEmail || init?.accountEmail || 'contact@asso.org',
            password: o.password || init?.password || 'Asso2026!'
          };
        });
      } catch (e) { /* fallback */ }
    }
    return INITIAL_ORGANIZATIONS;
  });

  const [currentOrgId, setCurrentOrgId] = useState<string>(() => {
    const saved = localStorage.getItem('asso_expert_current_org_id');
    return saved || INITIAL_ORGANIZATIONS[0].id;
  });

  const [subscriptions, setSubscriptions] = useState<Record<string, Subscription>>(() => {
    const saved = localStorage.getItem('asso_expert_subscriptions');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return DEFAULT_SUBSCRIPTIONS;
  });

  const [tickets, setTickets] = useState<ExpertTicket[]>(() => {
    const saved = localStorage.getItem('asso_expert_tickets');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_TICKETS;
  });

  const [plans, setPlans] = useState<Plan[]>(() => {
    const saved = localStorage.getItem('asso_expert_plans');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_PLANS;
  });

  const [aiUsageRecords, setAiUsageRecords] = useState<AiUsageRecord[]>(INITIAL_AI_USAGE);
  const [isOnboardingActive, setIsOnboardingActive] = useState<boolean>(false);
  const [prefillEscalation, setPrefillEscalation] = useState<{ domain: Domain; question: string } | null>(null);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('asso_expert_role', currentRole);
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem('asso_expert_orgs', JSON.stringify(organizations));
  }, [organizations]);

  useEffect(() => {
    localStorage.setItem('asso_expert_current_org_id', currentOrgId);
  }, [currentOrgId]);

  useEffect(() => {
    localStorage.setItem('asso_expert_subscriptions', JSON.stringify(subscriptions));
  }, [subscriptions]);

  useEffect(() => {
    localStorage.setItem('asso_expert_tickets', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem('asso_expert_plans', JSON.stringify(plans));
  }, [plans]);

  // Derived state
  const currentOrg = organizations.find(o => o.id === currentOrgId) || organizations[0];

  const currentSubscription = subscriptions[currentOrg.id] || {
    planCode: 'pro',
    status: 'active',
    currentPeriodEnd: '30 octobre 2026',
    graceUntil: null,
    stripeCustomerId: `cus_${currentOrg.id}`,
    questionsUsedThisMonth: 0
  };

  const currentPlan = plans.find(p => p.code === currentSubscription.planCode) || plans[1];

  // Actions
  const handleUpdateOrg = (updatedOrg: Organization) => {
    setOrganizations(prev => prev.map(o => o.id === updatedOrg.id ? updatedOrg : o));
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
    setCurrentOrgId(newOrg.id);

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

  // View Routing
  if (isOnboardingActive) {
    return (
      <OnboardingFlow
        plans={plans}
        onCompleteOnboarding={handleCompleteOnboarding}
        onCancel={() => setIsOnboardingActive(false)}
      />
    );
  }

  if (currentRole === 'login') {
    return (
      <LoginPage
        organizations={organizations}
        onLoginAsOrg={(org) => {
          setCurrentOrgId(org.id);
          setCurrentRole('client_asso');
        }}
        onLoginAsAdmin={() => {
          setCurrentRole('admin_laetitia');
        }}
        onStartOnboarding={() => {
          setIsOnboardingActive(true);
        }}
        onBackToPublic={() => {
          setCurrentRole('public');
        }}
      />
    );
  }

  if (currentRole === 'public') {
    return (
      <PublicLandingView
        plans={plans}
        onOpenLogin={() => setCurrentRole('login')}
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
        onUpdateTicket={handleUpdateTicket}
        onTrackAiUsage={handleTrackAiUsage}
        onLogoutToPublic={() => setCurrentRole('login')}
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
      onLogout={() => setCurrentRole('login')}
    />
  );
};
export default App;
