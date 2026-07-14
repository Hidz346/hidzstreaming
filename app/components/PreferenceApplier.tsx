'use client';

import { useEffect } from 'react';

/**
 * Komponen ini membaca semua preferensi dari localStorage
 * dan menerapkannya ke DOM saat aplikasi pertama kali dibuka.
 * Tidak merender apapun — hanya efek samping (side-effect only).
 */
export default function PreferenceApplier() {
  useEffect(() => {
    // 1. Kurangi Animasi
    const reducedMotion = localStorage.getItem('pref_reduced_motion') === 'true';
    if (reducedMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }

    // 2. Bahasa (set attribute lang di <html>)
    const lang = localStorage.getItem('pref_language') || 'id';
    document.documentElement.setAttribute('lang', lang);
  }, []);

  return null;
}
