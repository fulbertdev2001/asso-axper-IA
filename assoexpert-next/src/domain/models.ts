/**
 * Modèle métier (couche domaine).
 * Aucune dépendance vers la base, HTTP ou React : ces types sont partagés
 * par les repositories, les services et les mappers DTO.
 */

export type Domain = 'rh' | 'gouvernance' | 'finance' | 'conformite';
export const DOMAINS: readonly Domain[] = ['rh', 'gouvernance', 'finance', 'conformite'];

export type FeatureKey =
  | 'brique.rh'
  | 'brique.gouvernance'
  | 'brique.finance'
  | 'brique.conformite'
  | 'ai.model'
  | 'ai.max_tokens'
  | 'ai.max_input_chars'
  | 'expert_questions_month';

export const DOMAIN_FEATURE: Record<Domain, FeatureKey> = {
  rh: 'brique.rh',
  gouvernance: 'brique.gouvernance',
  finance: 'brique.finance',
  conformite: 'brique.conformite'
};

// --- Identité & accès -------------------------------------------------------

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash?: string | null;
  isPlatformAdmin: boolean;
  createdAt: Date;
}

export interface Session {
  /** Empreinte SHA-256 du jeton : le jeton brut n'est jamais stocké. */
  id: string;
  userId: string;
  organizationId: string | null;
  expiresAt: Date;
  createdAt: Date;
}

/** Contexte d'authentification résolu côté serveur à partir du cookie de session. */
export interface AuthContext {
  userId: string;
  email: string;
  organizationId: string | null;
  isPlatformAdmin: boolean;
}

export type MembershipRole = 'owner' | 'member';

export interface Membership {
  userId: string;
  organizationId: string;
  roleInOrg: string;
  appRole: MembershipRole;
}

// --- Organisation -----------------------------------------------------------

export interface OrgMember {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  email: string;
  phone?: string;
  idCardNumber?: string;
  joinedDate: string;
}

export interface Organization {
  id: string;
  name: string;
  siren: string;
  rna: string;
  createdAt: Date;
}

export interface OrganizationProfile {
  organizationId: string;
  sector: string;
  employeesCount: number;
  annualBudget: number;
  ccn: string;
  fiscalYearEnd: string;
  usualAgMonth: string;
  governanceSummary: string;
  mainFunders: string[];
  establishmentsCount: number;
  members: OrgMember[];
}

export type OrganizationProfileInput = Omit<OrganizationProfile, 'organizationId'>;

// --- Formules & abonnements -------------------------------------------------

export interface PlanFeature {
  featureKey: FeatureKey;
  enabled: boolean;
  limitValue: string | null;
}

export interface Plan {
  code: string;
  label: string;
  description: string;
  priceMonthlyEur: number;
  stripePriceId: string;
  highlighted: boolean;
  active: boolean;
  sort: number;
  features: PlanFeature[];
}

export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'suspended';

export interface Subscription {
  organizationId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  planCode: string;
  status: SubscriptionStatus;
  currentPeriodEnd: Date;
  graceUntil: Date | null;
}

/** Événement de facturation normalisé, indépendant du format Stripe. */
export interface BillingEvent {
  id: string;
  type: 'subscription.upserted' | 'subscription.deleted' | 'payment.failed';
  organizationId: string | null;
  stripeCustomerId: string;
  stripeSubscriptionId: string | null;
  priceId: string | null;
  currentPeriodEnd: Date | null;
}

// --- Question experte -------------------------------------------------------

export type TicketStatus = 'pending' | 'in_progress' | 'answered';
export type TicketUrgency = 'normal_48h' | 'urgent';

export interface ExpertTicket {
  id: string;
  ref: string;
  organizationId: string;
  userId: string;
  domain: Domain;
  urgency: TicketUrgency;
  subject: string;
  question: string;
  answer: string | null;
  internalNote: string | null;
  status: TicketStatus;
  answeredAt: Date | null;
  createdAt: Date;
}

// --- Assistant IA -----------------------------------------------------------

export interface StructuredAnswer {
  shortSummary: string;
  detailedAnalysis: string;
  references: string[];
  verificationNote: string;
  suggestedTicketDomain?: Domain;
  suggestedTicketQuestion?: string;
}

export interface Conversation {
  id: string;
  organizationId: string;
  userId: string;
  domain: Domain;
  title: string;
  createdAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  organizationId: string;
  userId: string;
  role: 'user' | 'assistant';
  /** Texte de la question, ou JSON de StructuredAnswer pour l'assistant. */
  content: string;
  createdAt: Date;
}

/** Journal d'usage IA : métadonnées uniquement, jamais de contenu (§3.7). */
export interface AiUsage {
  id: string;
  organizationId: string;
  userId: string;
  model: string;
  promptVersion: string;
  inputTokens: number;
  outputTokens: number;
  costEstimate: number;
  createdAt: Date;
}

// --- CMS --------------------------------------------------------------------

export interface CmsFaqItem {
  question: string;
  answer: string;
}

export interface CmsBreadcrumb {
  label: string;
  href: string;
}

export interface CmsPage {
  id: string;
  slug: string;
  title: string;
  metaDescription: string;
  h1: string;
  chapo: string;
  content: string;
  faq: CmsFaqItem[];
  sources: string[];
  author: string;
  reviewer: string;
  verifiedAt: string;
  status: 'draft' | 'published';
  noindex: boolean;
  breadcrumbs: CmsBreadcrumb[];
  updatedAt: Date;
}

export type CmsPageInput = Omit<CmsPage, 'id' | 'updatedAt'>;

