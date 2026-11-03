/**
 * Composition Root & Conteneur d'Injection de Dépendances (Design Pattern IoC / DI Container).
 * - Instancie les repositories (Neon Drizzle ou Mémoire selon DATABASE_URL ou options de test).
 * - Injecte les dépendances dans les services du domaine.
 * - Point unique d'assemblage de l'application.
 */

import {
  IUserRepository,
  ISessionRepository,
  IMembershipRepository,
  IOrgRepository,
  IPlanRepository,
  ISubscriptionRepository,
  ITicketRepository,
  IAiRepository,
  ICmsRepository,
  IVerificationTokenRepository
} from './repositories/interfaces';

import {
  DrizzleUserRepository,
  DrizzleSessionRepository,
  DrizzleMembershipRepository,
  DrizzleOrgRepository,
  DrizzlePlanRepository,
  DrizzleSubscriptionRepository,
  DrizzleTicketRepository,
  DrizzleAiRepository,
  DrizzleCmsRepository,
  DrizzleVerificationTokenRepository
} from './repositories/drizzle';

import {
  MemoryUserRepository,
  MemorySessionRepository,
  MemoryMembershipRepository,
  MemoryOrgRepository,
  MemoryPlanRepository,
  MemorySubscriptionRepository,
  MemoryTicketRepository,
  MemoryAiRepository,
  MemoryCmsRepository,
  MemoryVerificationTokenRepository
} from './repositories/memory';

import {
  User,
  Session,
  Membership,
  Organization,
  OrganizationProfile,
  Plan,
  Subscription,
  ExpertTicket,
  CmsPage
} from './domain/models';

import { INITIAL_ORGANIZATIONS, INITIAL_PLANS, INITIAL_TICKETS } from './data/mockData';
import { DEFAULT_SEO_PAGES } from './lib/cms/service';
import { MailProvider, mail as defaultMailProvider } from './lib/mail';
import { AuthService } from './services/auth.service';
import { OrgService } from './services/org.service';
import { BillingService } from './services/billing.service';
import { TicketService } from './services/ticket.service';
import { AiService } from './services/ai.service';
import { CmsService } from './services/cms.service';
import { PasswordHasher, ScryptPasswordHasher } from './lib/auth/password';
import { RateLimiter, createRateLimiter } from './lib/rate-limit';
import { PaymentGateway, createPaymentGateway } from './lib/payments';

export interface AppContainer {
  repositories: {
    user: IUserRepository;
    session: ISessionRepository;
    membership: IMembershipRepository;
    org: IOrgRepository;
    plan: IPlanRepository;
    subscription: ISubscriptionRepository;
    ticket: ITicketRepository;
    ai: IAiRepository;
    cms: ICmsRepository;
    verificationToken: IVerificationTokenRepository;
  };
  authService: AuthService;
  orgService: OrgService;
  billingService: BillingService;
  ticketService: TicketService;
  aiService: AiService;
  cmsService: CmsService;
  mailProvider: MailProvider;
  paymentGateway: PaymentGateway;
  rateLimiter: RateLimiter;
  resetForTests: () => void;
}

