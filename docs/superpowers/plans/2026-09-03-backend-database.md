# Backend & Database Implementation Plan (PostgreSQL + Drizzle ORM)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mengimplementasikan backend database PostgreSQL sesungguhnya dengan Drizzle ORM, Zod validator, Clean Service Layer, dan Next.js App Router REST API endpoints untuk katalog produk, keranjang belanja, transaksi checkout, pelacakan pesanan, dan panel admin.

**Architecture:** Full-Stack Next.js modular yang memisahkan schema Drizzle (`src/db/schema/`), business logic layer (`src/server/services/`), input validator (`src/server/validators/`), dan Next.js Route Handlers (`src/app/api/...`).

**Tech Stack:** Next.js 16, TypeScript, Drizzle ORM, `postgres` (driver), `dotenv`, `zod`, `drizzle-kit`.

## Global Constraints

- Semua entitas uang di database disimpan dalam integer Rupiah (tanpa desimal).
- Nomor invoice pesanan mengikuti format string unik `BK-YYYYMM-XXXXXX`.
- Endpoint API mengembalikan format JSON seragam `{ success: boolean, data?: any, message?: string, error?: string }`.
- Mendukung koneksi database lokal maupun cloud PostgreSQL melalui environment variable `DATABASE_URL`.

---

### Task 1: Setup Dependencies & Konfigurasi Drizzle ORM

**Files:**
- Create: `src/db/index.ts`
- Create: `drizzle.config.ts`
- Create: `.env.example`
- Modify: `package.json`

**Interfaces:**
- Produces: `db` instance dari Drizzle ORM untuk query database PostgreSQL.

- [ ] **Step 1: Install Drizzle ORM, postgres driver, zod, dan drizzle-kit**
```bash
npm install drizzle-orm postgres zod dotenv
npm install -D drizzle-kit @types/pg
```

- [ ] **Step 2: Buat file konfigurasi `.env.example` & `.env`**
```env
DATABASE_URL="postgres://postgres:postgres@localhost:5432/baby_shop"
```

- [ ] **Step 3: Buat `drizzle.config.ts`**
```typescript
import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config();

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/baby_shop',
  },
});
```

- [ ] **Step 4: Buat instance database connection di `src/db/index.ts`**
```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/baby_shop';

// Client for queries
export const client = postgres(connectionString, { max: 10 });
export const db = drizzle(client, { schema });
```

---

### Task 2: Definisi Skema Tabel Drizzle ORM

**Files:**
- Create: `src/db/schema/categories.ts`
- Create: `src/db/schema/products.ts`
- Create: `src/db/schema/users.ts`
- Create: `src/db/schema/carts.ts`
- Create: `src/db/schema/orders.ts`
- Create: `src/db/schema/index.ts`

**Interfaces:**
- Produces: Tabel Drizzle `categoriesTable`, `productsTable`, `productVariantsTable`, `productImagesTable`, `usersTable`, `addressesTable`, `cartsTable`, `cartItemsTable`, `ordersTable`, `orderItemsTable`, `trackingHistoryTable`.

- [ ] **Step 1: Buat skema `src/db/schema/categories.ts`**
- [ ] **Step 2: Buat skema `src/db/schema/products.ts` dengan relasi varian dan galeri gambar**
- [ ] **Step 3: Buat skema `src/db/schema/users.ts` dan `addresses.ts`**
- [ ] **Step 4: Buat skema `src/db/schema/carts.ts`**
- [ ] **Step 5: Buat skema `src/db/schema/orders.ts` dengan relasi `order_items` dan `tracking_history`**
- [ ] **Step 6: Re-export semua tabel di `src/db/schema/index.ts`**

---

### Task 3: Database Seeder & Mock Data Migration Script

**Files:**
- Create: `src/db/seed.ts`
- Modify: `package.json` (tambah script `"db:seed"`)

**Interfaces:**
- Consumes: Mock data dari `src/data/mock-products.ts`, `src/data/mock-checkout.ts`, `src/data/mock-orders.ts`.
- Produces: Fungsi `seedDatabase()` untuk inisialisasi basis data lengkap.

- [ ] **Step 1: Tulis script `src/db/seed.ts` yang menginsert kategori, 16 produk dengan varian, user demo, dan order demo**
- [ ] **Step 2: Tambahkan script `"db:seed": "node --loader ts-node/esm src/db/seed.ts"` atau executable ts script ke `package.json`**

---

### Task 4: Product Service & Catalog API Endpoints

**Files:**
- Create: `src/server/validators/product.schema.ts`
- Create: `src/server/services/product.service.ts`
- Create: `src/app/api/categories/route.ts`
- Create: `src/app/api/products/route.ts`
- Create: `src/app/api/products/[slug]/route.ts`

