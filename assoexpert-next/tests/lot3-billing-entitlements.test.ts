import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import {
  resetBillingStoresForTests,
  orgHasFeature,
  orgGetLimit,
  processStripeWebhookEvent
} from '../src/lib/billing/service';
import { PUT as putAdminPlanRoute } from '../src/app/api/admin/plans/route';
import { POST as postStripeWebhookRoute } from '../src/app/api/stripe/webhook/route';

describe('Lot 3 — Abonnements Stripe, Webhooks idempotents & Droits (§7 Lot 3)', () => {
  beforeEach(() => {
    resetBillingStoresForTests();
  });

  it('CA Lot 3 #1 : modifier une limite ou un droit dans l’admin change le comportement immédiatement sans redéploiement', async () => {
    // org-1 est sur la formule 'pro' : initialement expertQuestionsMonth = 1 et briqueConformite = true
    expect(orgGetLimit('org-1', 'expert_questions_month')).toBe(1);

    // Laetitia modifie la formule 'pro' dans l'admin pour passer le quota à 5 questions/mois
    // et désactiver briqueConformite
    const adminReq = new NextRequest('http://localhost:3000/api/admin/plans', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        planCode: 'pro',
        patch: {
          priceMonthly: 67,
          features: {
            expertQuestionsMonth: 5,
            briqueConformite: false
          }
        }
      })
    });

    const res = await putAdminPlanRoute(adminReq);
    expect(res.status).toBe(200);

    // Sans aucun redéploiement, orgGetLimit et orgHasFeature reflètent la nouvelle configuration
    expect(orgGetLimit('org-1', 'expert_questions_month')).toBe(5);
    expect(orgHasFeature('org-1', 'brique.conformite')).toBe(false);
    expect(orgHasFeature('org-1', 'brique.rh')).toBe(true);
  });

  it('CA Lot 3 #2 : rejouer un webhook Stripe ne crée pas de doublon (table stripe_events)', async () => {
    const webhookPayload = {
      id: 'evt_stripe_unique_001',
      type: 'customer.subscription.updated' as const,
      data: {
        object: {
          organizationId: 'org-1',
          planCode: 'expert' as const,
          stripeCustomerId: 'cus_AkiligueEspoir75'
        }
      }
    };

    const req1 = new NextRequest('http://localhost:3000/api/stripe/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhookPayload)
    });
    const res1 = await postStripeWebhookRoute(req1);
    const data1 = await res1.json();

    expect(data1.duplicate).toBe(false);
    expect(data1.subscription.planCode).toBe('expert');

    // Rejeu du même événement evt_stripe_unique_001
    const req2 = new NextRequest('http://localhost:3000/api/stripe/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhookPayload)
    });
    const res2 = await postStripeWebhookRoute(req2);
    const data2 = await res2.json();

    expect(data2.duplicate).toBe(true);
    expect(data2.eventRecord.eventId).toBe('evt_stripe_unique_001');
  });

  it('CA Lot 3 #3 : couvre la souscription, l’upgrade, l’échec de paiement (grâce 3 jours puis suspension) et la résiliation', () => {
    const baseTime = new Date('2026-10-01T10:00:00.000Z');

    // 1. Souscription initiale (formule 'initiale')
    processStripeWebhookEvent(
      {
        id: 'evt_sub_created',
        type: 'customer.subscription.created',
        data: {
          object: {
            organizationId: 'org-new',
            planCode: 'initiale',
            stripeCustomerId: 'cus_new_123'
          }
        }
      },
      { now: baseTime }
    );

    expect(orgHasFeature('org-new', 'brique.rh', baseTime)).toBe(true);
    expect(orgHasFeature('org-new', 'brique.finance', baseTime)).toBe(false);
    expect(orgGetLimit('org-new', 'expert_questions_month', 0, baseTime)).toBe(0);

    // 2. Upgrade vers la formule 'expert'
    processStripeWebhookEvent(
      {
        id: 'evt_sub_upgraded',
        type: 'customer.subscription.updated',
        data: {
          object: {
            organizationId: 'org-new',
            planCode: 'expert'
          }
        }
      },
      { now: baseTime }
    );

    expect(orgHasFeature('org-new', 'brique.finance', baseTime)).toBe(true);
    expect(orgGetLimit('org-new', 'expert_questions_month', 0, baseTime)).toBe(3);

    // 3. Échec de paiement (`invoice.payment_failed`) -> Période de grâce de 3 jours
    processStripeWebhookEvent(
      {
        id: 'evt_payment_failed',
        type: 'invoice.payment_failed',
        data: {
          object: {
            organizationId: 'org-new'
          }
        }
      },
      { now: baseTime, graceDays: 3 }
    );

    // À J+2 (pendant la période de grâce de 3 jours), les droits restent actifs
    const day2 = new Date('2026-10-03T10:00:00.000Z');
    expect(orgHasFeature('org-new', 'brique.finance', day2)).toBe(true);

    // À J+4 (après expiration des 3 jours de grâce), l'accès est automatiquement suspendu
    const day4 = new Date('2026-10-05T10:00:00.000Z');
    expect(orgHasFeature('org-new', 'brique.finance', day4)).toBe(false);
    expect(orgGetLimit('org-new', 'expert_questions_month', 0, day4)).toBe(0);

    // 4. Résiliation (`customer.subscription.deleted`)
    processStripeWebhookEvent(
      {
        id: 'evt_sub_deleted',
        type: 'customer.subscription.deleted',
        data: {
          object: {
            organizationId: 'org-new'
          }
        }
      },
      { now: day4 }
    );

    expect(orgHasFeature('org-new', 'brique.rh', day4)).toBe(false);
  });
});

