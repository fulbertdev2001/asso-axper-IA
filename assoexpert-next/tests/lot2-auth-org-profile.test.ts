import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import {
  GET as getOrgProfileRoute,
  PUT as putOrgProfileRoute,
  DELETE as deleteOrgProfileRoute,
  POST as postOrgProfileRoute
} from '../src/app/api/org/profile/route';
import { createContainer } from '../src/container';
import { MailProvider, SendMailInput } from '../src/lib/mail';
import { resetOrgStoreForTests } from '../src/lib/org/service';

function capturingMailProvider() {
  const sent: SendMailInput[] = [];
  const provider: MailProvider = {
    async sendMail(input) {
      sent.push(input);
      return { messageId: `test-${sent.length}` };
    }
  };
  return { sent, provider };
}

describe('Lot 2 — Auth, organisation, profil (§7 Lot 2)', () => {
  beforeEach(() => {
    resetOrgStoreForTests();
  });

  it('génère et vérifie un Magic Link pour ouvrir une session scopée par organisation', async () => {
    const { sent, provider } = capturingMailProvider();
    const c = createContainer({ useMemory: true, mailProvider: provider });

    // L'organisation est déduite du membership : le client ne la choisit pas
    await c.authService.requestMagicLink('direction@tremplin-solidarites.org');
    expect(sent).toHaveLength(1);
    const token = decodeURIComponent(sent[0].text.match(/token=([^\s&]+)/)![1]);

    const verified = await c.authService.verifyMagicLink(token);
    expect(verified.organizationId).toBe('org-1');
    const ctx = await c.authService.resolveContext(verified.sessionToken);
    expect(ctx?.organizationId).toBe('org-1');
    expect(ctx?.isPlatformAdmin).toBe(false);

    // Le token est à usage unique
    await expect(c.authService.verifyMagicLink(token)).rejects.toThrow();
  });

  it('crée l’organisation, le membership owner et le profil lors de l’onboarding (POST /api/org/profile)', async () => {
    const req = new NextRequest('http://localhost:3000/api/org/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'fondatrice@nouvelle-asso.fr',
        roleInOrg: 'Présidente',
        organization: {
          name: 'Association Nouvel Horizon',
          siren: '987654321',
          rna: 'W751999999',
          sector: 'Insertion par l’activité économique',
          employeesCount: 18,
          annualBudget: 620000,
          ccn: 'CCN 66 (Convention Collective Nationale de 1966)',
          fiscalYearEnd: '31 décembre',
          usualAgMonth: 'Mai',
          governanceSummary: 'CA de 7 membres, bureau de 3 membres',
          mainFunders: ['DIRECCTE', 'FSE'],
          establishmentsCount: 2
        }
      })
    });

    const res = await postOrgProfileRoute(req);
    expect(res.status).toBe(201);
    const data = await res.json();

    expect(data.organization.name).toBe('Association Nouvel Horizon');
    expect(data.membership.appRole).toBe('owner');
    expect(data.session.organizationId).toBe(data.organization.id);
  });

  it('CA Lot 2 #1 : un utilisateur de l’organisation A ne peut lire ni modifier aucune donnée de B via l’API', async () => {
    // 1. Tentative de lecture de org-2 par un utilisateur authentifié sur org-1
    const getCrossTenantReq = new NextRequest(
      'http://localhost:3000/api/org/profile?orgId=org-2',
      {
        method: 'GET',
        headers: {
          Authorization: 'Bearer session_org_1'
        }
      }
    );

    const getRes = await getOrgProfileRoute(getCrossTenantReq);
    expect(getRes.status).toBe(403);
    const getBody = await getRes.json();
    expect(getBody.error).toContain('Accès refusé');

    // 2. Tentative de modification de org-2 par un utilisateur authentifié sur org-1
    const putCrossTenantReq = new NextRequest('http://localhost:3000/api/org/profile', {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer session_org_1',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        orgId: 'org-2',
        patch: { name: 'Tentative Piratage Org 2' }
      })
    });

    const putRes = await putOrgProfileRoute(putCrossTenantReq);
    expect(putRes.status).toBe(403);

    // 3. Tentative de suppression du profil de org-2 par org-1
    const deleteCrossTenantReq = new NextRequest(
      'http://localhost:3000/api/org/profile?orgId=org-2',
      {
        method: 'DELETE',
        headers: {
          Authorization: 'Bearer session_org_1'
        }
      }
    );

    const delRes = await deleteOrgProfileRoute(deleteCrossTenantReq);
    expect(delRes.status).toBe(403);
  });

  it('CA Lot 2 #2 : le profil de l’association est modifiable et supprimable après l’onboarding', async () => {
    // Modification légitime du profil de org-1 par son propriétaire
    const putReq = new NextRequest('http://localhost:3000/api/org/profile', {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer session_org_1',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        orgId: 'org-1',
        patch: {
          employeesCount: 45,
          annualBudget: 1850000,
          usualAgMonth: 'Septembre',
          mainFunders: ['ARS Île-de-France', 'CPAM', ' Ville de Paris']
        }
      })
    });

    const putRes = await putOrgProfileRoute(putReq);
    expect(putRes.status).toBe(200);
    const putData = await putRes.json();
    expect(putData.profile.employeesCount).toBe(45);
    expect(putData.profile.annualBudget).toBe(1850000);
    expect(putData.profile.usualAgMonth).toBe('Septembre');

    // Suppression des données du profil de org-1
    const delReq = new NextRequest('http://localhost:3000/api/org/profile?orgId=org-1', {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer session_org_1'
      }
    });

    const delRes = await deleteOrgProfileRoute(delReq);
    expect(delRes.status).toBe(200);
    const delData = await delRes.json();
    expect(delData.profile.employeesCount).toBe(0);
    expect(delData.profile.mainFunders).toEqual([]);
    expect(delData.profile.siren).toBe('');
  });
});

