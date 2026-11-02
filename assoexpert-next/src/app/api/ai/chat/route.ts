import { NextResponse } from 'next/server';
import { container } from '../../../../container';
import { createApiHandler } from '../../../../http/handler';
import { aiChatSchema } from '../../../../http/validation';
import { NotFoundError, UnauthorizedError } from '../../../../domain/errors';
import { Domain } from '../../../../domain/models';

export const POST = createApiHandler({
  auth: true,
  orgScoped: true,
  bodySchema: aiChatSchema,
  handler: async ({ authContext, body }) => {
    if (!authContext) throw new UnauthorizedError('Session requise.');
    const result = await container.aiService.handleChat(authContext, {
      domain: body.domain as Domain,
      question: body.question,
      conversationId: body.conversationId
    });
    return result;
  }
});

export const GET = createApiHandler({
  auth: true,
  orgScoped: true,
  handler: async ({ authContext }) => {
    if (!authContext) throw new UnauthorizedError('Session requise.');
    const conversations = await container.aiService.listConversations(authContext);
    return { conversations };
  }
});

export const DELETE = createApiHandler({
  auth: true,
  orgScoped: true,
  handler: async ({ authContext, query }) => {
    if (!authContext) throw new UnauthorizedError('Session requise.');
    const convId = query.conversationId;
    if (!convId) {
      throw new NotFoundError('Identifiant de conversation manquant.');
    }

    const deleted = await container.aiService.deleteConversation(authContext, convId);
    if (!deleted) {
      throw new NotFoundError('Conversation introuvable ou déjà supprimée.');
    }

    return { ok: true, deletedConversationId: convId };
  }
});
