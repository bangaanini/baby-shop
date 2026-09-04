# Integrasi Eksternal API Ongkir (Biteship API + Smart Fallback) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mengintegrasikan API tarif pengiriman logistik real-time ke seluruh Indonesia menggunakan **Biteship API (Free Developer / Sandbox Tier)** dengan penghitungan berat volumetrik paket produk, sistem Smart Fallback toleran offline/tanpa API key, integrasi UI checkout dinamis, dan fitur uji cek tarif kurir di panel admin.

**Architecture:** 
- **Shipping Service Layer (`src/server/services/shipping.service.ts`)**: Adapter integrasi Biteship API `https://api.biteship.com/v1/rates/couriers` dengan kalkulasi berat kemasan produk fisik + dimensi volumetrik `(P x L x T) / 6000` kg dari database, serta Smart Fallback zonasi wilayah Indonesia.
- **REST Endpoint (`src/app/api/shipping/rates/route.ts`)**: Endpoint yang melayani permintaan kalkulasi tarif kurir untuk keranjang belanja.
- **Checkout Dynamic Rates (`src/components/checkout/CheckoutStepper.tsx`)**: Menampilkan opsi kurir ekspres (SiCepat, JNE, J&T, Anteraja) secara dinamis sesuai alamat tujuan pembeli.
- **Admin Logistics Tester (`src/app/admin/setting/page.tsx`)**: Fitur uji tarif live dan status koneksi API di halaman pengaturan toko.

**Tech Stack:** Next.js 16, TypeScript, Drizzle ORM, Biteship API, Zod, Tailwind CSS, Lucide Icons.

## Global Constraints

- Kredensial `BITESHIP_API_KEY` dan alamat asal gudang toko dikonfigurasi melalui `.env` tanpa di-hardcode.
- Jika API key Biteship belum diisi di `.env`, sistem wajib menggunakan *Smart Fallback* tanpa error sehingga proses checkout pembeli tetap berjalan lancar.
- Biaya pengiriman harus memperhitungkan berat fisik produk aktual dan estimasi volumetrik paket `(P*L*T)/6000` kg.

---

### Task 1: Environment Variables & Shipping Schema Validator

**Files:**
- Modify: `.env`
- Modify: `.env.example`
- Create: `src/server/validators/shipping.schema.ts`

**Interfaces:**
- Produces: `calculateShippingRatesSchema`, `CalculateShippingRatesInput`, `ShippingRateOption`.

- [ ] **Step 1: Tambahkan konfigurasi Biteship di `.env.example` dan `.env`**
```env
# Biteship Shipping API Configuration
BITESHIP_API_KEY="your_biteship_api_key"
SHIPPING_ORIGIN_POSTAL_CODE="12160"
SHIPPING_ORIGIN_CITY="Jakarta Selatan"
SHIPPING_ORIGIN_PROVINCE="DKI Jakarta"
```

- [ ] **Step 2: Buat `src/server/validators/shipping.schema.ts`**

---

### Task 2: Shipping Service Implementation (Biteship API + Smart Fallback)

**Files:**
- Create: `src/server/services/shipping.service.ts`

**Interfaces:**
- Produces:
  - `shippingService.isBiteshipConfigured()`
  - `shippingService.calculateRates(input)`
  - `shippingService.getOriginInfo()`

- [ ] **Step 1: Buat file `src/server/services/shipping.service.ts`**
  - Implementasikan fungsi pemanggilan HTTP ke Biteship API.
  - Implementasikan kalkulasi dimensi dan berat volumetrik paket dari database produk.
  - Implementasikan Smart Fallback matriks tarif kurir resmi Indonesia jika API key tidak diset atau jaringan error.

---

### Task 3: Shipping Rates REST Route Handler

**Files:**
- Create: `src/app/api/shipping/rates/route.ts`

**Interfaces:**
- Produces:
  - Endpoint `POST /api/shipping/rates` yang menerima `{ destinationPostalCode, destinationCity, items, courierCodes }` dan mengembalikan daftar opsi tarif kurir.

- [x] **Step 1: Buat route handler `src/app/api/shipping/rates/route.ts`**

---

### Task 4: Integrasi Live Shipping Rates ke Checkout Service

**Files:**
- Modify: `src/server/services/checkout.service.ts`

**Interfaces:**
- Produces:
  - `checkoutService.calculateOrder` dan `checkoutService.createOrder` mengonsumsi tarif kurir live dari `shippingService`.

- [ ] **Step 1: Update `src/server/services/checkout.service.ts` untuk memanggil `shippingService`**

---

### Task 5: Integrasi Dinamis di Halaman Checkout (`CheckoutStepper.tsx`)

**Files:**
- Modify: `src/components/checkout/CheckoutStepper.tsx`

**Interfaces:**
- Produces:
  - Langkah 2 (Pilihan Kurir) memanggil `POST /api/shipping/rates` saat alamat tujuan dipilih.
  - Menampilkan logo kurir, layanan, tarif live, dan estimasi waktu sampai.
  - Pembaruan otomatis ringkasan biaya tagihan saat berganti kurir.

- [ ] **Step 1: Update `src/components/checkout/CheckoutStepper.tsx`**

---

### Task 6: Fitur Uji Cek Tarif Live di Halaman Pengaturan Toko (`/admin/setting`)

**Files:**
- Modify: `src/app/admin/setting/page.tsx`

**Interfaces:**
- Produces:
  - Status koneksi live Biteship API.
  - Form interaktif "Uji Cek Tarif Kurir" untuk mencoba simulasi tarif pengiriman langsung dari panel admin.

- [ ] **Step 1: Update `src/app/admin/setting/page.tsx`**

---

### Task 7: Build, Typecheck, & Verifikasi End-to-End

**Files:**
- Full build check and verification.

- [ ] **Step 1: Jalankan `npm run build` untuk memverifikasi seluruh rute terkompilasi.**
- [ ] **Step 2: Jalankan `npx ngodingpakeai sync` untuk menyinkronkan seluruh perubahan ke workspace.**
