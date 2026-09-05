# Desain Pengaturan Toko Modular, Optimasi SEO Google, dan Rebranding "NBusiness"
Platform E-Commerce — NBusiness

**Tanggal:** 2026-09-04  
**Status:** Disetujui (Approved)  
**Tujuan:** Menata ulang halaman pengaturan toko (`/admin/setting`) menjadi antarmuka modular bersegmen kategori (Profil, Alamat, Ekspedisi, Payment Gateway, SEO, Storage), menambahkan konfigurasi SEO lengkap (Google Site Verification, Meta Tags, Open Graph, Sitemap XML, Robots.txt) agar website muncul optimal di mesin pencari Google, serta memperbarui seluruh identitas merek aplikasi menjadi **NBusiness**.

---

## 1. Skema Database Pengaturan SEO & Toko (`src/db/schema/settings.ts`)

Penambahan kolom-kolom SEO dan identitas bisnis pada tabel `store_settings`:

| Kolom Database | Tipe Data | Nilai Default / Format | Fungsi |
| :--- | :--- | :--- | :--- |
| `store_name` | `varchar(150)` | `'NBusiness'` | Nama identitas brand toko |
| `store_tagline` | `varchar(255)` | `'Marketplace & Toko Kebutuhan Anak Terpercaya'` | Slogan toko |
| `store_description`| `text` | `'Pusat belanja perlengkapan bayi, pakaian anak, dan mainan edukasi terstandar SNI.'` | Deskripsi toko |
| `seo_meta_title` | `varchar(255)` | `'NBusiness — Toko Kebutuhan Anak & Perlengkapan Terlengkap'` | Judul meta Google & tab browser |
| `seo_meta_description`| `text` | `'Beli perlengkapan bayi, baju anak modis, dan mainan edukatif terpercaya dengan pengiriman cepat ke seluruh Indonesia di NBusiness.'` | Cuplikan deskripsi hasil pencarian Google |
| `seo_keywords` | `text` | `'nbusiness, toko anak, perlengkapan bayi, baju anak, mainan edukasi, belanja anak online'` | Kata kunci pencarian mesin telusur |
| `seo_google_verification`| `varchar(255)` | `null` | Token verifikasi Google Search Console (`google-site-verification`) |
| `seo_og_image` | `text` | `null` | Banner gambar saat link dibagikan di media sosial (WhatsApp/FB/Twitter) |

---

## 2. Generator SEO Resmi Next.js (Sitemap & Robots.txt)

### 2.1 Peta Situs Dinamis (`src/app/sitemap.ts`)
Endpoint `/sitemap.xml` yang dibuat secara dinamis membaca database produk dan kategori:
- URL Root `/` (Change frequency: `daily`, Priority: `1.0`)
- URL Katalog `/katalog` (Change frequency: `daily`, Priority: `0.9`)
- URL Kategori `/kategori/[slug]` untuk semua kategori (Change frequency: `weekly`, Priority: `0.8`)
- URL Produk `/produk/[slug]` untuk seluruh produk aktif di database (Change frequency: `weekly`, Priority: `0.7`)

### 2.2 Aturan Perayapan Googlebot (`src/app/robots.ts`)
Endpoint `/robots.txt` yang mengatur izin crawler:
- Mengizinkan perayapan halaman produk dan katalog (`Allow: /`, `Allow: /katalog`, `Allow: /produk/`)
- Memblokir area privat dan panel admin (`Disallow: /admin/`, `Disallow: /api/`, `Disallow: /auth/`)
- Menyertakan tautan peta situs: `${siteUrl}/sitemap.xml`

### 2.3 Dynamic Metadata Generator (`src/app/layout.tsx`)
Root layout mengeksekusi `generateMetadata()` yang mengambil konfigurasi dari tabel `store_settings`:
- Menghasilkan tag `<title>`, `<meta name="description">`, `<meta name="keywords">`.
- Menyertakan tag verifikasi `<meta name="google-site-verification" content="...">`.
- Menyertakan protokol Open Graph (`og:type`, `og:site_name: 'NBusiness'`, `og:image`, `og:title`, `og:description`).

---

## 3. Antarmuka Halaman Pengaturan Modular (`/admin/setting`)

Halaman `/admin/setting` diorganisasi dalam 6 tab kategori yang rapi dan terisolasi:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  ⚙️ Pengaturan Toko NBusiness                                      [Simpan Pengaturan] │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  [ 🏢 Profil ] [ 📍 Alamat Gudang ] [ 🚚 Ekspedisi ] [ 💳 Payment ] [ 🔍 SEO ] [ ☁️ R2 ]│
└────────────────────────────────────────────────────────────────────────────────────────┘
```

1. **Tab 1: 🏢 Profil Toko**
   - Nama Toko: `NBusiness`
   - Tagline & Deskripsi Bisnis
   - Email CS, Nomor WhatsApp Toko, dan Jam Buka Operasional
2. **Tab 2: 📍 Alamat & Gudang Pengiriman**
   - Nama Gudang, Alamat Lengkap, Provinsi, Kota/Kabupaten, Kecamatan, Kode Pos (sebagai basis hitung tarif kurir ekspres)
3. **Tab 3: 🚚 Ekspedisi & Kurir Pengiriman**
   - Saklar kurir aktif (SiCepat, JNE, J&T, Anteraja, Cargo)
   - Uji Cek Tarif Kurir Live (Biteship API Tester)
4. **Tab 4: 💳 Payment Gateway**
   - Radio selector: Midtrans Snap vs Xendit Invoice vs Simulator
   - Kredensial terenkripsi dengan tombol intip kata sandi
   - Checklist metode pembayaran aktif (QRIS, BCA VA, Mandiri VA, BRI VA, GoPay)
   - URL Webhook Callback siap salin (`/api/webhooks/payment`) & Uji Koneksi Gateway
5. **Tab 5: 🔍 SEO & Google Search**
   - **Google Snippet Live Preview Box**: Simulasi tampilan hasil pencarian Google secara instan saat admin mengetik (judul, link URL, dan deskripsi).
   - Input Meta Title (dengan panduan 50-60 karakter).
   - Input Meta Description (dengan panduan 150-160 karakter).
   - Input Keywords pencarian.
   - Input Token Google Site Verification.
   - Input URL Gambar Open Graph (OG Image).
   - Tautan langsung verifikasi `/sitemap.xml` dan `/robots.txt`.
6. **Tab 6: ☁️ Cloud Storage**
   - Status koneksi Cloudflare R2 / S3 dan informasi bucket.

---

## 4. Rebranding Menyeluruh "NBusiness"

- **Identitas Brand**: Mengubah seluruh representasi merek dari "BabyKids" menjadi **"NBusiness"**:
  - `Navbar` & `Footer` Konsumen
  - `HeroBanner` Beranda
  - `AdminSidebar` & `AdminHeader` Seller Center (`NBusiness Seller Center`)
  - `LoginForm`, `RegisterForm`, `UnauthorizedPage`
  - Tag `<title>` dan metadata default aplikasi
