'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Menu, X, ChevronDown } from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const getSearchHref = () => {
    if (pathname?.startsWith('/novel')) return '/novel';
    if (pathname?.startsWith('/comic')) return '/comic/advanced-search';
    if (pathname?.startsWith('/donghua')) return '/donghua/search';
    if (pathname?.startsWith('/anime')) {
      const isOtakudesu = pathname.includes('/otakudesu');
      return `/anime/${isOtakudesu ? 'otakudesu' : 'animasu'}/search`;
    }
    if (pathname?.startsWith('/home-id')) return '/search?source=webtoons';
    if (pathname?.startsWith('/search')) return pathname; // tetap di halaman search yg sama
    return '/search';
  };
  const searchHref = getSearchHref();

  let animeSource = 'animasu';
  if (pathname?.includes('/otakudesu')) {
    animeSource = 'otakudesu';
  }

  let mode = 'main';
  if (pathname === '/donghua' || pathname?.startsWith('/donghua/')) {
    mode = 'donghua';
  } else if (pathname === '/anime' || pathname?.startsWith('/anime/')) {
    mode = 'home-id';
  }

  return (
    <>
      <nav id="navbar" className="fixed top-0 left-0 right-0 z-50 bg-zinc-100/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="container mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center font-sans text-2xl font-bold hover:scale-105 transition-transform drop-shadow-md">
              <span className="text-red-600">H</span>
              <span className="text-zinc-900 dark:text-white">idzStreaming</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-6 text-sm font-medium h-full">
              <Link href="/" className="text-zinc-600 dark:text-zinc-300 hover:text-amber-600 dark:hover:text-amber-500 transition-colors py-4">Home</Link>
              
              {/* Donghua Dropdown */}
              <div className="relative group h-full flex items-center">
                <Link href="/donghua" className="flex items-center gap-1 text-zinc-600 dark:text-zinc-300 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors py-4">
                  Donghua <ChevronDown size={14} className="opacity-50 group-hover:rotate-180 transition-transform duration-300" />
                </Link>
                <div className="absolute top-full left-0 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all translate-y-2 group-hover:translate-y-0 flex flex-col overflow-hidden z-50">
                  <Link href="/donghua" className="px-4 py-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors">Home Donghua</Link>
                  <Link href="/donghua/jadwal" className="px-4 py-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors">Jadwal Rilis</Link>
                  <Link href="/donghua/ongoing" className="px-4 py-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors">Sedang Tayang</Link>
                  <Link href="/donghua/genre" className="px-4 py-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors">Daftar Genre</Link>
                  <Link href="/donghua/explore" className="px-4 py-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors">Eksplorasi</Link>
                </div>
              </div>

              {/* Anime Dropdown */}
              <div className="relative group h-full flex items-center">
                <Link href="/anime" className="flex items-center gap-1 text-zinc-600 dark:text-zinc-300 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors py-4">
                  Anime <ChevronDown size={14} className="opacity-50 group-hover:rotate-180 transition-transform duration-300" />
                </Link>
                <div className="absolute top-full left-0 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all translate-y-2 group-hover:translate-y-0 flex flex-col overflow-hidden z-50">

                  <Link href={`/anime/${animeSource}`} className="px-4 py-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors">Home Anime</Link>
                  <Link href={`/anime/${animeSource}/schedule`} className="px-4 py-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors">Jadwal Rilis</Link>
                  <Link href={`/anime/${animeSource}/genre/movie`} className="px-4 py-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors">Anime Movie</Link>
                  <Link href={`/anime/${animeSource}/genres`} className="px-4 py-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors">Daftar Genre</Link>
                  <Link href={`/anime/${animeSource}/search`} className="px-4 py-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors">Eksplorasi</Link>
                </div>
              </div>

              {/* Comic Dropdown */}
              <div className="relative group h-full flex items-center">
                <Link href="/comic" className="flex items-center gap-1 text-zinc-600 dark:text-zinc-300 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors py-4">
                  Comic <ChevronDown size={14} className="opacity-50 group-hover:rotate-180 transition-transform duration-300" />
                </Link>
                <div className="absolute top-full left-0 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all translate-y-2 group-hover:translate-y-0 flex flex-col overflow-hidden z-50">
                  <Link href="/comic" className="px-4 py-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors">Home Comic</Link>
                  <Link href="/search?source=webtoons" className="px-4 py-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors">Webtoon Lengkap</Link>
                </div>
              </div>

              {/* Novel Dropdown */}
              <div className="relative group h-full flex items-center">
                <Link href="/novel" className="flex items-center gap-1 text-zinc-600 dark:text-zinc-300 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors py-4">
                  Novel <ChevronDown size={14} className="opacity-50 group-hover:rotate-180 transition-transform duration-300" />
                </Link>
                <div className="absolute top-full left-0 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all translate-y-2 group-hover:translate-y-0 flex flex-col overflow-hidden z-50">
                  <Link href="/novel" className="px-4 py-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors">Home Novel</Link>
                  <Link href="/novel/daftar-novel" className="px-4 py-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors">Daftar Novel</Link>
                  <Link href="/search?source=novels" className="px-4 py-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors">Cari Novel</Link>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link 
              href={searchHref === '/novel' ? '/novel?focus=true' : searchHref} 
              className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:bg-amber-100 hover:text-amber-600 dark:hover:bg-amber-900/30 transition-colors shrink-0" 
              title="Cari"
              onClick={(e) => {
                if (pathname === '/novel' && searchHref === '/novel') {
                  e.preventDefault();
                  const input = document.getElementById('novel-search-input');
                  if (input) {
                    input.focus();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }
              }}
            >
              <Search size={18} />
            </Link>

            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:bg-amber-100 hover:text-amber-600 dark:hover:bg-amber-900/30 transition-colors shrink-0"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Sidebar Overlay - always in DOM, toggled via opacity/pointer-events */}
      <div 
        className={`md:hidden fixed inset-0 z-[100] transition-opacity duration-300 ${menuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
        onClick={() => setMenuOpen(false)}
      />

      {/* Mobile Drawer Sidebar Panel - always in DOM, toggled via transform */}
      <div 
        className={`md:hidden fixed top-0 left-0 bottom-0 w-[85vw] max-w-[320px] z-[101] transition-transform duration-300 ease-out ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ height: '100dvh', backgroundColor: '#0a0a0a' }}
      >
        {/* Sidebar Header */}
        <div 
          className="flex items-center justify-between p-4"
          style={{ borderBottom: '1px solid #27272a' }}
        >
          <Link href="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-2">
            <img src="/welcome-logo.png" alt="HidzStreaming" className="w-8 h-8 object-contain" onError={(e) => { e.currentTarget.src = '/logo.png'; }} />
            <span className="font-bold text-xl text-white"><span className="text-red-600">H</span>idzStreaming</span>
          </Link>
          <button 
            onClick={() => setMenuOpen(false)}
            className="text-zinc-400 hover:text-white p-2 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Sidebar Content (Scrollable) */}
        <div style={{ overflowY: 'auto', height: 'calc(100dvh - 65px)' }}>
          
          {mode === 'donghua' && (
            <div className="flex flex-col">
              <div className="px-5 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider" style={{ backgroundColor: '#1a1a1a' }}>MENU DONGHUA</div>
              <Link href="/donghua" onClick={() => setMenuOpen(false)} className="px-5 py-4 font-bold text-[13px] text-zinc-200 hover:text-amber-500 transition-colors" style={{ borderBottom: '1px solid #27272a' }}>Home Donghua</Link>
              <Link href="/donghua/jadwal" onClick={() => setMenuOpen(false)} className="px-5 py-4 font-bold text-[13px] text-zinc-200 hover:text-amber-500 transition-colors" style={{ borderBottom: '1px solid #27272a' }}>Jadwal Rilis</Link>
              <Link href="/donghua/ongoing" onClick={() => setMenuOpen(false)} className="px-5 py-4 font-bold text-[13px] text-zinc-200 hover:text-amber-500 transition-colors" style={{ borderBottom: '1px solid #27272a' }}>Sedang Tayang</Link>
              <Link href="/donghua/genre" onClick={() => setMenuOpen(false)} className="px-5 py-4 font-bold text-[13px] text-zinc-200 hover:text-amber-500 transition-colors" style={{ borderBottom: '1px solid #27272a' }}>Daftar Genre</Link>
              <Link href="/donghua/explore" onClick={() => setMenuOpen(false)} className="px-5 py-4 font-bold text-[13px] text-zinc-200 hover:text-amber-500 transition-colors" style={{ borderBottom: '1px solid #27272a' }}>Eksplorasi</Link>
            </div>
          )}

          {mode === 'home-id' && (
            <div className="flex flex-col">
              <div className="px-5 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider" style={{ backgroundColor: '#1a1a1a' }}>MENU ANIME</div>

              <Link href={`/anime/${animeSource}`} onClick={() => setMenuOpen(false)} className="px-5 py-4 font-bold text-[13px] text-zinc-200 hover:text-amber-500 transition-colors" style={{ borderBottom: '1px solid #27272a' }}>Home Anime</Link>
              <Link href={`/anime/${animeSource}/schedule`} onClick={() => setMenuOpen(false)} className="px-5 py-4 font-bold text-[13px] text-zinc-200 hover:text-amber-500 transition-colors" style={{ borderBottom: '1px solid #27272a' }}>Jadwal Rilis</Link>
              <Link href={`/anime/${animeSource}/genre/movie`} onClick={() => setMenuOpen(false)} className="px-5 py-4 font-bold text-[13px] text-zinc-200 hover:text-amber-500 transition-colors" style={{ borderBottom: '1px solid #27272a' }}>Anime Movie</Link>
              <Link href={`/anime/${animeSource}/genres`} onClick={() => setMenuOpen(false)} className="px-5 py-4 font-bold text-[13px] text-zinc-200 hover:text-amber-500 transition-colors" style={{ borderBottom: '1px solid #27272a' }}>Daftar Genre</Link>
              <Link href={`/anime/${animeSource}/search`} onClick={() => setMenuOpen(false)} className="px-5 py-4 font-bold text-[13px] text-zinc-200 hover:text-amber-500 transition-colors" style={{ borderBottom: '1px solid #27272a' }}>Eksplorasi</Link>
            </div>
          )}

          <div className="flex flex-col">
            <div className="px-5 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider" style={{ backgroundColor: '#1a1a1a' }}>MENU UTAMA</div>
            <Link href="/" onClick={() => setMenuOpen(false)} className="px-5 py-4 font-bold text-[13px] text-zinc-200 hover:text-amber-500 transition-colors" style={{ borderBottom: '1px solid #27272a' }}>Beranda (Home)</Link>
            <Link href="/donghua" onClick={() => setMenuOpen(false)} className="px-5 py-4 font-bold text-[13px] text-zinc-200 hover:text-amber-500 transition-colors" style={{ borderBottom: '1px solid #27272a' }}>Donghua</Link>
            <Link href="/anime" onClick={() => setMenuOpen(false)} className="px-5 py-4 font-bold text-[13px] text-zinc-200 hover:text-amber-500 transition-colors" style={{ borderBottom: '1px solid #27272a' }}>Anime</Link>
            <Link href="/comic" onClick={() => setMenuOpen(false)} className="px-5 py-4 font-bold text-[13px] text-zinc-200 hover:text-amber-500 transition-colors" style={{ borderBottom: '1px solid #27272a' }}>Webtoon & Komik</Link>
            <Link href="/novel" onClick={() => setMenuOpen(false)} className="px-5 py-4 font-bold text-[13px] text-zinc-200 hover:text-amber-500 transition-colors">Novel</Link>
          </div>
          
        </div>
      </div>
    </>
  );
}

