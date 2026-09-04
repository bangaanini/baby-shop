# Integrasi Payment Gateway (Midtrans & Xendit) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mengintegrasikan payment gateway terkemuka di Indonesia (**Midtrans Snap API** & **Xendit XenInvoice API**) dengan antarmuka pengaturan kredensial dinamis di panel admin (`/admin/setting`), pemilihan satu provider aktif, checklist metode pembayaran aktif (QRIS, VA Bank, E-Wallet), pembuatan transaksi pembayaran online saat checkout, serta penanganan webhook otomatis (*Auto-Settlement*) untuk mengubah status pesanan menjadi `diproses`.

**Architecture:**
- **Database Persistence (`src/db/schema/settings.ts`)**: Tabel `store_settings` menyimpan preferensi provider aktif (`midtrans` | `xendit` | `simulator`), kredensial tersimpan, dan array `enabled_payment_methods`.
- **Payment Service Layer (`src/server/services/payment.service.ts`)**: Adapter seragam untuk Midtrans Snap API & Xendit Invoice API, pembuatan token pembayaran, verifikasi signature kriptografi webhook, dan koneksi pengujian.
- **REST Endpoints (`src/app/api/payment/methods`, `src/app/api/webhooks/payment`, `src/app/api/admin/settings/test-gateway`)**: Melayani daftar metode bayar aktif, penerimaan webhook real-time, dan ping test kredensial.
- **Checkout Stepper Integration (`src/components/checkout/CheckoutStepper.tsx`)**: Menampilkan hanya metode bayar aktif dan memicu modal Midtrans Snap Popup atau redirect invoice Xendit.
- **Admin Settings UI (`src/app/admin/setting/page.tsx`)**: Kartu pengaturan provider, form kredensial masked, checklist saklar metode pembayaran, dan URL webhook siap salin.

**Tech Stack:** Next.js 16, TypeScript, Drizzle ORM, PostgreSQL, Midtrans Snap API, Xendit API, Zod, Tailwind CSS, Lucide Icons.

## Global Constraints

- Kredensial payment gateway disimpan persisten di tabel `store_settings` dengan fallback aman ke `.env`.
- Hanya boleh satu provider gateway yang aktif pada satu waktu (`active_payment_gateway: 'midtrans' | 'xendit' | 'simulator'`).
- Webhook harus memvalidasi signature kriptografi (SHA512 untuk Midtrans, token verification untuk Xendit) sebelum mengubah status pesanan ke `diproses`.
- Mode simulator default memastikan checkout tetap berjalan lancar saat kredensial gateway belum diisi.

---

### Task 1: Database Schema for Store Settings & Migration

**Files:**
- Create: `src/db/schema/settings.ts`
- Modify: `src/db/schema/index.ts`
- Modify: `.env` & `.env.example`

**Interfaces:**
- Produces: `storeSettingsTable` dengan kolom provider gateway, kredensial Midtrans & Xendit, dan array metode bayar aktif.

- [ ] **Step 1: Tambahkan env variables fallback di `.env` dan `.env.example`**
- [ ] **Step 2: Buat tabel `src/db/schema/settings.ts`**
- [ ] **Step 3: Re-export tabel di `src/db/schema/index.ts`**
- [ ] **Step 4: Jalankan `npx drizzle-kit generate` dan `npx drizzle-kit push`**

---

### Task 2: Payment Service Layer (Midtrans Snap & Xendit Invoice Adapters)

**Files:**
- Create: `src/server/services/payment.service.ts`

**Interfaces:**
- Produces:
  - `paymentService.getPaymentSettings()`
  - `paymentService.savePaymentSettings(payload)`
  - `paymentService.getAvailablePaymentMethods()`
  - `paymentService.createPaymentTransaction(orderData)`
  - `paymentService.handleWebhookNotification(provider, payload, headers)`
  - `paymentService.testGatewayConnection(provider, credentials)`

