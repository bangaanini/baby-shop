# Desain Halaman Akun & Profil Pengguna ala Tokopedia
Platform E-Commerce — NBusiness

**Tanggal:** 2026-09-04  
**Status:** Disetujui (Approved)  
**Tujuan:** Merombak halaman akun pembeli (`/user/profil` dan `/user/pesanan`) menjadi antarmuka dashboard pengguna ala Tokopedia yang terorganisir rapi dalam 2 kolom di desktop dan bilah navigasi adaptif di mobile, mencakup: (1) Biodata Diri & Form Edit Profil, (2) Daftar Alamat Pengiriman lengkap dengan aksi CRUD dan Set Alamat Utama, (3) Daftar Transaksi Pembelian dengan status pesanan real-time, pelacakan kurir, dan pembayaran instan, serta (4) Pengaturan Keamanan Akun & Ubah Kata Sandi.

---

## 1. Struktur Layout & Navigasi (Tokopedia Profile Style)

Antarmuka akun pengguna mengadopsi tata letak responsif 2 kolom:
- **Sidebar Akun Pengguna (Sisi Kiri)**:
  - Kartu Ringkasan Akun: Foto profil avatar / inisial, nama lengkap, badge keanggotaan *"Member VIP NBusiness"*.
  - Menu Navigasi Akun:
    - 👤 **Biodata Diri** (`tab === 'biodata'`)
    - 📍 **Daftar Alamat** (`tab === 'alamat'`)
    - 🛍️ **Daftar Transaksi / Pembelian** (`tab === 'transaksi'`)
    - 🔒 **Keamanan Akun** (`tab === 'keamanan'`)
    - 🚪 **Keluar Akun (Logout)**
- **Panel Konten Utama (Sisi Kanan)**:
  - Wadah kartu putih berdesain bersih yang merender konten sesuai tab aktif.
- **Mobile Responsive Layout**:
  - Pada layar smartphone (< 768px), sidebar disederhanakan menjadi header ringkasan profil dan tab navigasi horizontal scrollable agar nyaman diakses dengan satu tangan.

---

## 2. Rincian Fitur per Kategori Tab

### 2.1 Tab 1: 👤 Biodata Diri (`BiodataTab`)
- **Tampilan Informasi Pribadi**:
  - Foto Profil / Avatar inisial dengan tombol ganti gambar.
  - Nama Lengkap (dengan opsi edit inline atau mode form ubah).
  - Tanggal Lahir (dengan pemilih tanggal interaktif).
  - Jenis Kelamin (Pilihan radio: Wanita / Pria).
  - Informasi Kontak: Alamat Email (dengan indikator status hijau *Terverifikasi*), Nomor WhatsApp / HP.
  - Data Keluarga / Anak (opsional: misal "2 Orang Anak").
- **API Endpoint**: `PATCH /api/user/profile` (memperbarui baris pengguna pada `usersTable`).

### 2.2 Tab 2: 📍 Daftar Alamat Pengiriman (`AddressesTab`)
- **Tampilan Daftar Alamat**:
  - Kartu alamat dengan label (`Rumah Utama`, `Kantor`, `Apartemen`).
  - Badge visual **"Alamat Utama"** untuk alamat prioritas pengiriman.
  - Detail: Nama penerima, nomor HP kontak, alamat lengkap, kecamatan, kota, provinsi, kode pos.
- **Fitur Interaktif & CRUD**:
  - **Tambah Alamat Baru**: Modal dialog input alamat lengkap (Nama Penerima, Telepon, Label, Provinsi, Kota, Kecamatan, Kode Pos, Alamat Lengkap, Checkbox "Jadikan Alamat Utama").
  - **Edit Alamat**: Modal dialog untuk mengubah data alamat yang sudah ada.
  - **Jadikan Alamat Utama**: Mengubah status alamat menjadi utama (`is_primary = true`) dan mencabut status utama dari alamat lain secara otomatis.
  - **Hapus Alamat**: Dialog konfirmasi penghapusan alamat dengan proteksi (tidak boleh menghapus satu-satunya alamat utama tanpa pengganti).
