import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/lib/providers';

export const metadata: Metadata = {
  title: 'Urbano Commerce — Premium E-commerce Dashboard',
  description:
    'State-of-the-art e-commerce management platform powered by hexagonal architecture and event-driven processing.',
  keywords: ['ecommerce', 'dashboard', 'premium', 'nextjs', 'inventory'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
