import type { Metadata } from 'next';

/**
 * §3.8 & Lot 1/6 — Toutes les pages `/app/**` sont obligatoirement `noindex`
 * et exclues du sitemap.
 */
export const metadata: Metadata = {
  title: 'Espace Association',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true
    }
  }
};

export default function ClientWorkspaceLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div data-layout="app-workspace">{children}</div>;
}