- [ ] **Step 1: Buat `src/server/services/payment.service.ts`**
  - Implementasikan pemanggilan Midtrans Snap API `https://app.sandbox.midtrans.com/snap/v1/transactions`.
  - Implementasikan pemanggilan Xendit Invoice API `https://api.xendit.co/v2/invoices`.
  - Implementasikan validasi signature Midtrans (SHA512) dan Xendit callback token.
  - Implementasikan test connection ping.

---

### Task 3: REST Endpoints & Webhook Route Handler

**Files:**
- Create: `src/app/api/payment/methods/route.ts`
- Create: `src/app/api/webhooks/payment/route.ts`
- Create: `src/app/api/admin/settings/test-gateway/route.ts`
- Modify: `src/app/api/admin/settings/route.ts`

**Interfaces:**
- Produces:
  - `GET /api/payment/methods` (daftar metode bayar aktif untuk checkout)
  - `POST /api/webhooks/payment` (penerima webhook notifikasi transaksi)
  - `POST /api/admin/settings/test-gateway` (uji coba koneksi API key)
  - `GET & POST /api/admin/settings` (persistensi pengaturan toko ke DB)

- [ ] **Step 1: Buat route `src/app/api/payment/methods/route.ts`**
- [ ] **Step 2: Buat route webhook `src/app/api/webhooks/payment/route.ts`**
- [ ] **Step 3: Buat route tester `src/app/api/admin/settings/test-gateway/route.ts`**
- [ ] **Step 4: Update `src/app/api/admin/settings/route.ts` untuk membaca & menulis ke `storeSettingsTable`**

---

### Task 4: Halaman Pengaturan Toko (Midtrans & Xendit Configuration)

**Files:**
- Modify: `src/app/admin/setting/page.tsx`

**Interfaces:**
- Produces:
  - Kartu konfigurasi payment gateway lengkap: pilihan radio provider aktif, form kredensial Midtrans, form kredensial Xendit, checklist saklar metode pembayaran aktif, URL webhook, dan tombol uji koneksi gateway.

- [ ] **Step 1: Update `src/app/admin/setting/page.tsx` dengan antarmuka payment gateway baru**

---

### Task 5: Integrasi Checkout Dinamis (Metode Aktif & Snap / Xendit Popup)

**Files:**
- Modify: `src/components/checkout/CheckoutStepper.tsx`
- Modify: `src/server/services/checkout.service.ts`

**Interfaces:**
- Produces:
  - Langkah 3 checkout memuat metode bayar aktif dari `GET /api/payment/methods`.
  - Langkah 4 saat menekan *"Bayar Sekarang"*, sistem memanggil `createPaymentTransaction`, memicu Midtrans Snap Popup modal atau link invoice Xendit.

- [ ] **Step 1: Update `src/server/services/checkout.service.ts` untuk mengembalikan token gateway saat createOrder**
- [ ] **Step 2: Update `src/components/checkout/CheckoutStepper.tsx` untuk memuat metode dinamis dan memicu pembayaran online**

---

### Task 6: Fitur Simulasi Pembayaran Sukses (Testing Auto-Settlement)

**Files:**
- Modify: `src/components/admin/OrderDetailDrawer.tsx`
- Modify: `src/components/order/OrderHistoryView.tsx`

**Interfaces:**
- Produces:
  - Tombol aksi cepat *"Simulasi Pembayaran Berhasil (Instant Settle)"* pada pesanan `menunggu_pembayaran` untuk mempermudah demonstrasi alur webhook.

- [x] **Step 1: Update `src/components/admin/OrderDetailDrawer.tsx`**
- [x] **Step 2: Update `src/components/order/OrderHistoryView.tsx`**

---

### Task 7: Build, Typecheck, & Verifikasi End-to-End

**Files:**
- Full build check and database verification.

- [ ] **Step 1: Jalankan `npm run build` untuk memverifikasi seluruh rute terkompilasi.**
- [ ] **Step 2: Jalankan `npx ngodingpakeai sync` untuk menyinkronkan seluruh perubahan ke workspace.**
