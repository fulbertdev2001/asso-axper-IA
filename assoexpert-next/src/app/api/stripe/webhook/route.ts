import { container } from '../../../../container';
import { createApiHandler } from '../../../../http/handler';

/**
 * Webhook Stripe (§3.5) : signature vérifiée par le `PaymentGateway`, puis traitement
 * idempotent via la table `stripe_events`. Le corps brut est lu tel quel (requis pour la signature).
 */
export const POST = createApiHandler({
  auth: false,
  handler: async ({ req }) => {
    const rawBody = await req.text();
    const event = await container.paymentGateway.parseWebhook(rawBody, req.headers.get('stripe-signature'));

    if (!event) {
      return { received: true, ignored: true };
    }

    return await container.billingService.processBillingEvent(event);
  }
});
