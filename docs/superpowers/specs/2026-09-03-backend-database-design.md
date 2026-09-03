# Desain Arsitektur Backend & Database (PostgreSQL + Drizzle ORM)
Toko Kebutuhan Anak — BabyKids

**Tanggal:** 2026-09-03  
**Status:** Disetujui (Approved)  
**Tujuan:** Mengintegrasikan layer database sesungguhnya (PostgreSQL) dan layer API backend modular (Drizzle ORM + Clean Service Layer + Route Handlers) ke dalam aplikasi Next.js App Router yang sudah memiliki antarmuka lengkap.

---

## 1. Ringkasan & Tujuan Arsitektur

Aplikasi BabyKids dibangun dengan arsitektur Full-Stack Next.js (App Router). Seluruh operasi query database, aturan bisnis (business logic), dan validasi request dikelola di server melalui:
- **Drizzle ORM** & **`postgres.js` driver** untuk akses basis data PostgreSQL yang cepat dan type-safe.
- **Service Layer (`src/server/services/`)** untuk memisahkan logika transaksi, stok barang, kalkulasi ongkir, dan status pesanan dari controller/routes.
- **Zod Validator (`src/server/validators/`)** untuk menjamin integritas data yang masuk ke endpoint.
- **Next.js Route Handlers (`src/app/api/...`)** sebagai REST API endpoints yang melayani halaman frontend dan integrasi webhook/eksternal.

---

## 2. Skema Tabel Database (Drizzle ORM)

### 2.1 `categories` (Kategori Produk)
| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | `uuid` (PK) | Default random UUID v4 |
| `slug` | `varchar(100)` | Unique, indeks pencarian (`perlengkapan`, `pakaian`, `mainan`) |
| `name` | `varchar(150)` | Nama kategori |
| `description` | `text` | Deskripsi kategori |
| `icon_name` | `varchar(50)` | Nama ikon Lucide |
| `color_bg` | `varchar(100)` | Kelas Tailwind warna latar ikon |
| `created_at` | `timestamp` | Waktu pembuatan |
| `updated_at` | `timestamp` | Waktu pembaruan terakhir |

### 2.2 `products` (Produk Toko Anak)
| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | `uuid` (PK) | Default random UUID v4 |
| `category_id` | `uuid` (FK) | Relasi ke `categories.id` (RESTRICT on delete) |
| `name` | `varchar(255)` | Nama lengkap produk |
| `slug` | `varchar(255)` | Unique, URL identifier |
| `description` | `text` | Penjelasan detail produk, bahan, dan SNI |
| `price` | `integer` | Harga jual efektif (dalam Rupiah) |
| `original_price`| `integer` | Harga coret sebelum diskon (opsional) |
| `discount_percent` | `integer` | Persentase diskon (opsional) |
| `sold_count` | `integer` | Jumlah barang terjual (default 0) |
| `rating` | `numeric(2,1)` | Rata-rata bintang penilaian (default 5.0) |
| `review_count` | `integer` | Jumlah ulasan pembeli (default 0) |
| `stock` | `integer` | Total ketersediaan stok fisik produk |
| `material` | `varchar(255)` | Bahan kain/alat (misal: 100% Organic Cotton SNI) |
| `suitable_age` | `varchar(100)` | Rekomendasi rentang usia anak (misal: 0-3 tahun) |
| `image_url` | `text` | Foto utama beresolusi tinggi |
| `is_popular` | `boolean` | Flag produk terlaris |
| `is_new_arrival`| `boolean` | Flag produk koleksi baru |
| `is_recommended`| `boolean` | Flag rekomendasi tumbuh kembang anak |
| `is_promo` | `boolean` | Flag promo hemat & flash sale |
| `tag` | `varchar(100)` | Label badge khusus (misal: `Diskon 50%`) |
| `created_at` | `timestamp` | Waktu dibuat |
| `updated_at` | `timestamp` | Waktu diupdate |

