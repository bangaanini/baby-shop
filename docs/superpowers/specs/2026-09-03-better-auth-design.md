# Desain Autentikasi & Manajemen Sesi (Better Auth)
Toko Kebutuhan Anak — BabyKids

**Tanggal:** 2026-09-03  
**Status:** Disetujui (Approved)  
**Tujuan:** Mengimplementasikan sistem pendaftaran, login email-password, manajemen sesi aman via HTTP-Only cookie, tombol demo login cepat, dan kontrol akses berbasis peran (Role-Based Access Control) untuk rute pembeli (`buyer`) dan panel pengelola toko (`admin`) menggunakan Better Auth & Drizzle ORM.

---

## 1. Arsitektur Autentikasi

Autentikasi dibangun menggunakan library modern **Better Auth** yang terintegrasi dengan database PostgreSQL melalui Drizzle ORM Adapter:
- **Server Instance (`src/server/auth.ts`)**: Konfigurasi Better Auth dengan database adapter, field kustom (`role`, `phone`), dan enkripsi password.
- **REST Catch-All Route (`src/app/api/auth/[...all]/route.ts`)**: Endpoint resmi untuk login, register, logout, session check, dan password verification.
- **Client React SDK (`src/lib/auth-client.ts`)**: Hook reaktif `useSession`, fungsi `signIn.email`, `signUp.email`, dan `signOut` untuk komponen frontend.
- **Next.js Middleware (`src/middleware.ts`)**: Proteksi rute tingkat server untuk memvalidasi token sesi dan izin role (`admin` vs `buyer`).

---

## 2. Skema Tabel Database Autentikasi

### 2.1 `users` (Tabel Pengguna)
| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | `text` (PK) | Unique Identifier pengguna |
| `name` | `varchar(150)` | Nama lengkap |
| `email` | `varchar(255)` | Unique, email login |
| `email_verified`| `boolean` | Status verifikasi email (default false) |
| `image` | `text` | Foto profil / avatar |
| `phone` | `varchar(50)` | Nomor WhatsApp kontak |
| `role` | `varchar(20)` | `'buyer'` atau `'admin'` (default `'buyer'`) |
| `created_at` | `timestamp` | Waktu pendaftaran |
| `updated_at` | `timestamp` | Waktu pembaruan profil |

### 2.2 `sessions` (Tabel Sesi Pengguna)
| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | `text` (PK) | Session ID |
| `user_id` | `text` (FK) | Relasi ke `users.id` (CASCADE on delete) |
| `token` | `text` | Unique session token |
| `expires_at` | `timestamp` | Waktu kadaluarsa sesi |
| `ip_address` | `text` | IP login pengguna |
| `user_agent` | `text` | Browser / device client |
| `created_at` | `timestamp` | Waktu login dibuat |
| `updated_at` | `timestamp` | Waktu perpanjangan sesi |

### 2.3 `accounts` (Tabel Akun & Kredensial)
| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | `text` (PK) | Account ID |
| `user_id` | `text` (FK) | Relasi ke `users.id` (CASCADE on delete) |
| `account_id` | `text` | Identifier akun provider (email/sub) |
| `provider_id` | `text` | `'credential'` |
| `password` | `text` | Hash password terenkripsi |
| `created_at` | `timestamp` | Waktu akun dibuat |
| `updated_at` | `timestamp` | Waktu pembaruan |

### 2.4 `verifications` (Tabel Token Verifikasi)
| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | `text` (PK) | Token ID |
| `identifier` | `text` | Email atau target identifier |
| `value` | `text` | Token verifikasi |
| `expires_at` | `timestamp` | Waktu kadaluarsa token |
| `created_at` | `timestamp` | Waktu dibuat |
| `updated_at` | `timestamp` | Waktu diupdate |

---

## 3. Aturan Proteksi Rute (Middleware & Role-Based Access)

| Rute URL | Izin Akses | Perilaku Jika Tidak Memiliki Izin |
| :--- | :--- | :--- |
| `/admin/*` | Hanya `role: 'admin'` | Belum login: Redirect `/auth/login?redirect=/admin`<br>Role `buyer`: Redirect `/auth/unauthorized` |
| `/user/*` | User login (`buyer` / `admin`) | Belum login: Redirect `/auth/login?redirect=/user/...` |
| `/checkout` | Publik / Guest / Login | Dapat diakses semua pengguna |
| `/auth/login` | Publik (Guest) | Jika sudah login: Redirect ke `/` atau `/admin` |
| `/auth/register`| Publik (Guest) | Jika sudah login: Redirect ke `/` |

---

## 4. Antarmuka Pengguna (UI Pages & Components)

### 4.1 Halaman Masuk (`/auth/login`)
- Form input email & password dengan feedback visual kesalahan.
- Tombol **Demo Quick Login**:
  - 🟢 **Login sebagai Pembeli Demo** (Akun: `sarah.clarissa@example.com` / `password123`)
  - 🔵 **Login sebagai Admin Toko** (Akun: `admin@babykids.id` / `admin123`)
- Tautan navigasi ke halaman pendaftaran `/auth/register`.

### 4.2 Halaman Pendaftaran (`/auth/register`)
- Form input Nama Lengkap, Alamat Email, Nomor WhatsApp, dan Password.
- Validasi instan konfirmasi password.
- Otomatis masuk ke sesi pengguna baru setelah pendaftaran berhasil.

### 4.3 Halaman Akses Ditolak (`/auth/unauthorized`)
- Tampilan ramah memberitahukan bahwa panel admin hanya dapat diakses oleh akun pengelola toko.
- Tombol navigasi kembali ke beranda belanja atau beralih akun.

### 4.4 Header / Navbar Akun Dinamis
- Jika **Belum Login**: Menampilkan tombol "Masuk / Daftar".
- Jika **Sudah Login**: Menampilkan avatar inisial/foto, nama pembeli (misal: "Halo, Bunda Sarah"), menu "Pesanan Saya", "Admin Panel" (khusus admin), dan tombol "Keluar (Logout)".
