'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ListFilter,
  ShoppingBag,
  TrendingUp,
  Settings,
  Store,
  LogOut,
  X,
  ExternalLink,
  ShieldCheck,
  ChevronDown,
  Loader2,
  Zap,
} from 'lucide-react';
import { useSession, signOut } from '@/lib/auth-client';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isProductRoute = pathname.startsWith('/admin/produk');
  const [productMenuOpen, setProductMenuOpen] = useState(true);

  // Auto-expand product submenu if on a product route
  useEffect(() => {
    if (isProductRoute) {
      setProductMenuOpen(true);
    }
  }, [isProductRoute]);

  const { data: session } = useSession();
  const user = session?.user as
    | { id?: string; name?: string; email?: string; role?: string; phone?: string; image?: string }
    | undefined;

  const displayName = user?.name || 'Admin NBusiness';
  const userEmail = user?.email || 'admin@babyshop.id';

  const getInitials = (name?: string) => {
    if (!name) return 'AD';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      if (typeof document !== 'undefined') {
        document.cookie = 'cart_id=; path=/; max-age=0';
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cart-updated'));
      }
      router.push('/auth/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      if (typeof document !== 'undefined') {
        document.cookie = 'cart_id=; path=/; max-age=0';
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cart-updated'));
      }
      router.push('/auth/login');
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isDashboardActive = pathname === '/admin';
  const isTambahProdukActive = pathname === '/admin/produk/tambah';
  const isDaftarProdukActive =
    pathname === '/admin/produk' || (pathname.startsWith('/admin/produk/') && !isTambahProdukActive);
  const isPesananActive = pathname.startsWith('/admin/pesanan');
  const isFlashSaleActive = pathname.startsWith('/admin/flash-sale');
  const isStatistikActive = pathname.startsWith('/admin/statistik');
  const isSettingActive = pathname.startsWith('/admin/setting');

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-3 group" onClick={onClose}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF9F43] to-[#EE8A2B] text-white flex items-center justify-center font-heading font-black text-xl shadow-lg shadow-[#FF9F43]/25 border border-[#F38C26] group-hover:scale-105 transition-transform">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-heading font-black text-white tracking-tight">NBusiness</span>
              <span className="text-[10px] bg-[#FF9F43]/20 text-[#FF9F43] font-heading font-black px-1.5 py-0.5 rounded border border-[#FF9F43]/30">
                SELLER
              </span>
            </div>
            <p className="text-[11px] font-body text-slate-400 font-medium">NBusiness Seller Center</p>
          </div>
        </Link>
        {/* Mobile close button */}
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 md:hidden transition-colors"
          aria-label="Tutup Menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-heading font-bold uppercase tracking-wider text-slate-400">
          Menu Utama
        </div>

        {/* 1. Dashboard */}
        <Link
          href="/admin"
          onClick={onClose}
          className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-heading font-bold transition-all group ${
            isDashboardActive
              ? 'clay-btn-orange text-white shadow-md font-black'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <LayoutDashboard
              className={`w-4 h-4 transition-colors ${
                isDashboardActive ? 'text-white' : 'text-slate-400 group-hover:text-[#FF9F43]'
              }`}
            />
            <span>Dashboard</span>
          </div>
        </Link>

        {/* 2. Produk (Expandable Sub-Menu) */}
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setProductMenuOpen(!productMenuOpen)}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-heading font-bold transition-all group ${
              isProductRoute
                ? 'text-white bg-slate-800/70 font-bold'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Package
                className={`w-4 h-4 transition-colors ${
                  isProductRoute ? 'text-[#FF9F43]' : 'text-slate-400 group-hover:text-[#FF9F43]'
                }`}
              />
              <span>Produk</span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                productMenuOpen ? 'rotate-180 text-white' : ''
              }`}
            />
          </button>

          {/* Sub-menu items */}
          {productMenuOpen && (
            <div className="pl-3 ml-3 border-l border-slate-800 space-y-1 pt-1 pb-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
              {/* Tambah Produk */}
              <Link
                href="/admin/produk/tambah"
                onClick={onClose}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-heading font-bold transition-all ${
                  isTambahProdukActive
                    ? 'bg-[#FFF2E5] text-[#D96B00] font-black border border-[#FFD4B2]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <PlusCircle
                  className={`w-3.5 h-3.5 ${
                    isTambahProdukActive ? 'text-[#D96B00]' : 'text-slate-400'
                  }`}
                />
                <span>Tambah Produk</span>
              </Link>

              {/* Daftar Produk */}
              <Link
                href="/admin/produk"
                onClick={onClose}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-heading font-bold transition-all ${
                  isDaftarProdukActive
                    ? 'bg-[#FFF2E5] text-[#D96B00] font-black border border-[#FFD4B2]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <ListFilter
                  className={`w-3.5 h-3.5 ${
                    isDaftarProdukActive ? 'text-[#D96B00]' : 'text-slate-400'
                  }`}
                />
                <span>Daftar Produk</span>
              </Link>
            </div>
          )}
        </div>

        {/* 3. Pesanan */}
        <Link
          href="/admin/pesanan"
          onClick={onClose}
          className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-heading font-bold transition-all group ${
            isPesananActive
              ? 'clay-btn-orange text-white shadow-md font-black'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <ShoppingBag
              className={`w-4 h-4 transition-colors ${
                isPesananActive ? 'text-white' : 'text-slate-400 group-hover:text-[#FF9F43]'
              }`}
            />
            <span>Pesanan</span>
          </div>
        </Link>

        {/* 4. Flash Sale */}
        <Link
          href="/admin/flash-sale"
          onClick={onClose}
          className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-heading font-bold transition-all group ${
            isFlashSaleActive
              ? 'clay-btn-orange text-white shadow-md font-black'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <Zap
              className={`w-4 h-4 transition-colors ${
                isFlashSaleActive ? 'text-white' : 'text-slate-400 group-hover:text-[#FF9F43]'
              }`}
            />
            <span>Flash Sale</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
            PROMO
          </span>
        </Link>

        {/* 5. Statistik */}
        <Link
          href="/admin/statistik"
          onClick={onClose}
          className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-heading font-bold transition-all group ${
            isStatistikActive
              ? 'clay-btn-orange text-white shadow-md font-black'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <TrendingUp
              className={`w-4 h-4 transition-colors ${
                isStatistikActive ? 'text-white' : 'text-slate-400 group-hover:text-[#FF9F43]'
              }`}
            />
            <span>Statistik Penjualan</span>
          </div>
        </Link>

        {/* 5. Setting */}
        <Link
          href="/admin/setting"
          onClick={onClose}
          className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-heading font-bold transition-all group ${
            isSettingActive
              ? 'clay-btn-orange text-white shadow-md font-black'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <Settings
              className={`w-4 h-4 transition-colors ${
                isSettingActive ? 'text-white' : 'text-slate-400 group-hover:text-[#FF9F43]'
              }`}
            />
            <span>Pengaturan Toko</span>
          </div>
        </Link>

        {/* Akses Luar Section */}
        <div className="pt-4 px-3 pb-2 text-[10px] font-heading font-bold uppercase tracking-wider text-slate-400">
          Akses Luar
        </div>

        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-heading font-bold text-slate-300 hover:bg-slate-800/80 hover:text-[#87CEEB] transition-all group"
        >
          <div className="flex items-center gap-3">
            <Store className="w-4 h-4 text-slate-400 group-hover:text-[#87CEEB]" />
            <span>Ke Toko Utama</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
        </Link>
      </div>

      {/* Admin User Info & Logout Badge */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/60">
        <div className="p-3 bg-slate-800/80 rounded-3xl border border-slate-700/60 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#87CEEB] to-[#FF9F43] text-white flex items-center justify-center font-heading font-black text-xs shadow-inner">
              {getInitials(displayName)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-heading font-black text-white truncate">{displayName}</p>
                <ShieldCheck className="w-3.5 h-3.5 text-[#FF9F43] shrink-0" />
              </div>
              <p className="text-[10px] font-body text-slate-400 truncate">{userEmail}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-700/80 hover:bg-rose-600/90 text-slate-200 hover:text-white rounded-xl text-xs font-semibold transition-all border border-slate-600/50 hover:border-rose-500 disabled:opacity-50 cursor-pointer"
          >
            {isLoggingOut ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <LogOut className="w-3.5 h-3.5" />
            )}
            <span>{isLoggingOut ? 'Keluar...' : 'Keluar Panel'}</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30 border-r border-slate-800">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          {/* Drawer Sheet */}
          <aside className="fixed inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl z-50 flex flex-col transform transition-transform">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
