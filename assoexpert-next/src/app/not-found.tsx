import React from 'react';
import Link from 'next/link';

/**
 * Page 404 utile (§7 Lot 6) :
 * Oriente le visiteur vers les 5 pages piliers SEO, les tarifs ou l'espace association.
 */
export default function NotFoundPage() {
  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
      <span className="badge badge-blue" style={{ marginBottom: 16 }}>
        Erreur 404
      </span>
      <h1 style={{ fontSize: 36, marginBottom: 12 }}>Cette page n’existe pas ou a été déplacée</h1>
      <p style={{ color: 'var(--color-navy-muted)', marginBottom: 32 }}>
        Retrouvez ci-dessous nos guides experts par domaine ou accédez directement à votre espace
        association.
      </p>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 12,
          marginBottom: 32
        }}
      >
        <Link href="/rh" className="btn btn-secondary btn-sm">
          RH & Conventions (CCN 66, 51, ÉCLAT)
        </Link>
        <Link href="/gouvernance" className="btn btn-secondary btn-sm">
          Gouvernance loi 1901
        </Link>
        <Link href="/finance" className="btn btn-secondary btn-sm">
          Finance & Comptabilité
        </Link>
        <Link href="/subventions" className="btn btn-secondary btn-sm">
          Subventions & CPOM
        </Link>
        <Link href="/conformite" className="btn btn-secondary btn-sm">
          Conformité (DUERP, RGPD)
        </Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
        <Link href="/" className="btn btn-primary">
          Retour à l’accueil
        </Link>
        <Link href="/tarifs" className="btn btn-secondary">
          Voir les tarifs
        </Link>
      </div>
    </main>
  );
}

