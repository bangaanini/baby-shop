# Desain Integrasi Payment Gateway (Midtrans & Xendit)
Toko Kebutuhan Anak — BabyKids

**Tanggal:** 2026-09-04  
**Status:** Disetujui (Approved)  
**Tujuan:** Mengintegrasikan payment gateway terkemuka di Indonesia (**Midtrans Snap API** & **Xendit XenInvoice API**) dengan antarmuka pengaturan kredensial dinamis di panel admin (`/admin/setting`), pemilihan satu provider aktif, checklist metode pembayaran aktif (QRIS, VA Bank, E-Wallet), pembuatan transaksi pembayaran online saat checkout, serta penanganan webhook otomatis (*Auto-Settlement*) untuk mengubah status pesanan menjadi `diproses`.

---

## 1. Arsitektur Modul Pembayaran (Payment Gateway Architecture)

```
[Admin Setting (/admin/setting)] ──► [Simpan Kredensial & Pilihan Metode ke DB (store_settings)]
                                                      │
                                                      ▼
[Pembeli Checkout (/checkout)] ─────► [GET /api/payment/methods (Hanya Tampilkan Metode Aktif)]
          │
          ▼
[Klik "Bayar Sekarang"] ─────────────► [POST /api/checkout/order]
                                                      │
                                                      ▼
                                      [paymentService.createPaymentTransaction]
                                                      │
                         ┌────────────────────────────┴────────────────────────────┐
                         ▼                                                         ▼
           [Midtrans Snap API]                                      [Xendit Invoice API]
        (Snap Token & Popup Modal)                                 (Invoice URL & QRIS Live)
                         │                                                         │
                         └────────────────────────────┬────────────────────────────┘
                                                      ▼
[Pembeli Membayar via QRIS / VA] ──► [Webhook Notifikasi (POST /api/webhooks/payment)]
                                                      │
                                                      ▼
                                       [Validasi Signature Kriptografi]
                                                      │
                                                      ▼
                               [Update Status Pesanan ➔ "diproses" di Database]
```

---

## 2. Skema Tabel Database Pengaturan (`src/db/schema/settings.ts`)

```typescript
export const storeSettingsTable = pgTable('store_settings', {
  id: text('id').primaryKey().default('default'),
  // General Info
  store_name: varchar('store_name', { length: 150 }).default('BabyKids Official Store').notNull(),
  store_tagline: varchar('store_tagline', { length: 255 }).default('Marketplace Kebutuhan Anak Terlengkap #1 di Indonesia'),
  store_email: varchar('store_email', { length: 255 }).default('halo@babykids.id'),
  store_phone: varchar('store_phone', { length: 50 }).default('0812-3456-7890'),
  store_address: text('store_address'),
  store_city: varchar('store_city', { length: 100 }).default('Jakarta Selatan'),
  store_postal_code: varchar('store_postal_code', { length: 20 }).default('12160'),
  
  // Payment Gateway Provider
  active_payment_gateway: varchar('active_payment_gateway', { length: 50 }).default('midtrans').notNull(), // 'midtrans' | 'xendit' | 'simulator'
  
  // Midtrans Credentials
  midtrans_server_key: text('midtrans_server_key'),
  midtrans_client_key: text('midtrans_client_key'),
  midtrans_merchant_id: text('midtrans_merchant_id'),
  midtrans_is_production: boolean('midtrans_is_production').default(false).notNull(),
  
  // Xendit Credentials
  xendit_secret_key: text('xendit_secret_key'),
  xendit_public_key: text('xendit_public_key'),
  xendit_webhook_token: text('xendit_webhook_token'),
  xendit_is_production: boolean('xendit_is_production').default(false).notNull(),
  
  // Enabled Payment Methods list
  enabled_payment_methods: json('enabled_payment_methods').$type<string[]>().default([
    'pay-qris',
    'pay-bca-va',
    'pay-mandiri-va',
    'pay-bri-va',
    'pay-gopay',
  ]).notNull(),
  
  // Enabled Logistics Couriers list
  enabled_couriers: json('enabled_couriers').$type<string[]>().default([
    'sicepat',
    'jne',
    'jnt',
    'anteraja',
    'cargo',
  ]).notNull(),

  updated_at: timestamp('updated_at').defaultNow().notNull(),
});
```

---

## 3. Service Layer (`src/server/services/payment.service.ts`)

### 3.1 Fungsi Utama
1. **`getPaymentSettings()`**: Mengambil pengaturan aktif dari database `store_settings` dengan fallback ke `.env`.
2. **`savePaymentSettings(payload)`**: Menyimpan kredensial dan preferensi gateway dari admin.
3. **`getAvailablePaymentMethods()`**: Mengembalikan daftar metode pembayaran yang aktif dan terfilter sesuai checklist admin.
4. **`createPaymentTransaction({ orderId, invoiceNumber, grossAmount, customerName, customerEmail, customerPhone, items })`**:
   - **Midtrans Provider**:
     - Endpoint: `https://app.sandbox.midtrans.com/snap/v1/transactions` (atau `https://app.midtrans.com/snap/v1/transactions` jika production).
     - Auth: `Basic Buffer.from(serverKey + ':').toString('base64')`.
     - Mengembalikan `{ provider: 'midtrans', snapToken: string, redirectUrl: string }`.
   - **Xendit Provider**:
     - Endpoint: `POST https://api.xendit.co/v2/invoices`.
     - Auth: `Basic Buffer.from(secretKey + ':').toString('base64')`.
     - Mengembalikan `{ provider: 'xendit', invoiceId: string, invoiceUrl: string }`.
   - **Simulator Mode**:
     - Mengembalikan token simulasi instan dengan data instruksi bayar.
5. **`handleWebhook(requestBody, headers)`**:
   - **Midtrans**:
     - Validasi Signature: `SHA512(order_id + status_code + gross_amount + ServerKey) === signature_key`.
     - Status `settlement` atau `capture` (fraud_status: `accept`) ➔ update status pesanan ke `diproses`.
   - **Xendit**:
     - Validasi Callback Token: `headers['x-callback-token'] === webhook_token`.
     - Status `PAID` / `SETTLED` ➔ update status pesanan ke `diproses`.

---

## 4. REST Endpoints

1. `GET /api/payment/methods` — Mengambil daftar metode pembayaran yang sedang diaktifkan admin untuk form checkout.
2. `POST /api/webhooks/payment` — Endpoint publik penerima notifikasi real-time dari Midtrans & Xendit.
3. `POST /api/admin/settings/test-gateway` — Endpoint uji koneksi kredensial gateway dari panel admin.

---

## 5. Halaman Pengaturan Toko (`/admin/setting`)

- **Kartu Integrasi Payment Gateway**:
  - Pilihan Radio Provider Aktif (Midtrans vs Xendit vs Simulator).
  - Form Kredensial Midtrans dengan sensor kata sandi.
  - Form Kredensial Xendit dengan sensor kata sandi.
  - Checklist Switch Metode Pembayaran Aktif.
  - URL Webhook siap salin (`/api/webhooks/payment`).
  - Tombol **"Uji Koneksi & Simpan Pengaturan"**.
