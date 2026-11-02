import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { createContainer } from '../src/container';
import { PUT as putAdminPlanRoute } from '../src/app/api/admin/plans/route';
import { GET as getAdminTicketsRoute } from '../src/app/api/admin/tickets/route';
import { POST as postTicketRoute } from '../src/app/api/tickets/route';
import { GET as getOrgProfileRoute } from '../src/app/api/org/profile/route';
import { ForbiddenError, QuotaExceededError } from '../src/domain/errors';

describe('Architecture & Design Patterns (Ports/Adapters, DI, Security, Validation)', () => {
  beforeEach(() => {
    const c = createContainer({ useMemory: true });
    c.resetForTests();
  });

  it('Respecte l’injection de dépendances (DI) et l’isolation des Services Métier vis-à-vis de HTTP', async () => {
    const testContainer = createContainer({ useMemory: true });

    // Authentification via AuthService
    const sessionToken = await testContainer.authService.createSession('user-org-1', 'org-1');
    const authContext = await testContainer.authService.resolveContext(sessionToken);

    expect(authContext).not.toBeNull();
    expect(authContext?.organizationId).toBe('org-1');
    expect(authContext?.isPlatformAdmin).toBe(false);

    // Isolation multi-tenant dans OrgService (Port/Adapter)
    await expect(
      testContainer.orgService.getProfile(authContext!, 'org-2')
    ).rejects.toThrow(ForbiddenError);

    const ownProfile = await testContainer.orgService.getProfile(authContext!, 'org-1');
    expect(ownProfile.organizationId).toBe('org-1');
  });

  it('S2 Remediation : bloque tout accès aux routes /api/admin/* pour un utilisateur non-admin (403 Forbidden)', async () => {
    // session_org_1 appartient à une directrice d'association (non admin plateforme)
    const nonAdminReq = new NextRequest('http://localhost:3000/api/admin/tickets', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer session_org_1'
      }
    });

    const res = await getAdminTicketsRoute(nonAdminReq);
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.code).toBe('FORBIDDEN');

    // Tentative de modification d'un plan par un utilisateur non-admin
    const nonAdminPlanReq = new NextRequest('http://localhost:3000/api/admin/plans', {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer session_org_1',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        planCode: 'pro',
        patch: { priceMonthlyEur: 1 }
      })
    });

    const resPlan = await putAdminPlanRoute(nonAdminPlanReq);
    expect(resPlan.status).toBe(403);
  });

  it('S1 Remediation : empêche l’usurpation de tenant par simple header x-authenticated-org-id hors mode test', async () => {
    const prevEnv = process.env.NODE_ENV;
    (process.env as Record<string, string>).NODE_ENV = 'production';

    try {
      const forgedReq = new NextRequest('http://localhost:3000/api/org/profile?orgId=org-1', {
        method: 'GET',
        headers: {
          'x-authenticated-org-id': 'org-1'
        }
      });

      const res = await getOrgProfileRoute(forgedReq);
      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.code).toBe('UNAUTHORIZED');
    } finally {
      (process.env as Record<string, string>).NODE_ENV = prevEnv || 'test';
    }
  });

  it('Validation DTO (Zod) : rejette les payloads malformés avec un statut 400 et le détail des champs', async () => {
    const invalidTicketReq = new NextRequest('http://localhost:3000/api/tickets', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer session_org_1',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        domain: 'domaine_inexistant',
        question: 'Court' // < 10 caractères
      })
    });

    const res = await postTicketRoute(invalidTicketReq);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.code).toBe('VALIDATION_ERROR');
    expect(Array.isArray(body.details)).toBe(true);
  });
});

