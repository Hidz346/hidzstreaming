'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flame, Compass, BookOpen, Tv, X, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Tampilkan popup sekali setiap 24 jam
    const lastSeen = localStorage.getItem('hidz_popup_last_seen');
    const now = new Date().getTime();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    if (!lastSeen || now - parseInt(lastSeen) > twentyFourHours) {
      setShowPopup(true);
    }
  }, []);

  const closePopup = () => {
    setShowPopup(false);
    localStorage.setItem('hidz_popup_last_seen', new Date().getTime().toString());
  };

  return (
    <div className="h-full w-full bg-[#09090b] overflow-hidden font-sans flex flex-col px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-20 md:pb-6 lg:pb-8">

      {/* ═══════════════════════════════════════════════════
          QUICK HUB NAVIGATION (mengisi penuh halaman Home)
         ═══════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 grid-rows-2 sm:grid-rows-1 gap-3 sm:gap-4 lg:gap-6 flex-1 min-h-0 w-full">
        <Link href="/anime" className="group relative overflow-hidden bg-gradient-to-br from-indigo-900/30 to-indigo-950/20 border border-indigo-500/15 rounded-2xl lg:rounded-3xl p-4 h-full flex flex-col items-center justify-center gap-2 sm:gap-3 lg:gap-4 hover:border-indigo-500/40 hover:bg-indigo-900/40 transition-all duration-300">
          <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-2xl bg-indigo-500/15 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
            <Tv className="w-6 h-6 sm:w-7 sm:h-7 lg:w-9 lg:h-9" />
          </div>
          <div className="text-center">
            <h3 className="text-white font-bold text-base sm:text-lg lg:text-xl">Anime Hub</h3>
            <p className="text-zinc-500 text-xs sm:text-sm mt-1">Sub Indo</p>
          </div>
        </Link>

        <Link href="/donghua" className="group relative overflow-hidden bg-gradient-to-br from-amber-900/30 to-amber-950/20 border border-amber-500/15 rounded-2xl lg:rounded-3xl p-4 h-full flex flex-col items-center justify-center gap-2 sm:gap-3 lg:gap-4 hover:border-amber-500/40 hover:bg-amber-900/40 transition-all duration-300">
          <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-2xl bg-amber-500/15 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
            <Flame className="w-6 h-6 sm:w-7 sm:h-7 lg:w-9 lg:h-9" />
          </div>
          <div className="text-center">
            <h3 className="text-white font-bold text-base sm:text-lg lg:text-xl">Donghua Hub</h3>
            <p className="text-zinc-500 text-xs sm:text-sm mt-1">Animasi China</p>
          </div>
        </Link>

        <Link href="/comic" className="group relative overflow-hidden bg-gradient-to-br from-emerald-900/30 to-emerald-950/20 border border-emerald-500/15 rounded-2xl lg:rounded-3xl p-4 h-full flex flex-col items-center justify-center gap-2 sm:gap-3 lg:gap-4 hover:border-emerald-500/40 hover:bg-emerald-900/40 transition-all duration-300">
          <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-2xl bg-emerald-500/15 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
            <Compass className="w-6 h-6 sm:w-7 sm:h-7 lg:w-9 lg:h-9" />
          </div>
          <div className="text-center">
            <h3 className="text-white font-bold text-base sm:text-lg lg:text-xl">Komik Hub</h3>
            <p className="text-zinc-500 text-xs sm:text-sm mt-1">Manga & Manhwa</p>
          </div>
        </Link>

        <Link href="/novel" className="group relative overflow-hidden bg-gradient-to-br from-pink-900/30 to-pink-950/20 border border-pink-500/15 rounded-2xl lg:rounded-3xl p-4 h-full flex flex-col items-center justify-center gap-2 sm:gap-3 lg:gap-4 hover:border-pink-500/40 hover:bg-pink-900/40 transition-all duration-300">
          <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-2xl bg-pink-500/15 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
            <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 lg:w-9 lg:h-9" />
          </div>
          <div className="text-center">
            <h3 className="text-white font-bold text-base sm:text-lg lg:text-xl">Novel Hub</h3>
            <p className="text-zinc-500 text-xs sm:text-sm mt-1">Light Novel</p>
          </div>
        </Link>
      </div>

      {/* ═══════════════════════════════════════════════════
          WELCOME / ANNOUNCEMENT POPUP (sekali per 24 jam)
         ═══════════════════════════════════════════════════ */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#1A1A24] rounded-2xl w-full max-w-[340px] p-5 md:p-7 relative border border-zinc-800 shadow-2xl flex flex-col items-center">
            <button onClick={closePopup} className="absolute top-3 right-3 text-zinc-500 hover:text-white bg-zinc-800/50 hover:bg-zinc-700 rounded-full p-1.5 transition-all">
              <X size={18} />
            </button>

            <h2 className="text-xl font-extrabold text-center mb-5 text-white tracking-wide">Pemberitahuan !!</h2>

            <div className="flex items-center justify-center gap-3 mb-6 bg-zinc-900/50 px-6 py-3 rounded-2xl border border-zinc-800/50">
              <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-zinc-700">
                <img
                  src="/welcome-logo.png"
                  alt="HidzStreaming"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.src = '/logo.png'; }}
                />
              </div>
              <span className="font-bold text-xl tracking-tight"><span className="text-red-500">H</span>idzStreaming</span>
            </div>

            <div className="text-center text-[13px] md:text-sm text-zinc-400 mb-7 leading-relaxed space-y-3 px-1">
              <p>
                <strong className="text-white">Selamat datang di HidzStreaming!</strong>
              </p>
              <p>
                Sebuah ruang santai untuk menonton anime & donghua, serta membaca komik dan novel—semua bisa langsung diakses tanpa perlu daftar akun.
              </p>
              <p>
                Koleksi akan terus diperbarui secara berkala, jadi jangan lupa mampir lagi untuk update terbaru. Selamat menikmati! 🎬
              </p>
            </div>

            <button onClick={closePopup} className="w-full bg-red-600 hover:bg-red-500 text-white font-bold text-[13px] py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-600/20 active:scale-95">
              Lanjut <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

