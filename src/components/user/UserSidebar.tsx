'use client';

import React from 'react';
import Link from 'next/link';
import {
  User,
  MapPin,
  ShoppingBag,
  Heart,
  ShieldCheck,
  LogOut,
  Store,
  Loader2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export type UserAccountTab = 'biodata' | 'alamat' | 'transaksi' | 'favorit' | 'keamanan';

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
  const displayName = user?.name || 'Pengguna NBusiness';
  const displayEmail = user?.email || '';
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
      id: 'favorit',
      label: 'Produk Favorit',
      description: 'Daftar produk yang Anda sukai',
      icon: Heart,
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
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-heading font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'clay-btn-orange text-white'
                  : 'bg-white text-slate-700 hover:bg-[#FFF8F0] border-2 border-[#FFE8D6]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#FF9F43]'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
        {isAdmin && (
          <Link
            href="/admin"
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-heading font-bold whitespace-nowrap bg-purple-50 text-purple-700 hover:bg-purple-100 border-2 border-purple-200 transition-all shrink-0"
          >
            <Store className="w-3.5 h-3.5 text-purple-600" />
            <span>Admin Toko</span>
          </Link>
        )}
      </div>

      {/* Profile Header Card - Clay Block */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-[#FFE8D6] shadow-[0_10px_24px_-4px_rgba(255,159,67,0.12),inset_0_2px_4px_rgba(255,255,255,0.95)]">
        <div className="flex items-center gap-4">
          {user?.image ? (
            <img
              src={user.image}
              alt={displayName}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-[#FF9F43] shadow-[0_4px_12px_rgba(255,159,67,0.25)] shrink-0"
            />
          ) : (
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-[#87CEEB] via-[#FFAF60] to-[#FF9F43] text-white font-heading font-black text-xl sm:text-2xl flex items-center justify-center border-2 border-white shadow-[0_6px_14px_rgba(255,159,67,0.3)] shrink-0">
              {getInitials(displayName)}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap mb-1">
              <h2 className="text-base sm:text-lg font-heading font-black text-slate-900 truncate" title={displayName}>
                {displayName}
              </h2>
            </div>
            {displayEmail && (
              <p className="text-xs font-body text-slate-500 truncate mb-2" title={displayEmail}>
                {displayEmail}
              </p>
            )}
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-heading font-bold">
              {isAdmin ? (
                <span className="bg-purple-100 text-purple-800 border border-purple-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                  <span>Administrator Toko</span>
                </span>
              ) : (
                <span className="clay-badge-orange text-[10px] px-2.5 py-0.5 inline-flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-[#FF9F43]" />
                  <span>Akun Pembeli</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Quick Actions: Admin Dashboard & Logout (< md) */}
        <div className="md:hidden mt-4 pt-3.5 border-t border-[#FFE8D6] flex flex-col gap-2">
          {isAdmin && (
            <Link
              href="/admin"
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl bg-purple-100/90 text-purple-900 border border-purple-300 font-heading font-bold text-xs shadow-2xs transition-colors hover:bg-purple-200"
            >
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-purple-700" />
                <span>Buka Panel Dashboard Admin Toko</span>
              </div>
              <ChevronRight className="w-4 h-4 text-purple-600" />
            </Link>
          )}

          <button
            type="button"
            onClick={onLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-heading font-bold text-xs transition-colors disabled:opacity-60 cursor-pointer"
          >
            {isLoggingOut ? (
              <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
            ) : (
              <LogOut className="w-4 h-4 text-rose-600" />
            )}
            <span>{isLoggingOut ? 'Sedang Keluar...' : 'Keluar dari Akun (Logout)'}</span>
          </button>
        </div>
      </div>

      {/* Menu Navigasi Desktop - Clay Block */}
      <div className="hidden md:flex flex-col bg-white rounded-3xl p-3.5 border-2 border-[#FFE8D6] shadow-[0_10px_24px_-4px_rgba(255,159,67,0.12),inset_0_2px_4px_rgba(255,255,255,0.95)] divide-y-2 divide-[#FFE8D6]">
        <div className="py-1 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#FFF2E5] text-[#D96B00] font-heading font-bold border-2 border-[#FFD4B2] shadow-[0_4px_10px_rgba(255,159,67,0.15)]'
                    : 'text-slate-700 hover:bg-[#FFF8F0] hover:text-[#D96B00] font-body font-semibold'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                      isActive
                        ? 'bg-[#FF9F43] text-white shadow-xs'
                        : 'bg-[#FFF8F0] text-[#FF9F43]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm ${isActive ? 'font-heading font-black text-[#D96B00]' : 'font-heading font-bold text-slate-800'}`}>
                      {item.label}
                    </p>
                    <p className="text-[11px] font-body text-slate-500 truncate">{item.description}</p>
                  </div>
                </div>
                <ChevronRight
                  className={`w-4 h-4 shrink-0 transition-transform ${
                    isActive ? 'text-[#FF9F43] translate-x-0.5' : 'text-slate-400'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Panel Admin Toko (Conditional) */}
        {isAdmin && (
          <div className="pt-2.5 pb-1">
            <Link
              href="/admin"
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-purple-50/80 hover:bg-purple-100 text-purple-900 border-2 border-purple-200 transition-all group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs shrink-0">
                  <Store className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-heading font-black text-purple-950">Panel Admin Toko</p>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-heading font-black bg-purple-200 text-purple-800">
                      Seller
                    </span>
                  </div>
                  <p className="text-[11px] font-body text-purple-700 truncate">Kelola produk, stok & pesanan</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-purple-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </Link>
          </div>
        )}

        {/* Tombol Logout */}
        <div className="pt-2.5">
          <button
            onClick={onLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-between p-3 rounded-2xl text-rose-600 hover:bg-rose-50 transition-all font-heading font-bold group disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 group-hover:bg-rose-100 flex items-center justify-center transition-colors shrink-0">
                {isLoggingOut ? (
                  <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
              </div>
              <div className="text-left">
                <p className="text-sm font-heading font-bold text-rose-700">
                  {isLoggingOut ? 'Sedang Keluar...' : 'Keluar dari Akun'}
                </p>
                <p className="text-[11px] font-body text-slate-500">Akhiri sesi login Anda</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-rose-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
