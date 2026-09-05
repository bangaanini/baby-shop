import React from 'react';
import Link from 'next/link';
import { Home, ShoppingBag, ArrowLeft, Search } from 'lucide-react';
import { Navbar, Footer } from '@/components/layout/NavbarFooter';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F0] text-slate-800">
      <Navbar />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-12 sm:py-20 flex items-center justify-center">
        <div className="w-full bg-white rounded-3xl p-8 sm:p-12 border-2 border-[#FFE8D6] shadow-[0_16px_36px_rgba(255,159,67,0.14),inset_0_2px_4px_rgba(255,255,255,0.95)] text-center relative overflow-hidden">
          {/* Ambient blur background */}
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#FFE8D6]/60 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-[#87CEEB]/25 rounded-full blur-2xl pointer-events-none" />

          {/* 3D Emoticon Badge */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-3xl bg-gradient-to-br from-[#FF9F43] to-[#87CEEB] text-white flex items-center justify-center mb-6 text-4xl sm:text-5xl border-2 border-white shadow-[0_8px_20px_rgba(255,159,67,0.3)] animate-bounce">
            🧸
          </div>

          <span className="clay-badge-orange text-xs px-3 py-1 font-heading font-black mb-3 inline-block">
            Error 404 • Halaman Tidak Ditemukan
          </span>

          <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-800 tracking-tight mb-3">
            Ups! Mainan atau Halaman Ini Hilang
          </h1>

          <p className="text-xs sm:text-sm font-body font-medium text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
            Halaman yang Anda cari mungkin sudah dipindahkan, dihapus, atau tautan yang Anda masukkan salah. Yuk kembali belanja kebutuhan si kecil di NBusiness!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/"
              className="w-full sm:w-auto clay-btn-orange px-6 py-3.5 text-xs sm:text-sm text-white font-heading font-bold shadow-md flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span>Kembali ke Beranda</span>
            </Link>

            <Link
              href="/katalog"
              className="w-full sm:w-auto clay-btn-white px-6 py-3.5 text-xs sm:text-sm text-slate-700 font-heading font-bold flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4 text-[#FF9F43]" />
              <span>Jelajahi Katalog Toko</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
