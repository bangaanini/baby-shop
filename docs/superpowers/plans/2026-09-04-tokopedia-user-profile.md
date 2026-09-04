# Halaman Akun & Profil Pengguna ala Tokopedia Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mengimplementasikan antarmuka akun dan profil pembeli ala Tokopedia yang terorganisir rapi dalam tata letak 2 kolom responsif (Biodata Diri, Daftar Alamat CRUD dengan Set Alamat Utama, Daftar Transaksi Pembelian dengan pelacakan & pembayaran instan, serta Keamanan Akun & Ubah Kata Sandi).

**Architecture:** Full-Stack Next.js 16 modular dengan User Service Layer (`src/server/services/user.service.ts`), REST API routes (`src/app/api/user/...`), komponen tab Tokopedia-style (`src/components/user/tabs/...`), dan integrasi database Drizzle PostgreSQL (`usersTable`, `addressesTable`, `accountsTable`, `ordersTable`).

**Tech Stack:** Next.js 16 (App Router), TypeScript, Drizzle ORM, PostgreSQL, Better Auth, Tailwind CSS, Lucide Icons, Zod.

## Global Constraints

- Antarmuka mengadopsi struktur 2 kolom ala Tokopedia: Sidebar profil & navigasi akun di sisi kiri, panel konten utama di sisi kanan.
- Seluruh data alamat terhubung langsung dengan tabel `addresses` di database PostgreSQL.
- Ubah kata sandi harus memverifikasi password lama dan mengupdate hash password di `accountsTable`.
- Seluruh antarmuka harus responsif di semua ukuran layar (Desktop, Tablet, dan Mobile).

---

### Task 1: Backend Service Layer & REST API Endpoints Akun Pengguna

**Files:**
- Create: `src/server/validators/user.schema.ts`
- Create: `src/server/services/user.service.ts`
- Create: `src/app/api/user/profile/route.ts`
- Create: `src/app/api/user/addresses/route.ts`
- Create: `src/app/api/user/addresses/[id]/route.ts`
- Create: `src/app/api/user/addresses/[id]/primary/route.ts`
- Create: `src/app/api/user/change-password/route.ts`

**Interfaces:**
- Produces:
  - `userService.getUserProfile(userId)` & `userService.updateUserProfile(userId, data)`
  - `userService.getUserAddresses(userId)` & `userService.createAddress(userId, data)`
  - `userService.updateAddress(addressId, userId, data)` & `userService.deleteAddress(addressId, userId)`
  - `userService.setPrimaryAddress(addressId, userId)`
  - `userService.changeUserPassword(userId, currentPassword, newPassword)`
  - Endpoint REST API lengkap di `/api/user/...`

- [x] **Step 1: Buat schema validator Zod di `src/server/validators/user.schema.ts`**
- [x] **Step 2: Buat service layer di `src/server/services/user.service.ts`**
- [x] **Step 3: Buat route handlers di `src/app/api/user/...`**

---

### Task 2: Komponen Sidebar Akun Pengguna (`UserSidebar.tsx`)

**Files:**
- Create: `src/components/user/UserSidebar.tsx`

**Interfaces:**
- Produces:
  - Sidebar akun pembeli dengan kartu profil avatar/inisial, nama pembeli, email, badge Member VIP NBusiness.
  - Menu navigasi: 👤 Biodata Diri, 📍 Daftar Alamat, 🛍️ Pembelian, 🔒 Keamanan Akun, 🚪 Logout.
  - Bilah tab horizontal adaptif untuk layar smartphone.

- [x] **Step 1: Buat `src/components/user/UserSidebar.tsx`**

---

### Task 3: Tab 1 — Biodata Diri & Edit Profil (`BiodataTab.tsx`)

**Files:**
- Create: `src/components/user/tabs/BiodataTab.tsx`

**Interfaces:**
- Produces:
  - Tampilan dan form ubah biodata diri (Nama Lengkap, Tanggal Lahir, Jenis Kelamin, Email Terverifikasi, Nomor HP/WA, Data Anak).
  - Terintegrasi dengan `PATCH /api/user/profile` dan feedback toast.

- [x] **Step 1: Buat `src/components/user/tabs/BiodataTab.tsx`**

---

### Task 4: Tab 2 — Daftar Alamat Pengiriman CRUD (`AddressesTab.tsx` & `AddressModal.tsx`)

**Files:**
- Create: `src/components/user/AddressModal.tsx`
- Create: `src/components/user/tabs/AddressesTab.tsx`

**Interfaces:**
- Produces:
  - Kartu daftar alamat dengan badge "Alamat Utama".
  - Modal form Tambah Alamat Baru & Ubah Alamat.
  - Aksi "Jadikan Alamat Utama" dan "Hapus Alamat" terhubung ke `/api/user/addresses`.

- [x] **Step 1: Buat `src/components/user/AddressModal.tsx`**
- [x] **Step 2: Buat `src/components/user/tabs/AddressesTab.tsx`**

---

### Task 5: Tab 3 — Daftar Transaksi Pembelian (`OrdersTab.tsx`)

**Files:**
- Create: `src/components/user/tabs/OrdersTab.tsx`

**Interfaces:**
- Produces:
  - Riwayat pesanan dengan filter status (Semua, Menunggu Pembayaran, Diproses, Dikirim, Selesai, Dibatalkan).
  - Kartu pesanan lengkap dengan nomor invoice, foto produk, kurir, nomor resi, modal pelacakan kurir, tombol konfirmasi terima, dan tombol bayar sekarang.

- [x] **Step 1: Buat `src/components/user/tabs/OrdersTab.tsx`**

---

### Task 6: Tab 4 — Keamanan Akun & Ubah Password (`SecurityTab.tsx`)

**Files:**
- Create: `src/components/user/tabs/SecurityTab.tsx`

**Interfaces:**
- Produces:
  - Form ubah password (Password Lama, Password Baru, Konfirmasi Password) dengan sensor lihat/sembunyikan sandi.
  - Terintegrasi dengan `POST /api/user/change-password`.
  - Informasi status verifikasi email dan tombol logout.

- [ ] **Step 1: Buat `src/components/user/tabs/SecurityTab.tsx`**

---

### Task 7: Integrasi Komprehensif Halaman Profil (`UserProfileView.tsx` & Pages)

**Files:**
- Modify: `src/components/user/UserProfileView.tsx`
- Modify: `src/app/user/profil/page.tsx`
- Modify: `src/app/user/pesanan/page.tsx`

**Interfaces:**
- Produces:
  - Halaman profil `/user/profil` yang menggabungkan seluruh tab dan sidebar 2 kolom responsif.
  - Halaman `/user/pesanan` yang otomatis membuka tab Transaksi Pembelian.

- [ ] **Step 1: Update `src/components/user/UserProfileView.tsx` untuk menyatukan seluruh tab**
- [ ] **Step 2: Update `src/app/user/profil/page.tsx` dan `src/app/user/pesanan/page.tsx`**

---

### Task 8: Build, Typecheck, & Verifikasi End-to-End

**Files:**
- Full build check and database verification.

- [ ] **Step 1: Jalankan `npm run build` untuk memverifikasi seluruh rute dan komponen terkompilasi.**
- [ ] **Step 2: Jalankan `npx ngodingpakeai sync` untuk menyinkronkan seluruh perubahan ke workspace.**
