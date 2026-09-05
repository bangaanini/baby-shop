'use client';

import React, { useState, useMemo } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  LogOut,
  Smartphone,
  Mail,
  Laptop,
  Globe,
  Info,
  Check,
  X,
  Sparkles,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

export interface SecurityTabProps {
  user?: {
    email?: string;
    phone?: string;
    emailVerified?: boolean;
    name?: string;
  };
  onLogout?: () => void;
  isLoggingOut?: boolean;
}

interface PasswordStrength {
  score: number; // 0 - 4
  label: string;
  colorClass: string;
  barColor: string;
}

export function SecurityTab({
  user,
  onLogout,
  isLoggingOut = false,
}: SecurityTabProps) {
  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password Visibility Toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & Feedback States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    show: false,
    message: '',
    type: 'success',
  });

  // Calculate Password Strength
  const passwordStrength: PasswordStrength = useMemo(() => {
    if (!newPassword) {
      return {
        score: 0,
        label: 'Belum diisi',
        colorClass: 'text-slate-400',
        barColor: 'bg-slate-200',
      };
    }

    let score = 0;
    if (newPassword.length >= 8) score += 1;
    if (/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword)) score += 1;
    if (/\d/.test(newPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 1;

    switch (score) {
      case 1:
        return {
          score: 1,
          label: 'Sangat Lemah',
          colorClass: 'text-rose-500',
          barColor: 'bg-rose-500',
        };
      case 2:
        return {
          score: 2,
          label: 'Cukup',
          colorClass: 'text-amber-500',
          barColor: 'bg-amber-500',
        };
      case 3:
        return {
          score: 3,
          label: 'Kuat',
          colorClass: 'text-emerald-500',
          barColor: 'bg-emerald-500',
        };
      case 4:
        return {
          score: 4,
          label: 'Sangat Kuat',
          colorClass: 'text-emerald-600',
          barColor: 'bg-emerald-600',
        };
      default:
        return {
          score: 0,
          label: 'Sangat Lemah',
          colorClass: 'text-rose-400',
          barColor: 'bg-rose-400',
        };
    }
  }, [newPassword]);

  // Requirement checks
  const hasMinLength = newPassword.length >= 8;
  const hasMixedCase = /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword);
  const hasNumberOrSymbol = /[\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const showToastNotification = (
    message: string,
    type: 'success' | 'error' = 'success'
  ) => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4500);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Client-side validations
    if (!currentPassword) {
      setErrorMessage('Harap masukkan kata sandi saat ini');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage('Kata sandi baru minimal harus 8 karakter');
      return;
    }

    if (newPassword === currentPassword) {
      setErrorMessage('Kata sandi baru tidak boleh sama dengan kata sandi lama');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok dengan kata sandi baru');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const errorMsg = data.error || data.message || 'Gagal mengubah kata sandi';
        setErrorMessage(errorMsg);
        showToastNotification(errorMsg, 'error');
        return;
      }

      // Success
      const successMsg = data.message || 'Kata sandi akun Anda berhasil diperbarui!';
      setSuccessMessage(successMsg);
      showToastNotification(successMsg, 'success');

      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (err: any) {
      console.error('Error changing password:', err);
      const fallbackMsg = err.message || 'Terjadi kesalahan pada server. Coba lagi nanti.';
      setErrorMessage(fallbackMsg);
      showToastNotification(fallbackMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayEmail = user?.email || 'Belum terdaftar';
  const hasPhone = Boolean(user?.phone && user.phone.trim() && user.phone !== 'Belum diisi' && user.phone !== '-');
  const displayPhone = hasPhone ? user!.phone : 'Belum ditambahkan';
  const isEmailVerified = Boolean(user?.emailVerified);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs sm:text-sm font-semibold border ${
              toast.type === 'success'
                ? 'bg-slate-900 text-white border-emerald-500/40'
                : 'bg-rose-900 text-white border-rose-500/40'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span>{toast.message}</span>
            <button
              onClick={() => setToast((prev) => ({ ...prev, show: false }))}
              className="ml-2 text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header Section - Clay Block */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#FFE8D6] shadow-[0_10px_24px_-4px_rgba(255,159,67,0.12),inset_0_2px_4px_rgba(255,255,255,0.95)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF2E5] text-[#FF9F43] border-2 border-[#FFD4B2] flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-heading font-black text-slate-800">Keamanan Akun 🛡️</h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-heading font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Shield className="w-3 h-3 text-emerald-600" />
                  Terlindungi
                </span>
              </div>
              <p className="text-xs sm:text-sm font-body font-medium text-slate-500 mt-0.5">
                Kelola kata sandi dan pengaturan keamanan akun Anda untuk melindungi transaksi belanja
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Card 1: Ubah Kata Sandi (Password) Form - Clay Block */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#FFE8D6] shadow-[0_10px_24px_-4px_rgba(255,159,67,0.12),inset_0_2px_4px_rgba(255,255,255,0.95)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b-2 border-[#FFE8D6] mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#FFF2E5] text-[#FF9F43] flex items-center justify-center border border-[#FFD4B2]">
                  <KeyRound className="w-4 h-4 text-[#FF9F43]" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-heading font-black text-slate-800">
                    Ubah Kata Sandi (Password)
                  </h3>
                  <p className="text-[11px] font-body text-slate-500">
                    Gunakan kombinasi minimal 8 karakter dengan huruf dan angka
                  </p>
                </div>
              </div>
            </div>

            {/* Success Banner */}
            {successMessage && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-200 flex items-start gap-3 text-xs text-emerald-800 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-body font-semibold">
                  <p className="font-heading font-bold text-emerald-900">Kata Sandi Berhasil Diperbarui</p>
                  <p className="mt-0.5 text-emerald-700">{successMessage}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSuccessMessage(null)}
                  className="text-emerald-500 hover:text-emerald-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Error Banner */}
            {errorMessage && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 border-2 border-rose-200 flex items-start gap-3 text-xs text-rose-800 animate-in fade-in">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-body font-semibold">
                  <p className="font-heading font-bold text-rose-900">Gagal Memperbarui Kata Sandi</p>
                  <p className="mt-0.5 text-rose-700">{errorMessage}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setErrorMessage(null)}
                  className="text-rose-500 hover:text-rose-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-5">
              {/* Kata Sandi Lama */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Kata Sandi Saat Ini (Lama) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Masukkan kata sandi lama Anda"
                    required
                    className="w-full pl-10 pr-11 py-2.5 bg-slate-50/50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={showCurrentPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Kata Sandi Baru */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Kata Sandi Baru <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 8 karakter"
                    required
                    minLength={8}
                    className="w-full pl-10 pr-11 py-2.5 bg-slate-50/50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={showNewPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {newPassword && (
                  <div className="mt-2.5 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Kekuatan Sandi:</span>
                      <span className={`font-bold ${passwordStrength.colorClass}`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          passwordStrength.score >= 1 ? passwordStrength.barColor : 'bg-transparent'
                        }`}
                      />
                      <div
                        className={`h-full transition-all duration-300 ${
                          passwordStrength.score >= 2 ? passwordStrength.barColor : 'bg-transparent'
                        }`}
                      />
                      <div
                        className={`h-full transition-all duration-300 ${
                          passwordStrength.score >= 3 ? passwordStrength.barColor : 'bg-transparent'
                        }`}
                      />
                      <div
                        className={`h-full transition-all duration-300 ${
                          passwordStrength.score >= 4 ? passwordStrength.barColor : 'bg-transparent'
                        }`}
                      />
                    </div>
                  </div>
                )}

                {/* Validation checklist */}
                <div className="mt-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                  <div className="flex items-center gap-2 text-[11px]">
                    {hasMinLength ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
                    )}
                    <span className={hasMinLength ? 'text-emerald-700 font-medium' : 'text-slate-500'}>
                      Minimal 8 karakter
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    {hasMixedCase ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
                    )}
                    <span className={hasMixedCase ? 'text-emerald-700 font-medium' : 'text-slate-500'}>
                      Kombinasi huruf besar (A-Z) dan kecil (a-z)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    {hasNumberOrSymbol ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
                    )}
                    <span className={hasNumberOrSymbol ? 'text-emerald-700 font-medium' : 'text-slate-500'}>
                      Mengandung angka (0-9) atau karakter simbol (!@#$%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Konfirmasi Kata Sandi Baru */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Konfirmasi Kata Sandi Baru <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ketik ulang kata sandi baru"
                    required
                    className="w-full pl-10 pr-11 py-2.5 bg-slate-50/50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={showConfirmPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {confirmPassword && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-[11px]">
                    {passwordsMatch ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-medium">Kata sandi cocok</span>
                      </>
                    ) : (
                      <>
                        <X className="w-3.5 h-3.5 text-rose-500" />
                        <span className="text-rose-500 font-medium">
                          Konfirmasi kata sandi belum sama
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !currentPassword ||
                    newPassword.length < 8 ||
                    newPassword !== confirmPassword
                  }
                  className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan Sandi Baru...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Simpan Kata Sandi Baru</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Card 2: Pusat Keamanan & Autentikasi Akun */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs">
            <h3 className="text-sm sm:text-base font-bold text-slate-800 pb-3 border-b border-slate-100 mb-5 flex items-center gap-2">
              <Shield className="w-4 h-4 text-rose-500" />
              <span>Pusat Autentikasi Akun</span>
            </h3>

            <div className="space-y-4">
              {/* Status Email */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">
                      Email Utama
                    </span>
                    {isEmailVerified ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Terverifikasi
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        Belum Verifikasi
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 truncate mt-0.5">
                    {displayEmail}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Digunakan untuk notifikasi belanja dan pemulihan akun.
                  </p>
                </div>
              </div>

              {/* Status Nomor HP / WhatsApp */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">
                      Nomor HP / WhatsApp
                    </span>
                    {hasPhone ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                        <ShieldCheck className="w-3 h-3 text-blue-600" />
                        Terhubung
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600">
                        Belum Diisi
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 truncate mt-0.5">
                    {displayPhone}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {hasPhone
                      ? 'Digunakan untuk konfirmasi pesanan dan verifikasi pengiriman.'
                      : 'Tambahkan nomor WhatsApp Anda di tab Biodata Diri untuk memudahkan kurir.'}
                  </p>
                </div>
              </div>

              {/* Sesi Login Aktif */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Laptop className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">
                      Sesi Login Saat Ini
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Aktif Sekarang
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 mt-0.5">
                    Browser Aktif (Sesi Desktop / Mobile)
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    IP Terhubung • Terakhir aktif: Baru saja
                  </p>
                </div>
              </div>
            </div>

            {/* Logout Action */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-slate-700">Keluar dari Akun</p>
                  <p className="text-[11px] text-slate-500">
                    Akhiri sesi login Anda pada perangkat ini
                  </p>
                </div>
                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    disabled={isLoggingOut}
                    className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
                  >
                    {isLoggingOut ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <LogOut className="w-3.5 h-3.5" />
                    )}
                    <span>{isLoggingOut ? 'Sedang Keluar...' : 'Keluar Akun'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Security Best Practices Banner */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-rose-50/60 to-pink-50/30 border border-rose-100">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-xs space-y-1">
                <p className="font-bold text-slate-800">Tips Keamanan Akun</p>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Jangan pernah membagikan kata sandi atau kode verifikasi (OTP) kepada siapa pun,
                  termasuk pihak yang mengatasnamakan NBusiness.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
