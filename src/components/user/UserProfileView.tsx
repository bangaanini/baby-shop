'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  MapPin,
  Package,
  ShieldCheck,
  Mail,
  Phone,
  Calendar,
  Edit3,
  Check,
  LogOut,
  Loader2,
  Shield,
  LogIn,
  AlertCircle,
} from 'lucide-react';
import { useSession, signOut } from '@/lib/auth-client';
import { MOCK_SAVED_ADDRESSES } from '@/data/mock-checkout';

export function UserProfileView() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const user = session?.user as
    | { id?: string; name?: string; email?: string; role?: string; phone?: string; image?: string }
    | undefined;

  const isAdmin = user?.role === 'admin';
  const [isEditing, setIsEditing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [toast, setToast] = useState(false);

  const [profile, setProfile] = useState({
    nama: 'Bunda Sarah Clarissa',
    email: 'sarah.clarissa@example.com',
    telepon: '0812-3456-7890',
    tanggalLahir: '14 Mei 1994',
    jumlahAnak: '2 Orang Anak (3 th & 6 bln)',
    memberSince: 'Januari 2025',
  });

  useEffect(() => {
    if (user) {
      setProfile((prev) => ({
        ...prev,
        nama: user.name || prev.nama,
        email: user.email || prev.email,
        telepon: user.phone || prev.telepon,
      }));
    }
  }, [user]);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      router.push('/auth/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/auth/login');
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isPending) {
    return (
      <div className="py-12 flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 text-rose-500 animate-spin mb-3" />
        <p className="text-xs text-slate-500 font-medium">Memuat profil akun Anda...</p>
      </div>
    );
  }

  return (
    <div className="py-4">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-700 text-xs sm:text-sm font-semibold">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Profil berhasil diperbarui!</span>
        </div>
      )}

      {/* Guest Notice if not logged in */}
      {!user && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              Anda saat ini belum masuk ke akun. Silakan masuk untuk mengakses data pesanan dan profil lengkap Anda.
            </span>
          </div>
          <Link
            href="/auth/login"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl flex items-center gap-1.5 transition-colors shrink-0"
          >
            <LogIn className="w-4 h-4" />
            <span>Masuk Akun</span>
          </Link>
        </div>
      )}

      {/* Header Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-xs mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 text-white font-black text-2xl flex items-center justify-center shadow-md shrink-0">
              {getInitials(profile.nama)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-800">{profile.nama}</h1>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                    isAdmin
                      ? 'bg-purple-100 text-purple-700 border border-purple-200'
                      : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {isAdmin ? '🛡️ Administrator Toko' : 'Member VIP'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {profile.email} • Bergabung sejak {profile.memberSince}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isAdmin && (
              <Link
                href="/admin"
                className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Panel Admin</span>
              </Link>
            )}
            <Link
              href="/user/pesanan"
              className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Package className="w-4 h-4" />
              <span>Status Pesanan</span>
            </Link>
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Edit3 className="w-4 h-4" />
              <span>{isEditing ? 'Batal Edit' : 'Ubah Data Diri'}</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="px-3.5 py-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {isLoggingOut ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              <span>{isLoggingOut ? 'Mengeluarkan...' : 'Keluar dari Akun'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs">
          <h2 className="text-base font-bold text-slate-800 pb-3 border-b border-slate-100 mb-6 flex items-center gap-2">
            <User className="w-4 h-4 text-rose-500" />
            <span>Informasi Akun {isAdmin ? 'Administrator' : 'Pembeli'}</span>
          </h2>

          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={profile.nama}
                  onChange={(e) => setProfile({ ...profile, nama: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-200"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Nomor Telepon / WhatsApp</label>
                  <input
                    type="text"
                    value={profile.telepon}
                    onChange={(e) => setProfile({ ...profile, telepon: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-200"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Informasi Buah Hati</label>
                <input
                  type="text"
                  value={profile.jumlahAnak}
                  onChange={(e) => setProfile({ ...profile, jumlahAnak: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-200"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-600">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Email Terdaftar:</span>
                  <strong className="text-slate-800 text-sm break-all">{profile.email}</strong>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Nomor WhatsApp:</span>
                  <strong className="text-slate-800 text-sm">{profile.telepon || '-'}</strong>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Peran Akun (Role):</span>
                  <strong className="text-slate-800 text-sm">
                    {isAdmin ? 'Administrator Toko' : 'Pembeli / Pelanggan'}
                  </strong>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Tanggal Lahir:</span>
                  <strong className="text-slate-800 text-sm">{profile.tanggalLahir}</strong>
                </div>
              </div>
              <div className="flex items-start gap-3 sm:col-span-2">
                <span className="text-base shrink-0">👶</span>
                <div>
                  <span className="text-slate-400 block text-[11px]">Data Anak:</span>
                  <strong className="text-slate-800 text-sm">{profile.jumlahAnak}</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Saved Addresses Summary */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-rose-500" />
              <span>Buku Alamat Tersimpan</span>
            </h3>
            <span className="text-xs font-bold text-rose-600">{MOCK_SAVED_ADDRESSES.length} Alamat</span>
          </div>

          <div className="space-y-3">
            {MOCK_SAVED_ADDRESSES.slice(0, 2).map((addr) => (
              <div key={addr.id} className="p-3 bg-slate-50 rounded-2xl text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <strong className="text-slate-800">{addr.labelAlamat}</strong>
                  {addr.isUtama && (
                    <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-md">
                      Utama
                    </span>
                  )}
                </div>
                <p className="text-slate-600 line-clamp-2">{addr.alamatLengkap}</p>
                <p className="text-[11px] text-slate-400">
                  {addr.kotaKabupaten}, {addr.provinsi}
                </p>
              </div>
            ))}
          </div>

          <Link
            href="/checkout"
            className="w-full mt-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl block text-center transition-colors"
          >
            Kelola Buku Alamat
          </Link>
        </div>
      </div>
    </div>
  );
}
