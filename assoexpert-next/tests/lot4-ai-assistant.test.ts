import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import {
  POST as postAiChatRoute,
  DELETE as deleteAiChatRoute,
  GET as getAiChatRoute
} from '../src/app/api/ai/chat/route';
import {
  resetAiStoresForTests,
  getAiUsageSummaryByOrg
} from '../src/lib/ai/chat-service';
import { resetBillingStoresForTests } from '../src/lib/billing/service';
import { resetOrgStoreForTests } from '../src/lib/org/service';
import { resetRateLimitBuckets } from '../src/lib/rate-limit';

describe('Lot 4 — Assistant IA, Briques, Historique & Coûts (§7 Lot 4)', () => {
  beforeEach(() => {
    resetAiStoresForTests();
    resetBillingStoresForTests();
    resetOrgStoreForTests();
    resetRateLimitBuckets();
  });

  it('CA Lot 4 #1 : une question hors des briques souscrites est traitée au niveau socle et propose l’upgrade', async () => {
    // org-2 est sur la formule 'initiale' (seule briqueRh est active ; briqueFinance est verrouillée)
    const req = new NextRequest('http://localhost:3000/api/ai/chat', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer session_org_2',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        orgId: 'org-2',
        domain: 'finance',
        question: 'Comment comptabiliser une subvention FSE en fonds dédiés ?'
      })
    });

    const res = await postAiChatRoute(req);
    expect(res.status).toBe(200);
    const data = await res.json();

    expect(data.brickUnlocked).toBe(false);
    expect(data.upgradeSuggested).toBe(true);
    expect(data.assistantMessage.structuredAnswer.shortSummary).toContain(
      '[Niveau Socle Général]'
    );
    expect(data.assistantMessage.structuredAnswer.detailedAnalysis).toContain(
      'formule supérieure'
    );
  });

  it('CA Lot 4 #2 & #3 : journalise ai_usage sans contenu de message, affiche le coût par organisation et permet la suppression de l’historique', async () => {
    const secretQuestion = 'Question RH très confidentielle sur un salarié protégé CCN66';

    const req = new NextRequest('http://localhost:3000/api/ai/chat', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer session_org_1',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        orgId: 'org-1',
        domain: 'rh',
        question: secretQuestion
      })
    });

    const res = await postAiChatRoute(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.brickUnlocked).toBe(true);
    expect(data.upgradeSuggested).toBe(false);

    // Vérification CA #2 & #3 : ai_usage contient les tokens et le coût par org, mais JAMAIS le texte de la question
    const summary = getAiUsageSummaryByOrg();
    expect(summary.records).toHaveLength(1);
    expect(summary.totalCostByOrg['org-1']).toBeGreaterThan(0);
    const serializedUsage = JSON.stringify(summary);
    expect(serializedUsage).not.toContain(secretQuestion);

    // Vérification de la suppression de conversation par l'utilisateur
    const delReq = new NextRequest(
      `http://localhost:3000/api/ai/chat?orgId=org-1&conversationId=${encodeURIComponent(data.conversationId)}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: 'Bearer session_org_1'
        }
      }
    );
    const delRes = await deleteAiChatRoute(delReq);
    expect(delRes.status).toBe(200);

    const listReq = new NextRequest('http://localhost:3000/api/ai/chat?orgId=org-1', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer session_org_1'
      }
    });
    const listRes = await getAiChatRoute(listReq);
    const listData = await listRes.json();
    expect(listData.conversations).toHaveLength(0);
  });
});