function buildDefaultMemoryFixtures() {
  const users: User[] = [
    {
      id: 'user-org-1',
      email: 'direction@tremplin-solidarites.org',
      name: 'Directrice Générale',
      isPlatformAdmin: false,
      createdAt: new Date()
    },
    {
      id: 'user-org-2',
      email: 'president@mpt-lilas.fr',
      name: 'Président',
      isPlatformAdmin: false,
      createdAt: new Date()
    },
    {
      id: 'user-org-3',
      email: 'daf@passerelle-insertion.org',
      name: 'DAF',
      isPlatformAdmin: false,
      createdAt: new Date()
    },
    {
      id: 'user-admin',
      email: 'contact@cabinet-mae.fr',
      name: 'Laetitia Badji',
      isPlatformAdmin: true,
      createdAt: new Date()
    }
  ];

  const sessions: Session[] = [
    {
      id: 'session_org_1',
      userId: 'user-org-1',
      organizationId: 'org-1',
      expiresAt: new Date(Date.now() + 365 * 24 * 3600 * 1000),
      createdAt: new Date()
    },
    {
      id: 'session_org_2',
      userId: 'user-org-2',
      organizationId: 'org-2',
      expiresAt: new Date(Date.now() + 365 * 24 * 3600 * 1000),
      createdAt: new Date()
    },
    {
      id: 'session_org_3',
      userId: 'user-org-3',
      organizationId: 'org-3',
      expiresAt: new Date(Date.now() + 365 * 24 * 3600 * 1000),
      createdAt: new Date()
    },
    {
      id: 'session_admin',
      userId: 'user-admin',
      organizationId: null,
      expiresAt: new Date(Date.now() + 365 * 24 * 3600 * 1000),
      createdAt: new Date()
    }
  ];

  const memberships: Membership[] = [
    { userId: 'user-org-1', organizationId: 'org-1', roleInOrg: 'Directrice Générale', appRole: 'owner' },
    { userId: 'user-org-2', organizationId: 'org-2', roleInOrg: 'Président', appRole: 'owner' },
    { userId: 'user-org-3', organizationId: 'org-3', roleInOrg: 'DAF', appRole: 'owner' }
  ];

  const orgs: Organization[] = INITIAL_ORGANIZATIONS.map((o) => ({
    id: o.id,
    name: o.name,
    siren: o.siren,
    rna: o.rna,
    createdAt: new Date()
  }));

  const profiles: OrganizationProfile[] = INITIAL_ORGANIZATIONS.map((o) => ({
    organizationId: o.id,
    sector: o.sector,
    employeesCount: o.employeesCount,
    annualBudget: o.annualBudget,
    ccn: o.ccn,
    fiscalYearEnd: o.fiscalYearEnd,
    usualAgMonth: o.usualAgMonth,
    governanceSummary: o.governanceSummary,
    mainFunders: o.mainFunders,
    establishmentsCount: o.establishmentsCount,
    members: o.members || []
  }));

  const plans: Plan[] = INITIAL_PLANS.map((p) => ({
    code: p.code,
    label: p.label,
    description: p.description,
    priceMonthlyEur: p.priceMonthly,
    stripePriceId: `price_${p.code}`,
    highlighted: p.code === 'pro',
    active: true,
    sort: p.code === 'initiale' ? 1 : p.code === 'pro' ? 2 : 3,
    features: [
      { featureKey: 'brique.rh', enabled: p.features.briqueRh, limitValue: null },
      { featureKey: 'brique.gouvernance', enabled: p.features.briqueGouvernance, limitValue: null },
      { featureKey: 'brique.finance', enabled: p.features.briqueFinance, limitValue: null },
      { featureKey: 'brique.conformite', enabled: p.features.briqueConformite, limitValue: null },
      { featureKey: 'ai.model', enabled: true, limitValue: p.features.aiModel },
      { featureKey: 'ai.max_tokens', enabled: true, limitValue: String(p.features.maxTokens) },
      { featureKey: 'ai.max_input_chars', enabled: true, limitValue: String(p.features.maxInputChars) },
      { featureKey: 'expert_questions_month', enabled: true, limitValue: String(p.features.expertQuestionsMonth) }
    ]
  }));

  const subscriptions: Subscription[] = [
    {
      organizationId: 'org-1',
      planCode: 'pro',
      status: 'active',
      currentPeriodEnd: new Date('2026-11-30T23:59:59.000Z'),
      graceUntil: null,
      stripeCustomerId: 'cus_AkiligueEspoir75',
      stripeSubscriptionId: 'sub_org_1'
    },
    {
      organizationId: 'org-2',
      planCode: 'initiale',
      status: 'active',
      currentPeriodEnd: new Date('2026-11-30T23:59:59.000Z'),
      graceUntil: null,
      stripeCustomerId: 'cus_MptLilas93',
      stripeSubscriptionId: 'sub_org_2'
    },
    {
      organizationId: 'org-3',
      planCode: 'expert',
      status: 'active',
      currentPeriodEnd: new Date('2026-11-30T23:59:59.000Z'),
      graceUntil: null,
      stripeCustomerId: 'cus_PasserelleLyon69',
      stripeSubscriptionId: 'sub_org_3'
    }
  ];

  const tickets: ExpertTicket[] = INITIAL_TICKETS.map((t) => ({
    id: t.id,
    ref: t.ref,
    organizationId: t.orgId,
    userId: `user-${t.orgId}`,
    domain: t.domain,
    urgency: t.urgency,
    subject: t.object,
    question: t.question,
    answer: t.status === 'answered' ? 'Réponse certifiée par Laetitia Badji' : null,
    internalNote: null,
    status: t.status,
    answeredAt: t.status === 'answered' ? new Date() : null,
    createdAt: new Date()
  }));

  const pages: CmsPage[] = DEFAULT_SEO_PAGES.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    metaDescription: p.metaDescription,
    h1: p.h1,
    chapo: p.chapo,
    content: p.content,
    faq: p.faq,
    sources: p.sources,
    author: p.author,
    reviewer: p.reviewer,
    verifiedAt: p.verifiedAt,
    status: p.status,
    noindex: p.noindex,
    breadcrumbs: p.breadcrumbs,
    updatedAt: new Date(p.updatedAt)
  }));

  // Les sessions de fixtures ont des jetons connus : elles ne sont jamais chargées en production.
  const fixtureSessions = process.env.NODE_ENV === 'production' ? [] : sessions;

  return { users, sessions: fixtureSessions, memberships, orgs, profiles, plans, subscriptions, tickets, pages };
}

