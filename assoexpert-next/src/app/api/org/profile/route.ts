import { NextResponse } from 'next/server';
import { container } from '../../../../container';
import { createApiHandler } from '../../../../http/handler';
import { updateOrgProfileRequestSchema } from '../../../../http/validation';
import { registerOrganizationHandler } from '../../../../http/registration';
import { UnauthorizedError } from '../../../../domain/errors';

export const GET = createApiHandler({
  auth: true,
  handler: async ({ authContext, query }) => {
    if (!authContext) throw new UnauthorizedError('Session requise.');
    const targetOrgId = query.orgId || authContext.organizationId;
    if (!targetOrgId) {
      return NextResponse.json({ profile: null }, { status: 200 });
    }

    const profile = await container.orgService.getProfile(authContext, targetOrgId);
    return { profile };
  }
});

export const PUT = createApiHandler({
  auth: true,
  bodySchema: updateOrgProfileRequestSchema,
  handler: async ({ authContext, body, req }) => {
    if (!authContext) throw new UnauthorizedError('Session requise.');
    const targetOrgId = body.orgId || req.nextUrl.searchParams.get('orgId') || authContext.organizationId;
    if (!targetOrgId) {
      throw new UnauthorizedError('Aucune organisation cible spécifiée.');
    }

    const updated = await container.orgService.updateProfile(authContext, targetOrgId, body.patch);
    return { profile: updated };
  }
});

export const DELETE = createApiHandler({
  auth: true,
  handler: async ({ authContext, query }) => {
    if (!authContext) throw new UnauthorizedError('Session requise.');
    const targetOrgId = query.orgId || authContext.organizationId;
    if (!targetOrgId) {
      throw new UnauthorizedError('Aucune organisation cible spécifiée.');
    }

    const profile = await container.orgService.resetProfile(authContext, targetOrgId);
    return {
      ok: true,
      message: 'Les données du profil de l’association ont été réinitialisées.',
      profile: {
        ...profile,
        siren: ''
      }
    };
  }
});

/** Inscription + création de l'organisation (même contrôleur que /api/auth/register). */
export const POST = registerOrganizationHandler;