**Interfaces:**
- Produces:
  - `productService.getProducts(filters)`
  - `productService.getProductBySlug(slug)`
  - `productService.getCategories()`
  - Endpoint `GET /api/categories`, `GET /api/products`, `GET /api/products/[slug]`

- [ ] **Step 1: Tulis Zod validator di `src/server/validators/product.schema.ts`**
- [ ] **Step 2: Tulis business logic di `src/server/services/product.service.ts`**
- [ ] **Step 3: Tulis route handler di `src/app/api/categories/route.ts`**
- [ ] **Step 4: Tulis route handler di `src/app/api/products/route.ts`**
- [ ] **Step 5: Tulis route handler di `src/app/api/products/[slug]/route.ts`**

---

### Task 5: Cart Service & Cart API Endpoints

**Files:**
- Create: `src/server/validators/cart.schema.ts`
- Create: `src/server/services/cart.service.ts`
- Create: `src/app/api/cart/route.ts`
- Create: `src/app/api/cart/[itemId]/route.ts`

**Interfaces:**
- Produces:
  - `cartService.getCart(userIdOrSession)`
  - `cartService.addToCart(userIdOrSession, payload)`
  - `cartService.updateQuantity(itemId, quantity)`
  - `cartService.removeItem(itemId)`
  - Endpoint `GET /api/cart`, `POST /api/cart`, `PATCH /api/cart/[itemId]`, `DELETE /api/cart/[itemId]`

- [ ] **Step 1: Tulis validator Zod di `src/server/validators/cart.schema.ts`**
- [ ] **Step 2: Tulis `src/server/services/cart.service.ts`**
- [ ] **Step 3: Tulis route handler `src/app/api/cart/route.ts` & `src/app/api/cart/[itemId]/route.ts`**

---

### Task 6: Checkout Service & Order Placement API Endpoints

**Files:**
- Create: `src/server/validators/checkout.schema.ts`
- Create: `src/server/services/checkout.service.ts`
- Create: `src/app/api/checkout/calculate/route.ts`
- Create: `src/app/api/checkout/order/route.ts`

**Interfaces:**
- Produces:
  - `checkoutService.calculateOrder(items, courierCode, voucherCode)`
  - `checkoutService.createOrder(payload)` (dengan database transaction & lock stok)
  - Endpoint `POST /api/checkout/calculate`
  - Endpoint `POST /api/checkout/order`

- [ ] **Step 1: Tulis validator Zod `src/server/validators/checkout.schema.ts`**
- [ ] **Step 2: Tulis `src/server/services/checkout.service.ts` dengan kalkulasi ongkir dan pembuatan order transactional**
- [ ] **Step 3: Tulis route handler `src/app/api/checkout/calculate/route.ts` & `src/app/api/checkout/order/route.ts`**

---

### Task 7: Order Service & Tracking API Endpoints

**Files:**
- Create: `src/server/services/order.service.ts`
- Create: `src/app/api/orders/route.ts`
- Create: `src/app/api/orders/[id]/route.ts`
- Create: `src/app/api/orders/[id]/confirm/route.ts`

**Interfaces:**
- Produces:
  - `orderService.getUserOrders(userIdOrEmail)`
  - `orderService.getOrderByIdOrInvoice(idOrInvoice)`
  - `orderService.confirmOrderReceived(orderId)`
  - Endpoint `GET /api/orders`, `GET /api/orders/[id]`, `POST /api/orders/[id]/confirm`

- [ ] **Step 1: Tulis `src/server/services/order.service.ts`**
- [ ] **Step 2: Tulis route handlers di `src/app/api/orders/...`**

---

### Task 8: Admin Service & Dashboard Management API Endpoints

**Files:**
- Create: `src/server/services/admin.service.ts`
- Create: `src/app/api/admin/stats/route.ts`
- Create: `src/app/api/admin/orders/route.ts`
- Create: `src/app/api/admin/products/route.ts`

**Interfaces:**
- Produces:
  - `adminService.getDashboardStats()`
  - `adminService.updateOrderStatusAndTracking(orderId, status, resi)`
  - `adminService.createOrUpdateProduct(payload)`
  - Endpoint `GET /api/admin/stats`, `GET / PATCH /api/admin/orders`, `POST / PUT /api/admin/products`

- [ ] **Step 1: Tulis `src/server/services/admin.service.ts`**
- [ ] **Step 2: Tulis route handlers di `src/app/api/admin/...`**

---

### Task 9: Build & Typecheck Verification

**Files:**
- Test all endpoints with TypeScript compilation and Next.js build.

- [ ] **Step 1: Jalankan `npm run build` untuk memverifikasi tidak ada error tipe dan seluruh rute API terkompilasi.**
- [ ] **Step 2: Jalankan `npx ngodingpakeai sync` untuk menyinkronkan seluruh perubahan ke workspace.**
