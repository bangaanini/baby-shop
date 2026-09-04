import React from 'react';
import { Metadata } from 'next';
import { Navbar, Footer } from '@/components/layout/NavbarFooter';
import { LoginForm } from '@/components/auth/LoginForm';
import { ShieldCheck, Sparkles, HeartHandshake } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Masuk ke Akun — NBusiness Store',
  description: 'Masuk ke akun NBusiness Anda untuk menikmati kemudahan belanja kebutuhan bayi, anak, dan perlengkapan terlengkap di Indonesia.',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-rose-50/40 via-white to-rose-50/30 text-slate-800">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col items-center justify-center">
        <LoginForm />

        {/* Value Props Bar below login */}
        <div className="mt-8 max-w-md w-full grid grid-cols-3 gap-3 text-center">
          <div className="p-3 bg-white/80 backdrop-blur-xs rounded-2xl border border-rose-100/80 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
            <span className="text-[10px] sm:text-xs font-semibold text-slate-700 block">
              100% SNI & Aman
            </span>
          </div>
          <div className="p-3 bg-white/80 backdrop-blur-xs rounded-2xl border border-rose-100/80 shadow-2xs">
            <Sparkles className="w-4 h-4 text-amber-500 mx-auto mb-1" />
            <span className="text-[10px] sm:text-xs font-semibold text-slate-700 block">
              Poin & Voucher
            </span>
          </div>
          <div className="p-3 bg-white/80 backdrop-blur-xs rounded-2xl border border-rose-100/80 shadow-2xs">
            <HeartHandshake className="w-4 h-4 text-rose-500 mx-auto mb-1" />
            <span className="text-[10px] sm:text-xs font-semibold text-slate-700 block">
              Garansi Retur
            </span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
