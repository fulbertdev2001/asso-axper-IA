import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Back-Office Payload CMS',
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div data-layout="admin-payload">{children}</div>;
}

