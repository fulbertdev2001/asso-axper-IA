import { container } from '../../../../container';
import { createApiHandler } from '../../../../http/handler';
import { UnauthorizedError } from '../../../../domain/errors';

export const POST = createApiHandler({
  auth: true,
  orgScoped: true,
  handler: async ({ authContext, req }) => {
    if (!authContext?.organizationId) throw new UnauthorizedError('Session requise.');
    const body = (await req.json().catch(() => ({}))) as {
      planCode?: string;
      returnUrl?: string;
    };

    const planCode = body.planCode || 'pro';
    const baseUrl = body.returnUrl || req.nextUrl.origin;
    const checkoutUrl = `${baseUrl}/app/billing?checkout=simulated&plan=${encodeURIComponent(planCode)}&org=${encodeURIComponent(authContext.organizationId)}`;

    return {
      url: checkoutUrl,
      organizationId: authContext.organizationId,
      planCode
    };
  }
});
