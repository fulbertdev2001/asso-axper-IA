/**
 * Lot 6 — Générateur de données structurées JSON-LD (§7 Lot 6 CA #3) :
 * Organization, Person, SoftwareApplication/Offer, FAQPage, BreadcrumbList
 * correspondant strictement au contenu réellement visible sur la page.
 */

import { Plan } from '../../types';
import { CmsSeoPage } from './service';

export function buildOrganizationAndExpertJsonLd(baseUrl = 'https://assoexpert.fr') {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${baseUrl}/#organization`,
        name: 'AssoExpert IA — Cabinet Maé (AKILIGUE SAS)',
        url: baseUrl,
        email: 'contact@cabinet-mae.fr',
        founder: {
          '@id': `${baseUrl}/a-propos#laetitia-badji`
        }
      },
      {
        '@type': 'Person',
        '@id': `${baseUrl}/a-propos#laetitia-badji`,
        name: 'Laetitia Badji',
        jobTitle: 'DAF externalisée & Experte gestion associative',
        worksFor: {
          '@id': `${baseUrl}/#organization`
        }
      }
    ]
  };
}

export function buildSoftwareOffersJsonLd(plans: Plan[], baseUrl = 'https://assoexpert.fr') {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'AssoExpert IA',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: `${baseUrl}/tarifs`,
    offers: plans.map((plan: any) => ({
      '@type': 'Offer',
      name: plan.label,
      description: plan.description,
      price: String(plan.priceMonthlyEur ?? plan.priceMonthly ?? 0),
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock'
    }))
  };
}

export function buildCmsPageJsonLd(page: CmsSeoPage, baseUrl = 'https://assoexpert.fr') {
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'BreadcrumbList',
      itemListElement: page.breadcrumbs.map((b, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: b.label,
        item: `${baseUrl}${b.href}`
      }))
    }
  ];

  if (page.faq.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: page.faq.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer
        }
      }))
    });
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph
  };
}

