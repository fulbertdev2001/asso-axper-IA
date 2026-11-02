import { container } from '../../../../container';
import { createApiHandler } from '../../../../http/handler';
import { adminUpdateTicketSchema } from '../../../../http/validation';
import { UnauthorizedError } from '../../../../domain/errors';
import { updateTicketInAdmin } from '../../../../lib/tickets/service';

export const GET = createApiHandler({
  auth: true,
  admin: true,
  handler: async ({ authContext }) => {
    if (!authContext) throw new UnauthorizedError('Session admin requise.');
    const tickets = await container.ticketService.listAllForAdmin(authContext);
    return { tickets };
  }
});

export const PUT = createApiHandler({
  auth: true,
  admin: true,
  bodySchema: adminUpdateTicketSchema,
  handler: async ({ authContext, body }) => {
    if (!authContext) throw new UnauthorizedError('Session admin requise.');
    const updated = await container.ticketService.updateTicketAdmin(
      authContext,
      body.ticketIdOrRef,
      {
        status: body.status,
        answer: body.answer,
        internalNotes: body.internalNotes,
        orgId: body.orgId,
        domain: body.domain as any,
        question: body.question,
        subject: body.subject
      }
    );
    try {
      updateTicketInAdmin(body as any);
    } catch {
      // sync
    }
    return { ticket: updated };
  }
});
