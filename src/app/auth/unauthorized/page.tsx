import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Navbar, Footer } from '@/components/layout/NavbarFooter';
import {
  ShieldAlert,
  ShoppingBag,
  UserCheck,
  Headphones,
  Lock,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Akses Ditolak (403) — NBusiness Store',
  description:
    'Halaman panel admin hanya dapat diakses oleh administrator resmi NBusiness Store.',
};

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-rose-50/50 via-white to-rose-50/30 text-slate-800">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex flex-col items-center justify-center text-center">
        {/* Shield / Error Icon with Glow */}
        <div className="relative mb-6">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-xl shadow-rose-500/25 ring-8 ring-rose-100">
            <ShieldAlert className="w-12 h-12 sm:w-14 sm:h-14" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white rounded-full p-2 shadow-md">
            <Lock className="w-4 h-4" />
          </div>
        </div>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold mb-4 tracking-wide uppercase">
          <span>Error 403 • Akses Terbatas</span>
        </div>

        {/* Heading & Subheading */}
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
          Akses Khusus Administrator Toko
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed mb-8">
          Maaf, halaman <span className="font-semibold text-rose-600">/admin</span> dan panel pengelolaan toko hanya dapat diakses oleh akun dengan peran (role) <span className="font-semibold text-slate-800">Administrator</span>. Akun Anda saat ini tidak memiliki izin untuk membuka halaman ini.
        </p>

        {/* Action Buttons */}
        <div className="w-full max-w-md flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 mb-10">
          <Link
            href="/katalog"
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold text-sm shadow-md shadow-rose-500/20 hover:shadow-lg transition-all active:scale-[0.98]"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Kembali Belanja</span>
          </Link>

          <Link
            href="/auth/login?redirect=/admin"
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-200 shadow-xs hover:border-slate-300 transition-all active:scale-[0.98]"
          >
            <UserCheck className="w-4 h-4 text-rose-500" />
            <span>Beralih ke Akun Admin</span>
          </Link>
        </div>

        {/* Help & Support Link */}
        <div className="bg-white/80 backdrop-blur-xs rounded-2xl border border-rose-100 p-4 sm:p-5 max-w-md w-full shadow-2xs">
          <div className="flex items-center justify-between gap-4 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-800">
                  Butuh bantuan akun atau peran?
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500">
                  Tim dukungan NBusiness siap membantu verifikasi hak akses Anda.
                </p>
              </div>
            </div>
            <a
              href="mailto:support@nbusiness.id?subject=Permintaan%20Akses%20Admin%20NBusiness"
              className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs shrink-0 transition-colors inline-flex items-center gap-1"
            >
              <span>Hubungi Dukungan</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Keamanan & Privasi Data Pengguna Terproteksi</span>
        </div>
      </main>

      <Footer />
    </div>
  );
}
