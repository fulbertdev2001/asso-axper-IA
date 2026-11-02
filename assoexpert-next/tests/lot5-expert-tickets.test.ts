import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import {
  POST as postClientTicketRoute,
  GET as getClientTicketsRoute
} from '../src/app/api/tickets/route';
import { PUT as putAdminTicketRoute } from '../src/app/api/admin/tickets/route';
import { resetTicketStoreForTests } from '../src/lib/tickets/service';
import { resetBillingStoresForTests, updatePlanInAdmin } from '../src/lib/billing/service';
import { resetOrgStoreForTests } from '../src/lib/org/service';

describe('Lot 5 — Escalade Question Experte 48h, Quotas & Suivi (§7 Lot 5)', () => {
  beforeEach(() => {
    resetTicketStoreForTests();
    resetBillingStoresForTests();
    resetOrgStoreForTests();
  });

  it('CA Lot 5 #1 : le quota de questions expertes est bloquant côté serveur', async () => {
    // org-1 (formule 'pro', quota initial = 1 question/mois) a déjà 1 ticket dans INITIAL_TICKETS
    const overQuotaReq = new NextRequest('http://localhost:3000/api/tickets', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer session_org_1',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        orgId: 'org-1',
        domain: 'rh',
        object: 'Deuxième question hors quota',
        question: 'Pouvons-nous conclure un CDD d’usage ?'
      })
    });

    const blockedRes = await postClientTicketRoute(overQuotaReq);
    expect(blockedRes.status).toBe(429);
    const blockedBody = await blockedRes.json();
    expect(blockedBody.code).toBe('QUOTA_EXCEEDED');

    // Si Laetitia augmente le quota de la formule 'pro' à 2 dans l'admin, la création passe
    updatePlanInAdmin('pro', { features: { expertQuestionsMonth: 2 } });

    const allowedReq = new NextRequest('http://localhost:3000/api/tickets', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer session_org_1',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        orgId: 'org-1',
        domain: 'rh',
        object: 'Deuxième question autorisée après hausse quota',
        question: 'Pouvons-nous conclure un CDD d’usage ?'
      })
    });

    const allowedRes = await postClientTicketRoute(allowedReq);
    expect(allowedRes.status).toBe(201);
    const allowedData = await allowedRes.json();
    expect(allowedData.ticket.ref).toMatch(/^AE-2026-\d{5}$/);
    expect(allowedData.expertEmailMessageId).toBeTruthy();
    expect(allowedData.ackEmailMessageId).toBeTruthy();
  });

  it('CA Lot 5 #2 : l’utilisateur voit le statut passer à « répondu » (answered) quand l’admin le met à jour, sans exposer la note interne', async () => {
    // 1. Laetitia répond au ticket AE-2026-00042 (appartenant à org-1) dans l'admin Payload
    const adminPutReq = new NextRequest('http://localhost:3000/api/admin/tickets', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticketIdOrRef: 'AE-2026-00042',
        status: 'answered',
        answer: 'Réponse officielle de Laetitia : appliquez l’article 14 de l’annexe 3 CCN66.',
        internalNotes: 'Note interne confidentielle Cabinet Maé — ne pas afficher au client'
      })
    });

    const adminRes = await putAdminTicketRoute(adminPutReq);
    expect(adminRes.status).toBe(200);

    // 2. L'utilisateur de org-1 consulte « Mes questions »
    const clientGetReq = new NextRequest('http://localhost:3000/api/tickets?orgId=org-1', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer session_org_1'
      }
    });

    const clientRes = await getClientTicketsRoute(clientGetReq);
    expect(clientRes.status).toBe(200);
    const clientData = await clientRes.json();

    const updatedTicket = clientData.tickets.find(
      (t: { ref: string }) => t.ref === 'AE-2026-00042'
    );
    expect(updatedTicket).toBeDefined();
    expect(updatedTicket.status).toBe('answered');
    expect(updatedTicket.answer).toContain('annexe 3 CCN66');
    // La note interne de l'admin ne doit jamais être envoyée au client
    expect(updatedTicket.internalNotes).toBeUndefined();
  });
});

