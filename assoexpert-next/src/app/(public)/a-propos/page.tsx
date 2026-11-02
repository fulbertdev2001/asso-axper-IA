import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { buildOrganizationAndExpertJsonLd } from '../../../lib/cms/jsonld';

export const metadata: Metadata = {
  title: 'À propos — Laetitia Badji & Cabinet Maé',
  description:
    'Découvrez Laetitia Badji, DAF externalisée et fondatrice du Cabinet Maé (AKILIGUE SAS), l’experte derrière AssoExpert IA.',
  alternates: { canonical: '/a-propos' }
};

/**
 * Page `/a-propos` (Lot 6) :
 * Page auteur orientée GEO avec données structurées JSON-LD `Organization` et `Person`.
 */
export default function AProposPage() {
  const jsonLd = buildOrganizationAndExpertJsonLd();

  return (
    <main style={{ maxWidth: 920, margin: '0 auto', padding: '64px 24px' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Fil d’Ariane" style={{ fontSize: 14, marginBottom: 24 }}>
        <Link href="/">Accueil</Link> <span>/</span> <span>À propos</span>
      </nav>

      <h1 style={{ fontSize: 40, marginBottom: 16 }}>
        Laetitia Badji — L’experte derrière AssoExpert IA
      </h1>
      <p style={{ fontSize: 18, color: 'var(--color-navy-muted)', marginBottom: 32 }}>
        Fondatrice du Cabinet Maé (AKILIGUE SAS) et directrice administrative et financière
        externalisée auprès des associations employeuses depuis plus de 10 ans.
      </p>

      <section className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, marginBottom: 12 }}>Pourquoi AssoExpert IA ?</h2>
        <p style={{ marginBottom: 16 }}>
          Les dirigeants bénévoles et directeurs d’associations de 1 à 100 salariés font face à une
          complexité réglementaire croissante : conventions collectives (CCN 66, CCN 51, ÉCLAT,
          ALISFA), obligations loi 1901, financements publics (CPOM, FSE, FONJEP) et conformité
          employeur (DUERP, RGPD, URSSAF).
        </p>
        <p>
          AssoExpert IA combine un assistant IA contextualisé au profil de votre structure et une
          escalade directe vers Laetitia Badji sous 48 heures ouvrées.
        </p>
      </section>

      <Link href="/onboarding" className="btn btn-primary">
        Démarrer avec AssoExpert IA
      </Link>
    </main>
  );
}

