import { container } from '../../../../container';
import { createApiHandler } from '../../../../http/handler';
import { ValidationError } from '../../../../domain/errors';

export const POST = createApiHandler({
  auth: false,
  handler: async ({ req }) => {
    const event = (await req.json().catch(() => null)) as any;

    if (!event?.id || !event?.type || !event?.data?.object?.organizationId) {
      throw new ValidationError('Payload webhook Stripe incomplet ou invalide.');
    }

    const result = await container.billingService.processStripeWebhook(event);
    return result;
  }
});
