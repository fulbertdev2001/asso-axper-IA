import { createApiHandler } from '../../../../http/handler';
import { UnauthorizedError } from '../../../../domain/errors';
import { appBaseUrl } from '../../../../http/session-cookie';

/**
 * Customer Portal (simulé tant que Stripe n'est pas branché — Lot 3).
 * L'URL de retour n'est jamais reprise du client (anti open-redirect).
 */
export const POST = createApiHandler({
  auth: true,
  orgScoped: true,
  handler: async ({ authContext, req }) => {
    if (!authContext?.organizationId) throw new UnauthorizedError('Session requise.');

    return {
      url: `${appBaseUrl(req)}/app/billing?portal=simulated`,
      organizationId: authContext.organizationId
    };
  }
});
