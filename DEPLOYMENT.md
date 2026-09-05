# 🚀 Panduan Lengkap Deployment & Konfigurasi Lingkungan (Production Guide) — NBusiness

Dokumentasi resmi ini memuat panduan langkah-demi-langkah untuk melakukan konfigurasi lingkungan (*environment variables*), persiapan database, integrasi layanan pihak ketiga (*Payment Gateway, Biteship, Google OAuth, Cloudflare R2*), hingga proses deployment ke platform produksi (**Vercel**, **VPS / Ubuntu + PM2 + Nginx**, atau **Docker / Railway**).

---

## 📑 Daftar Isi
1. [Ringkasan Arsitektur & Tech Stack](#1-ringkasan-arsitektur--tech-stack)
2. [Daftar Lengkap Environment Variables (.env)](#2-daftar-lengkap-environment-variables-env)
3. [Konfigurasi & Persiapan Database (PostgreSQL)](#3-konfigurasi--persiapan-database-postgresql)
4. [Konfigurasi Google OAuth (Login & Register)](#4-konfigurasi-google-oauth-login--register)
5. [Konfigurasi Payment Gateway (Midtrans & Xendit)](#5-konfigurasi-payment-gateway-midtrans--xendit)
6. [Konfigurasi Ekspedisi & Ongkir Real-Time (Biteship)](#6-konfigurasi-ekspedisi--ongkir-real-time-biteship)
7. [Konfigurasi Cloudflare R2 Storage (Upload Gambar Produk)](#7-konfigurasi-cloudflare-r2-storage-upload-gambar-produk)
8. [Manajemen Hak Akses Administrator](#8-manajemen-hak-akses-administrator)
9. [Panduan Deployment ke Vercel (Direkomendasikan)](#9-panduan-deployment-ke-vercel-direkomendasikan)
10. [Panduan Deployment ke VPS (Ubuntu + Node.js + PM2 + Nginx + SSL)](#10-panduan-deployment-ke-vps-ubuntu--nodejs--pm2--nginx--ssl)
11. [Panduan Deployment via Docker](#11-panduan-deployment-via-docker)
12. [Checklist Akhir Sebelum Peluncuran (Go-Live)](#12-checklist-akhir-sebelum-peluncuran-go-live)

---

## 1. Ringkasan Arsitektur & Tech Stack

- **Framework**: Next.js 16.3+ (App Router, React 19, Turbopack)
- **Bahasa**: TypeScript 5+ (Strict Mode)
- **Styling**: Tailwind CSS v4 + Claymorphism UI System
- **Database & ORM**: PostgreSQL + Drizzle ORM (`postgres.js`)
- **Autentikasi & RBAC**: Better Auth v1.7+ (Email/Password + Google OAuth)
- **Object Storage**: Cloudflare R2 (S3-Compatible via `@aws-sdk/client-s3`)
- **Logistik**: Biteship API (Tarif Real-time + Cargo Volumetrik `(P*L*T)/6000`)
- **Payment Gateway**: Midtrans Snap (Modal Popup) & Xendit XenInvoice (Hosted Invoice)

---

## 2. Daftar Lengkap Environment Variables (.env)

Buat berkas `.env` (atau isi pada menu *Environment Variables* di platform hosting Anda) dengan template berikut:

```bash
# ==============================================================================
# 1. DATABASE & SERVER CORE
# ==============================================================================
# Connection string PostgreSQL (Neon, Supabase, Railway, atau VPS lokal)
# Format: postgres://username:password@hostname:5432/database_name?sslmode=require
DATABASE_URL="postgres://postgres:password123@localhost:5432/baby_shop"

# Kunci enkripsi sesi Better Auth (Minimal 32 karakter acak)
# Tips buat string acak: jalankan `openssl rand -base64 32` di terminal
BETTER_AUTH_SECRET="f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8"

# URL domain utama aplikasi (tanpa trailing slash '/')
# Local: http://localhost:3000
# Production: https://nbusiness.id atau https://toko-anda.vercel.app
NEXT_PUBLIC_APP_URL="https://nbusiness.id"

# ==============================================================================
# 2. HAK AKSES ADMINISTRATOR
# ==============================================================================
# Email yang otomatis mendapatkan hak akses 'admin' saat mendaftar / login Google
# Pisahkan dengan tanda koma jika lebih dari satu
ADMIN_EMAILS="admin@nbusiness.id,pemilik@gmail.com,developer@domain.com"

# ==============================================================================
# 3. GOOGLE OAUTH 2.0 (LOGIN & REGISTER GOOGLE)
# ==============================================================================
# Diperoleh dari Google Cloud Console -> APIs & Services -> Credentials
GOOGLE_CLIENT_ID="123456789012-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx"

# ==============================================================================
# 4. EKSPEDISI & ONGKIR OTOMATIS (BITESHIP)
# ==============================================================================
# API Key diperoleh dari https://biteship.com -> Dashboard -> API Keys
BITESHIP_API_KEY="biteship_live.eyJhbGciOi..."

# Alamat Asal Gudang Toko (Penting untuk perhitungan ongkir riil)
SHIPPING_ORIGIN_POSTAL_CODE="12160"
SHIPPING_ORIGIN_CITY="Jakarta Selatan"
SHIPPING_ORIGIN_PROVINCE="DKI Jakarta"

# ==============================================================================
# 5. PAYMENT GATEWAY (MIDTRANS & XENDIT)
# ==============================================================================
# Provider aktif default: "midtrans" | "xendit" | "simulator"
PAYMENT_GATEWAY_PROVIDER="midtrans"

# --- MIDTRANS CONFIGURATION ---
# Dashboard: https://dashboard.midtrans.com (Production) atau https://dashboard.sandbox.midtrans.com
MIDTRANS_SERVER_KEY="Mid-server-xxxxxxxxxxxxxxxxxxxx"
MIDTRANS_CLIENT_KEY="Mid-client-xxxxxxxxxxxxxxxxxxxx"
MIDTRANS_MERCHANT_ID="G123456789"
# Ubah ke "true" untuk transaksi uang asli, "false" untuk mode pengujian (Sandbox)
MIDTRANS_IS_PRODUCTION="true"

# --- XENDIT CONFIGURATION ---
# Dashboard: https://dashboard.xendit.co -> Settings -> API Keys
XENDIT_SECRET_KEY="xnd_production_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
XENDIT_PUBLIC_KEY="xnd_public_production_xxxxxxxxxxxxxxxxxxxxxxxx"
XENDIT_WEBHOOK_TOKEN="xnd_webhook_token_xxxxxxxxxxxxxxxxxxxxxxxx"
XENDIT_IS_PRODUCTION="true"

# ==============================================================================
# 6. OBJECT STORAGE / FOTO PRODUK (CLOUDFLARE R2)
# ==============================================================================
# Diperoleh dari Cloudflare Dashboard -> R2 -> Manage R2 API Tokens
R2_ACCOUNT_ID="a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6"
R2_ACCESS_KEY_ID="0123456789abcdef0123456789abcdef"
R2_SECRET_ACCESS_KEY="fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210"
R2_BUCKET_NAME="nbusiness-products"
# Domain publik bucket R2 (Custom domain atau r2.dev)
R2_PUBLIC_URL="https://images.nbusiness.id"
```

---

## 3. Konfigurasi & Persiapan Database (PostgreSQL)

### A. Panduan Setup PostgreSQL Lokal di VPS (Ubuntu / Debian):
Jika Anda menginstal PostgreSQL langsung di server VPS Anda:

#### 1. Install PostgreSQL & Ekstensi Kontribusi:
```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
```

#### 2. Buat User & Database Baru:
Masuk ke terminal PostgreSQL (`psql`) sebagai user `postgres`:
```bash
sudo -u postgres psql
```

Jalankan perintah SQL berikut di dalam console `psql` (ganti `password_rahasia_anda` dengan password kuat Anda):
```sql
-- 1. Buat database untuk NBusiness
CREATE DATABASE nbusiness_db;

-- 2. Buat user database dengan password
CREATE USER nbusiness_user WITH ENCRYPTED PASSWORD 'password_rahasia_anda';

-- 3. Berikan seluruh hak akses database ke user tersebut
GRANT ALL PRIVILEGES ON DATABASE nbusiness_db TO nbusiness_user;

-- 4. Berikan izin schema public (PostgreSQL 15+)
\c nbusiness_db
GRANT ALL ON SCHEMA public TO nbusiness_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO nbusiness_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO nbusiness_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO nbusiness_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO nbusiness_user;

-- Keluar dari psql
\q
```

#### 3. Format `DATABASE_URL` di file `.env`:
```bash
DATABASE_URL="postgres://nbusiness_user:password_rahasia_anda@127.0.0.1:5432/nbusiness_db"
```

---

### B. Rekomendasi Managed Database Provider (Cloud / Serverless):
Jika Anda memilih menggunakan database cloud terkelola:
1. **Neon Serverless PostgreSQL** (*https://neon.tech*) — Sangat direkomendasikan untuk Next.js Vercel / serverless.
2. **Supabase** (*https://supabase.com*) — Mendukung PostgreSQL connection pooling (port `6543` / `5432`).
3. **Railway** (*https://railway.app*) — PostgreSQL mandiri dengan latensi rendah.

---

### C. Menjalankan Migrasi Skema Database:
Setelah `DATABASE_URL` terhubung, jalankan perintah sinkronisasi skema tabel Drizzle:
```bash
# Sinkronkan seluruh tabel (users, products, orders, vouchers, carts, store_settings, dll)
npm run db:push
```

### D. Melakukan Seeding Data Awal (Katalog & Akun Admin):
```bash
# Men-seed kategori, produk awal berstandar SNI, akun admin, dan pengaturan default
npm run db:seed
```
*Hasil*: Akun admin bawaan `admin@nbusiness.id` / `admin123` akan dibuat beserta master katalog lengkap.

---

## 4. Konfigurasi Google OAuth (Login & Register)

Untuk mengaktifkan tombol **"Masuk dengan Google"** dan **"Daftar dengan Google"**:

1. Buka [Google Cloud Console](https://console.cloud.google.com/).
2. Buat Project Baru (contoh: `NBusiness Store`).
3. Buka menu **APIs & Services** $\rightarrow$ **OAuth consent screen**:
   - Pilih *External*, isi nama aplikasi `NBusiness`, email dukungan, dan logo.
4. Buka menu **Credentials** $\rightarrow$ **Create Credentials** $\rightarrow$ **OAuth client ID**:
   - **Application type**: *Web application*.
   - **Name**: `NBusiness Web App`.
   - **Authorized JavaScript origins**:
     - `https://nbusiness.id` (domain produksi Anda)
     - `http://localhost:3000` (untuk pengujian lokal)
   - **Authorized redirect URIs (SANGAT PENTING)**:
     - `https://nbusiness.id/api/auth/callback/google`
     - `http://localhost:3000/api/auth/callback/google`
     *(Catatan: Better Auth menggunakan rute `/api/auth/callback/google`, bukan `/api/auth/google/callback`)*.
5. Salin **Client ID** dan **Client Secret** ke dalam `.env` (`GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`).

---

## 5. Konfigurasi Payment Gateway (Midtrans & Xendit)

Aplikasi NBusiness mendukung **Midtrans Snap** dan **Xendit XenInvoice** dengan sistem auto-settlement webhook kriptografis.

### A. Konfigurasi Midtrans (Production):
1. Login ke [Dashboard Midtrans Production](https://dashboard.midtrans.com/).
2. Masuk ke menu **Settings** $\rightarrow$ **Access Keys**:
   - Salin `Server Key`, `Client Key`, dan `Merchant ID` ke `.env`.
3. Masuk ke menu **Settings** $\rightarrow$ **Configuration**:
   - **Payment Notification URL (Webhook)**:
     `https://nbusiness.id/api/webhooks/payment`
   - **Finish Redirect URL**:
     `https://nbusiness.id/user/pesanan`
   - **Unfinish Redirect URL**:
     `https://nbusiness.id/checkout`
   - **Error Redirect URL**:
     `https://nbusiness.id/checkout`

### B. Konfigurasi Xendit (Production):
1. Login ke [Dashboard Xendit](https://dashboard.xendit.co/).
2. Buka menu **Settings** $\rightarrow$ **Developers** $\rightarrow$ **API Keys**:
   - Buat Secret Key dengan izin *Write* untuk Invoices.
3. Buka menu **Settings** $\rightarrow$ **Developers** $\rightarrow$ **Webhooks**:
   - Tambahkan Webhook URL untuk event **Invoice**:
     `https://nbusiness.id/api/webhooks/payment`
   - Salin **Verification Token (Webhook Token)** ke `XENDIT_WEBHOOK_TOKEN` di `.env`.

---

## 6. Konfigurasi Ekspedisi & Ongkir Real-Time (Biteship)

NBusiness terhubung ke **Biteship Logistics Gateway** yang mendukung kurir JNE, SiCepat, J&T, AnterAja, POS Indonesia, TIKI, Wahana, Lion Parcel, dan Ninja Xpress.

1. Daftar akun di [Biteship Console](https://biteship.com).
2. Di Dashboard Biteship, salin **API Key Live** ke `BITESHIP_API_KEY` di `.env`.
3. Tentukan titik lokasi gudang asal toko pada `.env`:
   - `SHIPPING_ORIGIN_POSTAL_CODE`: Kode pos gudang (misal `12160`).
   - `SHIPPING_ORIGIN_CITY`: Kota gudang (misal `Jakarta Selatan`).
   - `SHIPPING_ORIGIN_PROVINCE`: Provinsi gudang (misal `DKI Jakarta`).
4. *Catatan*: Alamat gudang asal juga dapat diubah kapan saja melalui halaman **Seller Center (`/admin/setting` $\rightarrow$ Tab Lokasi Gudang)**.

---

## 7. Konfigurasi Cloudflare R2 Storage (Upload Gambar Produk)

Cloudflare R2 memberikan penyimpanan objek S3-compatible berkecepatan tinggi tanpa biaya egress (*zero-egress fees*).

1. Buka [Cloudflare Dashboard](https://dash.cloudflare.com) $\rightarrow$ **R2 Object Storage**.
2. Buat bucket baru dengan nama: `nbusiness-products`.
3. Buka **Settings Bucket** $\rightarrow$ **Public Access**:
   - Aktifkan *Custom Domain* (misal: `images.nbusiness.id`) atau aktifkan *R2.dev subdomain*.
4. Buka menu **Manage R2 API Tokens** $\rightarrow$ **Create API Token**:
   - Permissions: *Object Read & Write*.
   - Salin `Account ID`, `Access Key ID`, dan `Secret Access Key` ke `.env`.
5. Atur **CORS Policy** pada bucket R2:
```json
[
  {
    "AllowedOrigins": ["https://nbusiness.id", "http://localhost:3000"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3000
  }
]
```
*(Catatan: Jika kredensial R2 belum diisi, sistem upload produk memiliki fallback cerdas yang menyimpan file secara lokal tanpa membuat aplikasi crash)*.

---

## 8. Manajemen Hak Akses Administrator

Terdapat 2 cara untuk memberikan role `admin` ke akun tertentu:

### Metode 1: Melalui `ADMIN_EMAILS` di `.env` (Otomatis)
Tambahkan email Anda ke variable `ADMIN_EMAILS` di `.env`:
```bash
ADMIN_EMAILS="admin@nbusiness.id,email-pribadi-anda@gmail.com"
```
Saat akun dengan email tersebut mendaftar atau login melalui Google OAuth, database hooks Better Auth akan **secara otomatis mengangkat role user menjadi `admin`**.

### Metode 2: Menggunakan Script CLI Server
Jalankan script injeksi admin via terminal:
```bash
npx tsx src/scripts/set-admin.ts email-anda@gmail.com
```

---

## 9. Panduan Deployment ke Vercel (Direkomendasikan)

Platform **Vercel** adalah platform hosting resmi untuk Next.js dengan dukungan serverless route handlers dan Edge middleware.

### Langkah-langkah Deploy ke Vercel:
1. Push repository Anda ke GitHub / GitLab / Bitbucket.
2. Buka [Vercel Dashboard](https://vercel.com) $\rightarrow$ Klik **"Add New Project"**.
3. Import repository project `baby-shop` (atau `nbusiness`).
4. Pada bagian **Environment Variables**, masukkan seluruh variabel yang ada di [Bagian 2](#2-daftar-lengkap-environment-variables-env).
   *(Pastikan `NEXT_PUBLIC_APP_URL` diisi dengan domain Vercel Anda, misal `https://nbusiness.vercel.app`)*.
5. Klik **"Deploy"**.
6. Setelah deployment selesai:
   - Hubungkan database dengan menjalankan `npx drizzle-kit push` dari lokal atau console.
   - Daftarkan URL callback Google OAuth dan URL Webhook Midtrans/Xendit menggunakan domain Vercel yang baru dibuat.

---

## 10. Panduan Deployment ke VPS (Ubuntu + Node.js + PM2 + Nginx + SSL)

Jika Anda menggunakan VPS pribadi (DigitalOcean, AWS EC2, Linode, IDCloudHost, Biznet):

### 1. Persiapan Server Ubuntu & PostgreSQL:
```bash
# Update paket sistem
sudo apt update && sudo apt upgrade -y

# Install Node.js 20 LTS, Git, Nginx, dan PostgreSQL Lokal
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git nginx postgresql postgresql-contrib

# Install PM2 Process Manager secara global
sudo npm install -g pm2
```

#### Setup Database PostgreSQL Lokal di VPS:
```bash
# Masuk ke console psql
sudo -u postgres psql
```
Jalankan perintah SQL berikut:
```sql
CREATE DATABASE nbusiness_db;
CREATE USER nbusiness_user WITH ENCRYPTED PASSWORD 'buat_password_kuat_anda';
GRANT ALL PRIVILEGES ON DATABASE nbusiness_db TO nbusiness_user;
\c nbusiness_db
GRANT ALL ON SCHEMA public TO nbusiness_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO nbusiness_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO nbusiness_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO nbusiness_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO nbusiness_user;
\q
```

### 2. Clone Repository & Install Dependencies:
```bash
# Clone project ke direktori web
cd /var/www
sudo git clone https://github.com/username/baby-shop.git nbusiness
cd nbusiness

# Install dependencies
npm install

# Buat dan isi file .env
cp .env.example .env
nano .env   # Masukkan seluruh kredensial produksi Anda
```

### 3. Migrasi Database & Build Aplikasi:
```bash
# Push skema database
npm run db:push

# Seed data awal katalog
npm run db:seed

# Build Next.js untuk produksi
npm run build
```

### 4. Jalankan Aplikasi dengan PM2:
```bash
# Start server Next.js di background
pm2 start npm --name "nbusiness" -- start

# Simpan proses agar otomatis berjalan saat VPS restart
pm2 save
pm2 startup
```

### 5. Konfigurasi Reverse Proxy Nginx:
Buat file konfigurasi Nginx:
```bash
sudo nano /etc/nginx/sites-available/nbusiness
```
Isi konfigurasi berikut:
```nginx
server {
    listen 80;
    server_name nbusiness.id www.nbusiness.id;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Aktifkan konfigurasi Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/nbusiness /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. Pasang Sertifikat SSL Gratis (Let's Encrypt / Certbot):
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d nbusiness.id -d www.nbusiness.id
```

---

## 11. Panduan Deployment via Docker

Jika Anda menggunakan container environment (Docker Compose, Portainer, Coolify, atau Railway):

### A. Buat berkas `Dockerfile`:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/src/db ./src/db
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts

EXPOSE 3000
CMD ["npm", "start"]
```

### B. Buat berkas `docker-compose.yml`:
```yaml
version: '3.8'

services:
  app:
    build: .
    restart: always
    ports:
      - "3000:3000"
    env_file:
      - .env
    depends_on:
      - postgres

  postgres:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password123
      POSTGRES_DB: baby_shop
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  pgdata:
```

Jalankan container:
```bash
docker compose up -d --build
```

---

## 12. Checklist Akhir Sebelum Peluncuran (Go-Live)

Gunakan checklist ini sebelum membuka toko untuk transaksi umum:

- [ ] **Database Connection**: `DATABASE_URL` terhubung dan `npm run db:push` berhasil dijalankan.
- [ ] **Admin Account**: Email Anda terdaftar di `ADMIN_EMAILS` dan bisa mengakses `/admin`.
- [ ] **Google OAuth**: Domain produksi dan URI callback `/api/auth/callback/google` sudah didaftarkan di Google Cloud Console.
- [ ] **Biteship API**: API key terpasang dan alamat gudang di `/admin/setting` sudah sesuai lokasi fisik.
- [ ] **Payment Gateway**:
  - `MIDTRANS_IS_PRODUCTION="true"` atau `XENDIT_IS_PRODUCTION="true"`.
  - Webhook URL `https://domain-anda.com/api/webhooks/payment` sudah didaftarkan di dashboard payment gateway.
- [ ] **Halaman Legal**: Periksa `/syarat-ketentuan`, `/kebijakan-privasi`, dan `/kebijakan-pengembalian` dapat dibuka dengan baik.
- [ ] **SEO & Metadata**: Periksa meta title dan meta description di `/admin/setting` (Tab SEO). Rute `/sitemap.xml` dan `/robots.txt` dapat diakses.
- [ ] **Uji Transaksi Nyata**: Buat 1 pesanan uji coba untuk memastikan alur keranjang, ongkir, pembayaran, dan pencatatan resi berfungsi normal.

---

🎉 **Selamat! Toko Online NBusiness Anda telah siap melayani pembeli secara profesional!**
