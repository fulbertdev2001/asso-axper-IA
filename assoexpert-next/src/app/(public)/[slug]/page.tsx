import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { container } from '../../../container';
import { buildCmsPageJsonLd } from '../../../lib/cms/jsonld';

interface DynamicSeoPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: DynamicSeoPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await container.cmsService.getPageBySlug(slug);
    if (res.type === 'page') {
      const page = res.page;
      return {
        title: page.title,
        description: page.metaDescription,
        alternates: { canonical: `/${page.slug}` },
        robots: page.noindex
          ? { index: false, follow: false }
          : { index: true, follow: true },
        openGraph: {
          title: page.title,
          description: page.metaDescription,
          type: 'article'
        }
      };
    }
  } catch {
    // not found
  }

  return { title: 'Page introuvable' };
}

/**
 * Gabarit SEO dynamique CMS (Lot 6 — §14.2 & §14.3) :
 * - Sert les 5 pages piliers (`/rh`, `/gouvernance`, `/finance`, `/subventions`, `/conformite`),
 *   les pages légales et toute page créée par Laetitia dans Payload CMS.
 * - Exécute automatiquement une redirection 301 (`permanentRedirect`) si le slug a changé.
 * - Injecte le JSON-LD `BreadcrumbList` et `FAQPage` aligné sur le contenu visible.
 */
export default async function DynamicCmsSeoPage({ params }: DynamicSeoPageProps) {
  const { slug } = await params;
  let res;
  try {
    res = await container.cmsService.getPageBySlug(slug);
  } catch {
    notFound();
  }

  if (res.type === 'redirect') {
    permanentRedirect(`/${res.targetSlug}`);
  }

  const page = res.page;
  const jsonLd = buildCmsPageJsonLd(page as any);

  return (
    <main style={{ maxWidth: 920, margin: '0 auto', padding: '64px 24px' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Fil d'Ariane */}
      <nav aria-label="Fil d’Ariane" style={{ fontSize: 14, marginBottom: 24 }}>
        {page.breadcrumbs.map((b, idx) => (
          <React.Fragment key={b.href}>
            {idx > 0 && <span> / </span>}
            <Link href={b.href}>{b.label}</Link>
          </React.Fragment>
        ))}
      </nav>

      <article>
        <h1 style={{ fontSize: 38, marginBottom: 16 }}>{page.h1}</h1>
        <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-navy-muted)', marginBottom: 24 }}>
          {page.chapo}
        </p>

        <div
          style={{
            fontSize: 13,
            color: 'var(--color-navy-muted)',
            marginBottom: 32,
            padding: '10px 16px',
            backgroundColor: '#ffffff',
            borderRadius: 12,
            border: '1px solid var(--color-border)'
          }}
        >
          Rédigé par <strong>{page.author}</strong> · Relu par <strong>{page.reviewer}</strong> ·
          Vérifié le <strong>{page.verifiedAt}</strong>
        </div>

        <div className="card" style={{ marginBottom: 32 }}>
          <p>{page.content}</p>
        </div>

        {page.faq.length > 0 && (
          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, marginBottom: 16 }}>Questions fréquentes</h2>
            <div style={{ display: 'grid', gap: 16 }}>
              {page.faq.map((f) => (
                <div key={f.question} className="card">
                  <h3 style={{ fontSize: 18, marginBottom: 8 }}>{f.question}</h3>
                  <p style={{ color: 'var(--color-navy-muted)' }}>{f.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {page.sources.length > 0 && (
          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 20, marginBottom: 12 }}>Sources et textes de référence</h2>
            <ul style={{ paddingLeft: 20 }}>
              {page.sources.map((src) => (
                <li key={src} style={{ marginBottom: 6 }}>
                  {src}
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="card" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 22, marginBottom: 8 }}>
            Besoin d’une réponse adaptée au profil de votre association ?
          </h2>
          <p style={{ color: 'var(--color-navy-muted)', marginBottom: 16 }}>
            Interrogez l’assistant AssoExpert IA ou sollicitez Laetitia Badji sous 48h.
          </p>
          <Link href="/onboarding" className="btn btn-primary">
            Commencer maintenant
          </Link>
        </div>
      </article>
    </main>
  );
}

