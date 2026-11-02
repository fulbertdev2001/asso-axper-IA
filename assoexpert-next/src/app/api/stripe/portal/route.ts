import { createApiHandler } from '../../../../http/handler';
import { UnauthorizedError } from '../../../../domain/errors';

export const POST = createApiHandler({
  auth: true,
  orgScoped: true,
  handler: async ({ authContext, req }) => {
    if (!authContext?.organizationId) throw new UnauthorizedError('Session requise.');
    const body = (await req.json().catch(() => ({}))) as {
      returnUrl?: string;
    };

    const baseUrl = body.returnUrl || req.nextUrl.origin;
    const portalUrl = `${baseUrl}/app/billing?portal=simulated&org=${encodeURIComponent(authContext.organizationId)}`;

    return {
      url: portalUrl,
      organizationId: authContext.organizationId
    };
  }
});
