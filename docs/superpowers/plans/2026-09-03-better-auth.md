# Better Auth & Session Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mengimplementasikan sistem pendaftaran, login email-password, manajemen sesi aman via HTTP-Only cookie, tombol demo login cepat, dan kontrol akses berbasis peran (Role-Based Access Control) untuk rute pembeli (`buyer`) dan panel pengelola toko (`admin`) menggunakan Better Auth & Drizzle ORM.

**Architecture:** Full-Stack Better Auth yang terintegrasi langsung dengan Drizzle ORM PostgreSQL (`src/db/schema/auth.ts`), server-side auth handler (`src/server/auth.ts`), client React SDK (`src/lib/auth-client.ts`), Next.js Middleware (`src/middleware.ts`), dan UI Login/Register (`src/app/auth/...`).

**Tech Stack:** Next.js 16, TypeScript, Better Auth, Drizzle ORM, PostgreSQL, Tailwind CSS, Lucide Icons.

## Global Constraints

- Sesi login disimpan secara aman melalui HTTP-Only Cookie yang dikelola langsung oleh Better Auth.
- Kolom `role` pada pengguna bernilai `'buyer'` atau `'admin'` (default: `'buyer'`).
- Panel admin `/admin/*` terlindungi hanya untuk akun dengan `role: 'admin'`.
- Tersedia tombol *1-Click Demo Login* untuk Pembeli (`sarah.clarissa@example.com` / `password123`) dan Admin (`admin@babykids.id` / `admin123`).

---

### Task 1: Install Better Auth & Skema Tabel Autentikasi Drizzle

**Files:**
- Modify: `package.json`
- Create: `src/db/schema/auth.ts`
- Modify: `src/db/schema/users.ts`
- Modify: `src/db/schema/index.ts`

**Interfaces:**
- Produces: `usersTable`, `sessionsTable`, `accountsTable`, `verificationsTable` yang kompatibel dengan Better Auth Drizzle Adapter.

- [ ] **Step 1: Install package `better-auth`**
```bash
npm install better-auth
```

- [ ] **Step 2: Buat tabel Drizzle `src/db/schema/auth.ts`**
  - `sessionsTable` (`id`, `user_id`, `token`, `expires_at`, `ip_address`, `user_agent`, `created_at`, `updated_at`)
  - `accountsTable` (`id`, `user_id`, `account_id`, `provider_id`, `password`, `created_at`, `updated_at`)
  - `verificationsTable` (`id`, `identifier`, `value`, `expires_at`, `created_at`, `updated_at`)

- [ ] **Step 3: Update `src/db/schema/users.ts` untuk menambahkan field `email_verified`, `image`, `role`, dan `phone`**

- [ ] **Step 4: Re-export semua tabel autentikasi di `src/db/schema/index.ts`**

- [ ] **Step 5: Jalankan `npm run db:push` untuk sinkronisasi skema ke database PostgreSQL**

---

### Task 2: Konfigurasi Server Auth Instance & Client Auth SDK

**Files:**
- Create: `src/server/auth.ts`
- Create: `src/lib/auth-client.ts`

**Interfaces:**
- Produces:
  - `auth` (Better Auth Server Instance)
  - `authClient`, `useSession`, `signIn`, `signUp`, `signOut` (Client React SDK)

- [ ] **Step 1: Buat konfigurasi server auth di `src/server/auth.ts` dengan Drizzle adapter dan custom user fields (`role`, `phone`)**
- [ ] **Step 2: Buat client SDK helper di `src/lib/auth-client.ts` dengan `createAuthClient`**

---

### Task 3: Route Handler Autentikasi & Update Database Seeder Kredensial

**Files:**
- Create: `src/app/api/auth/[...all]/route.ts`
- Modify: `src/db/seed.ts`

**Interfaces:**
- Produces:
  - Endpoint REST `/api/auth/*`
  - Seeder yang memasukkan akun demo pembeli & admin lengkap dengan password hash terenkripsi

- [ ] **Step 1: Buat route handler catch-all di `src/app/api/auth/[...all]/route.ts`**
- [ ] **Step 2: Perbarui `src/db/seed.ts` menggunakan API Better Auth password hasher untuk mengisi akun demo**
  - Pembeli: `sarah.clarissa@example.com` / `password123` (role: `buyer`)
  - Admin: `admin@babykids.id` / `admin123` (role: `admin`)
- [ ] **Step 3: Jalankan `npm run db:seed` untuk memverifikasi seeding akun auth**

---

### Task 4: Halaman Login & Register dengan 1-Click Demo Login

**Files:**
- Create: `src/app/auth/login/page.tsx`
- Create: `src/app/auth/register/page.tsx`
- Create: `src/components/auth/LoginForm.tsx`
- Create: `src/components/auth/RegisterForm.tsx`

**Interfaces:**
- Produces:
  - Halaman interaktif `/auth/login` dengan form email-password dan tombol 1-Click Demo Login
  - Halaman interaktif `/auth/register` dengan validasi konfirmasi password

- [ ] **Step 1: Buat komponen `src/components/auth/LoginForm.tsx`**
- [ ] **Step 2: Buat halaman `src/app/auth/login/page.tsx`**
- [ ] **Step 3: Buat komponen `src/components/auth/RegisterForm.tsx`**
- [ ] **Step 4: Buat halaman `src/app/auth/register/page.tsx`**

---

### Task 5: Middleware Proteksi Rute & Halaman Akses Ditolak (Unauthorized)

**Files:**
- Create: `src/middleware.ts`
- Create: `src/app/auth/unauthorized/page.tsx`

**Interfaces:**
- Produces:
  - Next.js Middleware yang mengamankan `/admin/*` (khusus admin) dan `/user/*` (khusus user login)
  - Halaman informatif `/auth/unauthorized` jika pembeli biasa mencoba mengakses panel admin

- [ ] **Step 1: Buat halaman `src/app/auth/unauthorized/page.tsx`**
- [ ] **Step 2: Buat Next.js Middleware di `src/middleware.ts` dengan session checking**

---

### Task 6: Integrasi Sesi Pengguna & Tombol Logout di Navbar

**Files:**
- Modify: `src/components/layout/NavbarFooter.tsx`

**Interfaces:**
- Produces:
  - Navbar yang menampilkan nama pembeli yang sedang aktif (misal: "Halo, Bunda Sarah"), menu dropdown "Pesanan Saya", "Admin Panel" (jika admin), dan aksi Logout instan.

- [ ] **Step 1: Update `src/components/layout/NavbarFooter.tsx` untuk mengonsumsi `useSession` dan tombol logout `signOut`**

---

### Task 7: Build & Typecheck Verification

**Files:**
- Test all authentication pages, API route handlers, and middleware compilation.

- [ ] **Step 1: Jalankan `npm run build` untuk memverifikasi bahwa tidak ada error tipe dan seluruh rute auth terkompilasi.**
- [ ] **Step 2: Jalankan `npx ngodingpakeai sync` untuk menyinkronkan seluruh perubahan ke workspace.**
