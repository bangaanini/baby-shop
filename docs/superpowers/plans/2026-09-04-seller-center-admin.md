# Seller Center & Professional Admin Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mengubah panel admin menjadi platform Seller Center profesional multi-rute (Dashboard dengan action center, menu Produk ber-submenu Tambah & Daftar Produk, halaman Tambah Produk dengan upload foto Cloudflare R2 di paling atas, opsi Set Cover & Hapus, serta form pengiriman berat gram & dimensi PxLxT; halaman Kelola Pesanan lengkap dengan drawer detail pemantauan pembayaran & nomor resi; halaman Statistik performa penjualan; dan halaman Setting toko).

**Architecture:** Full-Stack Next.js 16 modular dengan nested admin layout (`src/app/admin/layout.tsx`), multi-route pages (`/admin`, `/admin/produk`, `/admin/produk/tambah`, `/admin/produk/[id]/edit`, `/admin/pesanan`, `/admin/statistik`, `/admin/setting`), AWS S3 / Cloudflare R2 Storage Adapter (`src/server/services/storage.service.ts`), dan Drizzle ORM schema enhancement untuk berat & dimensi paket.

**Tech Stack:** Next.js 16, TypeScript, Drizzle ORM, PostgreSQL, `@aws-sdk/client-s3`, Better Auth, Tailwind CSS, Lucide Icons.

## Global Constraints

- Halaman `/admin/*` diisolasi sepenuhnya dalam layout khusus tanpa header/footer konsumen toko.
- Seluruh kredensial Cloudflare R2 (`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`) dikonfigurasi melalui `.env` tanpa di-hardcode.
- Jika kredensial R2 belum terpasang di `.env`, service upload menyediakan fallback preview yang aman agar alur penambahan produk tetap berjalan lancar.
- Form tambah produk memuat upload foto di posisi paling atas dengan kontrol "Set Cover" dan "Hapus Foto", serta formulir pengiriman (berat gram & dimensi PxLxT cm dengan kalkulasi otomatis berat volumetrik).

---

### Task 1: Sidebar Navigasi Baru dengan Sub-Menu & Header Route Detection

**Files:**
- Modify: `src/components/admin/AdminSidebar.tsx`
- Modify: `src/components/admin/AdminHeader.tsx`

**Interfaces:**
- Produces:
  - Sidebar dengan menu berjenjang:
    - 📊 Dashboard (`/admin`)
    - 📦 Produk (Sub-menu 1: ➕ Tambah Produk `/admin/produk/tambah`, Sub-menu 2: 📋 Daftar Produk `/admin/produk`)
    - 🚚 Pesanan (`/admin/pesanan`)
    - 📈 Statistik (`/admin/statistik`)
    - ⚙️ Setting (`/admin/setting`)
    - 🛍️ Ke Toko Utama & Profil Logout
  - Header yang otomatis menampilkan judul halaman dan breadcrumb berdasarkan rute aktif.

- [x] **Step 1: Update `src/components/admin/AdminSidebar.tsx` untuk menambahkan sub-menu produk dan menu baru**
- [x] **Step 2: Update `src/components/admin/AdminHeader.tsx` untuk mengenali path aktif dan menampilkan judul yang dinamis**

---

### Task 2: Cloudflare R2 Storage Service & Upload API Endpoint

**Files:**
- Modify: `package.json` (install `@aws-sdk/client-s3`)
- Modify: `.env.example` & `.env`
- Create: `src/server/services/storage.service.ts`
- Create: `src/app/api/admin/upload/route.ts`

**Interfaces:**
- Produces:
  - `storageService.uploadFile(buffer, fileName, contentType)`
  - Endpoint `POST /api/admin/upload` (menerima `multipart/form-data`, mengembalikan `{ success: true, url: string }`)

- [ ] **Step 1: Install `@aws-sdk/client-s3`**
```bash
npm install @aws-sdk/client-s3
```

- [ ] **Step 2: Tambahkan konfigurasi R2 di `.env.example` dan `.env`**
```env
R2_ACCOUNT_ID="your_account_id"
R2_ACCESS_KEY_ID="your_access_key"
R2_SECRET_ACCESS_KEY="your_secret_key"
R2_BUCKET_NAME="baby-shop-products"
R2_PUBLIC_URL="https://pub-your-id.r2.dev"
```

- [ ] **Step 3: Buat `src/server/services/storage.service.ts` dengan dukungan Cloudflare R2 & fallback preview**
- [ ] **Step 4: Buat `src/app/api/admin/upload/route.ts`**

---

### Task 3: Penambahan Kolom Berat & Dimensi Produk pada Database

**Files:**
- Modify: `src/db/schema/products.ts`
- Modify: `src/server/validators/admin.schema.ts`
- Modify: `src/server/services/admin.service.ts`

**Interfaces:**
- Produces:
  - Kolom `weight_gram` (integer), `dimension_length` (integer), `dimension_width` (integer), `dimension_height` (integer) pada tabel `products`.
  - Dukungan Zod validator dan CRUD admin service untuk berat & dimensi paket.

