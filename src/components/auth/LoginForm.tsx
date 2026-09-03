'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from '@/lib/auth-client';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Loader2,
  CheckCircle2,
  User,
  ShoppingBag,
} from 'lucide-react';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect') || searchParams.get('callbackUrl') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<'buyer' | 'admin' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Silakan isi email dan kata sandi Anda.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await signIn.email({
        email: email.trim(),
        password,
      });

      if (result?.error) {
        setErrorMessage(
          result.error.message || 'Email atau kata sandi salah. Silakan coba lagi.'
        );
        setIsLoading(false);
        return;
      }

      setSuccessMessage('Login berhasil! Mengalihkan...');
      setTimeout(() => {
        router.push(redirectParam);
        router.refresh();
      }, 800);
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      setErrorMessage(errObj?.message || 'Terjadi kesalahan saat masuk. Silakan coba lagi.');
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'buyer' | 'admin') => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setDemoLoading(role);

    const targetEmail =
      role === 'admin' ? 'admin@babykids.id' : 'sarah.clarissa@example.com';
    const targetPassword = role === 'admin' ? 'admin123' : 'password123';

    setEmail(targetEmail);
    setPassword(targetPassword);

    try {
      const result = await signIn.email({
        email: targetEmail,
        password: targetPassword,
      });

      if (result?.error) {
        setErrorMessage(
          result.error.message || `Gagal login sebagai demo ${role}. Pastikan database telah di-seed.`
        );
        setDemoLoading(null);
        return;
      }

      const roleName = role === 'admin' ? 'Admin Toko' : 'Pembeli Demo (Bunda Sarah)';
      setSuccessMessage(`Berhasil masuk sebagai ${roleName}! Mengalihkan...`);

      // Determine redirect target for demo users if default root
      let destination = redirectParam;
      if (destination === '/' && role === 'admin') {
        destination = '/admin';
      }

      setTimeout(() => {
        router.push(destination);
        router.refresh();
      }, 800);
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      setErrorMessage(
        errObj?.message || 'Gagal login demo. Silakan cek koneksi atau coba lagi.'
      );
      setDemoLoading(null);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Card Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-xl shadow-rose-100/40 relative overflow-hidden">
        {/* Subtle decorative background blur */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-rose-200/50 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-amber-200/40 rounded-full blur-2xl pointer-events-none" />

        <div className="relative">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/25 mb-3 text-2xl font-black">
              👶
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              Selamat Datang Kembali!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Masuk ke akun BabyKids Anda untuk melanjutkan belanja
            </p>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div className="flex-1 font-semibold leading-relaxed">{successMessage}</div>
            </div>
          )}

          {/* 1-Click Demo Section */}
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-rose-50/40 border border-rose-100 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>1-Click Demo Login (Praktis & Instan)</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              Coba fitur akun pembeli atau akses dashboard penjual tanpa repot registrasi:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleDemoLogin('buyer')}
                disabled={isLoading || demoLoading !== null}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                {demoLoading === 'buyer' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                ) : (
                  <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                )}
                <span>🟢 Akun Pembeli</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                disabled={isLoading || demoLoading !== null}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200/80 text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                {demoLoading === 'admin' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-700" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                )}
                <span>🔵 Admin Toko</span>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center mb-6">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Atau masuk dengan email
            </span>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Alamat Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  required
                  disabled={isLoading || demoLoading !== null}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Kata Sandi
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi Anda"
                  required
                  disabled={isLoading || demoLoading !== null}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Sembunyikan sandi' : 'Lihat sandi'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || demoLoading !== null}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-500/25 hover:shadow-lg transition-all active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memproses Masuk...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Masuk ke Akun</span>
                </>
              )}
            </button>
          </form>

          {/* Footer link to Register */}
          <div className="mt-6 text-center text-xs text-slate-500">
            <span>Belum memiliki akun BabyKids? </span>
            <Link
              href={
                redirectParam && redirectParam !== '/'
                  ? `/auth/register?redirect=${encodeURIComponent(redirectParam)}`
                  : '/auth/register'
              }
              className="font-bold text-rose-600 hover:text-rose-700 hover:underline transition-all"
            >
              Daftar Sekarang
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LoginForm() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md mx-auto p-8 bg-white rounded-3xl border border-rose-100 flex flex-col items-center justify-center min-h-[350px]">
          <Loader2 className="w-8 h-8 text-rose-500 animate-spin mb-2" />
          <p className="text-xs text-slate-500 font-medium">Memuat formulir login...</p>
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
