import type { Metadata } from 'next';
import Script from 'next/script';
import { AssoExpertProvider } from '../context/AssoExpertProvider';
import '../styles/styles.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://assoexpert.fr'),
  title: {
    default: 'AssoExpert IA — Assistant spécialisé dans la gestion des associations',
    template: '%s | AssoExpert IA'
  },
  description:
    'Comprenez vos obligations, analysez une situation et préparez la prochaine étape : RH et conventions collectives (CCN 66, CCN 51, ÉCLAT), gouvernance loi 1901, finance et subventions, conformité. Réponses sourcées et experte sous 48 h ouvrées.'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const umamiUrl = process.env.NEXT_PUBLIC_UMAMI_URL;
  const umamiWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700;800&family=Sora:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
        {umamiUrl && umamiWebsiteId && (
          <Script
            defer
            src={`${umamiUrl.replace(/\/$/, '')}/script.js`}
            data-website-id={umamiWebsiteId}
            strategy="afterInteractive"
          />
        )}
      </head>
      <body>
        <AssoExpertProvider>{children}</AssoExpertProvider>
      </body>
    </html>
  );
}

