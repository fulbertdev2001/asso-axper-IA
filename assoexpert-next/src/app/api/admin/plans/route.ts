import { container } from '../../../../container';
import { createApiHandler } from '../../../../http/handler';
import { updatePlanSchema } from '../../../../http/validation';
import { UnauthorizedError } from '../../../../domain/errors';
import { updatePlanInAdmin } from '../../../../lib/billing/service';

export const GET = createApiHandler({
  auth: false,
  handler: async ({ authContext }) => {
    if (authContext?.isPlatformAdmin) {
      const plans = await container.billingService.listAllPlans(authContext);
      return { plans };
    }
    const plans = await container.billingService.listActivePlans();
    return { plans };
  }
});

export const PUT = createApiHandler({
  auth: true,
  admin: true,
  bodySchema: updatePlanSchema,
  handler: async ({ authContext, body }) => {
    if (!authContext) throw new UnauthorizedError('Session admin requise.');
    const updated = await container.billingService.updatePlan(
      authContext,
      body.planCode,
      body.patch as any
    );
    try {
      updatePlanInAdmin(body.planCode as any, body.patch as any);
    } catch {
      // sync
    }
    const plans = await container.billingService.listAllPlans(authContext);
    return { plan: updated, plans };
  }
});
