import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import AuthProvider from './AuthProvider';
import VisitLogger from '@/components/VisitLogger';
import { Suspense } from 'react';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'The Dubai Mall — The Epicenter',
  description:
    "The world's most visited destination. 100 million annual visitors. 1,200+ stores. One address: Downtown Dubai.",
  keywords: 'Dubai Mall, luxury shopping, entertainment, Dubai, retail, events',
  openGraph: {
    title: 'The Dubai Mall — The Epicenter',
    description: "The world's most visited destination.",
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body className="bg-dark text-white antialiased" suppressHydrationWarning>
        <AuthProvider session={null}>
          <Suspense fallback={null}>
            <VisitLogger />
          </Suspense>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
