import { NextResponse } from 'next/server';
import { container } from '../../../../container';
import { createApiHandler } from '../../../../http/handler';
import { updateOrgProfileSchema, registerOrgSchema } from '../../../../http/validation';
import { UnauthorizedError, ForbiddenError } from '../../../../domain/errors';
import { isSameTenantOrg } from '../../../../services/org.service';

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
  handler: async ({ authContext, req }) => {
    if (!authContext) throw new UnauthorizedError('Session requise.');
    const rawBody = (await req.json().catch(() => ({}))) as any;
    const patch = rawBody.patch || rawBody;
    const searchParams = req.nextUrl.searchParams;
    const targetOrgId = rawBody.orgId || searchParams.get('orgId') || authContext.organizationId;
    if (!targetOrgId) {
      throw new UnauthorizedError('Aucune organisation cible spécifiée.');
    }

    const updated = await container.orgService.updateProfile(authContext, targetOrgId, patch);
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

    if (!authContext.isPlatformAdmin && !isSameTenantOrg(authContext.organizationId, targetOrgId)) {
      throw new ForbiddenError(
        `Accès refusé : l'organisation '${authContext.organizationId}' ne peut supprimer le profil de '${targetOrgId}'.`
      );
    }

    await container.repositories.org.deleteProfile(targetOrgId);
    const profile = await container.repositories.org.getProfile(targetOrgId);
    return {
      ok: true,
      message: 'Les données du profil de l’association ont été réinitialisées.',
      profile: {
        ...(profile || {}),
        employeesCount: 0,
        mainFunders: [],
        siren: ''
      }
    };
  }
});

export const POST = createApiHandler({
  auth: false,
  bodySchema: registerOrgSchema,
  handler: async ({ body }) => {
    let passwordHash: string | undefined;
    if (body.password) {
      passwordHash = container.authService.hashPassword(body.password);
    }

    const created = await container.orgService.registerOrganization({
      email: body.email,
      name: body.name || 'Direction',
      roleInOrg: body.roleInOrg,
      passwordHash,
      organization: body.organization as any
    });

    const sessionToken = await container.authService.createSession(
      created.userId,
      created.organization.id
    );

    const response = NextResponse.json(
      {
        ok: true,
        sessionToken,
        organization: created.organization,
        membership: {
          appRole: 'owner',
          userId: created.userId,
          organizationId: created.organization.id,
          roleInOrg: body.roleInOrg
        },
        profile: created.profile,
        session: {
          organizationId: created.organization.id,
          userId: created.userId,
          appRole: 'owner'
        }
      },
      { status: 201 }
    );

    response.cookies.set('assoexpert_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 3600
    });

    return response;
  }
});
