'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Search,
  User,
  ShieldCheck,
  Truck,
  LogOut,
  Package,
  ChevronDown,
  LogIn,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useSession, signOut } from '@/lib/auth-client';

export function Navbar() {
  const [navSearch, setNavSearch] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { data: session, isPending } = useSession();
  const user = session?.user as
    | { id?: string; name?: string; email?: string; role?: string; phone?: string; image?: string }
    | undefined;

  const isAdmin = user?.role === 'admin';
  const displayName = user?.name || 'Pengguna';
  const firstName = displayName.split(' ')[0];

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (navSearch.trim()) {
      router.push(`/katalog?q=${encodeURIComponent(navSearch.trim())}`);
    } else {
      router.push('/katalog');
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      setUserMenuOpen(false);
      router.push('/auth/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      setUserMenuOpen(false);
      router.push('/auth/login');
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-rose-100 shadow-xs">
      {/* Top Banner Info */}
      <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 text-white text-xs py-1.5 px-4 text-center font-medium">
        <span>🎉 Gratis Ongkir s/d Rp 20.000 ke Seluruh Indonesia dengan Belanja Minimal Rp 100.000! 🚚</span>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-black text-xl shadow-md group-hover:scale-105 transition-transform">
              👶
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                BabyKids
              </span>
              <span className="text-xs block text-slate-500 font-medium">Toko Kebutuhan Anak</span>
            </div>
          </Link>

          {/* Search Bar ala Marketplace */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-2xl mx-2 hidden md:block">
            <div className="relative">
              <input
                type="text"
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                placeholder="Cari stroller, baju bayi, balok edukasi..."
                className="w-full pl-4 pr-11 py-2 rounded-full border border-rose-200 bg-rose-50/30 text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all text-slate-800 placeholder-slate-400"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center transition-colors shadow-xs"
                title="Cari"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* User & Cart Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/keranjang"
              className="relative p-2 text-slate-700 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors flex items-center gap-1.5"
              title="Keranjang Belanja"
            >
              <div className="relative">
                <ShoppingBag className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center border-2 border-white">
                  3
                </span>
              </div>
              <span className="text-xs font-semibold hidden lg:inline">Keranjang</span>
            </Link>

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            {/* User Session Dropdown or Login Button */}
            {isPending ? (
              <div className="w-24 h-9 bg-rose-50 animate-pulse rounded-full" />
            ) : user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 text-slate-700 hover:text-rose-600 p-1 sm:px-3 sm:py-1.5 rounded-full hover:bg-rose-50 text-sm font-medium transition-colors border border-transparent hover:border-rose-100"
                  aria-expanded={userMenuOpen}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                    {getInitials(displayName)}
                  </div>
                  <div className="text-left hidden sm:block leading-tight max-w-[120px]">
                    <span className="text-[10px] block text-slate-400">Halo,</span>
                    <span className="text-xs font-bold text-slate-800 truncate block">
                      {isAdmin ? 'Admin' : firstName}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform hidden sm:block ${
                      userMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-rose-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0">
                          {getInitials(displayName)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-800 truncate">{displayName}</p>
                          <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isAdmin
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {isAdmin ? '🛡️ Administrator' : '👶 Member Pelanggan'}
                        </span>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/user/profil"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>Profil Saya</span>
                      </Link>

                      <Link
                        href="/user/pesanan"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      >
                        <Package className="w-4 h-4 text-slate-400" />
                        <span>Riwayat Pesanan</span>
                      </Link>

                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-purple-700 hover:bg-purple-50 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-purple-600" />
                          <span>Panel Admin</span>
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-1 mt-1">
                      <button
                        type="button"
                        disabled={isLoggingOut}
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left disabled:opacity-50 cursor-pointer"
                      >
                        {isLoggingOut ? (
                          <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                        ) : (
                          <LogOut className="w-4 h-4 text-rose-600" />
                        )}
                        <span>{isLoggingOut ? 'Sedang Keluar...' : 'Keluar (Logout)'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="flex items-center gap-1.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-bold px-3.5 py-2 rounded-full transition-all shadow-xs hover:shadow-md"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk / Daftar</span>
              </Link>
            )}

            {/* Quick Admin shortcut if logged in as Admin */}
            {user && isAdmin && (
              <Link
                href="/admin"
                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors hidden md:inline-flex items-center gap-1 border border-purple-200"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Panel</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        <form onSubmit={handleSearchSubmit} className="pb-3 md:hidden">
          <div className="relative">
            <input
              type="text"
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              placeholder="Cari kebutuhan si kecil..."
              className="w-full pl-4 pr-10 py-2 rounded-full border border-rose-200 bg-rose-50/30 text-sm focus:outline-none focus:border-rose-500 text-slate-800"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>

      {/* Category quick links bar */}
      <div className="bg-rose-50/60 border-t border-rose-100/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between text-xs text-slate-600 overflow-x-auto gap-4 scrollbar-none">
          <div className="flex items-center gap-6 font-medium whitespace-nowrap">
            <Link href="/katalog" className="hover:text-rose-600 transition-colors font-bold text-slate-800">🛍️ Semua Katalog</Link>
            <Link href="/katalog?sort=terpopuler" className="hover:text-rose-600 transition-colors">🔥 Produk Populer</Link>
            <Link href="/katalog?sort=terbaru" className="hover:text-rose-600 transition-colors">✨ Produk Terbaru</Link>
            <Link href="/katalog?sort=rekomendasi" className="hover:text-rose-600 transition-colors">🌟 Rekomendasi</Link>
            <Link href="/kategori/perlengkapan" className="hover:text-rose-600 transition-colors">🍼 Perlengkapan</Link>
            <Link href="/kategori/pakaian" className="hover:text-rose-600 transition-colors">👕 Pakaian</Link>
            <Link href="/kategori/mainan" className="hover:text-rose-600 transition-colors">🧸 Mainan</Link>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-slate-500 text-[11px] whitespace-nowrap">
            <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> 100% Produk Aman Anak</span>
            <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5 text-sky-500" /> Kirim Se-Indonesia</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold text-lg">
                👶
              </div>
              <span className="text-xl font-bold text-white">BabyKids</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Toko online kebutuhan anak terlengkap di Indonesia. Dari perlengkapan bayi, pakaian modis anak, hingga mainan edukatif berkualitas.
            </p>
            <div className="text-xs text-slate-400 space-y-1">
              <p>📍 Pengiriman dari: Jakarta & Surabaya</p>
              <p>📦 Menjangkau seluruh pelosok Indonesia</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Kategori Produk</h4>
            <ul className="text-xs space-y-2 text-slate-400">
              <li><Link href="/kategori/perlengkapan" className="hover:text-rose-400 transition-colors">Perlengkapan Bayi & Anak</Link></li>
              <li><Link href="/kategori/pakaian" className="hover:text-rose-400 transition-colors">Pakaian & Sepatu Anak</Link></li>
              <li><Link href="/kategori/mainan" className="hover:text-rose-400 transition-colors">Mainan & Edukasi</Link></li>
              <li><Link href="/katalog?sort=rekomendasi" className="hover:text-rose-400 transition-colors">Promo Diskon Rutin</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Layanan Pelanggan</h4>
            <ul className="text-xs space-y-2 text-slate-400">
              <li><Link href="/user/pesanan" className="hover:text-rose-400 transition-colors">Lacak Status Pesanan</Link></li>
              <li><Link href="/user/alamat" className="hover:text-rose-400 transition-colors">Buku Alamat Pengiriman</Link></li>
              <li><span className="text-slate-400">Jasa Kurir: JNE, SiCepat, J&T, Anteraja</span></li>
              <li><span className="text-slate-400">Metode Bayar: QRIS, Transfer Bank, E-Wallet</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Jaminan Keamanan</h4>
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-400">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span className="font-semibold">Bahan Ramah & Aman Anak</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Semua produk lolos standar keamanan BPA-Free, Non-Toxic, dan Standar Nasional Indonesia (SNI).
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 BabyKids Store — Toko Kebutuhan Anak Terpercaya di Indonesia.</p>
          <p className="text-slate-400">Dibangun untuk kenyamanan belanja orang tua Indonesia ❤️</p>
        </div>
      </div>
    </footer>
  );
}
