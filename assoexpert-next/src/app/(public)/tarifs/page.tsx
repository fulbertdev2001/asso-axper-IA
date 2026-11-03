import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { container } from '../../../container';
import { buildSoftwareOffersJsonLd } from '../../../lib/cms/jsonld';
import { serializeJsonLd } from '../../../lib/cms/serialize';

export const metadata: Metadata = {
  title: 'Tarifs et formules d’abonnement',
  description:
    'Découvrez les formules AssoExpert IA pour les associations employeuses : assistant IA spécialisé et questions expertes sous 48h.',
  alternates: { canonical: '/tarifs' }
};

/**
 * Page `/tarifs` (Lot 6 & §3.3) :
 * Lue dynamiquement depuis la configuration des `plans` (jamais de prix en dur),
 * avec balisage JSON-LD `SoftwareApplication` / `Offer` correspondant au contenu visible.
 */
export default async function TarifsPage() {
  const plans = await container.billingService.listActivePlans();
  const jsonLd = buildSoftwareOffersJsonLd(plans as any);

  return (
    <main style={{ maxWidth: 1120, margin: '0 auto', padding: '64px 24px' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <nav aria-label="Fil d’Ariane" style={{ fontSize: 14, marginBottom: 24 }}>
        <Link href="/">Accueil</Link> <span>/</span> <span>Tarifs</span>
      </nav>

      <h1 style={{ fontSize: 40, marginBottom: 12 }}>Une formule pour chaque association</h1>
      <p style={{ color: 'var(--color-navy-muted)', marginBottom: 40 }}>
        Tarifs mensuels hors taxes, sans engagement, lus dynamiquement depuis la configuration.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 24
        }}
      >
        {plans.map((plan) => {
          const aiModelFeat = plan.features.find((f) => f.featureKey === 'ai.model');
          const expertFeat = plan.features.find((f) => f.featureKey === 'expert_questions_month');
          return (
            <article key={plan.code} className="card">
              <h2 style={{ fontSize: 22, marginBottom: 8 }}>{plan.label}</h2>
              <p style={{ fontSize: 32, fontWeight: 800, color: 'var(--color-blue)', marginBottom: 12 }}>
                {plan.priceMonthlyEur} € <span style={{ fontSize: 14, fontWeight: 500 }}>HT / mois</span>
              </p>
              <p style={{ fontSize: 14, color: 'var(--color-navy-muted)', marginBottom: 20 }}>
                {plan.description}
              </p>
              <ul style={{ listStyle: 'none', display: 'grid', gap: 8, marginBottom: 24, fontSize: 14 }}>
                <li>Modèle IA : {aiModelFeat?.limitValue || 'Claude 3.5 Sonnet'}</li>
                <li>
                  Questions expertes 48h : {expertFeat?.limitValue || '0'} / mois
                </li>
              </ul>
              <Link href="/onboarding" className="btn btn-primary" style={{ width: '100%' }}>
                Choisir {plan.label}
              </Link>
            </article>
          );
        })}
      </div>
    </main>
  );
}

