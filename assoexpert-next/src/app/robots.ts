import type { MetadataRoute } from 'next';

/**
 * §3.8 & Lot 1/6 — Toutes les pages `/app/**` et `/admin/**` sont interdites d'indexation.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://assoexpert.fr').replace(/\/$/, '');

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/app/', '/app/*', '/admin/', '/admin/*', '/api/']
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`
  };
}

