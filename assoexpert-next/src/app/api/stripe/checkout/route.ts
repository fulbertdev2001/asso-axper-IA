import { container } from '../../../../container';
import { createApiHandler } from '../../../../http/handler';
import { UnauthorizedError } from '../../../../domain/errors';
import { appBaseUrl } from '../../../../http/session-cookie';

/**
 * Checkout (simulé tant que Stripe Checkout n'est pas branché — Lot 3).
 * Persiste immédiatement la nouvelle formule dans la table `subscriptions` en base Neon.
 * L'URL de retour est toujours construite depuis l'URL publique configurée :
 * aucune URL fournie par le client n'est reprise (anti open-redirect).
 */
export const POST = createApiHandler({
  auth: true,
  orgScoped: true,
  handler: async ({ authContext, req }) => {
    if (!authContext?.organizationId) throw new UnauthorizedError('Session requise.');
    const body = (await req.json().catch(() => ({}))) as { planCode?: unknown };

    const planCode = typeof body.planCode === 'string' && body.planCode ? body.planCode : 'pro';
    const existingSub = await container.repositories.subscription.findByOrgId(authContext.organizationId);
    const periodEnd = existingSub?.currentPeriodEnd ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await container.repositories.subscription.upsert({
      organizationId: authContext.organizationId,
      planCode,
      status: 'active',
      stripeCustomerId: existingSub?.stripeCustomerId ?? `cus_${authContext.organizationId}`,
      stripeSubscriptionId: existingSub?.stripeSubscriptionId ?? `sub_${authContext.organizationId}`,
      currentPeriodEnd: periodEnd,
      graceUntil: null
    });

    const checkoutUrl = `${appBaseUrl(req)}/app/billing?checkout=simulated&plan=${encodeURIComponent(planCode)}`;

    return {
      url: checkoutUrl,
      organizationId: authContext.organizationId,
      planCode
    };
  }
});
