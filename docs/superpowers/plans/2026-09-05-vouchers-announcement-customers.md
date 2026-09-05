# Vouchers, Header Announcement, and Customer Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dynamic promotional voucher management engine with database persistence, a custom header announcement bar in store settings, and a customer directory in Seller Center.

**Architecture:**
- Next.js 16 (App Router) + PostgreSQL + Drizzle ORM.
- Database schemas: `vouchersTable` (`vouchers.ts`) and `storeSettingsTable` additions (`settings.ts`).
- Backend service layer: `voucher.service.ts` for validation, calculation, quota tracking, and customer aggregation in `admin.service.ts`.
- Interactive Seller Center pages (`/admin/voucher`, `/admin/pelanggan`, `/admin/setting`) and live storefront components with Claymorphic styling.

**Tech Stack:** Next.js 16, TypeScript, Drizzle ORM, postgres.js, Tailwind CSS v4, Lucide Icons, Better Auth.

## Global Constraints
- Database credentials, API keys, and secrets must remain strictly in `.env` and accessed via `process.env`.
- Maintain Claymorphism + Vibrant Block styling with Nunito Bold (`--font-heading`) and Quicksand Medium (`--font-body`).
- Palettes: `#FF9F43` (Warm Orange), `#87CEEB` (Sky Blue), `#FFF8F0` (Cream background).
- All changes must pass `npx tsc --noEmit` and `npm run build` with 0 errors.

---

### Task 1: Database Schema & Migration for Vouchers Table & Announcement Bar

**Files:**
- Create: `src/db/schema/vouchers.ts`
- Modify: `src/db/schema/settings.ts`
- Modify: `src/db/schema/index.ts`
- Modify: `src/server/services/payment.service.ts`

**Interfaces:**
- Produces: `vouchersTable`, `storeSettingsTable.header_announcement_enabled`, `storeSettingsTable.header_announcement_text`, `storeSettingsTable.header_announcement_link`.

- [ ] **Step 1: Create `src/db/schema/vouchers.ts`**
Define `vouchersTable` with fields: `id`, `code`, `name`, `description`, `discount_type`, `discount_value`, `max_discount_amount`, `min_order_amount`, `usage_limit`, `used_count`, `start_date`, `end_date`, `is_active`, `created_at`, `updated_at`.

- [ ] **Step 2: Update `src/db/schema/settings.ts`**
Add `header_announcement_enabled`, `header_announcement_text`, `header_announcement_link`.

- [ ] **Step 3: Export schema in `src/db/schema/index.ts`**
Export `vouchersTable` and relations.

- [ ] **Step 4: Push database schema migration**
Run: `npx drizzle-kit push`
Expected: Database schemas synchronized successfully.

- [ ] **Step 5: Run typecheck & commit**
```bash
git add src/db/schema/ src/server/services/payment.service.ts
git commit -m "feat(db): add vouchers table and header announcement columns to store settings"
```

---

### Task 2: Backend Voucher Service & API Endpoints

**Files:**
- Create: `src/server/services/voucher.service.ts`
- Create: `src/server/validators/voucher.schema.ts`
- Create: `src/app/api/vouchers/validate/route.ts`
- Create: `src/app/api/admin/vouchers/route.ts`
- Create: `src/app/api/admin/vouchers/[id]/route.ts`
- Modify: `src/server/services/checkout.service.ts`

**Interfaces:**
- Consumes: Drizzle `db`, `vouchersTable`, `checkoutService`.
- Produces:
  - `voucherService.validateVoucher(code, subtotal, shippingCost)`
  - `voucherService.createVoucher(data)`, `updateVoucher(id, data)`, `deleteVoucher(id)`, `getAllVouchers()`
  - `GET /api/vouchers/validate?code=...&subtotal=...`
  - `GET/POST /api/admin/vouchers`, `PATCH/DELETE /api/admin/vouchers/:id`

- [ ] **Step 1: Implement `src/server/services/voucher.service.ts` & validators**
Implement validation rules for `fixed`, `percentage`, and `shipping` discounts with order minimum and quota limits.

- [ ] **Step 2: Create API routes `/api/vouchers/validate` and `/api/admin/vouchers`**
Implement client validation route and admin CRUD routes with session verification.

- [ ] **Step 3: Update `checkout.service.ts` to use real voucher service**
Replace hardcoded voucher logic in `checkout.service.ts` with `voucherService.validateVoucher` and increment voucher usage count upon order creation.

- [ ] **Step 4: Run typecheck & commit**
```bash
git add src/server/services/ src/server/validators/ src/app/api/vouchers/ src/app/api/admin/vouchers/
git commit -m "feat(api): implement voucher service, validation engine, and admin api routes"
```

---

### Task 3: Admin Voucher Management Page (`/admin/voucher`)

**Files:**
- Modify: `src/components/admin/AdminSidebar.tsx`
- Create: `src/app/admin/voucher/page.tsx`

**Interfaces:**
- Consumes: `GET/POST /api/admin/vouchers`, `PATCH/DELETE /api/admin/vouchers/:id`.
- Produces: Interactive Seller Center interface for creating and managing promotional vouchers.

- [ ] **Step 1: Add `🎟️ Voucher Promo` to `AdminSidebar.tsx`**
Place between *Flash Sale* and *Pesanan* or after *Pesanan* with active highlight.

