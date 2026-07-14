import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import Navbar from './components/Navbar';
import MobileNav from './components/MobileNav';
import MobileMenuChips from './components/MobileMenuChips';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'HidzStreaming - Streaming Donghua & Baca Webtoon',
  description: 'Situs terlengkap untuk nonton Donghua dan baca Webtoon/Manga.',
  referrer: 'no-referrer',
};

export const viewport: Viewport = {
  themeColor: '#09090b', // zinc-950
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

import MainLayoutWrapper from './MainLayoutWrapper';
import PreferenceApplier from './components/PreferenceApplier';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} dark`} data-theme="dark" style={{ colorScheme: 'dark' }} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body className="font-sans antialiased bg-zinc-200 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-50 min-h-screen flex flex-col md:pb-0">
        <PreferenceApplier />

        <MainLayoutWrapper>
          {children}
        </MainLayoutWrapper>
      </body>
    </html>
  );
}
