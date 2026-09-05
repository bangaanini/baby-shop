'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Home, LayoutGrid, Zap, ReceiptText, User } from 'lucide-react';
import { useSession } from '@/lib/auth-client';

function MobileBottomNavContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;

  // Sembunyikan bottom navbar saat berada di panel admin
  if (pathname.startsWith('/admin')) {
    return null;
  }

  // Check promo condition
  const isPromo =
    pathname.startsWith('/katalog') &&
    (searchParams?.get('sort') === 'terpopuler' ||
      searchParams?.get('sort') === 'rekomendasi' ||
      searchParams?.get('filter') === 'rekomendasi');

  const navItems = [
    {
      label: 'Beranda',
      href: '/',
      icon: Home,
      isActive: pathname === '/',
      badge: null,
    },
    {
      label: 'Kategori',
      href: '/katalog',
      icon: LayoutGrid,
      isActive:
        !isPromo &&
        (pathname.startsWith('/katalog') || pathname.startsWith('/kategori')),
      badge: null,
    },
    {
      label: 'Promo',
      href: '/flash-sale',
      icon: Zap,
      isActive: isPromo || pathname.startsWith('/flash-sale'),
      badge: 'HOT',
    },
    {
      label: 'Transaksi',
      href: isAuthenticated
        ? '/user/pesanan'
        : '/auth/login?redirect=/user/pesanan',
      icon: ReceiptText,
      isActive:
        pathname.startsWith('/user/pesanan') || pathname.startsWith('/checkout'),
      badge: null,
    },
    {
      label: 'Akun',
      href: isAuthenticated
        ? '/user/profil'
        : '/auth/login?redirect=/user/profil',
      icon: User,
      isActive:
        pathname.startsWith('/user/profil') || pathname.startsWith('/auth'),
      badge: null,
    },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t-2 border-[#FFE8D6] shadow-[0_-6px_20px_rgba(255,159,67,0.12)] pb-[env(safe-area-inset-bottom)]"
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`relative flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 group ${
                active
                  ? 'text-[#D96B00] font-bold scale-105'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    active ? 'stroke-[2.5px] scale-110 text-[#D96B00]' : 'stroke-[1.75px]'
                  }`}
                />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-3.5 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full leading-none shadow-sm animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[11px] mt-1 tracking-tight leading-none ${
                  active
                    ? 'font-heading font-black text-[#D96B00]'
                    : 'font-body font-semibold text-slate-500'
                }`}
              >
                {item.label}
              </span>
              {active && (
                <span className="absolute bottom-0 w-8 h-1 bg-[#FF9F43] rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function MobileBottomNav() {
  return (
    <Suspense fallback={null}>
      <MobileBottomNavContent />
    </Suspense>
  );
}

export default MobileBottomNav;
