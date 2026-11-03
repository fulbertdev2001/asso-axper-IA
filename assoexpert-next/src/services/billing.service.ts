/**
 * Service de facturation et d'abonnements (Couche Métier).
 * Design Pattern : Dependency Injection & Configuration-Driven Entitlements.
 * - Le code vérifie hasFeature() et getLimit() dynamiquement en base,
 *   sans condition codée en dur (ex: if (plan === 'pro')).
 * - Traitement idempotent des webhooks Stripe via ISubscriptionRepository.
 */

import { AuthContext, BillingEvent, FeatureKey, Plan, Subscription } from '../domain/models';
import { ForbiddenError, NotFoundError } from '../domain/errors';
import { IPlanRepository, ISubscriptionRepository } from '../repositories/interfaces';

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
      planCode?: string;
      currentPeriodEnd?: string;
    };
  };
}

export class BillingService {
  constructor(
    private readonly planRepo: IPlanRepository,
    private readonly subRepo: ISubscriptionRepository
  ) {}

  async listActivePlans(): Promise<Plan[]> {
    return await this.planRepo.listActive();
  }

  async listAllPlans(authContext: AuthContext): Promise<Plan[]> {
    if (!authContext.isPlatformAdmin) {
      throw new ForbiddenError('Accès réservé aux administrateurs de la plateforme.');
    }
    return await this.planRepo.listAll();
  }

  async updatePlan(
    authContext: AuthContext,
    code: string,
    patch: any
  ): Promise<Plan> {
    if (!authContext.isPlatformAdmin) {
      throw new ForbiddenError('Accès réservé aux administrateurs de la plateforme.');
    }

    const current = await this.planRepo.findByCode(code);
    if (!current) throw new NotFoundError(`Plan introuvable : ${code}`);

    let updatedFeatures = [...current.features];
    if (patch.features) {
      if (Array.isArray(patch.features)) {
        updatedFeatures = patch.features;
      } else {
        const featObj = patch.features;
        if (featObj.expertQuestionsMonth !== undefined) {
          const idx = updatedFeatures.findIndex((f) => f.featureKey === 'expert_questions_month');
          if (idx >= 0) {
            updatedFeatures[idx].limitValue = String(featObj.expertQuestionsMonth);
            updatedFeatures[idx].enabled = Number(featObj.expertQuestionsMonth) > 0;
          }
        }
        if (featObj.briqueConformite !== undefined) {
          const idx = updatedFeatures.findIndex((f) => f.featureKey === 'brique.conformite');
          if (idx >= 0) updatedFeatures[idx].enabled = Boolean(featObj.briqueConformite);
        }
        if (featObj.briqueRh !== undefined) {
          const idx = updatedFeatures.findIndex((f) => f.featureKey === 'brique.rh');
          if (idx >= 0) updatedFeatures[idx].enabled = Boolean(featObj.briqueRh);
        }
        if (featObj.briqueGouvernance !== undefined) {
          const idx = updatedFeatures.findIndex((f) => f.featureKey === 'brique.gouvernance');
          if (idx >= 0) updatedFeatures[idx].enabled = Boolean(featObj.briqueGouvernance);
        }
        if (featObj.briqueFinance !== undefined) {
          const idx = updatedFeatures.findIndex((f) => f.featureKey === 'brique.finance');
          if (idx >= 0) updatedFeatures[idx].enabled = Boolean(featObj.briqueFinance);
        }
      }
    }

    const price = patch.priceMonthly ?? patch.priceMonthlyEur ?? current.priceMonthlyEur;

    const updated = await this.planRepo.update(code, {
      ...patch,
      priceMonthlyEur: price,
      features: updatedFeatures
    });

    return updated;
  }

  async getSubscription(authContext: AuthContext, orgId: string): Promise<Subscription | null> {
    if (!authContext.isPlatformAdmin && authContext.organizationId !== orgId) {
      throw new ForbiddenError('Accès refusé aux données de facturation de cette organisation.');
    }
    return await this.subRepo.findByOrgId(orgId);
  }

  async hasFeature(orgId: string, featureKey: FeatureKey, now = new Date()): Promise<boolean> {
    const sub = await this.subRepo.findByOrgId(orgId);
    if (!sub) return false;

    // Vérifier l'état de l'abonnement
    const isActive = sub.status === 'active';
    const isInGrace =
      sub.status === 'past_due' && sub.graceUntil !== null && sub.graceUntil.getTime() > now.getTime();

    if (!isActive && !isInGrace) {
      return false;
    }

    const plan = await this.planRepo.findByCode(sub.planCode);
    if (!plan) return false;

    const feature = plan.features.find((f) => f.featureKey === featureKey);
    return feature ? feature.enabled : false;
  }

