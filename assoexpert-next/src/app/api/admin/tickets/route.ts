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
    const [tickets, orgs, aiUsageSummary] = await Promise.all([
      container.ticketService.listAllForAdmin(authContext),
      container.repositories.org.list(),
      container.repositories.ai.getUsageSummary()
    ]);

    const orgNameById = new Map(orgs.map((o) => [o.id, o.name]));

    const enrichedTickets = tickets.map((t) => ({
      ...t,
      orgId: t.organizationId,
      orgName: orgNameById.get(t.organizationId) || 'Association cliente',
      object: t.subject || t.question.slice(0, 60),
      internalNotes: t.internalNote || ''
    }));

    const aiUsageRecords = aiUsageSummary.records.map((r) => ({
      id: r.id,
      orgId: r.organizationId,
      orgName: orgNameById.get(r.organizationId) || 'Association cliente',
      model: r.model,
      promptVersion: r.promptVersion,
      inputTokens: r.inputTokens,
      outputTokens: r.outputTokens,
      costEstimateEur: r.costEstimate,
      createdAt:
        r.createdAt instanceof Date
          ? r.createdAt.toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            })
          : String(r.createdAt)
    }));

    return { tickets: enrichedTickets, aiUsageRecords };
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
