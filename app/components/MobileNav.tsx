'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, PlayCircle, Film, BookOpen, BookText, Calendar, LayoutGrid, Globe } from 'lucide-react';

export default function MobileNav() {
  const pathname = usePathname();

  let mode = 'main';
  if (pathname === '/donghua' || pathname?.startsWith('/donghua/')) {
    mode = 'donghua';
  } else if (pathname === '/anime' || pathname?.startsWith('/anime/')) {
    mode = 'home-id';
  }

  let links: any[] = [];

  let animeSource = 'animasu';
  if (pathname?.includes('/otakudesu')) {
    animeSource = 'otakudesu';
  }

  if (mode === 'donghua') {
    links = [
      { href: '/donghua', icon: Home, label: 'Home' },
      { href: '/donghua/jadwal', icon: Calendar, label: 'Jadwal' },
      { href: '/donghua/ongoing', icon: PlayCircle, label: 'Ongoing' },
      { href: '/donghua/genre', icon: LayoutGrid, label: 'Genre' },
      { href: '/donghua/explore', icon: Compass, label: 'Explore' },
      { href: '/', icon: Globe, label: 'Main Site' },
    ];
  } else if (mode === 'home-id') {
    links = [
      { href: `/anime/${animeSource}`, icon: Home, label: 'Home' },
      { href: `/anime/${animeSource}/schedule`, icon: Calendar, label: 'Jadwal' },
      { href: `/anime/${animeSource}/genre/movie`, icon: Film, label: 'Movie' },
      { href: `/anime/${animeSource}/genres`, icon: LayoutGrid, label: 'Genre' },
      { href: `/anime/${animeSource}/search`, icon: Compass, label: 'Explore' },
      { href: '/', icon: Globe, label: 'Main Site' },
    ];
  } else {
    // Main Site
    links = [
      { href: '/', icon: Home, label: 'Home' },
      { href: '/anime', icon: LayoutGrid, label: 'Anime' },
      { href: '/donghua', icon: PlayCircle, label: 'Donghua' },
      { href: '/comic', icon: BookOpen, label: 'Comic' },
      { href: '/novel', icon: BookText, label: 'Novel' },
    ];
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/98 dark:bg-zinc-950/98 border-t border-zinc-200 dark:border-zinc-800 z-[60] pb-safe">
      <div className="flex items-center justify-between w-full h-16 px-2">
        {links.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href !== '/' && pathname?.startsWith(href) && href !== '/');
          
          return (
            <Link 
              key={label}
              href={href} 
              className={`flex flex-col items-center gap-1 flex-1 ${
                isActive 
                  ? 'text-amber-600 dark:text-amber-500' 
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors'
              }`}
            >
              <Icon size={20} className={isActive ? 'fill-amber-100 dark:fill-amber-900/30' : ''} />
              <span className={`text-[9px] sm:text-[10px] whitespace-nowrap ${isActive ? 'font-semibold' : 'font-medium'}`}>{label}</span>
            </Link>
          );
        })}
      </div>
      
      {/* CSS to hide scrollbar but allow scroll */}
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </nav>
  );
}
