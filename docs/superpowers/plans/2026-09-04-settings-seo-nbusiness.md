# Pengaturan Toko Modular, Optimasi SEO Google, dan Rebranding "NBusiness" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menata ulang halaman pengaturan toko (`/admin/setting`) menjadi antarmuka bersegmen kategori yang rapi dan terorganisir (Profil, Alamat, Ekspedisi, Payment Gateway, SEO, Storage), menambahkan konfigurasi SEO lengkap (Google Site Verification, Meta Tags, Open Graph, Sitemap XML dinamis, Robots.txt) agar toko terindeks optimal di Google Search, serta memperbarui seluruh identitas brand aplikasi menjadi **NBusiness**.

**Architecture:** 
- **Database Schema (`src/db/schema/settings.ts`)**: Penambahan kolom SEO dan deskripsi bisnis pada tabel `store_settings`.
- **Search Engine Crawling Engine**: Peta situs dinamis (`src/app/sitemap.ts`) dan aturan perayapan bot (`src/app/robots.ts`).
- **Dynamic SEO Metadata Root Layout (`src/app/layout.tsx`)**: Injeksi meta tag, Google verification tag, dan OpenGraph secara real-time dari database.
- **Segmented Admin Settings UI (`src/app/admin/setting/page.tsx`)**: Antarmuka tab kategori dengan live Google Search snippet preview.
- **Brand Identity Rebranding**: Penyelarasan seluruh komponen (Navbar, Footer, Hero, Admin, Auth) ke identitas merek **NBusiness**.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Drizzle ORM, PostgreSQL, Tailwind CSS, Lucide Icons.

## Global Constraints

- Halaman pengaturan `/admin/setting` dibagi ke dalam 6 tab kategori yang terisolasi dan mudah diakses.
- Sitemap dinamis (`/sitemap.xml`) wajib memuat halaman beranda, katalog, seluruh kategori, dan seluruh produk aktif dari database.
- Tag `google-site-verification` harus disuntikkan secara dinamis jika diisi di pengaturan admin.
- Seluruh penyebutan brand lama digantikan secara menyeluruh menjadi **NBusiness**.

---

### Task 1: Skema Database untuk Kolom SEO & Deskripsi Toko

**Files:**
- Modify: `src/db/schema/settings.ts`
- Modify: `src/server/services/payment.service.ts` (settings mapper)
- Modify: `src/app/api/admin/settings/route.ts`

**Interfaces:**
- Produces: Kolom `store_description`, `seo_meta_title`, `seo_meta_description`, `seo_keywords`, `seo_google_verification`, `seo_og_image` di tabel `store_settings`.

- [ ] **Step 1: Tambahkan kolom SEO di `src/db/schema/settings.ts` dan ubah default brand ke 'NBusiness'**
- [ ] **Step 2: Jalankan `npx drizzle-kit generate` dan `npx drizzle-kit push`**
- [ ] **Step 3: Update `payment.service.ts` dan endpoint `src/app/api/admin/settings/route.ts` untuk menangani field SEO**

---

### Task 2: Peta Situs Dinamis & Robots.txt Google (`/sitemap.xml` & `/robots.txt`)

**Files:**
- Create: `src/app/sitemap.ts`
- Create: `src/app/robots.ts`

**Interfaces:**
- Produces:
  - Route `/sitemap.xml` (Next.js Metadata Route)
  - Route `/robots.txt` (Next.js Metadata Route)

- [ ] **Step 1: Buat `src/app/sitemap.ts` yang mengambil produk dan kategori dari database**
- [ ] **Step 2: Buat `src/app/robots.ts` dengan izin perayapan Googlebot dan link sitemap**

---

### Task 3: Root Layout Dynamic SEO Metadata & Google Verification

**Files:**
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Produces: `generateMetadata()` di Root Layout yang menyuntikkan Meta Title, Meta Description, Keywords, Google Site Verification, dan OpenGraph dinamis dari `store_settings`.

- [ ] **Step 1: Update `src/app/layout.tsx` untuk menggunakan `generateMetadata` dinamis**

---

### Task 4: Halaman Pengaturan Toko Modular Berdasarkan Kategori (`/admin/setting`)

**Files:**
- Modify: `src/app/admin/setting/page.tsx`

**Interfaces:**
- Produces:
  - Bilah Tab Kategori (Profil, Alamat Gudang, Ekspedisi, Payment Gateway, SEO & Google, Cloud Storage).
  - Tab 5 khusus SEO lengkap dengan Google Search Snippet Live Preview Box.
  - Alur simpan per tab atau global dengan toast notifikasi.

- [ ] **Step 1: Redesain `src/app/admin/setting/page.tsx` menjadi tab bersegmen kategori dengan Google Snippet Preview**

---

### Task 5: Rebranding Menyeluruh Menjadi "NBusiness"

**Files:**
- Modify: `src/components/layout/NavbarFooter.tsx`
- Modify: `src/components/home/HeroBanner.tsx`
- Modify: `src/components/admin/AdminSidebar.tsx`
- Modify: `src/components/admin/AdminHeader.tsx`
- Modify: `src/app/admin/page.tsx`
- Modify: `src/components/auth/LoginForm.tsx`
- Modify: `src/components/auth/RegisterForm.tsx`
- Modify: `src/app/auth/unauthorized/page.tsx`

**Interfaces:**
- Produces: Tampilan visual dan penamaan brand yang seragam sebagai **NBusiness** di seluruh aplikasi.

- [ ] **Step 1: Update Navbar & Footer konsumen menjadi NBusiness**
- [ ] **Step 2: Update HeroBanner beranda menjadi NBusiness**
- [ ] **Step 3: Update Admin Sidebar, Header, dan Dashboard menjadi NBusiness Seller Center**
- [ ] **Step 4: Update Halaman Auth Login, Register, dan Unauthorized menjadi NBusiness**

---

### Task 6: Build, Typecheck, & Verifikasi End-to-End

**Files:**
- Full build check and database verification.

- [ ] **Step 1: Jalankan `npm run build` untuk memverifikasi sitemap.xml, robots.txt, dan seluruh rute.**
- [ ] **Step 2: Jalankan `npx ngodingpakeai sync` untuk menyinkronkan seluruh perubahan ke workspace.**
