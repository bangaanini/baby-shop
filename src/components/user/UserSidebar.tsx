'use client';

import React from 'react';
import Link from 'next/link';
import {
  User,
  MapPin,
  ShoppingBag,
  ShieldCheck,
  LogOut,
  Store,
  Ticket,
  Loader2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export type UserAccountTab = 'biodata' | 'alamat' | 'transaksi' | 'keamanan';

export interface UserSidebarProps {
  activeTab: UserAccountTab;
  onTabChange: (tab: UserAccountTab) => void;
  user?: {
    name?: string;
    email?: string;
    role?: string;
    image?: string;
  };
  onLogout: () => void;
  isLoggingOut?: boolean;
}

export function UserSidebar({
  activeTab,
  onTabChange,
  user,
  onLogout,
  isLoggingOut = false,
}: UserSidebarProps) {
  const displayName = user?.name || 'Bunda Sarah Clarissa';
  const displayEmail = user?.email || 'sarah.clarissa@example.com';
  const isAdmin = user?.role === 'admin';

  const getInitials = (name?: string) => {
    if (!name) return 'NB';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const menuItems: Array<{
    id: UserAccountTab;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    {
      id: 'biodata',
      label: 'Biodata Diri',
      description: 'Profil, kontak & data keluarga',
      icon: User,
    },
    {
      id: 'alamat',
      label: 'Daftar Alamat',
      description: 'Alamat pengiriman & penerima',
      icon: MapPin,
    },
    {
      id: 'transaksi',
      label: 'Daftar Transaksi',
      description: 'Riwayat belanja & lacak pesanan',
      icon: ShoppingBag,
    },
    {
      id: 'keamanan',
      label: 'Keamanan Akun',
      description: 'Kata sandi & perlindungan login',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Mobile Horizontal Pill Navigation (< md) */}
      <div className="md:hidden w-full overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none flex items-center gap-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                isActive
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-200'
                  : 'bg-white text-slate-700 hover:bg-rose-50 hover:text-rose-600 border border-slate-200'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
        {isAdmin && (
          <Link
            href="/admin"
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-all shrink-0"
          >
            <Store className="w-3.5 h-3.5 text-purple-600" />
            <span>Admin Toko</span>
          </Link>
        )}
      </div>

      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-rose-100 shadow-xs">
        <div className="flex items-center gap-4">
          {user?.image ? (
            <img
              src={user.image}
              alt={displayName}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-rose-200 shadow-sm shrink-0"
            />
          ) : (
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-500 text-white font-black text-xl sm:text-2xl flex items-center justify-center shadow-md shrink-0">
              {getInitials(displayName)}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap mb-1">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate" title={displayName}>
                {displayName}
              </h2>
            </div>
            <p className="text-xs text-slate-500 truncate mb-2" title={displayEmail}>
              {displayEmail}
            </p>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200/80 text-[11px] font-semibold text-amber-800">
              <Sparkles className="w-3 h-3 text-amber-600 fill-amber-500" />
              <span>Member VIP NBusiness</span>
            </div>
          </div>
        </div>

        {/* Small Loyalty / Voucher Snippet */}
        <div className="mt-4 pt-3.5 border-t border-rose-50 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-700 font-medium truncate">
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <Ticket className="w-4 h-4" />
            </div>
            <span className="truncate">3 Voucher Toko Siap Pakai</span>
          </div>
          <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md shrink-0">
            Gunakan
          </span>
        </div>
      </div>

      {/* Menu Navigasi Desktop (hidden on mobile, visible on md+) */}
      <div className="hidden md:flex flex-col bg-white rounded-3xl p-3 border border-rose-100 shadow-xs divide-y divide-slate-100">
        <div className="py-1 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-rose-50 to-pink-50 text-rose-700 font-bold border border-rose-200/60 shadow-xs'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                      isActive
                        ? 'bg-rose-500 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 group-hover:bg-rose-100 group-hover:text-rose-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm ${isActive ? 'font-bold text-rose-900' : 'text-slate-800'}`}>
                      {item.label}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">{item.description}</p>
                  </div>
                </div>
                <ChevronRight
                  className={`w-4 h-4 shrink-0 transition-transform ${
                    isActive ? 'text-rose-600 translate-x-0.5' : 'text-slate-400'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Panel Admin Toko (Conditional) */}
        {isAdmin && (
          <div className="pt-2 pb-1">
            <Link
              href="/admin"
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-purple-50/70 hover:bg-purple-100/80 text-purple-900 border border-purple-200/60 transition-all group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs shrink-0">
                  <Store className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold text-purple-950">Panel Admin Toko</p>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-purple-200 text-purple-800">
                      Seller
                    </span>
                  </div>
                  <p className="text-[11px] text-purple-700 truncate">Kelola produk, stok & pesanan</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-purple-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </Link>
          </div>
        )}

        {/* Tombol Logout */}
        <div className="pt-2">
          <button
            onClick={onLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-between p-3 rounded-2xl text-slate-600 hover:text-red-600 hover:bg-red-50/80 transition-all font-medium group disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 group-hover:bg-red-100 group-hover:text-red-600 flex items-center justify-center transition-colors shrink-0">
                {isLoggingOut ? (
                  <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-700 group-hover:text-red-700">
                  {isLoggingOut ? 'Sedang Keluar...' : 'Keluar dari Akun'}
                </p>
                <p className="text-[11px] text-slate-500 group-hover:text-red-500">Akhiri sesi login Anda</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-red-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