- **API Endpoints**:
  - `GET /api/user/addresses` (daftar alamat pengguna yang sedang login)
  - `POST /api/user/addresses` (tambah alamat baru)
  - `PUT /api/user/addresses/[id]` (update alamat)
  - `DELETE /api/user/addresses/[id]` (hapus alamat)
  - `PATCH /api/user/addresses/[id]/primary` (set alamat utama)

### 2.3 Tab 3: 🛍️ Daftar Transaksi Pembelian (`OrdersTab`)
- **Filter Status Pesanan**:
  - `Semua`, `Menunggu Pembayaran`, `Diproses`, `Sedang Dikirim`, `Selesai`, `Dibatalkan`.
- **Kartu Pesanan Marketplace**:
  - Nomor invoice (`BK-...`), tanggal transaksi, badge status transaksi (warna-warni).
  - Snapshot produk: thumbnail gambar, nama barang, varian warna/ukuran, jumlah barang, harga satuan, dan total bayar.
  - Informasi kurir ekspedisi & nomor resi paket.
- **Aksi Cepat**:
  - 🚚 **Lacak Pengiriman**: Modal popup live tracking timeline kurir.
  - 💳 **Bayar Sekarang**: Pemicu pembayaran Midtrans Snap / Xendit Invoice jika status `menunggu_pembayaran`.
  - ⚡ **Simulasi Pembayaran Lunas**: Aksi cepat instant settle untuk pengujian alur pesanan.
  - ✅ **Konfirmasi Terima**: Menandai pesanan telah sampai dengan baik (`status ➔ selesai`).
  - 🔄 **Beli Lagi**: Menautkan kembali ke katalog untuk memesan barang yang sama.

### 2.4 Tab 4: 🔒 Keamanan Akun (`SecurityTab`)
- **Ubah Kata Sandi (Password)**:
  - Input: Kata Sandi Saat Ini (Lama).
  - Input: Kata Sandi Baru (minimal 8 karakter) dengan fitur lihat/sembunyikan password.
  - Input: Konfirmasi Kata Sandi Baru.
  - Validasi kecocokan password dan update hash aman pada `accountsTable`.
  - Endpoint: `POST /api/user/change-password`.
- **Informasi Keamanan & Sesi**:
  - Status Verifikasi Email.
  - Sesi login perangkat aktif.
  - Tombol **"Keluar dari Akun (Logout)"**.

---

## 3. Arsitektur API Backend (`src/app/api/user/...`)

1. **`GET /api/user/profile` & `PATCH /api/user/profile`**: Mengambil dan memperbarui data profil pengguna (`name`, `phone`, `image`, metadata).
2. **`GET /api/user/addresses`**: Mengambil seluruh buku alamat milik user yang terautentikasi (`addressesTable`).
3. **`POST /api/user/addresses`**: Menyimpan alamat pengiriman baru ke database.
4. **`PUT /api/user/addresses/[id]`**: Memperbarui informasi alamat spesifik.
5. **`DELETE /api/user/addresses/[id]`**: Menghapus alamat pengiriman.
6. **`PATCH /api/user/addresses/[id]/primary`**: Menyetel alamat tertentu sebagai alamat utama.
7. **`POST /api/user/change-password`**: Memverifikasi password lama dan mengupdate hash password baru menggunakan Better Auth hasher.

---

## 4. Responsivitas & Desain Aksesibilitas
- Menggunakan Tailwind CSS flex/grid responsif (`grid-cols-1 lg:grid-cols-12`).
- Sidebar mengambil porsi 3 kolom di desktop (`lg:col-span-3` atau `w-64`) dan konten utama 9 kolom (`lg:col-span-9`).
- Desain tombol, input, dan kartu dibuat *touch-friendly* dengan padding minimum 44px di perangkat layar sentuh mobile.
