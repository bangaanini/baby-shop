# Flash Sale System & Catalog Query Bugfix Design Document

**Date:** 2026-09-05  
**Product:** NBusiness (Baby & Kids eCommerce)  
**Status:** Approved  

---

## 1. Problem Statement & Background

1. **Catalog Bug (`/katalog` & `/katalog?sort=...`)**:
   - In the storefront homepage, all products render properly because they use the server-side `productService.getProducts()`.
   - When navigating to `/katalog` or sorting (`/katalog?sort=terpopuler`, `sort=terbaru`, etc.), the client component `CatalogView.tsx` displays *"Tidak ada produk yang cocok"*.
   - **Root Cause**: In `GET /api/products`, the response payload is formatted as:
     ```json
     { "success": true, "data": [...items], "pagination": { "total": 30, ... } }
     ```
     However, `CatalogView.tsx` checks `Array.isArray(json.data.items)`. Because `json.data.items` is `undefined`, the state `products` is set to `[]` (empty array), hiding all catalog products.

2. **Flash Sale & Special Promo Management**:
   - The storefront has a *"Promo Hemat Rutin (Flash Sale)"* section with a countdown timer. Currently, countdown and products in this section are static or tied to a generic `is_promo` flag.
   - The user requested:
     - A dedicated Flash Sale management menu in Admin Seller Center (`/admin/flash-sale`).
     - Admin can set the Flash Sale countdown expiration date/time (`batas waktu flash sale`).
     - Admin can add products to Flash Sale and assign specific **Flash Sale prices** (`harga flash sale`).
     - Remove the *"Promo Spesial"* visibility toggle from the Add/Edit product forms (`/admin/produk/tambah` and `ProductFormModal.tsx`), centralizing all promotional deals into the dedicated Flash Sale manager.

---

## 2. Database Schema Changes

### 2.1 Table `products` (`src/db/schema/products.ts`)
Add the following columns to `productsTable`:
- `is_flash_sale`: `boolean('is_flash_sale').default(false).notNull()`
- `flash_sale_price`: `integer('flash_sale_price')` (Stores the discounted event price in IDR)

### 2.2 Table `store_settings` (`src/db/schema/settings.ts`)
Add the following columns to `storeSettingsTable`:
- `flash_sale_is_active`: `boolean('flash_sale_is_active').default(true).notNull()`
- `flash_sale_title`: `varchar('flash_sale_title', { length: 150 }).default('Promo Hemat Rutin')`
- `flash_sale_end_time`: `timestamp('flash_sale_end_time')` (Stores the datetime when the current Flash Sale countdown expires)

---

## 3. Architecture & Data Flow

### 3.1 Catalog Filter & Query Flow
1. **`CatalogView.tsx` Data Reading**:
   ```typescript
   const rawItems = Array.isArray(json.data)
     ? json.data
     : Array.isArray(json.data?.items)
     ? json.data.items
     : [];
   const fetchedItems = rawItems.map(mapDbProductToProduct);
   setProducts(fetchedItems);
   setTotalCount(json.pagination?.total || json.data?.pagination?.total || fetchedItems.length);
   ```
2. **Sorting Logic**:
   - `sort=rekomendasi`: Sort by `is_recommended DESC, sold_count DESC`
   - `sort=terpopuler`: Sort by `sold_count DESC`
   - `sort=terbaru`: Sort by `created_at DESC`
   - `sort=harga-asc`: Sort by `price ASC`
   - `sort=harga-desc`: Sort by `price DESC`
   - `sort=rating`: Sort by `rating DESC, review_count DESC`

### 3.2 Flash Sale Management in Admin (`/admin/flash-sale`)
1. **API Endpoints (`/api/admin/flash-sale`)**:
   - `GET /api/admin/flash-sale`:
     - Returns `{ event: { isActive, title, endTime }, items: [...productsInFlashSale] }`.
   - `POST /api/admin/flash-sale/settings`:
     - Updates `flash_sale_is_active`, `flash_sale_title`, and `flash_sale_end_time` in `store_settings`.
   - `POST /api/admin/flash-sale/items`:
     - Adds a product to Flash Sale: `{ productId, flashSalePrice }`.
     - Updates `is_flash_sale = true` and `flash_sale_price = flashSalePrice` on the product.
   - `PATCH /api/admin/flash-sale/items/:id`:
     - Updates `flash_sale_price` for an existing item.
   - `DELETE /api/admin/flash-sale/items/:id`:
     - Removes product from Flash Sale (`is_flash_sale = false`, `flash_sale_price = null`).

2. **Admin UI (`src/app/admin/flash-sale/page.tsx`)**:
   - Header control block: Event status toggle, event title input, and countdown deadline selector (`datetime-local`).
   - Action: *"Pilih Produk ke Flash Sale"* opening a product picker modal.
   - Product table: Shows image, name, normal price, editable Flash Sale price input, computed discount percentage badge, and delete button.

### 3.3 Product Form Cleanup
- Remove the *"Visibilitas Promo Spesial"* (`isPromo` / `is_promo`) checkbox from:
  - `src/components/admin/ProductFormModal.tsx`
  - `src/app/admin/produk/tambah/page.tsx`
  - `src/app/admin/produk/[id]/edit/page.tsx`
- Ensure form submission preserves existing `is_flash_sale` and `flash_sale_price` without overwriting them.

### 3.4 Storefront Integration (`src/components/home/HomeSections.tsx`)
- `PromoSection`:
  - Receives `products` (filtered where `isFlashSale` is true) and `flashSaleSettings`.
  - Countdown timer calculates hours, minutes, and seconds dynamically against `flashSaleSettings.endTime`.
  - When `is_flash_sale` is active:
    - Display price = `product.hargaFlashSale || product.harga`
    - Strikethrough price = `product.harga`
    - Discount percent = `round(((harga - hargaFlashSale) / harga) * 100)`

---

## 4. UI/UX Specifications (Claymorphism + Vibrant Block)

- **Palette**:
  - Primary Warm Orange: `#FF9F43`
  - Sky Blue Accent: `#87CEEB`
  - Warm Cream Canvas: `#FFF8F0`
- **Admin Sidebar**:
  - Add new menu item `⚡ Flash Sale` linked to `/admin/flash-sale` between *Pesanan* and *Statistik*.
- **Admin Flash Sale Page**:
  - Clay cards (`clay-block`) with `#FFE8D6` borders.
  - Clay inputs with clear currency formatting (`Rp`).
  - Toast notifications for instant save feedback.

---

## 5. Verification Plan

1. **Database Migration**: Run `npm run db:push` to apply schema additions.
2. **Catalog Page Testing**:
   - Visit `/katalog` -> Verify all products render properly instead of "tidak ada produk yang cocok".
   - Visit `/katalog?sort=terpopuler` -> Verify products are sorted by `terjual` descending.
   - Visit `/katalog?sort=terbaru` -> Verify newest items appear first.
   - Visit `/katalog?kategori=perlengkapan` -> Verify category filtering works.
3. **Admin Flash Sale Testing**:
   - Open `/admin/flash-sale` -> Set countdown deadline to future date & save.
   - Add product to Flash Sale with discounted price -> Confirm in database and table.
   - Check Add/Edit Product form -> Confirm "Promo Spesial" toggle is gone.
4. **Storefront Flash Sale Testing**:
   - Open `/` (Home) -> Verify Flash Sale section displays the chosen product with the discounted price, strikethrough price, and live countdown timer.
5. **Build & Typecheck**:
   - Run `npx tsc --noEmit` -> 0 errors.
   - Run `npm run build` -> All 32 routes compile successfully.
