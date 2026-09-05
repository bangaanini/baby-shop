# Desain Integrasi Eksternal API Ongkir (Biteship API + Smart Fallback)
Toko Kebutuhan Anak — BabyKids

**Tanggal:** 2026-09-04  
**Status:** Disetujui (Approved)  
**Tujuan:** Mengintegrasikan API tarif pengiriman logistik real-time ke seluruh Indonesia menggunakan **Biteship API (Free Developer / Sandbox Tier)** yang mendukung SiCepat, JNE, J&T, Anteraja, dan Cargo dengan penghitungan berat volumetrik paket PxLxT, dilengkapi sistem *Smart Fallback* agar checkout pembeli tetap berjalan aman tanpa error saat API key belum diisi.

---

## 1. Arsitektur Modul Pengiriman (Shipping Service Architecture)

- **Service Layer (`src/server/services/shipping.service.ts`)**:
  - `shippingService.calculateRates({ originPostalCode, destinationPostalCode, destinationCity, items, activeCouriers })`:
    - Memanggil endpoint resmi Biteship `POST https://api.biteship.com/v1/rates/couriers` menggunakan `BITESHIP_API_KEY`.
    - Menghitung akumulasi berat fisik (`weight_gram`) dan dimensi kemasan (`dimension_length`, `dimension_width`, `dimension_height`) dari database produk.
    - Menghasilkan daftar opsi kurir terstandarisasi (`ShippingRateOption[]`).
    - Menyediakan *Smart Fallback* berbasis zonasi wilayah Indonesia jika API key belum diisi di `.env` atau server sandbox offline.
  - `shippingService.isBiteshipConfigured()`: Memeriksa validitas konfigurasi API key.
- **REST Route Handler (`src/app/api/shipping/rates/route.ts`)**:
  - Menerima payload `POST` dari halaman checkout dan mengembalikan daftar kurir, layanan, tarif, serta estimasi hari tiba.
- **Zod Validator (`src/server/validators/shipping.schema.ts`)**:
  - Memvalidasi parameter alamat tujuan, kode pos, dan daftar item belanjaan.

---

## 2. Struktur Data & Kontrak Tipe

```typescript
export interface ShippingRateItemInput {
  productId: string;
  variantId?: string | null;
  quantity: number;
}

export interface CalculateShippingRatesInput {
  destinationPostalCode?: string | number;
  destinationCity?: string;
  destinationProvince?: string;
  items: ShippingRateItemInput[];
  courierCodes?: string[]; // e.g. ['sicepat', 'jne', 'jnt', 'anteraja']
}

export interface ShippingRateOption {
  id: string; // e.g. "sicepat_reg"
  courierCode: string; // "sicepat" | "jne" | "jnt" | "anteraja"
  courierName: string; // "SiCepat Ekspres"
  serviceName: string; // "REG"
  serviceDescription: string; // "Reguler Service"
  price: number; // e.g. 22000
  estimatedDays: string; // "1 - 2 Hari"
  courierLogoText: string; // "⚡ SiCepat"
  isLiveRate: boolean; // true if from live Biteship API, false if fallback
}
```

---

## 3. Alur Penghitungan Ongkir (Checkout Calculation Flow)

```
[Pembeli Isi Alamat di Checkout]
          │
          ▼
[POST /api/shipping/rates] ──► [shippingService.calculateRates]
                                        │
                      ┌─────────────────┴─────────────────┐
                      ▼                                   ▼
        [BITESHIP_API_KEY Valid?]           [Fallback Matrix]
             │ (Ya)                               │ (Tidak / Error)
             ▼                                    ▼
[Panggil api.biteship.com/v1/rates]   [Hitung Jarak Zonasi + Berat/Vol]
             │                                    │
             └─────────────────┬──────────────────┘
                               ▼
              [Daftar Opsi Kurir Lengkap]
              (SiCepat, JNE, J&T, Anteraja)
                               │
                               ▼
           [Update Total Biaya di CheckoutStepper]
```

---

## 4. Halaman Pengaturan Toko (`/admin/setting`)

- **Kartu Logistik & Status Biteship API**:
  - Indikator status live: *🟢 Terhubung ke Biteship API* vs *🟡 Mode Simulasi Tarif Cerdas*.
  - Menampilkan alamat asal gudang pengiriman toko (`Jakarta Selatan, 12160`).
  - Saklar aktif/nonaktif per kurir ekspedisi.
  - Fitur **"Uji Cek Tarif Live"**: Form simulasi untuk mencoba tarif ke berbagai kota di Indonesia.

---

## 5. Konfigurasi Kredensial di `.env`

```env
# Biteship Shipping API Configuration
BITESHIP_API_KEY="your_biteship_api_key"
SHIPPING_ORIGIN_POSTAL_CODE="12160"
SHIPPING_ORIGIN_CITY="Jakarta Selatan"
SHIPPING_ORIGIN_PROVINCE="DKI Jakarta"
```
