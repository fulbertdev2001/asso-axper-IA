'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Organization,
  Plan,
  Subscription,
  ExpertTicket,
  AiUsageRecord,
  Domain
} from '../types';
import {
  INITIAL_ORGANIZATIONS,
  INITIAL_PLANS,
  INITIAL_TICKETS,
  INITIAL_AI_USAGE
} from '../data/mockData';
import { track, captureUtmFromUrl } from '../lib/analytics/track';

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

interface AssoExpertContextValue {
  organizations: Organization[];
  currentOrg: Organization;
  setCurrentOrgId: (id: string) => void;
  plans: Plan[];
  setPlans: React.Dispatch<React.SetStateAction<Plan[]>>;
  currentPlan: Plan;
  currentSubscription: Subscription;
  tickets: ExpertTicket[];
  aiUsageRecords: AiUsageRecord[];
  prefillEscalation: { domain: Domain; question: string } | null;
  setPrefillEscalation: (val: { domain: Domain; question: string } | null) => void;
  handleUpdateOrg: (updatedOrg: Organization) => void;
  handleUpdateSubscription: (partialSub: Partial<Subscription>) => void;
  handleSelectPlan: (planCode: 'initiale' | 'pro' | 'expert') => void;
  handleAddTicket: (newTicket: ExpertTicket) => void;
  handleUpdateTicket: (updatedTicket: ExpertTicket) => void;
  handleTrackAiUsage: (tokens: number, cost: number) => void;
  handleCompleteOnboarding: (
    newOrg: Organization,
    selectedPlanCode: 'initiale' | 'pro' | 'expert'
  ) => void;
}

const AssoExpertContext = createContext<AssoExpertContextValue | null>(null);

