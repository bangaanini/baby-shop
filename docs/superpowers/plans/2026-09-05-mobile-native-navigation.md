# Mobile Native Navigation & Compact Top Bar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the mobile storefront experience of the NBusiness online store into a native marketplace mobile app interface with a single-row sticky top bar and a fixed 5-tab bottom navigation bar.

**Architecture:** Create a dedicated `MobileBottomNav` client component mounted globally in `RootLayout`. Refactor `NavbarFooter.tsx` so mobile header displays Logo, Inline Search, and Cart in a single row without secondary rows or desktop auth buttons. Adjust `FloatingWhatsApp.tsx` and layout padding for mobile safe-areas.

**Tech Stack:** Next.js 16 (App Router, Client Components), Tailwind CSS, Lucide React icons, Better Auth client SDK (`useSession`).

## Global Constraints
- Responsive breakpoints: Mobile (`< 768px` / `< md`), Desktop (`>= 768px` / `md:`).
- Styling: Claymorphism palette (`#FF9F43`, `#FFF8F0`, `#FFE8D6`, `#D96B00`), local fonts Nunito (`font-heading`) & Quicksand (`font-body`).
- No horizontal overflow on mobile viewports (360px - 430px).

---

### Task 1: Create MobileBottomNav Component

**Files:**
- Create: `src/components/layout/MobileBottomNav.tsx`

**Interfaces:**
- Produces: `export function MobileBottomNav(): React.JSX.Element`
- Consumes: `usePathname()`, `useSearchParams()` from `next/navigation`, `useSession()` from `@/lib/auth-client`, icons `Home`, `LayoutGrid`, `Zap`, `ReceiptText`, `User` from `lucide-react`.

- [ ] **Step 1: Write `src/components/layout/MobileBottomNav.tsx`**

```tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Home, LayoutGrid, Zap, ReceiptText, User } from 'lucide-react';
import { useSession } from '@/lib/auth-client';

export function MobileBottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const isAuthenticated = Boolean(session?.user);

  // Active state checkers
  const isHome = pathname === '/';
  const isPromo =
    pathname.startsWith('/katalog') &&
    (searchParams.get('sort') === 'terpopuler' ||
      searchParams.get('sort') === 'rekomendasi' ||
      searchParams.get('filter') === 'rekomendasi');
  const isKatalog =
    !isPromo && (pathname.startsWith('/katalog') || pathname.startsWith('/kategori'));
  const isTransaksi =
    pathname.startsWith('/user/pesanan') || pathname.startsWith('/checkout');
  const isAkun =
    pathname.startsWith('/user/profil') || pathname.startsWith('/auth');

  const navItems = [
    {
      label: 'Beranda',
      href: '/',
      icon: Home,
      isActive: isHome,
    },
    {
      label: 'Kategori',
      href: '/katalog',
      icon: LayoutGrid,
      isActive: isKatalog,
    },
    {
      label: 'Promo',
      href: '/katalog?filter=rekomendasi',
      icon: Zap,
      isActive: isPromo,
      badge: 'HOT',
    },
    {
      label: 'Transaksi',
      href: isAuthenticated ? '/user/pesanan' : '/auth/login?redirect=/user/pesanan',
      icon: ReceiptText,
      isActive: isTransaksi,
    },
    {
      label: 'Akun',
      href: isAuthenticated ? '/user/profil' : '/auth/login?redirect=/user/profil',
      icon: User,
      isActive: isAkun,
    },
  ];

  return (
    <nav
      aria-label="Navigasi Bawah Mobile"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t-2 border-[#FFE8D6] shadow-[0_-6px_20px_rgba(255,159,67,0.12)] md:hidden pb-[env(safe-area-inset-bottom)]"
    >
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto items-center px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 relative transition-all duration-150 ${
                item.isActive
                  ? 'text-[#D96B00] scale-105'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <div
                  className={`p-1 rounded-xl transition-colors ${
                    item.isActive ? 'bg-[#FFF2E5]' : ''
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-transform ${
                      item.isActive ? 'stroke-[2.5px] scale-110 text-[#D96B00]' : 'stroke-2'
                    }`}
                  />
                </div>
                {item.badge && (
                  <span className="absolute -top-1 -right-3 px-1 py-0.2 bg-rose-500 text-white text-[9px] font-heading font-black rounded-full shadow-xs animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] tracking-tight mt-0.5 ${
                  item.isActive
                    ? 'font-heading font-black text-[#D96B00]'
                    : 'font-body font-semibold text-slate-500'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Commit MobileBottomNav**

```bash
git add src/components/layout/MobileBottomNav.tsx
git commit -m "feat(layout): create MobileBottomNav component for native marketplace bottom bar"
```

---

### Task 2: Refactor Navbar for Mobile Single-Row Header

**Files:**
- Modify: `src/components/layout/NavbarFooter.tsx`

**Interfaces:**
- Produces: `export function Navbar(): React.JSX.Element`
- Consumes: Mobile single-row layout with Logo, inline Search, and Cart counter.

- [ ] **Step 1: Update `src/components/layout/NavbarFooter.tsx`**

Refactor the mobile layout in `Navbar`:
- On mobile (`md:hidden`), place the store logo icon on the left, an inline search input with magnifying icon in the center (`flex-1 mx-2`), and the cart button on the right.
- Move the auth/profile dropdown to be desktop-only (`hidden md:flex`), as mobile users now access transactions and profile via the bottom navigation bar.
- Remove redundant duplicate bottom search bar on mobile.

- [ ] **Step 2: Commit NavbarFooter Refactor**

```bash
git add src/components/layout/NavbarFooter.tsx
git commit -m "feat(navbar): streamline mobile header into compact single row with inline search"
```

---

### Task 3: Mount Bottom Nav in Layout & Adjust Floating WhatsApp

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/components/layout/FloatingWhatsApp.tsx`

**Interfaces:**
- Consumes: `<MobileBottomNav />` in `src/app/layout.tsx`.
- Adjusts: `FloatingWhatsApp` positioning to `bottom-20 right-4 sm:bottom-6 sm:right-6`.
- Adjusts: Body padding `pb-18 md:pb-0` to avoid content occlusion by bottom bar.

- [ ] **Step 1: Update `src/app/layout.tsx` and `src/components/layout/FloatingWhatsApp.tsx`**

1. Import and render `<MobileBottomNav />` inside `RootLayout`.
2. Add `pb-18 md:pb-0` class to `body` or wrapper element.
3. Update `FloatingWhatsApp` position classes to `bottom-20 right-4 sm:bottom-6 sm:right-6`.

- [ ] **Step 2: Commit Layout Integration**

```bash
git add src/app/layout.tsx src/components/layout/FloatingWhatsApp.tsx
git commit -m "feat(layout): integrate MobileBottomNav and adjust floating WhatsApp spacing"
```

---

### Task 4: Verify and Build

**Files:**
- Test: All routes and breakpoints.

- [ ] **Step 1: Run TypeScript Typecheck**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 2: Run Production Build**

Run: `npm run build`
Expected: Successful compilation of all 32 static and dynamic routes.

- [ ] **Step 3: Commit Final Changes if any**

```bash
git status
```
