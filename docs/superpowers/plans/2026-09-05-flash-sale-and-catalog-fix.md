# Flash Sale System and Catalog Bugfix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the catalog product list display bug on `/katalog` and build a complete Flash Sale management system with custom event pricing, dynamic countdown deadlines, dedicated admin Seller Center interface (`/admin/flash-sale`), and cleanup of the product add/edit forms.

**Architecture:** 
- Next.js 16 (App Router) + PostgreSQL + Drizzle ORM.
- Database schema expansion on `productsTable` (`is_flash_sale`, `flash_sale_price`) and `storeSettingsTable` (`flash_sale_is_active`, `flash_sale_title`, `flash_sale_end_time`).
- Client-side data parser normalization in `CatalogView.tsx` supporting standard and paginated JSON payloads.
- Claymorphic UI components in Admin Seller Center with real-time countdown synchronization on the storefront homepage.

**Tech Stack:** Next.js 16, TypeScript, Drizzle ORM, postgres.js, Tailwind CSS v4, Lucide Icons, Better Auth.

## Global Constraints
- Database credentials, API keys, and secrets must remain strictly in `.env` and accessed via `process.env`.
- Maintain Claymorphism + Vibrant Block styling with Nunito Bold (`--font-heading`) and Quicksand Medium (`--font-body`).
- Palettes: `#FF9F43` (Warm Orange), `#87CEEB` (Sky Blue), `#FFF8F0` (Cream background).
- All changes must pass `npx tsc --noEmit` and `npm run build` with 0 errors.

---

### Task 1: Fix Catalog Page Bug (`/katalog`, `/katalog?sort=...`, categories, search)

**Files:**
- Modify: `src/components/catalog/CatalogView.tsx`

**Interfaces:**
- Consumes: `GET /api/products` -> `{ success: true, data: Product[] | { items: Product[] }, pagination: { total: number } }`
- Produces: Correct state `products: Product[]` and `totalCount: number` rendered on `/katalog`.

- [ ] **Step 1: Update `CatalogView.tsx` data parsing logic**
Edit `src/components/catalog/CatalogView.tsx` around line 120 so that it handles both array `json.data` and object `json.data.items`:
```typescript
const rawItems: any[] = Array.isArray(json.data)
  ? json.data
  : Array.isArray(json.data?.items)
  ? json.data.items
  : [];
const fetchedItems: Product[] = rawItems.map(mapDbProductToProduct);
setProducts(fetchedItems);
const total = json.pagination?.total || json.data?.pagination?.total || fetchedItems.length;
setTotalCount(total);
```

- [ ] **Step 2: Verify `CatalogView.tsx` fallback handling**
Ensure fallback client-side filtering also triggers properly if the API returns an error or empty result.

- [ ] **Step 3: Run TypeScript check**
Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 4: Commit**
```bash
git add src/components/catalog/CatalogView.tsx
git commit -m "fix(catalog): resolve empty product array bug in CatalogView data parser"
```

---

### Task 2: Database Schema & Type Migration for Flash Sale

**Files:**
- Modify: `src/db/schema/products.ts`
- Modify: `src/db/schema/settings.ts`
- Modify: `src/types/product.ts`
- Modify: `src/lib/mappers.ts`

**Interfaces:**
- Produces: `productsTable.is_flash_sale`, `productsTable.flash_sale_price`, `storeSettingsTable.flash_sale_is_active`, `storeSettingsTable.flash_sale_title`, `storeSettingsTable.flash_sale_end_time`.

- [ ] **Step 1: Add columns in `src/db/schema/products.ts`**
```typescript
is_flash_sale: boolean('is_flash_sale').default(false).notNull(),
flash_sale_price: integer('flash_sale_price'),
```

- [ ] **Step 2: Add columns in `src/db/schema/settings.ts`**
```typescript
flash_sale_is_active: boolean('flash_sale_is_active').default(true).notNull(),
flash_sale_title: varchar('flash_sale_title', { length: 150 }).default('Promo Hemat Rutin'),
flash_sale_end_time: timestamp('flash_sale_end_time'),
```

- [ ] **Step 3: Update `src/types/product.ts` & `src/lib/mappers.ts`**
Add `isFlashSale?: boolean` and `hargaFlashSale?: number` to `Product` interface and update `mapDbProductToProduct`:
```typescript
isFlashSale: Boolean(dbProduct.is_flash_sale || dbProduct.isFlashSale),
hargaFlashSale: dbProduct.flash_sale_price ? Number(dbProduct.flash_sale_price) : undefined,
```

- [ ] **Step 4: Push database schema migration**
Run: `npx drizzle-kit push`
Expected: Database schemas synchronized successfully.

- [ ] **Step 5: Commit**
```bash
git add src/db/schema/ src/types/product.ts src/lib/mappers.ts
git commit -m "feat(db): add flash sale columns to products and store_settings schema"
```

---

### Task 3: Backend Services & API Endpoints for Flash Sale Management

**Files:**
- Modify: `src/server/services/product.service.ts`
- Create: `src/app/api/admin/flash-sale/route.ts`
- Create: `src/app/api/admin/flash-sale/settings/route.ts`

**Interfaces:**
- Consumes: Drizzle `db`, Better Auth session (admin check).
- Produces:
  - `GET /api/admin/flash-sale`: `{ success: true, data: { settings, flashSaleProducts, allProducts } }`
  - `POST /api/admin/flash-sale/settings`: Update active state, title, and deadline date/time.
  - `POST /api/admin/flash-sale`: Add or remove product from flash sale with custom price.

