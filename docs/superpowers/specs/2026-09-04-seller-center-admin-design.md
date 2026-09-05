# Desain Seller Center & Panel Admin Profesional
Toko Kebutuhan Anak — BabyKids

**Tanggal:** 2026-09-04  
**Status:** Disetujui (Approved)  
**Tujuan:** Merombak panel admin menjadi platform Seller Center kelas marketplace (Tokopedia/Shopee/TikTok Shop) dengan navigasi multi-rute mandiri, formulir tambah produk komprehensif (upload Cloudflare R2, set cover, rincian berat & dimensi paket), detail pesanan lengkap dengan nomor resi kurir, visualisasi statistik performa toko, dan pengaturan lokasi/kurir/pembayaran toko.

---

## 1. Struktur Navigasi & Routing Seller Center

Panel admin diisolasi sepenuhnya melalui `src/app/admin/layout.tsx` tanpa merender `Navbar` atau `Footer` konsumen:

| Rute URL | Menu Sidebar | Deskripsi Halaman |
| :--- | :--- | :--- |
| `/admin` | 📊 **Dashboard** | Ringkasan toko, action center pesanan baru, alert stok menipis, dan KPI penjualan. |
| `/admin/produk` | 📋 **Daftar Produk** | Tabel manajemen produk, filter status stok, quick edit harga/stok, dan hapus produk. |
| `/admin/produk/tambah` | ➕ **Tambah Produk** | Formulir lengkap tambah produk baru (upload foto R2 di atas, set cover, dimensi PxLxT & berat). |
| `/admin/produk/[id]/edit` | ✏️ **Edit Produk** | Formulir ubah produk dengan pre-fill data varian, gambar, dan spesifikasi. |
| `/admin/pesanan` | 🚚 **Kelola Pesanan** | Tab status pesanan, modal detail pesanan mendalam, input resi kurir, update status, dan print invoice. |
| `/admin/statistik` | 📈 **Statistik** | Grafik omzet penjualan, konversi toko, produk terlaris (top selling SKU), dan performa kategori. |
| `/admin/setting` | ⚙️ **Setting Toko** | Pengaturan alamat asal gudang pengiriman, toggle kurir aktif, toggle pembayaran, dan status R2. |

---

## 2. Formulir Tambah & Edit Produk (`/admin/produk/tambah`)

### 2.1 Zona Upload Foto Produk (Paling Atas)
- **Komponen Upload Cloudflare R2**:
  - Drag & drop zona upload multi-foto (maksimal 8 foto, format JPG/PNG/WebP).
  - Endpoint: `POST /api/admin/upload` (membaca konfigurasi Cloudflare R2 / S3-compatible dari `.env`).
  - Fallback aman ke Data URL / storage lokal jika credentials R2 belum terisi saat development.
- **Manajemen Foto**:
  - **Cover Badge**: Foto pertama otomatis menjadi cover utama di katalog produk.
  - **Tombol "Set Cover"**: Menggeser foto pilihan menjadi cover urutan pertama.
  - **Tombol "Hapus Foto"**: Menghapus foto yang tidak diinginkan.

### 2.2 Informasi Dasar & Spesifikasi SNI
- Nama Produk, Slug unik otomatis, dan Kategori Produk (dropdown dinamis).
- Deskripsi Lengkap Produk (penjelasan bahan, standar SNI, cara perawatan).
- Rekomendasi Rentang Usia Anak (misal: `0 - 6 Bulan`, `1 - 3 Tahun`, `4 - 6 Tahun`).
- Bahan / Material Produk (misal: `100% Organic Cotton OEKO-TEX`, `BPA-Free Food Grade Silicone`).

### 2.3 Harga, Diskon, & Varian
- Harga Jual Normal & Harga Coret (kalkulasi persentase diskon promo otomatis).
- **Varian Warna & Ukuran**:
  - Tabel varian dinamis untuk menambah kombinasi warna (misal: Mint Green, Lilac, Sage) dan ukuran (misal: Size S, M, L, 240ml).
  - Pengaturan stok fisik satuan per varian dan harga tambahan (*additional price*).

