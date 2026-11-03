/**
 * Contrôleur d'inscription partagé (Design Pattern Controller) :
 * utilisé par POST /api/auth/register|signup et POST /api/org/profile.
 * La session est posée uniquement dans le cookie HttpOnly.
 */

import { NextResponse } from 'next/server';
import { container } from '../container';
import { createApiHandler } from './handler';
import { registerOrgSchema } from './validation';
import { setSessionCookie } from './session-cookie';

export const registerOrganizationHandler = createApiHandler({
  auth: false,
  bodySchema: registerOrgSchema,
  handler: async ({ body }) => {
    const passwordHash = body.password ? await container.authService.hashPassword(body.password) : undefined;

    const created = await container.orgService.registerOrganization({
      email: body.email,
      name: body.name || 'Direction',
      roleInOrg: body.roleInOrg,
      passwordHash,
      organization: body.organization
    });

    const sessionToken = await container.authService.createSession(created.userId, created.organization.id);

    const response = NextResponse.json(
      {
        ok: true,
        organization: created.organization,
        profile: created.profile,
        membership: {
          appRole: 'owner',
          userId: created.userId,
          organizationId: created.organization.id,
          roleInOrg: body.roleInOrg
        },
        session: {
          organizationId: created.organization.id,
          userId: created.userId,
          appRole: 'owner'
        }
      },
      { status: 201 }
    );

    return setSessionCookie(response, sessionToken);
  }
});
