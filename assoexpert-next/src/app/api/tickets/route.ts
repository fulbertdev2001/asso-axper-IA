import { NextResponse } from 'next/server';
import { container } from '../../../container';
import { createApiHandler } from '../../../http/handler';
import { createTicketSchema } from '../../../http/validation';
import { UnauthorizedError } from '../../../domain/errors';
import { Domain, TicketUrgency } from '../../../domain/models';

export const GET = createApiHandler({
  auth: true,
  orgScoped: true,
  handler: async ({ authContext }) => {
    if (!authContext) throw new UnauthorizedError('Session requise.');
    const tickets = await container.ticketService.listOrgTickets(authContext);
    // Masquer les notes internes pour l'utilisateur client (§6 & §7 Lot 5)
    const sanitized = tickets.map(({ internalNote, ...rest }) => rest);
    return { tickets: sanitized };
  }
});

export const POST = createApiHandler({
  auth: true,
  orgScoped: true,
  bodySchema: createTicketSchema,
  handler: async ({ authContext, body }) => {
    if (!authContext) throw new UnauthorizedError('Session requise.');
    const result = await container.ticketService.createTicket(authContext, {
      domain: body.domain as Domain,
      urgency: body.urgency as TicketUrgency,
      subject: body.subject || body.object || 'Question experte',
      question: body.question
    });

    return NextResponse.json(result, { status: 201 });
  }
});
