# Frontend API Sync & Dedicated Admin Panel with Product CRUD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menghubungkan seluruh halaman frontend belanja ke database via REST API, membuat layout panel admin mandiri khusus (tanpa header & footer pembeli, dengan sidebar profesional), dan menambahkan antarmuka CRUD produk lengkap untuk admin.

**Architecture:** 
- **Admin Isolation**: Menggunakan Next.js Nested Layout (`src/app/admin/layout.tsx`) dengan dedicated sidebar navigasi toko, header ringkasan admin, dan tanpa Navbar/Footer konsumen.
- **Admin Product CRUD**: Antarmuka modal/form untuk menambah produk baru, mengedit produk beserta varian warna & ukuran, mengatur ketersediaan stok, dan menghapus produk via `/api/admin/products`.
- **Frontend Real Data Sync**: Halaman Beranda, Katalog, Detail Produk, Keranjang, Checkout, dan Riwayat Pesanan mengonsumsi data langsung dari endpoint `/api/...` dengan state management dan loading skeleton yang mulus.
- **Security & Secrets**: Seluruh credentials dan konfigurasi rahasia dikelola secara aman melalui `.env`.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Drizzle ORM, PostgreSQL, Better Auth, Tailwind CSS, Lucide Icons, Zod.

## Global Constraints

- Halaman `/admin/*` tidak boleh merender Navbar atau Footer konsumen. Halaman admin memiliki layout tersendiri (`src/app/admin/layout.tsx`).
- Tidak boleh ada kredensial atau secret yang di-hardcode di dalam kode sumber; semua wajib membaca `process.env.*`.
- Operasi CRUD produk admin harus memvalidasi data dan mengupdate tabel `products`, `product_variants`, dan `product_images`.
- Transaksi checkout dan riwayat pesanan harus tersinkronisasi langsung dengan database PostgreSQL.

---

### Task 1: Environment Variables Audit & Secrets Cleanup

**Files:**
- Modify: `.env`
- Modify: `.env.example`
- Modify: `src/server/auth.ts`
- Modify: `src/db/index.ts`
- Modify: `src/lib/auth-client.ts`

**Interfaces:**
- Produces: Konfigurasi env yang bersih dan aman untuk `DATABASE_URL`, `BETTER_AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`.

- [ ] **Step 1: Periksa dan pastikan `.env` & `.env.example` memuat seluruh variabel konfigurasi**
```env
DATABASE_URL="postgres://postgres:postgres@localhost:5432/baby_shop"
BETTER_AUTH_SECRET="babykids_secret_key_production_2026_secure_token"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

- [ ] **Step 2: Pastikan `src/server/auth.ts` dan `src/db/index.ts` membaca dari env secara konsisten**

---

### Task 2: Dedicated Admin Layout (Sidebar & Topbar Khusus, Tanpa Navbar/Footer Toko)

**Files:**
- Create: `src/app/admin/layout.tsx`
- Create: `src/components/admin/AdminSidebar.tsx`
- Create: `src/components/admin/AdminHeader.tsx`
- Modify: `src/app/admin/page.tsx`

**Interfaces:**
- Produces: Layout khusus panel admin dengan navigasi sidebar mandiri (Ringkasan, Produk, Pesanan, Promo, Kembali ke Toko) dan header admin interaktif dengan tombol Logout.

- [ ] **Step 1: Buat `src/components/admin/AdminSidebar.tsx`**
- [ ] **Step 2: Buat `src/components/admin/AdminHeader.tsx`**
- [ ] **Step 3: Buat `src/app/admin/layout.tsx` yang membungkus seluruh rute admin**
- [ ] **Step 4: Sesuaikan `src/app/admin/page.tsx` untuk bekerja di dalam layout admin baru tanpa Navbar/Footer pembeli**

---

### Task 3: Admin Product CRUD Interface (Create, Edit, Delete, Varian & Stok)

**Files:**
- Create: `src/components/admin/ProductFormModal.tsx`
- Create: `src/components/admin/ProductTable.tsx`
- Create: `src/components/admin/DeleteProductDialog.tsx`
- Modify: `src/app/admin/page.tsx`
- Modify: `src/app/api/admin/products/route.ts` (jika diperlukan support batch update / delete)

**Interfaces:**
- Produces:
  - Form modal tambah produk baru lengkap dengan pilihan kategori, foto URL, harga, diskon, stok, bahan SNI, usia cocok, dan varian (warna & ukuran).
  - Form modal edit produk dengan pre-fill data.
  - Dialog konfirmasi hapus produk dengan feedback toast.
  - Refresh data tabel produk secara reaktif setelah mutasi.

- [ ] **Step 1: Buat `src/components/admin/ProductFormModal.tsx`**
- [ ] **Step 2: Buat `src/components/admin/DeleteProductDialog.tsx`**
- [ ] **Step 3: Buat `src/components/admin/ProductTable.tsx` dan integrasikan ke `src/app/admin/page.tsx`**

---

### Task 4: Sinkronisasi API Halaman Beranda & Katalog Produk

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/components/catalog/CatalogView.tsx`

