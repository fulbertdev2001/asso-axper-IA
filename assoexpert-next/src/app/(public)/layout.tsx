import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: {
    index: true,
    follow: true
  },
  alternates: {
    canonical: '/'
  }
};

/**
 * Lot 1 — Layout public (indexé SEO, distinct du layout applicatif `/app/**`)
 */
export default function PublicLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div data-layout="public">{children}</div>;
}

