'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw, Home, AlertTriangle } from 'lucide-react';
import { Navbar, Footer } from '@/components/layout/NavbarFooter';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled app error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F0] text-slate-800">
      <Navbar />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-12 sm:py-20 flex items-center justify-center">
        <div className="w-full bg-white rounded-3xl p-8 sm:p-12 border-2 border-[#FFE8D6] shadow-[0_16px_36px_rgba(255,159,67,0.14),inset_0_2px_4px_rgba(255,255,255,0.95)] text-center relative overflow-hidden">
          {/* Ambient blur background */}
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-rose-100/60 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-[#87CEEB]/25 rounded-full blur-2xl pointer-events-none" />

          {/* 3D Emoticon Badge */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-3xl bg-gradient-to-br from-rose-500 to-[#FF9F43] text-white flex items-center justify-center mb-6 text-4xl sm:text-5xl border-2 border-white shadow-[0_8px_20px_rgba(244,63,94,0.3)] animate-pulse">
            ⚠️
          </div>

          <span className="bg-rose-50 text-rose-700 border border-rose-200 text-xs px-3 py-1 font-heading font-black rounded-full mb-3 inline-block">
            Terjadi Kendala Sistem
          </span>

          <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-800 tracking-tight mb-3">
            Sedang Ada Gangguan Sementara
          </h1>

          <p className="text-xs sm:text-sm font-body font-medium text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
            Mohon maaf atas ketidaknyamanannya. Sistem kami sedang melakukan pemulihan otomatis. Silakan coba muat ulang halaman.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              type="button"
              onClick={() => reset()}
              className="w-full sm:w-auto clay-btn-orange px-6 py-3.5 text-xs sm:text-sm text-white font-heading font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Muat Ulang Halaman</span>
            </button>

            <Link
              href="/"
              className="w-full sm:w-auto clay-btn-white px-6 py-3.5 text-xs sm:text-sm text-slate-700 font-heading font-bold flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4 text-[#FF9F43]" />
              <span>Kembali ke Beranda</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