export const AssoExpertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [organizations, setOrganizations] = useState<Organization[]>(INITIAL_ORGANIZATIONS);
  const [currentOrgId, setCurrentOrgId] = useState<string>(INITIAL_ORGANIZATIONS[0].id);
  const [subscriptions, setSubscriptions] =
    useState<Record<string, Subscription>>(DEFAULT_SUBSCRIPTIONS);
  const [tickets, setTickets] = useState<ExpertTicket[]>(INITIAL_TICKETS);
  const [plans, setPlans] = useState<Plan[]>(INITIAL_PLANS);
  const [aiUsageRecords, setAiUsageRecords] = useState<AiUsageRecord[]>(INITIAL_AI_USAGE);
  const [prefillEscalation, setPrefillEscalation] = useState<{
    domain: Domain;
    question: string;
  } | null>(null);

  // Hydratation client + capture UTM (§7 Transverse)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    captureUtmFromUrl(window.location.search);

    try {
      const savedOrgs = localStorage.getItem('asso_expert_orgs');
      if (savedOrgs) setOrganizations(JSON.parse(savedOrgs));

      const savedOrgId = localStorage.getItem('asso_expert_current_org_id');
      if (savedOrgId) setCurrentOrgId(savedOrgId);

      const savedSubs = localStorage.getItem('asso_expert_subscriptions');
      if (savedSubs) setSubscriptions(JSON.parse(savedSubs));

      const savedTickets = localStorage.getItem('asso_expert_tickets');
      if (savedTickets) setTickets(JSON.parse(savedTickets));

      const savedPlans = localStorage.getItem('asso_expert_plans_v2');
      if (savedPlans) setPlans(JSON.parse(savedPlans));
    } catch {
      // Fallback sur les valeurs initiales
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('asso_expert_orgs', JSON.stringify(organizations));
    }
  }, [organizations]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // La session serveur n'est créée que par une vraie connexion ou inscription (cookie HttpOnly)
      localStorage.setItem('asso_expert_current_org_id', currentOrgId);
    }
  }, [currentOrgId]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('asso_expert_subscriptions', JSON.stringify(subscriptions));
    }
  }, [subscriptions]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('asso_expert_tickets', JSON.stringify(tickets));
    }
  }, [tickets]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('asso_expert_plans_v2', JSON.stringify(plans));
    }
  }, [plans]);

  const currentOrg = organizations.find((o) => o.id === currentOrgId) || organizations[0];

  const currentSubscription = subscriptions[currentOrg.id] || {
    planCode: 'pro',
    status: 'active',
    currentPeriodEnd: '30 octobre 2026',
    graceUntil: null,
    stripeCustomerId: `cus_${currentOrg.id}`,
    questionsUsedThisMonth: 0
  };

  const currentPlan = plans.find((p) => p.code === currentSubscription.planCode) || plans[1];

  const handleUpdateOrg = (updatedOrg: Organization) => {
    setOrganizations((prev) => {
      const exists = prev.some((o) => o.id === updatedOrg.id);
      return exists ? prev.map((o) => (o.id === updatedOrg.id ? updatedOrg : o)) : [updatedOrg, ...prev];
    });
    void fetch('/api/org/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orgId: updatedOrg.id, patch: updatedOrg })
    }).catch(() => {});
  };

  const handleUpdateSubscription = (partialSub: Partial<Subscription>) => {
    setSubscriptions((prev) => ({
      ...prev,
      [currentOrg.id]: {
        ...prev[currentOrg.id],
        ...partialSub
      }
    }));
  };

  const handleSelectPlan = (planCode: 'initiale' | 'pro' | 'expert') => {
    track('subscription_upgraded', { planCode, organizationId: currentOrg.id });
    setSubscriptions((prev) => ({
      ...prev,
      [currentOrg.id]: {
        ...prev[currentOrg.id],
        planCode
      }
    }));
    void fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planCode })
    }).catch(() => {});
  };

  const handleAddTicket = (newTicket: ExpertTicket) => {
    track('expert_ticket_created', {
      domain: newTicket.domain,
      urgency: newTicket.urgency,
      organizationId: currentOrg.id
    });
    setTickets((prev) => [newTicket, ...prev]);
    setSubscriptions((prev) => ({
      ...prev,
      [currentOrg.id]: {
        ...prev[currentOrg.id],
        questionsUsedThisMonth: (prev[currentOrg.id]?.questionsUsedThisMonth || 0) + 1
      }
    }));
    void fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        domain: newTicket.domain,
        urgency: newTicket.urgency,
        subject: newTicket.object,
        question: newTicket.question
      })
    }).catch(() => {});
  };

  const handleUpdateTicket = (updatedTicket: ExpertTicket) => {
    setTickets((prev) => prev.map((t) => (t.id === updatedTicket.id ? updatedTicket : t)));
    void fetch('/api/admin/tickets', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticketIdOrRef: updatedTicket.ref || updatedTicket.id,
        status: updatedTicket.status,
        answer: updatedTicket.answer,
        internalNotes: updatedTicket.internalNotes,
        orgId: updatedTicket.orgId,
        domain: updatedTicket.domain,
        question: updatedTicket.question,
        subject: updatedTicket.object
      })
    }).catch(() => {});
  };

  const handleTrackAiUsage = (tokens: number, cost: number) => {
    track('question_sent', {
      tokens,
      costEstimateEur: cost,
      model: currentPlan.features.aiModel,
      organizationId: currentOrg.id
    });
    const newRecord: AiUsageRecord = {
      id: 'usage-' + Date.now(),
      orgId: currentOrg.id,
      orgName: currentOrg.name.split('(')[0].trim(),
      model: currentPlan.features.aiModel.toLowerCase().replace(/\s+/g, '-'),
      promptVersion: '2026.10.v1',
      inputTokens: Math.round(tokens * 0.4),
      outputTokens: Math.round(tokens * 0.6),
      costEstimateEur: cost,
      createdAt: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };
    setAiUsageRecords((prev) => [newRecord, ...prev]);
  };

  const handleCompleteOnboarding = (
    newOrg: Organization,
    selectedPlanCode: 'initiale' | 'pro' | 'expert'
  ) => {
    track('signup_complete', { planCode: selectedPlanCode });
    track('subscription_started', { planCode: selectedPlanCode });
    // Le mot de passe n'est jamais conservé côté navigateur (localStorage)
    const { password, ...orgWithoutPassword } = newOrg;
    setOrganizations((prev) => [orgWithoutPassword, ...prev]);
    setCurrentOrgId(newOrg.id);

    const renewalDate = new Date();
    renewalDate.setDate(renewalDate.getDate() + 30);

    setSubscriptions((prev) => ({
      ...prev,
      [newOrg.id]: {
        planCode: selectedPlanCode,
        status: 'active',
        currentPeriodEnd: renewalDate.toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }),
        graceUntil: null,
        stripeCustomerId: `cus_${newOrg.id}`,
        questionsUsedThisMonth: 0
      }
    }));

    // Persistance réelle de la nouvelle organisation en base Neon PostgreSQL
    void fetch('/api/org/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: newOrg.accountEmail || newOrg.members?.[0]?.email || `contact@${newOrg.id}.org`,
        name: newOrg.members?.[0]
          ? `${newOrg.members[0].firstName} ${newOrg.members[0].lastName}`
          : 'Direction',
        password: password || undefined,
        roleInOrg: newOrg.members?.[0]?.role || 'Président(e)',
        organization: {
          name: newOrg.name,
          siren: newOrg.siren,
          rna: newOrg.rna,
          sector: newOrg.sector,
          employeesCount: newOrg.employeesCount,
          annualBudget: newOrg.annualBudget,
          ccn: newOrg.ccn,
          fiscalYearEnd: newOrg.fiscalYearEnd,
          usualAgMonth: newOrg.usualAgMonth,
          governanceSummary: newOrg.governanceSummary,
          mainFunders: newOrg.mainFunders,
          establishmentsCount: newOrg.establishmentsCount,
          members: newOrg.members
        }
      })
    }).catch(() => {});
  };

  return (
    <AssoExpertContext.Provider
      value={{
        organizations,
        currentOrg,
        setCurrentOrgId,
        plans,
        setPlans,
        currentPlan,
        currentSubscription,
        tickets,
        aiUsageRecords,
        prefillEscalation,
        setPrefillEscalation,
        handleUpdateOrg,
        handleUpdateSubscription,
        handleSelectPlan,
        handleAddTicket,
        handleUpdateTicket,
        handleTrackAiUsage,
        handleCompleteOnboarding
      }}
    >
      {children}
    </AssoExpertContext.Provider>
  );
};

export function useAssoExpert() {
  const ctx = useContext(AssoExpertContext);
  if (!ctx) {
    throw new Error('useAssoExpert doit être utilisé dans un AssoExpertProvider');
  }
  return ctx;
}

