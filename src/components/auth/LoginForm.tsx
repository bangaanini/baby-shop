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
  AlertCircle,
  Loader2,
  CheckCircle2,
  Store,
} from 'lucide-react';

function GoogleIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect') || searchParams.get('callbackUrl') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Silakan isi alamat email dan kata sandi Anda.');
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
          result.error.message || 'Email atau kata sandi tidak cocok. Silakan coba lagi.'
        );
        setIsLoading(false);
        return;
      }

      setSuccessMessage('Login berhasil! Mengalihkan...');
      setTimeout(() => {
        router.push(redirectParam);
        router.refresh();
      }, 600);
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      setErrorMessage(errObj?.message || 'Terjadi kesalahan saat masuk. Silakan coba lagi.');
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsGoogleLoading(true);

    try {
      const result = await signIn.social({
        provider: 'google',
        callbackURL: redirectParam,
      });

      if (result?.error) {
        setErrorMessage(
          result.error.message || 'Gagal masuk dengan akun Google. Pastikan kredensial Google OAuth telah dikonfigurasi.'
        );
        setIsGoogleLoading(false);
      }
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      setErrorMessage(
        errObj?.message || 'Terjadi kesalahan koneksi saat login dengan Google.'
      );
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto py-6">
      {/* Card Form - Clay Block */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#FFE8D6] shadow-[0_16px_36px_rgba(255,159,67,0.14),inset_0_2px_4px_rgba(255,255,255,0.95)] relative overflow-hidden">
        {/* Decorative background bubbles */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#FFE8D6]/60 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-[#87CEEB]/25 rounded-full blur-2xl pointer-events-none" />

        <div className="relative">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF9F43] to-[#EE8A2B] text-white border-2 border-[#F38C26] shadow-[0_6px_14px_rgba(255,159,67,0.35)] mb-3">
              <Store className="w-7 h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-800 tracking-tight">
              Selamat Datang Kembali!
            </h1>
            <p className="text-xs sm:text-sm font-body font-medium text-slate-500 mt-1">
              Masuk ke akun NBusiness Anda untuk melanjutkan belanja
            </p>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2.5 font-heading font-bold">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-start gap-2.5 font-heading font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{successMessage}</div>
            </div>
          )}

          {/* Google OAuth Login Button */}
          <div className="mb-5">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading || isGoogleLoading}
              className="w-full py-3 px-4 rounded-2xl border-2 border-[#FFE8D6] bg-white hover:bg-[#FFF8F0] text-slate-700 font-heading font-bold text-xs sm:text-sm shadow-[0_4px_12px_rgba(255,159,67,0.08)] flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.99]"
            >
              {isGoogleLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                  <span>Menghubungkan ke Google...</span>
                </>
              ) : (
                <>
                  <GoogleIcon className="w-4 h-4" />
                  <span>Masuk dengan Google</span>
                </>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center mb-5">
            <div className="border-t-2 border-[#FFE8D6] w-full" />
            <span className="bg-white px-3 text-[11px] font-heading font-bold text-slate-400 uppercase tracking-wider">
              atau dengan email
            </span>
          </div>

          {/* Email & Password Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-heading font-bold text-slate-700 mb-1.5">
                Alamat Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4 text-[#FF9F43]" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  required
                  disabled={isLoading || isGoogleLoading}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border-2 border-[#FFE8D6] bg-[#FFF8F0] text-xs sm:text-sm font-body text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#FF9F43] transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-heading font-bold text-slate-700">
                  Kata Sandi
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4 text-[#FF9F43]" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi Anda"
                  required
                  disabled={isLoading || isGoogleLoading}
                  className="w-full pl-10 pr-10 py-2.5 rounded-2xl border-2 border-[#FFE8D6] bg-[#FFF8F0] text-xs sm:text-sm font-body text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#FF9F43] transition-all"
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
              disabled={isLoading || isGoogleLoading}
              className="w-full mt-3 clay-btn-orange py-3.5 px-4 text-xs sm:text-sm text-white font-heading font-black shadow-md cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  <span>Memproses Masuk...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  <span>Masuk ke Akun</span>
                </>
              )}
            </button>
          </form>

          {/* Footer link to Register */}
          <div className="mt-6 text-center text-xs font-body font-medium text-slate-500">
            <span>Belum memiliki akun NBusiness? </span>
            <Link
              href={
                redirectParam && redirectParam !== '/'
                  ? `/auth/register?redirect=${encodeURIComponent(redirectParam)}`
                  : '/auth/register'
              }
              className="font-heading font-bold text-[#D96B00] hover:text-[#FF9F43] underline transition-all"
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
        <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#FF9F43]" />
          <span className="text-xs font-heading font-bold">Memuat formulir masuk...</span>
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
