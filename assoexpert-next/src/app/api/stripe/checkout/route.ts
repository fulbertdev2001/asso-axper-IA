import { createApiHandler } from '../../../../http/handler';
import { UnauthorizedError } from '../../../../domain/errors';
import { appBaseUrl } from '../../../../http/session-cookie';

/**
 * Checkout (simulé tant que Stripe Checkout n'est pas branché — Lot 3).
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
    const checkoutUrl = `${appBaseUrl(req)}/app/billing?checkout=simulated&plan=${encodeURIComponent(planCode)}`;

    return {
      url: checkoutUrl,
      organizationId: authContext.organizationId,
      planCode
    };
  }
});