- [ ] **Step 1: Tambahkan kolom berat dan dimensi di `src/db/schema/products.ts`**
- [ ] **Step 2: Jalankan `npm run db:push` untuk sinkronisasi kolom ke PostgreSQL**
- [ ] **Step 3: Update `src/server/validators/admin.schema.ts` dan `src/server/services/admin.service.ts`**

---

### Task 4: Halaman Tambah Produk (`/admin/produk/tambah`) & Edit Produk (`/admin/produk/[id]/edit`)

**Files:**
- Create: `src/components/admin/ProductPhotoUploader.tsx`
- Create: `src/components/admin/ShippingDimensionForm.tsx`
- Create: `src/app/admin/produk/tambah/page.tsx`
- Create: `src/app/admin/produk/[id]/edit/page.tsx`

**Interfaces:**
- Produces:
  - Komponen `ProductPhotoUploader`: Dropzone upload foto R2 di posisi paling atas dengan fitur "Set Cover" (foto cover pertama ber-badge) dan "Hapus Foto".
  - Komponen `ShippingDimensionForm`: Form input berat paket (gram), dimensi P x L x T (cm), dan kalkulasi otomatis berat volumetrik kurir `(P*L*T)/6000` kg.
  - Halaman penuh `/admin/produk/tambah` dan `/admin/produk/[id]/edit`.

- [ ] **Step 1: Buat komponen `src/components/admin/ProductPhotoUploader.tsx`**
- [ ] **Step 2: Buat komponen `src/components/admin/ShippingDimensionForm.tsx`**
- [ ] **Step 3: Buat halaman `src/app/admin/produk/tambah/page.tsx`**
- [ ] **Step 4: Buat halaman `src/app/admin/produk/[id]/edit/page.tsx`**

---

### Task 5: Halaman Daftar Produk (`/admin/produk`)

**Files:**
- Create: `src/app/admin/produk/page.tsx`

**Interfaces:**
- Produces:
  - Halaman dedicated daftar produk seller center dengan tabel produk, filter pencarian & kategori, quick action edit & delete, serta tombol navigasi ke "Tambah Produk".

- [ ] **Step 1: Buat halaman `src/app/admin/produk/page.tsx`**

---

### Task 6: Halaman Kelola Pesanan Komprehensif (`/admin/pesanan`) & Drawer Detail Order

**Files:**
- Create: `src/components/admin/OrderDetailDrawer.tsx`
- Create: `src/app/admin/pesanan/page.tsx`

**Interfaces:**
- Produces:
  - Halaman `/admin/pesanan` dengan filter tab status (`Semua`, `Perlu Diproses`, `Sedang Dikirim`, `Selesai`, `Dibatalkan`).
  - Drawer detail pesanan lengkap: informasi kontak pembeli (dengan tombol WhatsApp), rincian pembayaran, input nomor resi kurir, update status pengiriman, timeline paket, dan tombol cetak struk/invoice.

- [ ] **Step 1: Buat komponen `src/components/admin/OrderDetailDrawer.tsx`**
- [ ] **Step 2: Buat halaman `src/app/admin/pesanan/page.tsx`**

---

### Task 7: Halaman Dashboard Utama Seller Center (`/admin`)

**Files:**
- Modify: `src/app/admin/page.tsx`

**Interfaces:**
- Produces:
  - Dashboard seller center dengan Action Center "Penting Hari Ini" (notifikasi pesanan baru perlu diproses, pesanan siap dikirim, peringatan stok menipis), kartu metrik omzet & pesanan, grafik tren ringkas, dan 5 pesanan terbaru yang butuh tindakan cepat.

- [ ] **Step 1: Update `src/app/admin/page.tsx`**

---

### Task 8: Halaman Statistik & Performa Toko (`/admin/statistik`)

**Files:**
- Create: `src/app/admin/statistik/page.tsx`

**Interfaces:**
- Produces:
  - Halaman analitik seller center yang menampilkan grafik tren penjualan, konversi toko, peringkat 5 produk terlaris (*Top Selling SKU*), dan distribusi omzet berdasarkan kategori.

- [x] **Step 1: Buat halaman `src/app/admin/statistik/page.tsx`**

---

### Task 9: Halaman Pengaturan Toko (`/admin/setting`)

**Files:**
- Create: `src/app/admin/setting/page.tsx`

**Interfaces:**
- Produces:
  - Halaman konfigurasi toko: alamat gudang asal pengiriman (titik asal penentuan tarif kurir se-Indonesia), toggle saklar kurir ekspedisi aktif (SiCepat, JNE, J&T, Anteraja), toggle metode pembayaran aktif (QRIS, VA Bank), dan status koneksi storage Cloudflare R2.

- [ ] **Step 1: Buat halaman `src/app/admin/setting/page.tsx`**

---

### Task 10: Build, Typecheck, & Verifikasi End-to-End

**Files:**
- Full build check and database verification.

- [ ] **Step 1: Jalankan `npm run build` untuk memverifikasi bahwa seluruh rute admin dan sub-menu terkompilasi.**
- [ ] **Step 2: Jalankan `npx ngodingpakeai sync` untuk menyinkronkan seluruh perubahan ke workspace.**