- [ ] **Step 1: Add Flash Sale methods in `src/server/services/product.service.ts`**
Add helper functions:
- `getFlashSaleProducts()`: Query products where `is_flash_sale = true`.
- `updateProductFlashSale(productId, isFlashSale, flashSalePrice)`: Update product record.

- [ ] **Step 2: Create API route `src/app/api/admin/flash-sale/route.ts`**
Implement `GET` (fetch event settings & items) and `POST` (toggle product in/out of flash sale with price).

- [ ] **Step 3: Create API route `src/app/api/admin/flash-sale/settings/route.ts`**
Implement `POST` to save `flash_sale_is_active`, `flash_sale_title`, and `flash_sale_end_time` into `store_settings`.

- [ ] **Step 4: Run typecheck**
Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 5: Commit**
```bash
git add src/server/services/product.service.ts src/app/api/admin/flash-sale/
git commit -m "feat(api): implement admin flash sale service and route handlers"
```

---

### Task 4: Admin Sidebar & Flash Sale Seller Center Page (`/admin/flash-sale`)

**Files:**
- Modify: `src/components/admin/AdminSidebar.tsx`
- Create: `src/app/admin/flash-sale/page.tsx`

**Interfaces:**
- Consumes: `GET /api/admin/flash-sale`, `POST /api/admin/flash-sale/settings`, `POST /api/admin/flash-sale`.
- Produces: Interactive Seller Center management dashboard for Flash Sale.

- [ ] **Step 1: Add `⚡ Flash Sale` in `src/components/admin/AdminSidebar.tsx`**
Place between *Pesanan* and *Statistik Penjualan* with `Zap` icon and active state highlighting.

- [ ] **Step 2: Build `src/app/admin/flash-sale/page.tsx`**
Implement:
1. Event Settings Box: Toggle active, title input, deadline picker (`datetime-local`), and Save button.
2. Flash Sale Items Table: Displays image, name, regular price, editable Flash Sale Price input, auto-calculated discount percent badge, and remove button.
3. "Tambah Produk ke Flash Sale" Modal: Searchable list of store products with price input to add new items.
4. Claymorphic styling with toast alerts.

- [ ] **Step 3: Run typecheck**
Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 4: Commit**
```bash
git add src/components/admin/AdminSidebar.tsx src/app/admin/flash-sale/page.tsx
git commit -m "feat(admin): add dedicated flash sale management page in seller center"
```

---

### Task 5: Cleanup Product Form (Remove "Promo Spesial" visibility checkbox)

**Files:**
- Modify: `src/components/admin/ProductFormModal.tsx`
- Modify: `src/app/admin/produk/tambah/page.tsx`
- Modify: `src/app/admin/produk/[id]/edit/page.tsx`

**Interfaces:**
- Removes: `isPromo` / `is_promo` visibility toggle from product add/edit form.
- Preserves: `is_popular`, `is_new_arrival`, `is_recommended` and core product fields.

- [ ] **Step 1: Remove `isPromo` from `ProductFormModal.tsx`**
Remove the `isPromo` checkbox state and input from the UI.

- [ ] **Step 2: Check `tambah/page.tsx` and `[id]/edit/page.tsx`**
Ensure no lingering `isPromo` fields or broken labels exist.

- [ ] **Step 3: Run typecheck**
Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 4: Commit**
```bash
git add src/components/admin/ProductFormModal.tsx src/app/admin/produk/
git commit -m "refactor(admin): remove promo spesial checkbox from product creation form"
```

---

### Task 6: Storefront Real-Time Flash Sale & Countdown Timer Integration

**Files:**
- Modify: `src/components/home/HomeSections.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/components/product/ProductCard.tsx`
- Modify: `src/components/product/ProductDetailView.tsx`

**Interfaces:**
- Consumes: Real `store_settings.flash_sale_end_time`, `store_settings.flash_sale_is_active`, and products with `is_flash_sale = true`.
- Produces: Live ticking countdown timer and discounted flash sale pricing across storefront.

- [ ] **Step 1: Update `PromoSection` in `src/components/home/HomeSections.tsx`**
- Connect countdown timer to `endTime` prop (or default 24h interval if not set).
- Calculate live hours, minutes, seconds using `useEffect` with 1-second interval.
- Display `flash_sale_price` as main price and regular price as `hargaCoret`.

- [ ] **Step 2: Update `src/app/page.tsx`**
Fetch `storeSettings` and pass Flash Sale settings and products (`products.filter(p => p.isFlashSale)`) into `PromoSection`.

- [ ] **Step 3: Update `ProductCard.tsx` & `ProductDetailView.tsx`**
Support active `hargaFlashSale` and Flash Sale discount tags.

- [ ] **Step 4: Run typecheck**
Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 5: Commit**
```bash
git add src/components/home/HomeSections.tsx src/app/page.tsx src/components/product/
git commit -m "feat(storefront): connect flash sale section and countdown timer to database"
```

---

### Task 7: End-to-End Verification & Build

**Files:**
- None (verification task)

- [ ] **Step 1: Run TypeScript verification**
Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 2: Run Next.js production build**
Run: `npm run build`
Expected: All 32+ routes compile successfully.

- [ ] **Step 3: Synchronize with NgodingPakeAI CLI**
Run: `npx ngodingpakeai sync --plan` followed by `npx ngodingpakeai sync`.
Expected: All files indexed and synced.

---
