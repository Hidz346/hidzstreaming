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
    <div className="w-full bg-[#09090b] pb-20 overflow-x-hidden font-sans">

      {/* ═══════════════════════════════════════════════════
          QUICK HUB NAVIGATION
         ═══════════════════════════════════════════════════ */}
      <div className="px-4 sm:px-6 lg:px-8 mt-6 lg:mt-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 lg:gap-4">
          <Link href="/anime" className="relative overflow-hidden group bg-gradient-to-br from-indigo-900/30 to-indigo-950/20 border border-indigo-500/15 p-3 lg:p-4 rounded-2xl flex items-center gap-3 hover:border-indigo-500/40 hover:bg-indigo-900/40 transition-all duration-300">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform"><Tv size={20} /></div>
            <div>
              <h3 className="text-white font-bold text-xs sm:text-sm">Anime Hub</h3>
              <p className="text-zinc-500 text-[10px] sm:text-xs mt-0.5">Sub Indo</p>
            </div>
          </Link>
          <Link href="/donghua" className="relative overflow-hidden group bg-gradient-to-br from-amber-900/30 to-amber-950/20 border border-amber-500/15 p-3 lg:p-4 rounded-2xl flex items-center gap-3 hover:border-amber-500/40 hover:bg-amber-900/40 transition-all duration-300">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform"><Flame size={20} /></div>
            <div>
              <h3 className="text-white font-bold text-xs sm:text-sm">Donghua Hub</h3>
              <p className="text-zinc-500 text-[10px] sm:text-xs mt-0.5">Animasi China</p>
            </div>
          </Link>
          <Link href="/comic" className="relative overflow-hidden group bg-gradient-to-br from-emerald-900/30 to-emerald-950/20 border border-emerald-500/15 p-3 lg:p-4 rounded-2xl flex items-center gap-3 hover:border-emerald-500/40 hover:bg-emerald-900/40 transition-all duration-300">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform"><Compass size={20} /></div>
            <div>
              <h3 className="text-white font-bold text-xs sm:text-sm">Komik Hub</h3>
              <p className="text-zinc-500 text-[10px] sm:text-xs mt-0.5">Manga & Manhwa</p>
            </div>
          </Link>
          <Link href="/novel" className="relative overflow-hidden group bg-gradient-to-br from-pink-900/30 to-pink-950/20 border border-pink-500/15 p-3 lg:p-4 rounded-2xl flex items-center gap-3 hover:border-pink-500/40 hover:bg-pink-900/40 transition-all duration-300">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-pink-500/15 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform"><BookOpen size={20} /></div>
            <div>
              <h3 className="text-white font-bold text-xs sm:text-sm">Novel Hub</h3>
              <p className="text-zinc-500 text-[10px] sm:text-xs mt-0.5">Light Novel</p>
            </div>
          </Link>
        </div>
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
