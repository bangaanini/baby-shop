'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import {
  Menu,
  ShieldCheck,
  LogOut,
  ChevronDown,
  Store,
  Clock,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { useSession, signOut } from '@/lib/auth-client';

interface AdminHeaderProps {
  onOpenSidebar: () => void;
}

export function AdminHeader({ onOpenSidebar }: AdminHeaderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: session } = useSession();
  const user = session?.user as
    | { id?: string; name?: string; email?: string; role?: string; phone?: string; image?: string }
    | undefined;

  const displayName = user?.name || 'Administrator';
  const userEmail = user?.email || 'admin@babyshop.id';

  const getInitials = (name?: string) => {
    if (!name) return 'AD';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' WIB'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      setUserDropdownOpen(false);
      router.push('/auth/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      setUserDropdownOpen(false);
      router.push('/auth/login');
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getHeaderInfo = () => {
    if (pathname === '/admin/produk/tambah') {
      return {
        title: 'Tambah Produk Baru',
        subtitle: 'Upload foto produk, isi detail spesifikasi, harga & berat paket',
      };
    }
    if (pathname.includes('/edit')) {
      return {
        title: 'Edit Produk Toko',
        subtitle: 'Perbarui informasi, foto, varian & stok produk',
      };
    }
    if (pathname === '/admin/produk' || pathname.startsWith('/admin/produk/')) {
      return {
        title: 'Daftar Produk Toko',
        subtitle: 'Kelola katalog produk, pantau stok, harga, dan varian',
      };
    }
    if (pathname.startsWith('/admin/pesanan')) {
      return {
        title: 'Kelola Pesanan Pembeli',
        subtitle: 'Pantau pesanan masuk, verifikasi pembayaran, dan input resi pengiriman',
      };
    }
    if (pathname.startsWith('/admin/statistik')) {
      return {
        title: 'Statistik & Performa Penjualan',
        subtitle: 'Analisis pendapatan, pesanan, dan tren produk terlaris',
      };
    }
    if (pathname.startsWith('/admin/setting')) {
      return {
        title: 'Pengaturan Toko & Logistik',
        subtitle: 'Atur alamat toko, profil merchant, kurir pengiriman & rekening bank',
      };
    }

    // Fallback for /admin query tab backwards compatibility
    const currentTab = searchParams.get('tab');
    if (currentTab === 'produk') {
      return {
        title: 'Daftar Produk Toko',
        subtitle: 'Kelola katalog produk, pantau stok, harga, dan varian',
      };
    }
    if (currentTab === 'pesanan') {
      return {
        title: 'Kelola Pesanan Pembeli',
        subtitle: 'Pantau pesanan masuk, verifikasi pembayaran, dan input resi pengiriman',
      };
    }
    if (currentTab === 'promo') {
      return {
        title: 'Diskon & Voucher Promo',
        subtitle: 'Atur kode voucher dan program promosi hemat kebutuhan anak',
      };
    }

    return {
      title: 'Dashboard Seller Center',
      subtitle: 'Ringkasan metrik toko, aksi penting, dan performa harian',
    };
  };

  const currentInfo = getHeaderInfo();

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left: Mobile Menu Toggle & Title / Subtitle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenSidebar}
              className="p-2 -ml-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 md:hidden transition-colors"
              aria-label="Buka Menu Navigasi"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                  {currentInfo.title}
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <p className="hidden md:block text-xs text-slate-500 line-clamp-1">
                {currentInfo.subtitle}
              </p>
            </div>
          </div>

          {/* Right: Store Status, Live Time, Profile Menu */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Live Clock / Store status badge */}
            <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div className="flex items-center gap-1.5 text-slate-600">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono font-medium">{currentTime || 'Memuat...'}</span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Toko Buka</span>
              </div>
            </div>

            {/* Link to main store */}
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors border border-rose-200/60"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Lihat Toko</span>
            </Link>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 cursor-pointer"
                aria-expanded={userDropdownOpen}
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {getInitials(displayName)}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <span className="truncate max-w-[110px]">{displayName}</span>
                    <ShieldCheck className="w-3 h-3 text-rose-500 shrink-0" />
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium block">Administrator</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    userDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 text-slate-800 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">{displayName}</p>
                    <p className="text-[11px] text-slate-500 truncate">{userEmail}</p>
                    <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md border border-rose-100">
                      <ShieldCheck className="w-3 h-3 text-rose-500" />
                      Role: Admin Toko BabyKids
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-rose-600 transition-colors"
                    >
                      <Store className="w-4 h-4 text-slate-400" />
                      <span>Kunjungi Website Utama</span>
                    </Link>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50 text-left cursor-pointer"
                    >
                      {isLoggingOut ? (
                        <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                      ) : (
                        <LogOut className="w-4 h-4 text-rose-600" />
                      )}
                      <span>{isLoggingOut ? 'Sedang keluar...' : 'Keluar dari Panel Admin'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
