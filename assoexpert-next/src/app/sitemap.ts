import type { MetadataRoute } from 'next';

/**
 * §3.8 & Lot 6 — Sitemap excluant strictement `/app/**` et `/admin/**`.
 * Inclut la landing, `/tarifs`, `/a-propos` et les 5 pages piliers SEO.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://assoexpert.fr').replace(/\/$/, '');
  const now = new Date();

  const publicRoutes = [
    '',
    '/tarifs',
    '/a-propos',
    '/rh',
    '/gouvernance',
    '/finance',
    '/subventions',
    '/conformite',
    '/mentions-legales',
    '/politique-confidentialite'
  ];

  return publicRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1.0 : 0.8
  }));
}