export function createContainer(options?: {
  useMemory?: boolean;
  mailProvider?: MailProvider;
  paymentGateway?: PaymentGateway;
  rateLimiter?: RateLimiter;
  passwordHasher?: PasswordHasher;
}): AppContainer {
  const useMemory =
    options?.useMemory ??
    ((process.env.NODE_ENV === 'test' && !process.env.USE_TEST_DB) || !process.env.DATABASE_URL);

  const mailProvider = options?.mailProvider ?? defaultMailProvider;
  const paymentGateway = options?.paymentGateway ?? createPaymentGateway();
  const rateLimiter = options?.rateLimiter ?? createRateLimiter();
  const passwordHasher = options?.passwordHasher ?? new ScryptPasswordHasher();
  const appBaseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
  const expertEmail = process.env.EXPERT_NOTIFICATION_EMAIL || 'contact@cabinet-mae.fr';

  let userRepo: IUserRepository;
  let sessionRepo: ISessionRepository;
  let membershipRepo: IMembershipRepository;
  let orgRepo: IOrgRepository;
  let planRepo: IPlanRepository;
  let subRepo: ISubscriptionRepository;
  let ticketRepo: ITicketRepository;
  let aiRepo: IAiRepository;
  let cmsRepo: ICmsRepository;
  let tokenRepo: IVerificationTokenRepository;

  function initRepos() {
    if (useMemory) {
      const fixtures = buildDefaultMemoryFixtures();
      userRepo = new MemoryUserRepository(fixtures.users);
      sessionRepo = new MemorySessionRepository(fixtures.sessions);
      membershipRepo = new MemoryMembershipRepository(fixtures.memberships);
      orgRepo = new MemoryOrgRepository(fixtures.orgs, fixtures.profiles);
      planRepo = new MemoryPlanRepository(fixtures.plans);
      subRepo = new MemorySubscriptionRepository(fixtures.subscriptions);
      ticketRepo = new MemoryTicketRepository(fixtures.tickets);
      aiRepo = new MemoryAiRepository();
      cmsRepo = new MemoryCmsRepository(fixtures.pages);
      tokenRepo = new MemoryVerificationTokenRepository();
    } else {
      userRepo = new DrizzleUserRepository();
      sessionRepo = new DrizzleSessionRepository();
      membershipRepo = new DrizzleMembershipRepository();
      orgRepo = new DrizzleOrgRepository();
      planRepo = new DrizzlePlanRepository();
      subRepo = new DrizzleSubscriptionRepository();
      ticketRepo = new DrizzleTicketRepository();
      aiRepo = new DrizzleAiRepository();
      cmsRepo = new DrizzleCmsRepository();
      tokenRepo = new DrizzleVerificationTokenRepository();
    }
  }

  initRepos();

  const buildServices = () => {
    const billing = new BillingService(planRepo!, subRepo!);
    return {
      authService: new AuthService(
        userRepo!,
        sessionRepo!,
        membershipRepo!,
        tokenRepo!,
        mailProvider,
        passwordHasher,
        rateLimiter,
        { appBaseUrl }
      ),
      orgService: new OrgService(orgRepo!, membershipRepo!, userRepo!, subRepo!),
      billingService: billing,
      ticketService: new TicketService(ticketRepo!, orgRepo!, userRepo!, billing, mailProvider, expertEmail),
      aiService: new AiService(aiRepo!, orgRepo!, billing, rateLimiter),
      cmsService: new CmsService(cmsRepo!)
    };
  };

  let services = buildServices();

  const resetForTests = () => {
    initRepos();
    services = buildServices();
  };

  return {
    repositories: {
      get user() { return userRepo; },
      get session() { return sessionRepo; },
      get membership() { return membershipRepo; },
      get org() { return orgRepo; },
      get plan() { return planRepo; },
      get subscription() { return subRepo; },
      get ticket() { return ticketRepo; },
      get ai() { return aiRepo; },
      get cms() { return cmsRepo; },
      get verificationToken() { return tokenRepo; }
    },
    get authService() { return services.authService; },
    get orgService() { return services.orgService; },
    get billingService() { return services.billingService; },
    get ticketService() { return services.ticketService; },
    get aiService() { return services.aiService; },
    get cmsService() { return services.cmsService; },
    mailProvider,
    paymentGateway,
    rateLimiter,
    resetForTests
  };
}

// Singleton global pour le runtime Next.js
export const container: AppContainer = createContainer();
