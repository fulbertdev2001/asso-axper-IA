/**
 * §4 — Paiement (Stripe Billing + Checkout + Customer Portal) encapsulé derrière une interface.
 * Design Pattern Port/Adapter : `BillingService` ne connaît que `PaymentGateway` et le type
 * de domaine `BillingEvent`, jamais le SDK Stripe.
 *
 * Sécurité (§3.5) : un webhook n'est accepté que si sa signature `Stripe-Signature`
 * est valide pour `STRIPE_WEBHOOK_SECRET`. Sans secret configuré, tous les webhooks sont refusés.
 */

import Stripe from 'stripe';
import { BillingEvent } from '../../domain/models';
import { ServiceUnavailableError, ValidationError } from '../../domain/errors';

export interface PaymentGateway {
  /**
   * Vérifie la signature du webhook et le convertit en événement de domaine.
   * Retourne `null` pour un type d'événement non géré (accusé de réception sans traitement).
   */
  parseWebhook(rawBody: string, signature: string | null): Promise<BillingEvent | null>;
}

type StripeId = string | { id: string } | null | undefined;

function idOf(value: StripeId): string | null {
  if (!value) return null;
  return typeof value === 'string' ? value : value.id;
}

function unixToDate(value: unknown): Date | null {
  return typeof value === 'number' && value > 0 ? new Date(value * 1000) : null;
}

/** Traduit un événement Stripe vérifié en `BillingEvent` (anti-corruption layer). */
export function toBillingEvent(event: Stripe.Event): BillingEvent | null {
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      const firstItem = sub.items?.data?.[0] as (Stripe.SubscriptionItem & { current_period_end?: number }) | undefined;
      return {
        id: event.id,
        type: event.type === 'customer.subscription.deleted' ? 'subscription.deleted' : 'subscription.upserted',
        organizationId: sub.metadata?.organizationId || null,
        stripeCustomerId: idOf(sub.customer as StripeId) || '',
        stripeSubscriptionId: sub.id,
        priceId: firstItem?.price?.id || null,
        currentPeriodEnd:
          unixToDate((sub as unknown as { current_period_end?: number }).current_period_end) ??
          unixToDate(firstItem?.current_period_end)
      };
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice & {
        parent?: { subscription_details?: { subscription?: StripeId; metadata?: Record<string, string> } };
      };
      const subscriptionId =
        idOf((invoice as unknown as { subscription?: StripeId }).subscription) ??
        idOf(invoice.parent?.subscription_details?.subscription);
      return {
        id: event.id,
        type: 'payment.failed',
        organizationId:
          invoice.subscription_details?.metadata?.organizationId ||
          invoice.parent?.subscription_details?.metadata?.organizationId ||
          null,
        stripeCustomerId: idOf(invoice.customer as StripeId) || '',
        stripeSubscriptionId: subscriptionId,
        priceId: null,
        currentPeriodEnd: null
      };
    }

    default:
      return null;
  }
}

export class StripePaymentGateway implements PaymentGateway {
  private readonly stripe: Stripe;

  constructor(
    secretKey: string | undefined,
    private readonly webhookSecret: string | undefined
  ) {
    // La clé API n'est pas nécessaire pour vérifier une signature ; une valeur neutre évite une exception.
    this.stripe = new Stripe(secretKey || 'sk_unconfigured');
  }

  async parseWebhook(rawBody: string, signature: string | null): Promise<BillingEvent | null> {
    if (!this.webhookSecret) {
      throw new ServiceUnavailableError('Webhooks Stripe désactivés : STRIPE_WEBHOOK_SECRET non configuré.');
    }
    if (!signature) {
      throw new ValidationError('En-tête Stripe-Signature manquant.');
    }

    let event: Stripe.Event;
    try {
      event = await this.stripe.webhooks.constructEventAsync(rawBody, signature, this.webhookSecret);
    } catch {
      throw new ValidationError('Signature du webhook Stripe invalide.');
    }

    return toBillingEvent(event);
  }
}

export function createPaymentGateway(): PaymentGateway {
  return new StripePaymentGateway(process.env.STRIPE_SECRET_KEY, process.env.STRIPE_WEBHOOK_SECRET);
}
