import type { Metadata } from 'next';
import { Fraunces, Source_Sans_3 } from 'next/font/google';
import { AppShell } from '@/components/layout/app-shell';
import './globals.css';

const display = Fraunces({
  variable: '--font-display',
  subsets: ['latin'],
});

const sans = Source_Sans_3({
  variable: '--font-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Easy Fashion Limited | Premium Fashion E-Commerce',
  description:
    'Discover luxury menswear, elegant womenswear, and contemporary apparel at Easy Fashion Limited.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${sans.variable} antialiased`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
