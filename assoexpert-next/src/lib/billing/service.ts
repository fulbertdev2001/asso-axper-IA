/**
 * Lot 3 — Abonnements Stripe, Webhooks idempotents & Droits configurables (`plans` / `plan_features`)
 * §3.2, §3.3, §3.5 & §7 Lot 3 :
 * - Formules, droits et limites vivent en configuration (modifiables dans l'admin sans redéploiement).
 * - Le code interroge `hasFeature(org, ...)` et `getLimit(org, ...)`, jamais `plan === 'pro'`.
 * - Les webhooks Stripe sont dédoublonnés via `stripe_events`.
 * - En cas d'`invoice.payment_failed`, une période de grâce configurable (3 jours par défaut)
 *   est appliquée avant suspension des droits.
 */

import { Plan, Subscription } from '../../types';
import { INITIAL_PLANS } from '../../data/mockData';
import { container } from '../../container';
import {
  FeatureKey,
  OrgFeatureGrant,
  OrganizationEntitlementContext,
  hasFeature,
  getLimit,
  getConfigValue
} from '../entitlements';

export interface StripeEventRecord {
  eventId: string;
  type: string;
  processedAt: string;
}

export interface IncomingStripeWebhookEvent {
  id: string;
  type:
    | 'customer.subscription.created'
    | 'customer.subscription.updated'
    | 'customer.subscription.deleted'
    | 'invoice.payment_failed';
  data: {
    object: {
      organizationId: string;
      stripeCustomerId?: string;
      stripeSubscriptionId?: string;
      planCode?: 'initiale' | 'pro' | 'expert';
      currentPeriodEnd?: string;
    };
  };
}

const DEFAULT_GRACE_PERIOD_DAYS = 3;

let configurablePlansStore: Plan[] = INITIAL_PLANS.map((p) => ({
  ...p,
  features: { ...p.features }
}));

const subscriptionStore = new Map<string, Subscription>([
  [
    'org-1',
    {
      planCode: 'pro',
      status: 'active',
      currentPeriodEnd: '2026-11-30T23:59:59.000Z',
      graceUntil: null,
      stripeCustomerId: 'cus_AkiligueEspoir75',
      questionsUsedThisMonth: 1
    }
  ],
  [
    'org-2',
    {
      planCode: 'initiale',
      status: 'active',
      currentPeriodEnd: '2026-11-30T23:59:59.000Z',
      graceUntil: null,
      stripeCustomerId: 'cus_MptLilas93',
      questionsUsedThisMonth: 1
    }
  ],
  [
    'org-3',
    {
      planCode: 'expert',
      status: 'active',
      currentPeriodEnd: '2026-11-30T23:59:59.000Z',
      graceUntil: null,
      stripeCustomerId: 'cus_PasserelleLyon69',
      questionsUsedThisMonth: 0
    }
  ]
]);

const processedStripeEvents = new Map<string, StripeEventRecord>();

export function resetBillingStoresForTests(): void {
  configurablePlansStore = INITIAL_PLANS.map((p) => ({
    ...p,
    features: { ...p.features }
  }));
  processedStripeEvents.clear();
  subscriptionStore.clear();
  subscriptionStore.set('org-1', {
    planCode: 'pro',
    status: 'active',
    currentPeriodEnd: '2026-11-30T23:59:59.000Z',
    graceUntil: null,
    stripeCustomerId: 'cus_AkiligueEspoir75',
    questionsUsedThisMonth: 1
  });
  subscriptionStore.set('org-2', {
    planCode: 'initiale',
    status: 'active',
    currentPeriodEnd: '2026-11-30T23:59:59.000Z',
    graceUntil: null,
    stripeCustomerId: 'cus_MptLilas93',
    questionsUsedThisMonth: 1
  });
  subscriptionStore.set('org-3', {
    planCode: 'expert',
    status: 'active',
    currentPeriodEnd: '2026-11-30T23:59:59.000Z',
    graceUntil: null,
    stripeCustomerId: 'cus_PasserelleLyon69',
    questionsUsedThisMonth: 0
  });
  container.resetForTests();
}