- [ ] **Step 2: Build `src/app/admin/voucher/page.tsx`**
Implement:
1. Voucher Summary Metric Tiles (Total Voucher, Voucher Aktif, Total Penggunaan).
2. Active Vouchers Table: Code pill with copy action, discount type badge, minimum spend, validity period, usage bar (`used_count / usage_limit`), status toggle switch, edit and delete buttons.
3. Modal Tambah/Edit Voucher: Code input, title, discount type selector (Rp, %, Ongkir), discount amount, max discount cap, min purchase, usage quota, date range pickers, and save button.
4. Claymorphic styling with toast alerts.

- [ ] **Step 3: Run typecheck & commit**
```bash
git add src/components/admin/AdminSidebar.tsx src/app/admin/voucher/page.tsx
git commit -m "feat(admin): build voucher promo management page in seller center"
```

---

### Task 4: Dynamic Header Announcement Bar

**Files:**
- Modify: `src/components/admin/settings/ProfileSettingsTab.tsx`
- Modify: `src/app/admin/setting/page.tsx`
- Modify: `src/components/layout/NavbarFooter.tsx`

**Interfaces:**
- Consumes: `storeSettingsTable.header_announcement_*`.
- Produces: Live configurable announcement banner at the top of the storefront.

- [ ] **Step 1: Add Announcement Bar Form to `ProfileSettingsTab.tsx`**
Add:
- Toggle: Aktifkan / Sembunyikan Banner Pengumuman Atas.
- Input: Teks Pengumuman Header (misal: "🎉 Gratis Ongkir s/d Rp 20.000...").
- Input: Tautan / Link Tujuan (opsional).
- Live Preview: Mini preview box displaying the banner in realtime.

- [ ] **Step 2: Update `src/app/admin/setting/page.tsx`**
Save and load `headerAnnouncementEnabled`, `headerAnnouncementText`, and `headerAnnouncementLink`.

- [ ] **Step 3: Update `NavbarFooter.tsx`**
Fetch store settings or pass announcement banner props dynamically so the top banner renders the real database text or hides gracefully when toggled off.

- [ ] **Step 4: Run typecheck & commit**
```bash
git add src/components/admin/settings/ProfileSettingsTab.tsx src/app/admin/setting/page.tsx src/components/layout/NavbarFooter.tsx
git commit -m "feat(settings): add dynamic header announcement bar configuration and navbar sync"
```

---

### Task 5: Admin Customer Directory (`/admin/pelanggan`)

**Files:**
- Modify: `src/components/admin/AdminSidebar.tsx`
- Create: `src/app/api/admin/customers/route.ts`
- Create: `src/app/admin/pelanggan/page.tsx`

**Interfaces:**
- Consumes: `usersTable`, `ordersTable`, `addressesTable`.
- Produces: Customer directory page with purchase history and search.

- [ ] **Step 1: Add `👥 Pelanggan` in `src/components/admin/AdminSidebar.tsx`**
Add menu item linked to `/admin/pelanggan`.

- [ ] **Step 2: Create `GET /api/admin/customers` endpoint**
Aggregate registered users with total orders count, total spent (LTV), phone number, and last order date.

- [ ] **Step 3: Build `src/app/admin/pelanggan/page.tsx`**
Implement:
1. Metric Tiles: Total Pelanggan, Pelanggan Aktif Bertransaksi, Total Nilai Belanja Pelanggan.
2. Search & Filter Bar: Instant search by name, email, or phone. Filter by transaction status.
3. Customer Table: Avatar, Full Name, Contact info with direct WhatsApp click-to-chat, Role badge, Order count, Total Spend in Rp, Join date.

- [ ] **Step 4: Run typecheck & commit**
```bash
git add src/components/admin/AdminSidebar.tsx src/app/api/admin/customers/ src/app/admin/pelanggan/page.tsx
git commit -m "feat(admin): add customer directory and analytics page in seller center"
```

---

### Task 6: Storefront Real-Time Voucher Integration in Cart & Checkout

**Files:**
- Modify: `src/components/checkout/CartView.tsx`
- Modify: `src/components/checkout/CheckoutStepper.tsx`

**Interfaces:**
- Consumes: `GET /api/vouchers/validate?code=...&subtotal=...`.
- Produces: Real dynamic voucher application and discount calculation in Cart and Checkout.

- [ ] **Step 1: Update `CartView.tsx` voucher handler**
Call `GET /api/vouchers/validate` when user submits voucher code, applying the real discount returned by the database.

- [ ] **Step 2: Update `CheckoutStepper.tsx` voucher handler**
Validate vouchers in checkout steps against database rules and update `calcSummary.diskonVoucher` dynamically.

- [ ] **Step 3: Run typecheck & commit**
```bash
git add src/components/checkout/CartView.tsx src/components/checkout/CheckoutStepper.tsx
git commit -m "feat(checkout): connect cart and checkout voucher inputs to real database engine"
```

---

### Task 7: End-to-End Build & Verification

**Files:**
- None (verification task)

- [ ] **Step 1: Run TypeScript verification**
Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 2: Run Next.js production build**
Run: `npm run build`
Expected: All 34 routes compile successfully.

- [ ] **Step 3: Synchronize with NgodingPakeAI CLI**
Run: `npx ngodingpakeai sync --plan && npx ngodingpakeai sync`
Expected: All files indexed and synced.

---