### 2.4 Pengiriman & Dimensi Paket (Perhitungan Ongkos Kirim Akurat)
- **Berat Paket (Gram)**: Berat kotor produk beserta kotak kemasan (misal: 350 gr, 1.200 gr, 5.500 gr).
- **Dimensi Paket (cm)**:
  - Panjang (cm), Lebar (cm), Tinggi (cm).
  - Tampilan otomatis estimasi berat volumetrik formula kurir: `(P x L x T) / 6000` kg.

---

## 3. Detail Pesanan & Pengelolaan Kurir (`/admin/pesanan`)

- **Tab Status Pesanan**:
  - `Semua`, `Perlu Diproses` (status `diproses` / `menunggu_pembayaran`), `Sedang Dikirim` (`dikirim`), `Selesai` (`selesai`), `Dibatalkan` (`dibatalkan`).
- **Modal / Drawer Detail Pesanan**:
  - **Informasi Pembeli**: Nama pemesan, nomor kontak WhatsApp (dengan tautan langsung `https://wa.me/...`), dan alamat lengkap tujuan kirim.
  - **Rincian Pembayaran**: Metode pembayaran, subtotal produk, diskon voucher, biaya layanan, dan grand total.
  - **Aksi Kurir & Nomor Resi**:
    - Pilihan kurir dan layanan (SiCepat, JNE, J&T, Anteraja).
    - Input nomor resi pengiriman kurir.
    - Tombol "Kirim Barang & Simpan Resi" yang mengubah status pesanan ke `dikirim` dan mencatat event live ke `tracking_history`.
    - Tombol "Selesaikan Pesanan" untuk mengubah status ke `selesai`.
  - **Timeline Pelacakan Paket**: Riwayat pergerakan paket dari penjemputan kurir hingga diterima pembeli.
  - **Cetak Label & Invoice**: Tampilan struk pengiriman standar paket marketplace.

---

## 4. Statistik & Performa Toko (`/admin/statistik`)

- **Metrik Utama**:
  - Total Pendapatan Kotor & Bersih.
  - Total Pesanan Berhasil & Tingkat Penyelesaian Pesanan.
  - Nilai Rata-rata Keranjang Belanja (*Average Order Value*).
- **Grafik Omzet & Pesanan Harian/Mingguan**:
  - Visualisasi grafik bar/line tren penjualan.
- **Peringkat Produk Terlaris (*Top Selling Products*)**:
  - Tabel 5 produk dengan angka penjualan dan pendapatan tertinggi.
- **Komposisi Kategori**:
  - Breakdown penjualan per kategori Perlengkapan, Pakaian, dan Mainan.

---

## 5. Pengaturan Toko (`/admin/setting`)

- **Alamat Gudang Asal Pengiriman**:
  - Nama Toko: `BabyKids Official Store`
  - Kota Asal: `Jakarta Selatan` / `Surabaya` (titik asal penentuan tarif kurir).
  - Alamat Lengkap Gudang Pengiriman.
- **Kurir Ekspedisi Aktif**:
  - Toggle saklar on/off untuk: SiCepat Ekspres, JNE Express, J&T Express, Anteraja, Cargo.
- **Metode Pembayaran Aktif**:
  - Toggle saklar on/off untuk: QRIS, BCA Virtual Account, Mandiri VA, BRI VA, GoPay.
- **Konfigurasi Cloudflare R2**:
  - Status koneksi R2 Storage dari konfigurasi `.env`.

---

## 6. Konfigurasi Environment Variable (`.env`)

```env
# Database
DATABASE_URL="postgres://postgres:postgres@localhost:5432/baby_shop"

# Auth
BETTER_AUTH_SECRET="babykids_secret_key_production_2026_secure_token"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Cloudflare R2 Storage (S3-Compatible)
R2_ACCOUNT_ID="your_cloudflare_account_id"
R2_ACCESS_KEY_ID="your_r2_access_key_id"
R2_SECRET_ACCESS_KEY="your_r2_secret_access_key"
R2_BUCKET_NAME="baby-shop-products"
R2_PUBLIC_URL="https://pub-xxxxxx.r2.dev"
```