export function getConfigurablePlans(): Plan[] {
  return configurablePlansStore.map((p) => ({ ...p, features: { ...p.features } }));
}

/**
 * Permet à Laetitia (via le back-office Payload `/admin`) de modifier les prix,
 * quotas, modèles et briques sans redéploiement (§7 Lot 3 CA #1).
 */
export function updatePlanInAdmin(
  planCode: Plan['code'],
  patch: {
    priceMonthly?: number;
    label?: string;
    description?: string;
    features?: Partial<Plan['features']>;
  }
): Plan {
  const index = configurablePlansStore.findIndex((p) => p.code === planCode);
  if (index === -1) {
    throw new Error(`Formule introuvable : ${planCode}`);
  }

  const current = configurablePlansStore[index];
  const updated: Plan = {
    ...current,
    ...(patch.priceMonthly !== undefined ? { priceMonthly: patch.priceMonthly } : {}),
    ...(patch.label !== undefined ? { label: patch.label } : {}),
    ...(patch.description !== undefined ? { description: patch.description } : {}),
    features: {
      ...current.features,
      ...(patch.features || {})
    }
  };

  configurablePlansStore[index] = updated;
  void container.repositories.plan.update(planCode, patch as any);

  return { ...updated, features: { ...updated.features } };
}

export function getOrganizationSubscription(organizationId: string): Subscription | null {
  return subscriptionStore.get(organizationId) || null;
}

/**
 * Convertit un `Plan` de la configuration en liste de `OrgFeatureGrant`
 * pour le moteur `entitlements` (§3.2).
 */
export function buildGrantsFromPlan(plan: Plan): OrgFeatureGrant[] {
  return [
    { featureKey: 'brique.rh', enabled: plan.features.briqueRh },
    { featureKey: 'brique.gouvernance', enabled: plan.features.briqueGouvernance },
    { featureKey: 'brique.finance', enabled: plan.features.briqueFinance },
    { featureKey: 'brique.conformite', enabled: plan.features.briqueConformite },
    {
      featureKey: 'ai.model',
      enabled: true,
      limitValue: plan.features.aiModel
    },
    {
      featureKey: 'ai.max_tokens',
      enabled: true,
      limitValue: plan.features.maxTokens
    },
    {
      featureKey: 'ai.max_input_chars',
      enabled: true,
      limitValue: plan.features.maxInputChars
    },
    {
      featureKey: 'expert_questions_month',
      enabled: plan.features.expertQuestionsMonth > 0,
      limitValue: plan.features.expertQuestionsMonth
    }
  ];
}

export function getOrgEntitlementContext(organizationId: string): OrganizationEntitlementContext {
  const sub = subscriptionStore.get(organizationId);
  if (!sub) {
    return {
      organizationId,
      subscriptionStatus: 'canceled',
      graceUntil: null,
      grants: []
    };
  }

  const plan =
    configurablePlansStore.find((p) => p.code === sub.planCode) || configurablePlansStore[0];

  return {
    organizationId,
    subscriptionStatus: sub.status,
    graceUntil: sub.graceUntil ? new Date(sub.graceUntil) : null,
    grants: buildGrantsFromPlan(plan)
  };
}

export function orgHasFeature(
  organizationId: string,
  featureKey: FeatureKey,
  now = new Date()
): boolean {
  const ctx = getOrgEntitlementContext(organizationId);
  return hasFeature(ctx, featureKey, now);
}

export function orgGetLimit(
  organizationId: string,
  featureKey: FeatureKey,
  defaultValue = 0,
  now = new Date()
): number {
  const ctx = getOrgEntitlementContext(organizationId);
  return getLimit(ctx, featureKey, defaultValue, now);
}

