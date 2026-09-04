'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Camera,
  Upload,
  ShieldCheck,
  CheckCircle2,
  Baby,
  Sparkles,
  AlertCircle,
  Loader2,
  Check,
  X,
  Edit3,
} from 'lucide-react';

export interface UserProfileData {
  id?: string;
  name?: string;
  email?: string;
  phone?: string | null;
  image?: string | null;
  birthDate?: string | null;
  gender?: 'female' | 'male' | string | null;
  childrenInfo?: string | null;
  emailVerified?: boolean;
  memberSince?: string;
  role?: string;
}

export interface BiodataTabProps {
  initialProfile?: UserProfileData;
  user?: {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
    image?: string;
    role?: string;
  };
  onProfileUpdated?: (updated: UserProfileData) => void;
  userId?: string;
}

export function BiodataTab({
  initialProfile,
  user,
  onProfileUpdated,
  userId: propUserId,
}: BiodataTabProps) {
  const userId = propUserId || user?.id;
  const initialData = initialProfile || (user ? {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    image: user.image,
    role: user.role,
  } : undefined);

  // Profile form state
  const [profile, setProfile] = useState<UserProfileData>({
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    image: initialData?.image || null,
    birthDate: initialData?.birthDate || '',
    gender: (initialData?.gender as 'female' | 'male') || '',
    childrenInfo: initialData?.childrenInfo || '',
    emailVerified: initialData?.emailVerified ?? false,
    memberSince: initialData?.memberSince || 'Baru Saja',
    role: initialData?.role || 'buyer',
  });

  // Original snapshot for reset / cancellation
  const [originalProfile, setOriginalProfile] = useState<UserProfileData>(profile);

  // UI States
  const [isLoading, setIsLoading] = useState(!initialProfile && !user);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    show: false,
    message: '',
    type: 'success',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync with initialProfile or user when prop changes
  useEffect(() => {
    if (initialProfile || user) {
      const source = initialProfile || user;
      const merged: UserProfileData = {
        id: source?.id,
        name: source?.name || '',
        email: source?.email || '',
        phone: source?.phone || '',
        image: source?.image || null,
        birthDate: (source as UserProfileData)?.birthDate || '',
        gender: ((source as UserProfileData)?.gender as 'female' | 'male') || '',
        childrenInfo: (source as UserProfileData)?.childrenInfo || '',
        emailVerified: (source as UserProfileData)?.emailVerified ?? false,
        memberSince: (source as UserProfileData)?.memberSince || 'Baru Saja',
        role: source?.role || 'buyer',
      };
      setProfile(merged);
      setOriginalProfile(merged);
      setIsLoading(false);
    } else {
      fetchUserProfile();
    }
  }, [initialProfile, user]);

  // Fetch from API if no initialProfile provided
  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const url = userId ? `/api/user/profile?userId=${encodeURIComponent(userId)}` : '/api/user/profile';
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        const fetched: UserProfileData = {
          id: json.data.id,
          name: json.data.name || '',
          email: json.data.email || '',
          phone: json.data.phone || '',
          image: json.data.image || null,
          birthDate: json.data.birthDate || '',
          gender: json.data.gender || 'female',
          childrenInfo: json.data.childrenInfo || '',
          emailVerified: json.data.emailVerified ?? true,
          memberSince: json.data.memberSince || 'Januari 2025',
          role: json.data.role || 'buyer',
        };
        setProfile(fetched);
        setOriginalProfile(fetched);
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  const getInitials = (name?: string) => {
    if (!name) return 'NB';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Handle Photo Upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation: Allowed MIME types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showToast('Format gambar harus JPG, PNG, atau WEBP', 'error');
      return;
    }

    // Validation: Size Max 2MB (2,000,000 bytes)
    const MAX_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      showToast(`Ukuran foto melebihi 2MB (${(file.size / (1024 * 1024)).toFixed(2)}MB)`, 'error');
      return;
    }

    setIsUploading(true);

    try {
      // Try uploading to server upload route
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.url) {
          setProfile((prev) => ({ ...prev, image: data.url }));
          showToast('Foto profil berhasil diunggah');
          setIsUploading(false);
          return;
        }
      }

      // Fallback: Read as Base64 Data URL for local preview & persistence
      const reader = new FileReader();
      reader.onload = () => {
        const base64Url = reader.result as string;
        setProfile((prev) => ({ ...prev, image: base64Url }));
        showToast('Foto profil berhasil diperbarui');
        setIsUploading(false);
      };
      reader.onerror = () => {
        showToast('Gagal memproses gambar', 'error');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error('Error uploading photo:', err);
      // Fallback to FileReader
      const reader = new FileReader();
      reader.onload = () => {
        const base64Url = reader.result as string;
        setProfile((prev) => ({ ...prev, image: base64Url }));
        showToast('Foto profil berhasil diperbarui');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile.name || profile.name.trim().length < 2) {
      showToast('Nama lengkap minimal 2 karakter', 'error');
      return;
    }

    setIsSaving(true);

    try {
      const payload: Record<string, any> = {
        name: profile.name.trim(),
        phone: profile.phone?.trim() || null,
        image: profile.image || null,
        birthDate: profile.birthDate?.trim() || null,
        gender: profile.gender || null,
        childrenInfo: profile.childrenInfo?.trim() || null,
      };

      if (userId) {
        payload.userId = userId;
      }

      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal menyimpan perubahan profil');
      }

      const updated = {
        ...profile,
        ...(json.data || {}),
      };

      setProfile(updated);
      setOriginalProfile(updated);
      showToast('Biodata diri berhasil disimpan!');
      if (onProfileUpdated) {
        onProfileUpdated(updated);
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      showToast(error.message || 'Terjadi kesalahan saat menyimpan profil', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Cancel / Reset
  const handleReset = () => {
    setProfile(originalProfile);
    showToast('Perubahan dibatalkan');
  };

  const hasChanges = JSON.stringify(profile) !== JSON.stringify(originalProfile);

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xs flex flex-col items-center justify-center min-h-[360px]">
        <Loader2 className="w-8 h-8 text-rose-500 animate-spin mb-3" />
        <p className="text-xs text-slate-500 font-medium">Memuat data biodata diri...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 border text-xs sm:text-sm font-semibold transition-all transform animate-in fade-in slide-in-from-bottom-5 ${
            toast.type === 'success'
              ? 'bg-slate-900 text-white border-slate-800'
              : 'bg-red-600 text-white border-red-700'
          }`}
        >
          {toast.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-white shrink-0" />
          )}
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast((prev) => ({ ...prev, show: false }))}
            className="ml-2 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Biodata Diri Container */}
      <div className="bg-white rounded-3xl border border-rose-100/80 shadow-xs overflow-hidden">
        {/* Header Tokopedia Style */}
        <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-slate-100 bg-gradient-to-r from-rose-50/40 via-pink-50/20 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-xs shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                Biodata Diri
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Kelola informasi profil Anda untuk mengontrol, melindungi dan mengamankan akun
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* Left Column: Avatar & Photo Management (4 Cols) */}
            <div className="lg:col-span-4 flex flex-col items-center text-center">
              <div className="w-full max-w-xs p-6 rounded-3xl bg-slate-50/80 border border-slate-200/80 flex flex-col items-center">
                {/* Avatar Preview */}
                <div className="relative group mb-4">
                  {profile.image ? (
                    <img
                      src={profile.image}
                      alt={profile.name || 'User Avatar'}
                      className="w-36 h-36 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-white shadow-md"
                    />
                  ) : (
                    <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-full bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-500 text-white font-black text-4xl sm:text-5xl flex items-center justify-center border-4 border-white shadow-md">
                      {getInitials(profile.name)}
                    </div>
                  )}

                  {/* Upload Overlay Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="absolute bottom-1 right-1 w-10 h-10 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-lg border-2 border-white transition-all transform hover:scale-105 cursor-pointer disabled:opacity-75"
                    title="Ubah Foto Profil"
                  >
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Choose Photo Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold border border-slate-300 shadow-xs hover:border-rose-300 hover:text-rose-600 transition-all flex items-center justify-center gap-2 mb-4 cursor-pointer disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
                      <span>Mengunggah Foto...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Pilih Foto</span>
                    </>
                  )}
                </button>

                {/* File Rules Card */}
                <div className="text-left space-y-1.5 text-[11px] text-slate-500 leading-relaxed bg-white p-3.5 rounded-2xl border border-slate-200/70 w-full">
                  <p className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-rose-500" />
                    <span>Petunjuk Foto Profil:</span>
                  </p>
                  <p>• Besar file: maksimum 2.000.000 bytes (2MB).</p>
                  <p>• Ekstensi file yang diperbolehkan: .JPG, .JPEG, .PNG, .WEBP</p>
                </div>

                {/* Account Status Badge */}
                <div className="mt-4 pt-3 border-t border-slate-200/70 w-full flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Status Akun</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Terverifikasi</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Main Biodata Form (8 Cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Section 1: Ubah Biodata Diri */}
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-rose-600 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span>Ubah Biodata Diri</span>
                </h2>

                <div className="space-y-4">
                  {/* Nama Lengkap */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-center">
                    <label className="text-xs font-semibold text-slate-600">
                      Nama Lengkap <span className="text-rose-500">*</span>
                    </label>
                    <div className="sm:col-span-2">
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={profile.name || ''}
                          onChange={(e) =>
                            setProfile((prev) => ({ ...prev, name: e.target.value }))
                          }
                          placeholder="Masukkan nama lengkap Anda"
                          className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-all font-medium text-slate-800"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tanggal Lahir */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-center">
                    <label className="text-xs font-semibold text-slate-600">
                      Tanggal Lahir
                    </label>
                    <div className="sm:col-span-2">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <input
                          type="date"
                          value={profile.birthDate || ''}
                          onChange={(e) =>
                            setProfile((prev) => ({ ...prev, birthDate: e.target.value }))
                          }
                          className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-all font-medium text-slate-800"
                        />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Digunakan untuk memberikan penawaran khusus dan kejutan hari ulang tahun
                      </p>
                    </div>
                  </div>

                  {/* Jenis Kelamin */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-center">
                    <label className="text-xs font-semibold text-slate-600">
                      Jenis Kelamin
                    </label>
                    <div className="sm:col-span-2 flex items-center gap-4">
                      <label
                        className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border cursor-pointer transition-all hover:bg-rose-50/50 text-xs font-semibold select-none ${
                          profile.gender === 'female'
                            ? 'border-rose-500 bg-rose-50/60 text-rose-700 shadow-xs'
                            : 'border-slate-200 bg-white text-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="gender"
                          value="female"
                          checked={profile.gender === 'female'}
                          onChange={() =>
                            setProfile((prev) => ({ ...prev, gender: 'female' }))
                          }
                          className="accent-rose-500 w-3.5 h-3.5"
                        />
                        <span>Wanita</span>
                      </label>

                      <label
                        className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border cursor-pointer transition-all hover:bg-rose-50/50 text-xs font-semibold select-none ${
                          profile.gender === 'male'
                            ? 'border-rose-500 bg-rose-50/60 text-rose-700 shadow-xs'
                            : 'border-slate-200 bg-white text-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="gender"
                          value="male"
                          checked={profile.gender === 'male'}
                          onChange={() =>
                            setProfile((prev) => ({ ...prev, gender: 'male' }))
                          }
                          className="accent-rose-500 w-3.5 h-3.5"
                        />
                        <span>Pria</span>
                      </label>
                    </div>
                  </div>

                  {/* Data Buah Hati / Anak */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-start">
                    <div className="pt-2">
                      <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                        <Baby className="w-3.5 h-3.5 text-rose-500" />
                        <span>Data Buah Hati / Anak</span>
                      </label>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Opsional
                      </span>
                    </div>
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        value={profile.childrenInfo || ''}
                        onChange={(e) =>
                          setProfile((prev) => ({ ...prev, childrenInfo: e.target.value }))
                        }
                        placeholder="cth. 2 Orang Anak (3 th & 6 bln)"
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-all font-medium text-slate-800"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">
                        Membantu NBusiness merekomendasikan ukuran pakaian & produk bayi yang sesuai
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Ubah Kontak Tokopedia Style */}
              <div className="pt-6 border-t border-slate-100">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-rose-600 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span>Ubah Kontak</span>
                </h2>

                <div className="space-y-4">
                  {/* Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-center">
                    <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>Email</span>
                    </label>
                    <div className="sm:col-span-2 flex items-center justify-between gap-3 p-3 bg-slate-50/80 rounded-xl border border-slate-200">
                      <span className="text-xs sm:text-sm font-semibold text-slate-800 truncate">
                        {profile.email || 'Belum ada email'}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100/80 text-emerald-800 font-bold text-[10px] shrink-0 border border-emerald-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Terverifikasi</span>
                      </span>
                    </div>
                  </div>

                  {/* Nomor HP / WhatsApp */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-center">
                    <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>Nomor HP / WhatsApp</span>
                    </label>
                    <div className="sm:col-span-2">
                      <div className="relative">
                        <input
                          type="tel"
                          value={profile.phone || ''}
                          onChange={(e) =>
                            setProfile((prev) => ({ ...prev, phone: e.target.value }))
                          }
                          placeholder="cth. 081234567890"
                          className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-all font-medium text-slate-800"
                        />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Digunakan untuk konfirmasi pesanan dan notifikasi pengiriman kurir
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={!hasChanges || isSaving}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full sm:w-auto px-8 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs sm:text-sm font-bold shadow-md shadow-rose-200 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Simpan Perubahan</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
