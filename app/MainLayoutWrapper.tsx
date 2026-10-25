'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import MobileMenuChips from './components/MobileMenuChips';
import Navbar from './components/Navbar';
import MobileNav from './components/MobileNav';
import Link from 'next/link';

export default function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isComicRead = pathname?.startsWith('/comic/read') || pathname?.startsWith('/read');
  const isNovelRead = pathname?.startsWith('/novel/read');

  const isHome = pathname === '/';

  // Kunci scroll halaman penuh khusus di Home (tanpa mengganggu toggle scroll milik Navbar untuk menu mobile)
  useEffect(() => {
    document.documentElement.style.overflow = isHome ? 'hidden' : '';
    return () => {
      document.documentElement.style.overflow = '';
    };
  }, [isHome]);

  if (isComicRead || isNovelRead) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className={`w-full pt-[72px] sm:pt-[84px] flex flex-col relative max-w-[1600px] mx-auto px-4 md:px-8 ${isHome ? 'h-dvh overflow-hidden' : 'flex-1 pb-12 min-h-[85vh]'}`}>
        <div className={`flex flex-col lg:flex-row w-full gap-6 lg:gap-8 ${isHome ? 'flex-1 min-h-0' : ''}`}>
          {children}
        </div>
      </main>
      {!isHome && (
      <footer className="bg-zinc-100 dark:bg-[#1f1f22] border-t border-zinc-200 dark:border-zinc-800 mt-auto pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center">

          {/* Links */}
          <div className="flex items-center gap-4 text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-6">
            <Link href="/about-us" className="hover:text-amber-600 transition-colors">About Us</Link>
            <span className="w-1 h-1 rounded-full bg-zinc-500"></span>
            <Link href="/contact-us" className="hover:text-amber-600 transition-colors">Contact Us</Link>
            <span className="w-1 h-1 rounded-full bg-zinc-500"></span>
            <Link href="/developer" className="hover:text-amber-600 transition-colors">Developer</Link>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-3xl text-center leading-relaxed mb-4">
            HidzStreaming does not host any files, it merely pulls streams from 3rd party services. Legal issues should be taken up with the file hosts and providers. HidzStreaming is not responsible for any media files shown by the video providers.
          </p>

          {/* Copyright */}
          <p className="text-xs text-zinc-600 dark:text-zinc-500 font-medium">
            &copy; {new Date().getFullYear()} <span className="font-bold">HidzStreaming</span>. All rights reserved.
          </p>
        </div>
      </footer>
      )}
      <MobileNav />
    </>
  );
}
