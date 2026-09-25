export type Domain = 'rh' | 'gouvernance' | 'finance' | 'conformite';

export interface Organization {
  id: string;
  name: string;
  siren: string;
  rna: string;
  sector: string;
  employeesCount: number;
  annualBudget: number;
  ccn: string;
  fiscalYearEnd: string;
  usualAgMonth: string;
  governanceSummary: string;
  mainFunders: string[];
  establishmentsCount: number;
}

export interface PlanFeatures {
  briqueRh: boolean;
  briqueGouvernance: boolean;
  briqueFinance: boolean;
  briqueConformite: boolean;
  aiModel: string;
  maxTokens: number;
  maxInputChars: number;
  expertQuestionsMonth: number;
}

export interface Plan {
  code: 'initiale' | 'pro' | 'expert';
  label: string;
  priceMonthly: number;
  description: string;
  highlighted?: boolean;
  features: PlanFeatures;
}

export interface Subscription {
  planCode: 'initiale' | 'pro' | 'expert';
  status: 'active' | 'past_due' | 'canceled';
  currentPeriodEnd: string;
  graceUntil: string | null;
  stripeCustomerId: string;
  questionsUsedThisMonth: number;
}

export interface ChatMessage {
  id: string;
  domain: Domain;
  role: 'user' | 'assistant';
  content?: string;
  structuredAnswer?: {
    shortSummary: string;
    detailedAnalysis: string;
    references: string[];
    verificationNote: string;
    suggestedTicketDomain?: Domain;
    suggestedTicketQuestion?: string;
  };
  createdAt: string;
  modelUsed?: string;
  tokensCount?: number;
}

export interface ExpertTicket {
  id: string;
  ref: string; // Ex: AE-2026-00042
  orgId: string;
  orgName: string;
  domain: Domain;
  urgency: 'normal_48h' | 'urgent';
  object: string;
  question: string;
  status: 'pending' | 'in_progress' | 'answered';
  answer?: string;
  internalNotes?: string;
  createdAt: string;
  answeredAt?: string;
}

export interface AiUsageRecord {
  id: string;
  orgId: string;
  orgName: string;
  model: string;
  promptVersion: string;
  inputTokens: number;
  outputTokens: number;
  costEstimateEur: number;
  createdAt: string;
}
