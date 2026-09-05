# Vouchers, Header Announcement, and Customer Management Design Document

**Date:** 2026-09-05  
**Product:** NBusiness (Baby & Kids eCommerce)  
**Status:** Approved  

---

## 1. Executive Summary & Goals

This document specifies the production-readiness overhaul for three core business capabilities:
1. **Dynamic Store Voucher System (`/admin/voucher`)**:
   - Transition from hardcoded voucher lists to a database-backed promotional engine supporting fixed discount (Rp), percentage discount (%), and shipping subsidies with order minimums, usage quotas, and expiry dates.
   - Real-time validation at Cart (`/keranjang`) and Checkout (`/checkout`) with automatic quota decrements on order placement.
2. **Dynamic Header Announcement Bar**:
   - Store settings controls in Admin (`/admin/setting`) for custom announcement text, target URL, and visibility toggle, directly consumed by storefront navbar (`NavbarFooter.tsx`).
3. **Customer Relationship & Registered Users Directory (`/admin/pelanggan`)**:
   - Seller Center interface aggregating registered buyers from `usersTable`, computing order counts and total customer lifetime value (LTV), with instant search and filtering.

---

## 2. Database Schema Specifications

### 2.1 Table `vouchers` (`src/db/schema/vouchers.ts`)
```typescript
export const vouchersTable = pgTable('vouchers', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique(), // Uppercase code (e.g. ANAKHEMAT)
  name: varchar('name', { length: 150 }).notNull(),
  description: text('description'),
  discount_type: varchar('discount_type', { length: 20 }).default('fixed').notNull(), // 'fixed' | 'percentage' | 'shipping'
  discount_value: integer('discount_value').notNull(), // Rp amount or percentage (e.g. 20000 or 10)
  max_discount_amount: integer('max_discount_amount'), // Max discount cap for percentage types
  min_order_amount: integer('min_order_amount').default(0).notNull(), // Min subtotal required
  usage_limit: integer('usage_limit'), // Nullable: max times voucher can be used across store
  used_count: integer('used_count').default(0).notNull(),
  start_date: timestamp('start_date').defaultNow().notNull(),
  end_date: timestamp('end_date'), // Nullable: no expiry if null
  is_active: boolean('is_active').default(true).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});
```

### 2.2 Table `store_settings` Additions (`src/db/schema/settings.ts`)
Add columns to `storeSettingsTable`:
- `header_announcement_enabled`: `boolean('header_announcement_enabled').default(true).notNull()`
- `header_announcement_text`: `varchar('header_announcement_text', { length: 255 }).default('🎉 Gratis Ongkir s/d Rp 20.000 ke Seluruh Indonesia Belanja Min. Rp 100.000!')`
- `header_announcement_link`: `varchar('header_announcement_link', { length: 255 })`

---

## 3. Architecture & API Endpoints

### 3.1 Voucher Engine (`src/server/services/voucher.service.ts`)
- **`validateVoucher(code, subtotal, shippingCost)`**:
  - Checks if voucher exists, `is_active === true`, `start_date <= now`, and `end_date >= now`.
  - Checks if `used_count < usage_limit`.
  - Checks if `subtotal >= min_order_amount`.
  - Computes exact discount:
    - If `fixed`: `Math.min(discount_value, subtotal)`
    - If `percentage`: `Math.min(Math.round((subtotal * discount_value) / 100), max_discount_amount || Infinity)`
    - If `shipping`: `Math.min(discount_value, shippingCost || 20000)`
- **`incrementVoucherUsage(code)`**:
  - Atomically increments `used_count` upon successful order placement (`POST /api/checkout/order`).

### 3.2 Public & Checkout APIs
- `GET /api/vouchers/validate?code=...&subtotal=...&shippingCost=...`: Returns `{ success: true, valid: boolean, discountAmount: number, message: string }`.
- `GET /api/vouchers/active`: Returns list of public active vouchers displayed to buyers.

### 3.3 Admin Seller Center APIs
- `GET /api/admin/vouchers`: Lists all vouchers with usage statistics.
- `POST /api/admin/vouchers`: Creates a new promotional voucher.
- `PATCH /api/admin/vouchers/:id`: Updates an existing voucher.
- `DELETE /api/admin/vouchers/:id`: Deletes a voucher.
- `GET /api/admin/customers`: Aggregates registered users, total completed orders, total spending, and last active order date.

---

## 4. UI/UX Specifications (Claymorphism + Vibrant Block)

### 4.1 Admin Sidebar (`src/components/admin/AdminSidebar.tsx`)
- Add **"🎟️ Voucher Promo"** (`/admin/voucher`) with `Ticket` icon.
- Add **"👥 Pelanggan"** (`/admin/pelanggan`) with `Users` icon below *Pesanan*.

### 4.2 Voucher Management Page (`src/app/admin/voucher/page.tsx`)
- Summary Metrics (Total Voucher Aktif, Total Diskon Diberikan, Kuota Digunakan).
- Interactive Voucher Table: Code pill, discount type badge, minimum spend, validity period, usage bar (`used_count / usage_limit`), status toggle, edit and delete buttons.
- Create/Edit Modal with instant preview of discount calculation.

### 4.3 Customer Directory Page (`src/app/admin/pelanggan/page.tsx`)
- Metric Tiles: Total Pelanggan, Pelanggan Aktif, Rata-rata Nilai Belanja (AOV).
- Customer Table: Avatar, Name, Email, WhatsApp link, Role badge, Total Pesanan, Total Belanja (Rp), Tanggal Bergabung.
- Real-time search by name, email, or phone.

### 4.4 Header Announcement Bar Settings
- Added to `/admin/setting` (Tab Profil & Tampilan Toko).
- Live preview snippet showing how the banner appears above the storefront navbar.
- Connected to `NavbarFooter.tsx` with hide/show support.

---

## 5. Verification Plan

1. **Database Migration**:
   - Run `npm run db:push` to sync `vouchers` and `store_settings`.
2. **Voucher Validation Testing**:
   - Seed or create voucher `DISKON50K` with min spend Rp 100.000.
   - Test in Cart `/keranjang` and Checkout `/checkout` -> verify discount applies properly and calculates grand total.
3. **Announcement Bar Testing**:
   - Update announcement text in `/admin/setting` and toggle visibility -> verify changes update in storefront header immediately.
4. **Customer List Testing**:
   - Open `/admin/pelanggan` -> verify registered users appear with computed order count and total spending.
5. **Build & Typecheck**:
   - Run `npx tsc --noEmit` -> 0 errors.
   - Run `npm run build` -> All 34 routes compile cleanly.
