import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import {
  POST as postAdminPageRoute,
  PUT as putAdminPageRoute
} from '../src/app/api/admin/pages/route';
import {
  resetCmsStoreForTests,
  resolveCmsPageOrRedirect
} from '../src/lib/cms/service';
import {
  buildCmsPageJsonLd,
  buildSoftwareOffersJsonLd
} from '../src/lib/cms/jsonld';
import { getConfigurablePlans } from '../src/lib/billing/service';

describe('Lot 6 — Site public, CMS Payload, Redirections 301 & JSON-LD (§7 Lot 6)', () => {
  beforeEach(() => {
    resetCmsStoreForTests();
  });

  it('CA Lot 6 #1 : Laetitia crée et publie une page SEO sans développeur, et un changement de slug crée une redirection 301 automatique', async () => {
    // 1. Laetitia publie une nouvelle page SEO depuis le back-office Payload
    const createReq = new NextRequest('http://localhost:3000/api/admin/pages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug: 'conges-trimestriels-ccn66',
        title: 'Congés trimestriels CCN 66 : calcul et proratisation',
        metaDescription: 'Tout comprendre aux congés trimestriels de la CCN 66.',
        h1: 'Calculer les congés trimestriels en CCN 66',
        chapo: 'Règles d’acquisition par annexe et impact des absences.',
        content: 'En CCN 66, les congés trimestriels sont accordés sur 3 trimestres.',
        faq: [
          {
            question: 'Combien de jours pour un éducateur spécialisé ?',
            answer: '6 jours ouvrés par trimestre selon l’annexe 3.'
          }
        ],
        sources: ['CCN 66 Annexe 3, article 6'],
        author: 'Laetitia Badji',
        reviewer: 'Cabinet Maé',
        verifiedAt: '2026-10-28',
        status: 'published',
        noindex: false
      })
    });

    const createRes = await postAdminPageRoute(createReq);
    expect(createRes.status).toBe(201);
    const createdData = await createRes.json();
    const pageId = createdData.page.id;

    // La page est immédiatement accessible publiquement
    const resolved1 = resolveCmsPageOrRedirect('conges-trimestriels-ccn66');
    expect(resolved1.page).not.toBeNull();
    expect(resolved1.page?.h1).toBe('Calculer les congés trimestriels en CCN 66');

    // 2. Laetitia renomme le slug de la page -> Redirection 301 automatique de l'ancien slug vers le nouveau
    const updateReq = new NextRequest('http://localhost:3000/api/admin/pages', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pageId,
        patch: {
          slug: 'guide-conges-trimestriels-ccn66'
        }
      })
    });

    const updateRes = await putAdminPageRoute(updateReq);
    expect(updateRes.status).toBe(200);

    // L'ancien slug renvoie désormais une redirection 301 vers le nouveau slug
    const oldSlugResolution = resolveCmsPageOrRedirect('conges-trimestriels-ccn66');
    expect(oldSlugResolution.redirect301To).toBe('/guide-conges-trimestriels-ccn66');

    // Le nouveau slug sert bien la page
    const newSlugResolution = resolveCmsPageOrRedirect('guide-conges-trimestriels-ccn66');
    expect(newSlugResolution.page?.id).toBe(pageId);
  });

  it('CA Lot 6 #3 : génère un balisage JSON-LD valide (FAQPage, BreadcrumbList, SoftwareApplication/Offer) aligné sur le contenu visible', () => {
    const { page } = resolveCmsPageOrRedirect('rh');
    expect(page).not.toBeNull();

    const pageJsonLd = buildCmsPageJsonLd(page!);
    const faqNode = pageJsonLd['@graph'].find((n) => n['@type'] === 'FAQPage') as {
      mainEntity: { name: string }[];
    };
    expect(faqNode).toBeDefined();
    expect(faqNode.mainEntity[0].name).toBe(page!.faq[0].question);

    const plans = getConfigurablePlans();
    const offersJsonLd = buildSoftwareOffersJsonLd(plans);
    expect(offersJsonLd['@type']).toBe('SoftwareApplication');
    expect(offersJsonLd.offers).toHaveLength(plans.length);
    expect(offersJsonLd.offers[0].price).toBe(String(plans[0].priceMonthly));
  });
});

