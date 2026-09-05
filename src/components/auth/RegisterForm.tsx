'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signUp } from '@/lib/auth-client';
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
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

function RegisterFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect') || searchParams.get('callbackUrl') || '/';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleGoogleSignUp = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsGoogleLoading(true);

    try {
      const { signIn } = await import('@/lib/auth-client');
      const result = await signIn.social({
        provider: 'google',
        callbackURL: redirectParam,
      });

      if (result?.error) {
        setErrorMessage(
          result.error.message || 'Gagal mendaftar dengan akun Google. Pastikan kredensial Google OAuth telah dikonfigurasi.'
        );
        setIsGoogleLoading(false);
      }
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      setErrorMessage(
        errObj?.message || 'Terjadi kesalahan koneksi saat registrasi dengan Google.'
      );
      setIsGoogleLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Form Validations
    if (!name.trim()) {
      setErrorMessage('Silakan isi nama lengkap Anda.');
      return;
    }

    if (!email.trim()) {
      setErrorMessage('Silakan isi alamat email Anda.');
      return;
    }

    if (!phone.trim()) {
      setErrorMessage('Silakan isi nomor WhatsApp aktif Anda.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Kata sandi harus minimal 8 karakter.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok. Silakan periksa kembali.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await signUp.email({
        name: name.trim(),
        email: email.trim(),
        password: password,
        phone: phone.trim(),
      } as any);

      if (result?.error) {
        setErrorMessage(
          result.error.message || 'Pendaftaran gagal. Alamat email mungkin sudah terdaftar.'
        );
        setIsLoading(false);
        return;
      }

      setSuccessMessage('Pendaftaran berhasil! Mengalihkan ke akun Anda...');
      setTimeout(() => {
        router.push(redirectParam);
        router.refresh();
      }, 1000);
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      setErrorMessage(
        errObj?.message || 'Terjadi kesalahan saat mendaftar. Silakan coba lagi.'
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto py-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#FFE8D6] shadow-[0_16px_36px_rgba(255,159,67,0.14),inset_0_2px_4px_rgba(255,255,255,0.95)] relative overflow-hidden">
        {/* Decorative ambient blur */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#FFE8D6]/60 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-[#87CEEB]/25 rounded-full blur-2xl pointer-events-none" />

        <div className="relative">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF9F43] to-[#EE8A2B] text-white border-2 border-[#F38C26] shadow-[0_6px_14px_rgba(255,159,67,0.35)] mb-3">
              <Store className="w-7 h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-800 tracking-tight">
              Daftar Akun Baru
            </h1>
            <p className="text-xs sm:text-sm font-body font-medium text-slate-500 mt-1">
              Bergabung bersama ribuan Bunda & Ayah hebat di NBusiness
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

          {/* Google OAuth Register Button */}
          <div className="mb-5">
            <button
              type="button"
              onClick={handleGoogleSignUp}
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
                  <span>Daftar dengan Google</span>
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

          {/* Registration Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-heading font-bold text-slate-700 mb-1.5">
                Nama Lengkap Bunda / Ayah <span className="text-[#FF9F43]">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4 text-[#FF9F43]" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Bunda Sarah Clarissa"
                  required
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border-2 border-[#FFE8D6] bg-[#FFF8F0] text-xs sm:text-sm font-body text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#FF9F43] transition-all"
                />
              </div>
            </div>

            {/* Email & Phone Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-heading font-bold text-slate-700 mb-1.5">
                  Email <span className="text-[#FF9F43]">*</span>
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
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border-2 border-[#FFE8D6] bg-[#FFF8F0] text-xs sm:text-sm font-body text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#FF9F43] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-heading font-bold text-slate-700 mb-1.5">
                  No. WhatsApp <span className="text-[#FF9F43]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4 text-[#FF9F43]" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0812-3456-7890"
                    required
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border-2 border-[#FFE8D6] bg-[#FFF8F0] text-xs sm:text-sm font-body text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#FF9F43] transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Password & Confirm Password Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-heading font-bold text-slate-700 mb-1.5">
                  Kata Sandi <span className="text-[#FF9F43]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4 text-[#FF9F43]" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 karakter"
                    required
                    disabled={isLoading}
                    className="w-full pl-10 pr-10 py-2.5 rounded-2xl border-2 border-[#FFE8D6] bg-[#FFF8F0] text-xs sm:text-sm font-body text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#FF9F43] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-heading font-bold text-slate-700 mb-1.5">
                  Konfirmasi Sandi <span className="text-[#FF9F43]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4 text-[#FF9F43]" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi"
                    required
                    disabled={isLoading}
                    className="w-full pl-10 pr-10 py-2.5 rounded-2xl border-2 border-[#FFE8D6] bg-[#FFF8F0] text-xs sm:text-sm font-body text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#FF9F43] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Terms & Conditions Notice */}
            <p className="text-[11px] font-body text-slate-500 leading-relaxed pt-1">
              Dengan mendaftar, Anda menyetujui{' '}
              <span className="text-[#D96B00] font-heading font-bold">Syarat & Ketentuan</span> serta{' '}
              <span className="text-[#D96B00] font-heading font-bold">Kebijakan Privasi</span> NBusiness Store.
            </p>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-3 clay-btn-orange py-3.5 px-4 text-xs sm:text-sm text-white font-heading font-black shadow-md cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  <span>Memproses Pendaftaran...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  <span>Daftar Akun Sekarang</span>
                </>
              )}
            </button>
          </form>

          {/* Footer link to Login */}
          <div className="mt-6 text-center text-xs font-body font-medium text-slate-500">
            <span>Sudah memiliki akun NBusiness? </span>
            <Link
              href={
                redirectParam && redirectParam !== '/'
                  ? `/auth/login?redirect=${encodeURIComponent(redirectParam)}`
                  : '/auth/login'
              }
              className="font-heading font-bold text-[#D96B00] hover:text-[#FF9F43] underline transition-all"
            >
              Masuk di Sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RegisterForm() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-lg mx-auto p-8 bg-white rounded-3xl border-2 border-[#FFE8D6] flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-[#FF9F43] animate-spin mb-2" />
          <p className="text-xs font-heading font-bold text-slate-500">Memuat formulir pendaftaran...</p>
        </div>
      }
    >
      <RegisterFormContent />
    </Suspense>
  );
}