export function orgGetConfigValue(
  organizationId: string,
  featureKey: FeatureKey,
  defaultValue: string
): string {
  const ctx = getOrgEntitlementContext(organizationId);
  return getConfigValue(ctx, featureKey, defaultValue);
}

/**
 * Traitement idempotent des Webhooks Stripe (§3.5 & §7 Lot 3 CA #2 et #3)
 */
export function processStripeWebhookEvent(
  event: IncomingStripeWebhookEvent,
  options: { now?: Date; graceDays?: number } = {}
): {
  duplicate: boolean;
  eventRecord: StripeEventRecord;
  subscription: Subscription;
} {
  const now = options.now || new Date();
  const graceDays = options.graceDays ?? DEFAULT_GRACE_PERIOD_DAYS;

  const existingEvent = processedStripeEvents.get(event.id);
  const orgId = event.data.object.organizationId;

  if (existingEvent) {
    const existingSub = subscriptionStore.get(orgId)!;
    return {
      duplicate: true,
      eventRecord: existingEvent,
      subscription: existingSub
    };
  }

  const currentSub: Subscription = subscriptionStore.get(orgId) || {
    planCode: event.data.object.planCode || 'initiale',
    status: 'active',
    currentPeriodEnd:
      event.data.object.currentPeriodEnd ||
      new Date(now.getTime() + 30 * 24 * 3600 * 1000).toISOString(),
    graceUntil: null,
    stripeCustomerId: event.data.object.stripeCustomerId || `cus_${orgId}`,
    questionsUsedThisMonth: 0
  };

  let updatedSub: Subscription = { ...currentSub };

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      updatedSub = {
        ...currentSub,
        planCode: event.data.object.planCode || currentSub.planCode,
        status: 'active',
        graceUntil: null,
        stripeCustomerId: event.data.object.stripeCustomerId || currentSub.stripeCustomerId,
        currentPeriodEnd: event.data.object.currentPeriodEnd || currentSub.currentPeriodEnd
      };
      break;
    }

    case 'invoice.payment_failed': {
      const graceEnd = new Date(now.getTime() + graceDays * 24 * 3600 * 1000);
      updatedSub = {
        ...currentSub,
        status: 'past_due',
        graceUntil: graceEnd.toISOString()
      };
      break;
    }

    case 'customer.subscription.deleted': {
      updatedSub = {
        ...currentSub,
        status: 'canceled',
        graceUntil: null
      };
      break;
    }
  }

  subscriptionStore.set(orgId, updatedSub);

  const eventRecord: StripeEventRecord = {
    eventId: event.id,
    type: event.type,
    processedAt: now.toISOString()
  };
  processedStripeEvents.set(event.id, eventRecord);

  return {
    duplicate: false,
    eventRecord,
    subscription: updatedSub
  };
}

export function createStripeCheckoutSessionUrl(params: {
  organizationId: string;
  planCode: Plan['code'];
  returnUrl?: string;
}): { sessionId: string; checkoutUrl: string } {
  const baseUrl = (params.returnUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(
    /\/$/,
    ''
  );
  const sessionId = `cs_test_${params.organizationId}_${params.planCode}_${Date.now()}`;
  return {
    sessionId,
    checkoutUrl: `${baseUrl}/app?checkout=success&plan=${params.planCode}&session_id=${sessionId}`
  };
}

export function createStripeCustomerPortalUrl(params: {
  organizationId: string;
  returnUrl?: string;
}): { portalUrl: string; stripeCustomerId: string } {
  const sub = subscriptionStore.get(params.organizationId);
  const stripeCustomerId = sub?.stripeCustomerId || `cus_${params.organizationId}`;
  const baseUrl = (params.returnUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(
    /\/$/,
    ''
  );
  return {
    stripeCustomerId,
    portalUrl: `https://billing.stripe.com/p/session/${stripeCustomerId}?return_url=${encodeURIComponent(baseUrl + '/app')}`
  };
}
