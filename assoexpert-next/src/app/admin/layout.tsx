import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { container } from '../../container';
import { SESSION_COOKIE_NAME } from '../../http/session-cookie';

export const metadata: Metadata = {
  title: 'Back-Office Payload CMS',
  robots: {
    index: false,
    follow: false
  }
};

// La session est lue à chaque requête : jamais de rendu statique du back-office
export const dynamic = 'force-dynamic';

/**
 * Garde serveur du back-office : seule une session administrateur plateforme y accède.
 * (Le contrôle côté navigateur sur l'adresse @cabinet-mae.fr n'est qu'une aide à la saisie.)
 */
export default async function AdminLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const authContext = token ? await container.authService.resolveContext(token).catch(() => null) : null;

  if (!authContext?.isPlatformAdmin) {
    redirect('/login');
  }

  return <div data-layout="admin-payload">{children}</div>;
}