  async getLimit(
    orgId: string,
    featureKey: FeatureKey,
    defaultValue = 0,
    now = new Date()
  ): Promise<number> {
    const sub = await this.subRepo.findByOrgId(orgId);
    if (!sub) return defaultValue;

    const isActive = sub.status === 'active';
    const isInGrace =
      sub.status === 'past_due' && sub.graceUntil !== null && sub.graceUntil.getTime() > now.getTime();

    if (!isActive && !isInGrace) {
      return defaultValue;
    }

    const plan = await this.planRepo.findByCode(sub.planCode);
    if (!plan) return defaultValue;

    const feature = plan.features.find((f) => f.featureKey === featureKey);
    if (!feature || !feature.enabled) {
      return 0;
    }

    if (feature.limitValue === null || feature.limitValue === 'unlimited') {
      return Infinity;
    }

    const parsed = Number(feature.limitValue);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  async getFeatureValue(
    orgId: string,
    featureKey: FeatureKey,
    defaultValue: string,
    now = new Date()
  ): Promise<string> {
    const sub = await this.subRepo.findByOrgId(orgId);
    if (!sub) return defaultValue;

    const isActive = sub.status === 'active';
    const isInGrace =
      sub.status === 'past_due' && sub.graceUntil !== null && sub.graceUntil.getTime() > now.getTime();

    if (!isActive && !isInGrace) {
      return defaultValue;
    }

    const plan = await this.planRepo.findByCode(sub.planCode);
    if (!plan) return defaultValue;

    const feature = plan.features.find((f) => f.featureKey === featureKey);
    if (!feature || !feature.enabled || !feature.limitValue) {
      return defaultValue;
    }

    // §4 Stack : claude-sonnet-4-6 des CDC ne doit jamais être utilisé
    if (featureKey === 'ai.model' && feature.limitValue === 'claude-sonnet-4-6') {
      return 'claude-sonnet-5';
    }

    return feature.limitValue;
  }

  /**
   * Point d'entrée des webhooks de paiement VÉRIFIÉS (signature contrôlée par `PaymentGateway`).
   * Résout l'organisation (metadata ou abonnement connu) et la formule (via `stripe_price_id`
   * configuré en base), puis délègue au traitement idempotent `processStripeWebhook`.
   */
  async processBillingEvent(
    event: BillingEvent,
    options: { now?: Date; graceDays?: number } = {}
  ): Promise<
    | { ignored: true; reason: string; eventId: string }
    | Awaited<ReturnType<BillingService['processStripeWebhook']>>
  > {
    const knownSub = event.stripeSubscriptionId
      ? await this.subRepo.findByStripeSubscriptionId(event.stripeSubscriptionId)
      : null;
    const organizationId = event.organizationId || knownSub?.organizationId || null;
    if (!organizationId) {
      return { ignored: true, reason: 'organisation introuvable pour cet événement', eventId: event.id };
    }

    let planCode: string | undefined;
    if (event.priceId) {
      const plan = await this.planRepo.findByStripePriceId(event.priceId);
      if (!plan) {
        return { ignored: true, reason: `aucune formule configurée pour le prix ${event.priceId}`, eventId: event.id };
      }
      planCode = plan.code;
    }

    const typeMap: Record<BillingEvent['type'], IncomingStripeWebhookEvent['type']> = {
      'subscription.upserted': 'customer.subscription.updated',
      'subscription.deleted': 'customer.subscription.deleted',
      'payment.failed': 'invoice.payment_failed'
    };

    return this.processStripeWebhook(
      {
        id: event.id,
        type: typeMap[event.type],
        data: {
          object: {
            organizationId,
            stripeCustomerId: event.stripeCustomerId || undefined,
            stripeSubscriptionId: event.stripeSubscriptionId || undefined,
            planCode,
            currentPeriodEnd: event.currentPeriodEnd?.toISOString()
          }
        }
      },
      options
    );
  }

  async processStripeWebhook(
    event: IncomingStripeWebhookEvent,
    options: { now?: Date; graceDays?: number } = {}
  ): Promise<{ duplicate: boolean; eventRecord: { eventId: string; type: string }; subscription: Subscription }> {
    const now = options.now || new Date();
    const graceDays = options.graceDays ?? 3;

    // Contrôle d'idempotence via la table stripe_events (§3.5)
    const alreadyProcessed = await this.subRepo.hasStripeEvent(event.id);
    const orgId = event.data.object.organizationId;

    if (alreadyProcessed) {
      const existingSub = await this.subRepo.findByOrgId(orgId);
      if (existingSub) {
        return {
          duplicate: true,
          eventRecord: { eventId: event.id, type: event.type },
          subscription: existingSub
        };
      }
    }

    const currentSub = (await this.subRepo.findByOrgId(orgId)) || {
      organizationId: orgId,
      stripeCustomerId: event.data.object.stripeCustomerId || `cus_${orgId}`,
      stripeSubscriptionId: event.data.object.stripeSubscriptionId || `sub_${orgId}`,
      planCode: event.data.object.planCode || 'initiale',
      status: 'active',
      currentPeriodEnd: event.data.object.currentPeriodEnd
        ? new Date(event.data.object.currentPeriodEnd)
        : new Date(now.getTime() + 30 * 24 * 3600 * 1000),
      graceUntil: null
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
          stripeSubscriptionId:
            event.data.object.stripeSubscriptionId || currentSub.stripeSubscriptionId,
          currentPeriodEnd: event.data.object.currentPeriodEnd
            ? new Date(event.data.object.currentPeriodEnd)
            : currentSub.currentPeriodEnd
        };
        break;
      }

      case 'invoice.payment_failed': {
        const graceEnd = new Date(now.getTime() + graceDays * 24 * 3600 * 1000);
        updatedSub = {
          ...currentSub,
          status: 'past_due',
          graceUntil: graceEnd
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

    const savedSub = await this.subRepo.upsert(updatedSub);
    await this.subRepo.recordStripeEvent(event.id, event.type);

    return {
      duplicate: false,
      eventRecord: { eventId: event.id, type: event.type },
      subscription: savedSub
    };
  }
}