### 2.3 `product_variants` & `product_images`
- **`product_variants`**:
  - `id`: `uuid` (PK)
  - `product_id`: `uuid` (FK -> `products.id` on delete CASCADE)
  - `color`: `varchar(100)` (misal: Midnight Black, Pastel Pink)
  - `size`: `varchar(100)` (misal: Standar, M (3-4 th))
  - `stock`: `integer` (stok spesifik varian)
  - `additional_price`: `integer` (default 0)
- **`product_images`**:
  - `id`: `uuid` (PK)
  - `product_id`: `uuid` (FK -> `products.id` on delete CASCADE)
  - `url`: `text`
  - `alt_text`: `varchar(255)`
  - `sort_order`: `integer` (default 0)

### 2.4 `users` & `addresses`
- **`users`**:
  - `id`: `uuid` (PK)
  - `name`: `varchar(150)`
  - `email`: `varchar(255)` (Unique)
  - `phone`: `varchar(50)`
  - `role`: `varchar(20)` (Default: `'buyer'`, Opsi: `'buyer' | 'admin'`)
  - `avatar_url`: `text` (nullable)
  - `created_at`: `timestamp`
- **`addresses`**:
  - `id`: `uuid` (PK)
  - `user_id`: `uuid` (FK -> `users.id` on delete CASCADE)
  - `recipient_name`: `varchar(150)`
  - `phone`: `varchar(50)`
  - `label`: `varchar(50)` (misal: Rumah Utama, Kantor)
  - `full_address`: `text`
  - `province`: `varchar(100)`
  - `city`: `varchar(100)`
  - `district`: `varchar(100)`
  - `postal_code`: `varchar(20)`
  - `is_primary`: `boolean` (Default false)

### 2.5 `carts` & `cart_items`
- **`carts`**:
  - `id`: `uuid` (PK)
  - `user_id`: `uuid` (FK -> `users.id` or guest session id)
  - `created_at` / `updated_at`: `timestamp`
- **`cart_items`**:
  - `id`: `uuid` (PK)
  - `cart_id`: `uuid` (FK -> `carts.id` on delete CASCADE)
  - `product_id`: `uuid` (FK -> `products.id`)
  - `variant_id`: `uuid` (FK -> `product_variants.id`, nullable)
  - `quantity`: `integer` (Default 1)

### 2.6 `orders`, `order_items`, & `tracking_history`
- **`orders`**:
  - `id`: `uuid` (PK)
  - `invoice_number`: `varchar(50)` (Unique, format: `BK-YYYYMM-XXXXXX`)
  - `user_id`: `uuid` (FK -> `users.id`, nullable)
  - `status`: `varchar(50)` (`menunggu_pembayaran`, `diproses`, `dikirim`, `selesai`, `dibatalkan`)
  - `recipient_name`: `varchar(150)`
  - `recipient_phone`: `varchar(50)`
  - `shipping_address`: `text`
  - `courier_code`: `varchar(50)` (`sicepat`, `jne`, `jnt`, `anteraja`)
  - `courier_service`: `varchar(100)` (`REG`, `EZ`, `Cargo`, `Next Day`)
  - `tracking_number`: `varchar(100)` (Nomor resi kurir, nullable)
  - `payment_method`: `varchar(100)` (`qris`, `bank_transfer_bca`, dll)
  - `subtotal`: `integer`
  - `shipping_cost`: `integer`
  - `discount_amount`: `integer` (Default 0)
  - `service_fee`: `integer` (Default 1000)
  - `total_amount`: `integer`
  - `notes`: `text` (Catatan pembeli untuk toko/kurir)
  - `created_at` / `updated_at`: `timestamp`
- **`order_items`**:
  - `id`: `uuid` (PK)
  - `order_id`: `uuid` (FK -> `orders.id` on delete CASCADE)
  - `product_id`: `uuid` (FK -> `products.id`)
  - `variant_id`: `uuid` (FK -> `product_variants.id`, nullable)
  - `product_name`: `varchar(255)`
  - `variant_color`: `varchar(100)` (nullable)
  - `variant_size`: `varchar(100)` (nullable)
  - `price`: `integer`
  - `quantity`: `integer`
  - `image_url`: `text`
