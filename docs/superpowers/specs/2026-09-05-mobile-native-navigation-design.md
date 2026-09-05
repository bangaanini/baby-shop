# Mobile Native Navigation & Compact Top Bar Design Document

## 1. Goal
Transform the mobile storefront experience of the NBusiness online store into a native marketplace mobile app interface (modeled after Tokopedia / Shopee mobile standards).

---

## 2. Requirements & Architecture

### A. Mobile Sticky Top Bar (`src/components/layout/NavbarFooter.tsx`)
- **Desktop (`md:` breakpoint and above)**:
  - Preserves the full header with store logo, tagline, wide search bar, cart button, and user profile dropdown / login button.
- **Mobile (`< md` breakpoint)**:
  - Single compact row (`h-14` or `h-16`) containing:
    1. **Left**: Store Logo / Icon button linking to `/`.
    2. **Center**: Integrated search input (`flex-1 mx-2.5`) with placeholder *"Cari perlengkapan si kecil..."* and search action button.
    3. **Right**: Cart button with live count badge linking to `/keranjang`.
  - The login / account button is migrated to the Bottom Navigation Bar on mobile for cleaner aesthetics and 1-hand reachability.

### B. Mobile Bottom Navigation Bar (`src/components/layout/MobileBottomNav.tsx`)
- A dedicated sticky bottom bar fixed to the bottom of the viewport on mobile devices (`fixed bottom-0 left-0 right-0 z-40 md:hidden`).
- Claymorphic glass design: `bg-white/95 backdrop-blur-md border-t-2 border-[#FFE8D6] shadow-[0_-6px_20px_rgba(255,159,67,0.12)]`.
- 5 Primary Navigation Tabs:
  1. **Home / Beranda**: Icon `Home`, links to `/`. Active when `pathname === '/'`.
  2. **Kategori**: Icon `LayoutGrid`, links to `/katalog`. Active when `pathname.startsWith('/katalog')` (without promo filter) or `pathname.startsWith('/kategori')`.
  3. **Promo / Flash Sale**: Icon `Zap`, links to `/katalog?filter=rekomendasi`. Active when query `filter=rekomendasi` or `filter=promo` or `sort=terpopuler`.
  4. **Transaksi**: Icon `ShoppingBag` / `ReceiptText`, links to `/user/pesanan`. Active when `pathname.startsWith('/user/pesanan')` or `pathname.startsWith('/checkout')`.
  5. **Akun**: Icon `User`, links to `/user/profil`. If not authenticated, links or redirects to `/auth/login`. Active when `pathname.startsWith('/user/profil')` or `pathname.startsWith('/auth')`.

### C. Layout & Safe-Area Accommodations
- **`src/app/layout.tsx`**:
  - Render `<MobileBottomNav />` globally in the root layout.
  - Apply `pb-18 md:pb-0` to the root wrapper/body to prevent bottom content truncation.
- **`src/components/layout/FloatingWhatsApp.tsx`**:
  - Position adjusted to `bottom-20 right-4 sm:bottom-6 sm:right-6` so the WhatsApp chat bubble floats cleanly above the bottom navigation bar without collision.

---

## 3. Tech Stack & Styling
- **Framework**: Next.js 16 (App Router, Client Components).
- **Navigation Detection**: `usePathname()`, `useSearchParams()` from `next/navigation`.
- **Icons**: `lucide-react` (`Home`, `LayoutGrid`, `Zap`, `ReceiptText`, `User`, `ShoppingBag`, `Search`).
- **Styling**: Tailwind CSS with Claymorphism classes (`clay-badge-orange`, `font-heading`, `font-body`).

---

## 4. Verification Plan
- **Mobile Viewport Test (360px, 375px, 390px, 412px)**: Verify top bar has logo, search, and cart in a single line with 0 horizontal overflow.
- **Bottom Navigation Test**: Tap all 5 tabs and verify active tab indicator highlights properly and routes accurately.
- **Desktop Breakpoint Test (>= 768px)**: Verify bottom bar is completely hidden (`md:hidden`) and standard desktop navbar renders normally.
- **Build & Typecheck**: Run `npx tsc --noEmit` and `npm run build`.
