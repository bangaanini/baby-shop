'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Heart,
  Store,
} from 'lucide-react';
import { useSession, signOut } from '@/lib/auth-client';

export function Navbar() {
  const [navSearch, setNavSearch] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [cartCount, setCartCount] = useState<number>(0);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { data: session } = useSession();
  const user = session?.user;
  const userRole = (user as any)?.role;
  const isAdmin = userRole === 'admin';

  // Fetch dynamic cart item count
  const fetchCartCount = useCallback(async () => {
    try {
      const res = await fetch('/api/cart');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const total = Array.isArray(json.data.items)
            ? json.data.items.reduce(
                (sum: number, item: any) => sum + (Number(item.jumlah) || 1),
                0
              )
            : 0;
          setCartCount(total);
          return;
        }
      }
      setCartCount(0);
    } catch {
      setCartCount(0);
    }
  }, []);

  useEffect(() => {
    fetchCartCount();

    const handleCartUpdated = () => {
      fetchCartCount();
    };

    window.addEventListener('cart-updated', handleCartUpdated);
    return () => {
      window.removeEventListener('cart-updated', handleCartUpdated);
    };
  }, [fetchCartCount]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (navSearch.trim()) {
      router.push(`/katalog?q=${encodeURIComponent(navSearch.trim())}`);
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
    <header className="sticky top-0 z-50 bg-[#FFF8F0]/95 backdrop-blur-md border-b-2 border-[#FFE8D6] shadow-[0_4px_20px_rgba(255,159,67,0.08)]">
      {/* Top Banner Info - Vibrant Playful Warm Tone */}
      <div className="bg-gradient-to-r from-[#FF9F43] via-[#FFAF60] to-[#87CEEB] text-white text-xs py-2 px-4 text-center font-heading font-bold tracking-wide shadow-inner">
        <span className="inline-flex items-center gap-1.5 drop-shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-yellow-200 animate-pulse" />
          <span>🎉 Gratis Ongkir s/d Rp 20.000 ke Seluruh Indonesia Belanja Min. Rp 100.000!</span>
          <Truck className="w-3.5 h-3.5 text-sky-100" />
        </span>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-6">
          {/* Brand Logo - Playful Claymorphic Block */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#FF9F43] to-[#EE8A2B] text-white flex items-center justify-center font-heading font-black text-2xl border-2 border-[#F38C26] shadow-[0_6px_14px_rgba(255,159,67,0.35),inset_0_2px_4px_rgba(255,255,255,0.6)] group-hover:scale-105 group-hover:rotate-2 transition-all duration-200">
              <Store className="w-6 h-6 drop-shadow-xs" />
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-heading font-black text-[#D96B00] tracking-tight group-hover:text-[#FF9F43] transition-colors drop-shadow-xs">
                NBusiness
              </span>
              <span className="text-[11px] block font-body font-semibold text-slate-500 -mt-1">
                Kebutuhan & Mainan Anak
              </span>
            </div>
          </Link>

          {/* Search Bar ala Marketplace - Clay Rounded Pill */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-2xl mx-2 hidden md:block">
            <div className="relative">
              <input
                type="text"
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                placeholder="Cari stroller, baju bayi lucu, balok edukasi..."
                className="w-full pl-5 pr-12 py-3 rounded-2xl border-2 border-[#FFE8D6] bg-white text-sm font-body font-medium focus:outline-none focus:border-[#FF9F43] focus:ring-4 focus:ring-[#FF9F43]/20 shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)] transition-all text-slate-800 placeholder-slate-400"
              />
              <button
                type="submit"
                aria-label="Cari Produk"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-[#FF9F43] hover:bg-[#EE8A2B] text-white flex items-center justify-center border border-[#F38C26] shadow-[0_4px_10px_rgba(255,159,67,0.4),inset_0_1px_2px_rgba(255,255,255,0.5)] active:scale-95 transition-all cursor-pointer"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* User & Cart Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Cart Button - Claymorphic Puffy Pill */}
            <Link
              href="/keranjang"
              className="relative p-2.5 sm:px-4 sm:py-2.5 rounded-2xl bg-white border-2 border-[#FFE8D6] hover:border-[#FF9F43] text-slate-700 hover:text-[#D96B00] flex items-center gap-2 shadow-[0_4px_12px_rgba(255,159,67,0.1),inset_0_2px_3px_rgba(255,255,255,0.9)] active:translate-y-0.5 transition-all group"
              title="Keranjang Belanja"
            >
              <ShoppingBag className="w-5 h-5 text-[#FF9F43] group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline text-xs font-heading font-bold">Keranjang</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 sm:-top-1.5 sm:-right-1.5 bg-[#FF9F43] text-white text-[11px] font-heading font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-[0_2px_6px_rgba(255,159,67,0.5)] animate-pulse">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* User Auth Section */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-2xl bg-white border-2 border-[#FFE8D6] hover:border-[#FF9F43] text-slate-700 text-xs font-heading font-bold shadow-[0_4px_12px_rgba(255,159,67,0.1)] transition-all cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#87CEEB] to-[#FF9F43] text-white flex items-center justify-center font-heading font-bold text-xs border border-white shadow-xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="hidden sm:inline max-w-[100px] truncate text-slate-800">
                    {user.name?.split(' ')[0] || 'Akun'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu - Clay Card */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-60 rounded-3xl bg-white border-2 border-[#FFE8D6] shadow-[0_16px_36px_rgba(255,159,67,0.16)] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-3 border-b border-[#FFE8D6] bg-[#FFF8F0]/60 rounded-t-2xl">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#87CEEB] to-[#FF9F43] text-white flex items-center justify-center font-heading font-bold text-sm shadow-xs">
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-heading font-bold text-slate-900 truncate">
                            {user.name || 'Pengguna'}
                          </p>
                          <p className="text-[11px] font-body text-slate-500 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 mt-2.5">
                        <span
                          className={`text-[10px] font-heading font-bold px-2.5 py-0.5 rounded-full ${
                            isAdmin
                              ? 'bg-purple-100 text-purple-700 border border-purple-200'
                              : 'clay-badge-orange'
                          }`}
                        >
                          {isAdmin ? '🛡️ Administrator' : '👶 Pembeli Terdaftar'}
                        </span>
                      </div>
                    </div>

                    <div className="py-1.5 px-2">
                      <Link
                        href="/user/profil"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-heading font-bold text-slate-700 hover:bg-[#FFF2E5] hover:text-[#D96B00] rounded-xl transition-colors"
                      >
                        <User className="w-4 h-4 text-[#FF9F43]" />
                        <span>Profil Saya</span>
                      </Link>

                      <Link
                        href="/user/pesanan"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-heading font-bold text-slate-700 hover:bg-[#FFF2E5] hover:text-[#D96B00] rounded-xl transition-colors"
                      >
                        <Package className="w-4 h-4 text-[#FF9F43]" />
                        <span>Riwayat Pesanan</span>
                      </Link>

                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-heading font-bold text-purple-700 hover:bg-purple-50 rounded-xl transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-purple-600" />
                          <span>Panel Admin Toko</span>
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-[#FFE8D6] pt-1 px-2">
                      <button
                        type="button"
                        disabled={isLoggingOut}
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-heading font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left disabled:opacity-50 cursor-pointer"
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
                className="clay-btn-orange px-4 py-2 text-xs text-white"
              >
                <LogIn className="w-3.5 h-3.5 mr-1.5" />
                <span>Masuk / Daftar</span>
              </Link>
            )}

            {/* Quick Admin shortcut if logged in as Admin */}
            {user && isAdmin && (
              <Link
                href="/admin"
                className="text-xs font-heading font-bold px-3 py-2 rounded-2xl bg-purple-100 text-purple-800 hover:bg-purple-200 border-2 border-purple-300 transition-all hidden md:inline-flex items-center gap-1.5 shadow-xs"
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
              className="w-full pl-4 pr-11 py-2.5 rounded-2xl border-2 border-[#FFE8D6] bg-white text-sm font-body focus:outline-none focus:border-[#FF9F43] text-slate-800 shadow-inner"
            />
            <button
              type="submit"
              aria-label="Cari Produk Mobile"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-[#FF9F43] text-white flex items-center justify-center shadow-xs"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Category Quick Links Strip */}
      <div className="bg-[#FFF2E5]/80 border-t border-[#FFE8D6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between text-xs text-slate-700 overflow-x-auto gap-4 scrollbar-none">
          <div className="flex items-center gap-4 sm:gap-6 font-heading font-bold whitespace-nowrap">
            <Link
              href="/katalog"
              className="px-3 py-1 rounded-xl bg-white border border-[#FFD4B2] text-[#D96B00] shadow-[0_2px_6px_rgba(255,159,67,0.15)] hover:bg-[#FF9F43] hover:text-white transition-all flex items-center gap-1"
            >
              🛍️ <span>Semua Katalog</span>
            </Link>
            <Link href="/katalog?sort=terpopuler" className="hover:text-[#D96B00] transition-colors">🔥 Populer</Link>
            <Link href="/katalog?sort=terbaru" className="hover:text-[#D96B00] transition-colors">✨ Baru Masuk</Link>
            <Link href="/katalog?sort=rekomendasi" className="hover:text-[#D96B00] transition-colors">🌟 Pilihan Ahli</Link>
            <span className="text-[#FFD4B2]">|</span>
            <Link href="/kategori/perlengkapan" className="hover:text-[#D96B00] transition-colors">🍼 Perlengkapan</Link>
            <Link href="/kategori/pakaian" className="hover:text-[#D96B00] transition-colors">👕 Pakaian</Link>
            <Link href="/kategori/mainan" className="hover:text-[#D96B00] transition-colors">🧸 Mainan Edukasi</Link>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-slate-600 text-[11px] font-heading font-bold whitespace-nowrap">
            <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Standar SNI Aman</span>
            <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5 text-[#2E86AB]" /> Kirim Se-Indonesia</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#2D3748] text-slate-300 pt-14 pb-8 border-t-4 border-[#FF9F43] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2.5 mb-3.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF9F43] to-[#87CEEB] text-white flex items-center justify-center font-heading font-black text-lg border-2 border-white/20 shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
                <Store className="w-5 h-5" />
              </div>
              <span className="text-2xl font-heading font-black text-white tracking-tight">
                NBusiness
              </span>
            </div>
            <p className="text-xs font-body text-slate-300 leading-relaxed mb-4">
              Pusat belanja online terpercaya untuk perlengkapan bayi, pakaian modis anak, dan mainan edukasi terstandar aman SNI dengan pengiriman ke seluruh Nusantara.
            </p>
            <div className="text-xs font-body text-slate-400 space-y-1.5">
              <p className="flex items-center gap-1.5">📍 <span>Gudang Utama: Jakarta & Surabaya</span></p>
              <p className="flex items-center gap-1.5">📦 <span>Menjangkau 514 Kota/Kabupaten</span></p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-heading font-bold text-[#FF9F43] mb-3.5">Kategori Produk</h4>
            <ul className="text-xs font-body space-y-2.5 text-slate-300">
              <li>
                <Link href="/kategori/perlengkapan" className="hover:text-[#87CEEB] transition-colors">
                  🍼 Perlengkapan Bayi & Balita
                </Link>
              </li>
              <li>
                <Link href="/kategori/pakaian" className="hover:text-[#87CEEB] transition-colors">
                  👕 Pakaian & Sepatu Anak
                </Link>
              </li>
              <li>
                <Link href="/kategori/mainan" className="hover:text-[#87CEEB] transition-colors">
                  🧸 Mainan Edukasi & Motorik
                </Link>
              </li>
              <li>
                <Link href="/katalog?sort=rekomendasi" className="hover:text-[#87CEEB] transition-colors">
                  ⚡ Promo & Flash Sale Hemat
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-heading font-bold text-[#87CEEB] mb-3.5">Layanan Pembeli</h4>
            <ul className="text-xs font-body space-y-2.5 text-slate-300">
              <li>
                <Link href="/user/pesanan" className="hover:text-[#FF9F43] transition-colors">
                  📦 Lacak Riwayat Pesanan
                </Link>
              </li>
              <li>
                <Link href="/user/profil" className="hover:text-[#FF9F43] transition-colors">
                  👤 Pengaturan Akun & Alamat
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="hover:text-[#FF9F43] transition-colors">
                  💳 Panduan Pembayaran Aman
                </Link>
              </li>
              <li>
                <Link href="/katalog" className="hover:text-[#FF9F43] transition-colors">
                  🛡️ Garansi Produk SNI Original
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-heading font-bold text-[#FF9F43] mb-3.5">Mitra Logistik & Pembayaran</h4>
            <p className="text-xs font-body text-slate-400 mb-3 leading-relaxed">
              Mendukung kurir tepercaya (JNE, SiCepat, J&T, Anteraja) & metode pembayaran instan (QRIS, VA Bank, Midtrans, Xendit).
            </p>
            <div className="p-3.5 rounded-2xl bg-slate-800 border border-slate-700">
              <div className="flex items-center gap-2 text-xs font-heading font-bold text-white mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Belanja 100% Terlindungi</span>
              </div>
              <p className="text-[11px] font-body text-slate-400">
                Data terenkripsi dan garansi retur jika barang tidak sesuai.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-700/80 flex flex-col sm:flex-row items-center justify-between text-xs font-body text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} NBusiness. Hak Cipta Dilindungi.</p>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/katalog" className="hover:text-white transition-colors">Syarat & Ketentuan</Link>
            <span>•</span>
            <Link href="/katalog" className="hover:text-white transition-colors">Kebijakan Privasi</Link>
            <span>•</span>
            <Link href="/admin" className="hover:text-[#FF9F43] transition-colors">Seller Center</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
