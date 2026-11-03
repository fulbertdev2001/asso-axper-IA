import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  numeric,
  jsonb,
  uniqueIndex,
  index
} from 'drizzle-orm/pg-core';

/**
 * §6. Modèle de données minimal — Tables applicatives (Drizzle ORM)
 * Unité métier : `organizations`. Tout objet métier porte un `organization_id`.
 */

// 1. Utilisateurs & Sessions sécurisées
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull().default(''),
  passwordHash: text('password_hash'),
  isPlatformAdmin: boolean('is_platform_admin').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(), // SHA-256 hash du token
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  organizationId: uuid('organization_id')
    .references(() => organizations.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

// Jetons à usage unique (magic link, réinitialisation de mot de passe) — empreinte SHA-256 uniquement
export const verificationTokens = pgTable(
  'verification_tokens',
  {
    id: text('id').primaryKey(),
    purpose: text('purpose').$type<'magic_link' | 'password_reset'>().notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [index('verification_tokens_user_idx').on(table.userId)]
);

// 2. Organisations (unité métier multi-tenant)
export const organizations = pgTable('organizations', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  siren: text('siren').notNull().default(''),
  rna: text('rna').notNull().default(''),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

// 3. Profils d'association (§6 : tous les champs sont modifiables et supprimables par l'utilisateur)
export const organizationProfiles = pgTable(
  'organization_profiles',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    sector: text('sector').notNull().default(''),
    employeesCount: integer('employees_count').notNull().default(1),
    annualBudget: integer('annual_budget').notNull().default(0),
    ccn: text('ccn').notNull().default(''),
    fiscalYearEnd: text('fiscal_year_end').notNull().default('31 décembre'),
    usualAgMonth: text('usual_ag_month').notNull().default('Juin'),
    governanceSummary: text('governance_summary').notNull().default(''),
    mainFunders: jsonb('main_funders').$type<string[]>().notNull().default([]),
    members: jsonb('members').$type<any[]>().notNull().default([]),
    establishmentsCount: integer('establishments_count').notNull().default(1),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [uniqueIndex('org_profiles_org_id_idx').on(table.organizationId)]
);

// 4. Memberships (multi-utilisateurs anticipé dès le MVP — §5 & §6)
export const memberships = pgTable(
  'memberships',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull(),
    organizationId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    roleInOrg: text('role_in_org').notNull().default('Direction'),
    appRole: text('app_role').$type<'owner' | 'admin_platform' | 'member'>().notNull().default('owner'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [index('memberships_org_user_idx').on(table.organizationId, table.userId)]
);

// 4. Formules & Droits configurables en base (§3.2 & §3.3 : aucun prix, quota ou modèle codé en dur)
export const plans = pgTable('plans', {
  code: text('code').primaryKey(), // ex: 'initiale', 'pro', 'expert', 'free'
  label: text('label').notNull(),
  description: text('description').notNull().default(''),
  priceMonthlyEur: integer('price_monthly_eur').notNull(),
  stripePriceId: text('stripe_price_id').notNull(),
  highlighted: boolean('highlighted').notNull().default(false),
  active: boolean('active').notNull().default(true),
  sort: integer('sort').notNull().default(0)
});

export const planFeatures = pgTable(
  'plan_features',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    planCode: text('plan_code')
      .notNull()
      .references(() => plans.code, { onDelete: 'cascade' }),
    // Exemples : 'brique.finance', 'brique.rh', 'brique.conformite', 'brique.gouvernance',
    // 'ai.model', 'ai.max_tokens', 'ai.max_input_chars', 'expert_questions_month'
    featureKey: text('feature_key').notNull(),
    enabled: boolean('enabled').notNull().default(true),
    limitValue: text('limit_value') // nullable : contient par ex. '3', '2048', 'claude-sonnet-5'
  },
  (table) => [uniqueIndex('plan_feature_unique_idx').on(table.planCode, table.featureKey)]
);

// 5. Abonnements Stripe (§6)
export const subscriptions = pgTable(
  'subscriptions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    stripeCustomerId: text('stripe_customer_id').notNull(),
    stripeSubscriptionId: text('stripe_subscription_id').notNull(),
    planCode: text('plan_code')
      .notNull()
      .references(() => plans.code),
    status: text('status')
      .$type<'active' | 'past_due' | 'canceled' | 'suspended'>()
      .notNull()
      .default('active'),
    currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }).notNull(),
    graceUntil: timestamp('grace_until', { withTimezone: true }),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [uniqueIndex('subscriptions_org_id_idx').on(table.organizationId)]
);

// 6. Événements Webhooks Stripe idempotents (§3.5)
export const stripeEvents = pgTable('stripe_events', {
  eventId: text('event_id').primaryKey(),
  type: text('type').notNull(),
  processedAt: timestamp('processed_at', { withTimezone: true }).defaultNow().notNull()
});

// 7. Conversations & Messages IA (§6 : contenu stocké pour l'historique utilisateur, supprimable)
export const conversations = pgTable(
  'conversations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    userId: text('user_id').notNull(),
    domain: text('domain')
      .$type<'rh' | 'gouvernance' | 'finance' | 'conformite'>()
      .notNull(),
    title: text('title').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [index('conversations_org_idx').on(table.organizationId)]
);

export const messages = pgTable(
  'messages',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    conversationId: uuid('conversation_id')
      .notNull()
      .references(() => conversations.id, { onDelete: 'cascade' }),
    organizationId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    userId: text('user_id').notNull(),
    role: text('role').$type<'user' | 'assistant'>().notNull(),
    content: text('content').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [index('messages_org_conv_idx').on(table.organizationId, table.conversationId)]
);

// 8. Journalisation d'usage IA (§3.7 & §6 : SANS contenu de question ni de réponse)
export const aiUsage = pgTable(
  'ai_usage',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    userId: text('user_id').notNull(),
    model: text('model').notNull(),
    promptVersion: text('prompt_version').notNull(),
    inputTokens: integer('input_tokens').notNull(),
    outputTokens: integer('output_tokens').notNull(),
    costEstimate: numeric('cost_estimate', { precision: 10, scale: 6 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [index('ai_usage_org_idx').on(table.organizationId)]
);

// 9. Tickets d'escalade vers l'experte humaine (§6)
export const expertTickets = pgTable(
  'expert_tickets',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    ref: text('ref').notNull().unique(), // Ex: AE-2026-00042
    organizationId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    userId: text('user_id').notNull(),
    domain: text('domain')
      .$type<'rh' | 'gouvernance' | 'finance' | 'conformite'>()
      .notNull(),
    urgency: text('urgency').notNull().default('normal_48h'),
    subject: text('subject').notNull().default(''),
    question: text('question').notNull(),
    answer: text('answer'),
    internalNote: text('internal_note'),
    status: text('status')
      .$type<'pending' | 'in_progress' | 'answered'>()
      .notNull()
      .default('pending'),
    answeredAt: timestamp('answered_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [index('expert_tickets_org_idx').on(table.organizationId)]
);

// 10. Pages SEO (CMS Payload / SSR)
export const cmsPages = pgTable('cms_pages', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  metaDescription: text('meta_description').notNull(),
  h1: text('h1').notNull(),
  chapo: text('chapo').notNull(),
  content: text('content').notNull(),
  faq: jsonb('faq').$type<any[]>().notNull().default([]),
  sources: jsonb('sources').$type<string[]>().notNull().default([]),
  author: text('author').notNull().default('Laetitia Badji'),
  reviewer: text('reviewer').notNull().default('Cabinet Maé'),
  verifiedAt: text('verified_at').notNull().default(''),
  status: text('status').$type<'draft' | 'published'>().notNull().default('published'),
  noindex: boolean('noindex').notNull().default(false),
  breadcrumbs: jsonb('breadcrumbs').$type<any[]>().notNull().default([]),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

// 11. Redirections 301 SEO automatiques lors du renommage de slug
export const cmsRedirects = pgTable('cms_redirects', {
  oldSlug: text('old_slug').primaryKey(),
  newSlug: text('new_slug').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});