- **`tracking_history`**:
  - `id`: `uuid` (PK)
  - `order_id`: `uuid` (FK -> `orders.id` on delete CASCADE)
  - `status_title`: `varchar(150)` (misal: Paket Dibawa Kurir)
  - `description`: `text`
  - `location`: `varchar(150)`
  - `occurred_at`: `timestamp`

---

## 3. Struktur Direktori Backend

```
src/
├── db/
│   ├── index.ts                # Koneksi postgres instance & Drizzle client
│   ├── schema/
│   │   ├── index.ts            # Re-export semua tabel & relasi
│   │   ├── categories.ts
│   │   ├── products.ts
│   │   ├── users.ts
│   │   ├── carts.ts
│   │   └── orders.ts
│   └── seed.ts                 # Script seeding database otomatis
├── server/
│   ├── services/
│   │   ├── product.service.ts  # Layanan katalog, filter, varian, pencarian
│   │   ├── cart.service.ts     # Layanan keranjang belanja & kuantitas
│   │   ├── checkout.service.ts # Layanan kalkulasi ongkir & transaksi pemesanan
│   │   ├── order.service.ts    # Layanan pelacakan kurir & status pesanan
│   │   └── admin.service.ts    # Layanan dashboard, statistik, & manajemen order
│   └── validators/
│       ├── product.schema.ts
│       ├── cart.schema.ts
│       └── checkout.schema.ts
└── app/
    └── api/                    # Route Handlers
        ├── products/route.ts
        ├── products/[slug]/route.ts
        ├── categories/route.ts
        ├── cart/route.ts
        ├── cart/[itemId]/route.ts
        ├── checkout/calculate/route.ts
        ├── checkout/order/route.ts
        ├── orders/route.ts
        ├── orders/[id]/route.ts
        ├── orders/[id]/confirm/route.ts
        └── admin/
            ├── stats/route.ts
            ├── orders/route.ts
            └── products/route.ts
```

---

## 4. Alur Transaksi Pemesanan (Order Placement Flow)

1. **Permintaan Pembuatan Pesanan**:
   Frontend mengirim payload ke `POST /api/checkout/order`.
2. **Validasi Skema (Zod)**:
   Mengecek kelengkapan alamat, kontak nomor WhatsApp, kurir yang dipilih, dan item keranjang.
3. **Database Transaction (`db.transaction`)**:
   - Memeriksa ketersediaan stok fisik di `products` dan `product_variants`.
   - Mengurangi stok barang yang dipesan. Jika stok kurang dari permintaan, transaksi di-*rollback* dan mengembalikan error 400.
   - Menghitung ongkir final berdasarkan total berat akumulasi barang.
   - Membuat baris pada tabel `orders` dengan nomor invoice unik `BK-YYYYMM-XXXXXX`.
   - Membuat baris-baris pada tabel `order_items` untuk menyimpan snapshot nama produk, varian, dan harga saat transaksi terjadi.
   - Menambahkan event awal pada tabel `tracking_history` ("Pembayaran Berhasil / Menunggu Diproses Toko").
   - Mengosongkan data di tabel `carts` / `cart_items` milik pembeli.
4. **Respon Berhasil**:
   Mengembalikan invoice pesanan, total bayar, dan rincian instruksi pembayaran.

---

## 5. Rencana Pengujian (Testing Strategy)

- **Unit Testing Service Layer**: Menguji fungsi kalkulasi diskon voucher, total ongkir berjenjang berat, dan validasi stok.
- **Database Seed Validation**: Memastikan script `npm run db:seed` berhasil mengeksekusi migrasi tabel dan memasukkan 100% data awal tanpa konflik relasi.
- **End-to-End API Route Testing**: Memverifikasi respons status HTTP 200/201 pada skenario sukses dan status HTTP 400/404 pada skenario data tidak valid.