**Interfaces:**
- Produces:
  - Beranda (`/`) memuat kategori dan produk populer, terbaru, rekomendasi, serta promo langsung dari database (`productService` / `/api/products`).
  - Katalog (`/katalog` & `/kategori/[slug]`) memanggil `GET /api/products` dengan parameter pencarian teks, filter kategori, rentang harga, rating, dan sorting dinamis.

- [ ] **Step 1: Update `src/app/page.tsx` untuk mengambil data produk langsung dari `productService.getProducts()` di server**
- [ ] **Step 2: Update `src/components/catalog/CatalogView.tsx` untuk memanggil API `/api/products` dan `/api/categories` secara dinamis**

---

### Task 5: Sinkronisasi API Halaman Detail Produk

**Files:**
- Modify: `src/app/produk/[slug]/page.tsx`
- Modify: `src/components/product/ProductDetailView.tsx`

**Interfaces:**
- Produces:
  - Halaman `/produk/[slug]` mengambil data detail produk, varian, dan produk terkait langsung dari `productService.getProductBySlug(slug)` & `productService.getRelatedProducts()`.
  - Tombol "Tambah ke Keranjang" memanggil API `POST /api/cart`.

- [ ] **Step 1: Update `src/app/produk/[slug]/page.tsx` menggunakan `productService`**
- [ ] **Step 2: Update `src/components/product/ProductDetailView.tsx` agar tombol "Tambah ke Keranjang" memanggil `POST /api/cart`**

---

### Task 6: Sinkronisasi API Keranjang Belanja & Checkout

**Files:**
- Modify: `src/components/checkout/CartView.tsx`
- Modify: `src/components/checkout/CheckoutStepper.tsx`

**Interfaces:**
- Produces:
  - Keranjang belanja membaca data item live dari `/api/cart`, update jumlah via `PATCH /api/cart/[itemId]`, dan hapus item via `DELETE /api/cart/[itemId]`.
  - Halaman checkout menghitung ongkir live via `/api/checkout/calculate` dan membuat pesanan resmi via `POST /api/checkout/order`.

- [ ] **Step 1: Update `src/components/checkout/CartView.tsx` dengan integrasi `/api/cart`**
- [ ] **Step 2: Update `src/components/checkout/CheckoutStepper.tsx` dengan integrasi `/api/checkout/calculate` dan `/api/checkout/order`**

---

### Task 7: Sinkronisasi API Riwayat Pesanan & Admin Orders Management

**Files:**
- Modify: `src/components/order/OrderHistoryView.tsx`
- Modify: `src/app/admin/page.tsx`

**Interfaces:**
- Produces:
  - Riwayat pesanan pembeli memuat data pesanan live dari `/api/orders` dan tombol konfirmasi terima memanggil `POST /api/orders/[id]/confirm`.
  - Panel admin memuat daftar seluruh pesanan dari `/api/admin/orders`, update status (diproses/dikirim) dan input nomor resi kurir real-time.

- [ ] **Step 1: Update `src/components/order/OrderHistoryView.tsx` dengan pemanggilan `/api/orders`**
- [ ] **Step 2: Update manajemen pesanan di `src/app/admin/page.tsx` dengan pemanggilan `/api/admin/orders`**

---

### Task 8: Build, Typecheck, & Verifikasi End-to-End

**Files:**
- Full build check and database verification.

- [ ] **Step 1: Jalankan `npm run build` untuk memverifikasi seluruh rute terkompilasi.**
- [ ] **Step 2: Jalankan `npx ngodingpakeai sync` untuk menyinkronkan seluruh perubahan ke workspace.**
