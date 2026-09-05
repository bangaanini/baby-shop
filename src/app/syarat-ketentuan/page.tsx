import type { Metadata } from 'next';
import Link from 'next/link';
import { paymentService } from '@/server/services/payment.service';

export const metadata: Metadata = { title: 'Syarat & Ketentuan — NBusiness' };

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-3xl border border-[#FFE8D6] shadow-md p-6 sm:p-7">
      <h2 className="font-heading font-bold text-lg text-slate-800 mb-3">{title}</h2>
      <div className="font-body text-[13px] leading-relaxed text-slate-600 space-y-2">{children}</div>
    </section>
  );
}

export default async function SyaratKetentuanPage() {
  let settings: Awaited<ReturnType<typeof paymentService.getStoreSettings>> | null = null;
  try {
    settings = await paymentService.getStoreSettings();
  } catch {
    settings = null;
  }
  const storeName = (settings as any)?.store_name || 'NBusiness';
  const storeEmail = (settings as any)?.store_email || 'halo@babykids.id';
  const storePhone = (settings as any)?.store_phone || '0812-3456-7890';
  const storeAddress =
    (settings as any)?.store_address || 'Jl. Melati Indah No. 42, RT 03 / RW 07, Kebayoran Baru';
  const storeCity = (settings as any)?.store_city || 'Jakarta Selatan';
  const storePostal = (settings as any)?.store_postal_code || '12160';

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <span className="inline-flex items-center gap-2 text-[11px] font-heading font-bold tracking-widest uppercase px-4 py-2 rounded-full bg-white border border-[#FFE8D6] text-[#D96B00] shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#FF9F43]" />
            Dokumen Hukum
          </span>
          <h1 className="mt-4 font-heading font-black text-3xl sm:text-4xl text-slate-800">
            Syarat & Ketentuan
          </h1>
          <p className="mt-2 font-body text-sm text-slate-500">
            Berlaku untuk seluruh pengguna {storeName}. Terakhir diperbarui: 5 September 2026.
          </p>
        </div>

        <div className="space-y-5">
          <Card title="1. Definisi Toko">
            <p>
              <strong>{storeName}</strong> adalah toko/penyelenggara platform yang menyediakan
              produk kebutuhan bayi, balita, dan anak — meliputi perlengkapan, pakaian, dan mainan
              edukasi — beserta layanan pendukungnya (pencarian produk, keranjang, pembayaran, dan
              pengiriman).
            </p>
            <p>
              &quot;Pengguna&quot; adalah setiap pengunjung atau pembeli yang mengakses situs/aplikasi{' '}
              {storeName}. &quot;Layanan&quot; mencakup seluruh fitur katalog, pemesanan, pembayaran,
              dan pengiriman yang disediakan {storeName}.
            </p>
          </Card>

          <Card title="2. Akun">
            <p>
              Pengguna wajib memberikan data pendaftaran yang benar dan menjaga kerahasiaan kredensial
              akun. Setiap aktivitas yang terjadi pada akun menjadi tanggung jawab pemilik akun.
            </p>
            <p>
              {storeName} berhak menangguhkan atau menutup akun yang terindikasi melanggar ketentuan,
              melakukan penyalahgunaan, atau membahayakan keamanan layanan.
            </p>
            <p>
              Autentikasi dikelola dengan mekanisme aman (Better Auth) dan hanya digunakan untuk
              keperluan pengelolaan akun, alamat, dan pesanan.
            </p>
          </Card>

          <Card title="3. Harga & Stok">
            <p>
              Harga yang tampil pada katalog adalah harga final pada saat pemesanan sebelum biaya
              pengiriman dan pajak (jika ada). {storeName} berhak menyesuaikan harga dan stok
              sewaktu-waktu mengikuti ketersediaan dan kebijakan pemasok.
            </p>
            <p>
              Jika terjadi selisih harga atau kesalahan pencantuman harga akibat kesalahan sistem,
              {storeName} akan menginformasikan kepada pengguna sebelum pemrosesan pesanan dan
              menawarkan opsi konfirmasi ulang atau pembatalan dengan pengembalian dana.
            </p>
            <p>Pesanan hanya diproses setelah pembayaran terverifikasi dari payment gateway.</p>
          </Card>

          <Card title="4. Pembayaran">
            <p>
              Pembayaran diproses melalui <strong>payment gateway terintegrasi</strong> yang
              mendukung berbagai metode populer (mis. QRIS, Virtual Account bank, e-wallet). Rekonsiliasi
              dilakukan otomatis melalui webhook dari penyedia payment gateway.
            </p>
            <p>
              {storeName} tidak menyimpan data kartu atau kredensial pembayaran pengguna; seluruh
              data pembayaran diproses langsung oleh penyedia payment gateway sesuai standar
              keamanan mereka.
            </p>
            <p>Segala biaya transaksi pihak ketiga akan diinformasikan pada halaman checkout.</p>
          </Card>

          <Card title="5. Pengiriman">
            <p>
              Pengiriman dilayani melalui mitra logistik terintegrasi (Biteship) yang
              mencakup kurir seperti JNE, SiCepat, J&T, dan Anteraja. Estimasi biaya dan durasi
              ditampilkan pada saat checkout berdasarkan alamat tujuan.
            </p>
            <p>
              Keterlambatan akibat force majeure, kebijakan kurir, cuaca, atau kendala bea cukai untuk
              daerah tertentu berada di luar kendali {storeName}. Status pengiriman dapat dilacak
              melalui halaman
              <Link href="/user/pesanan" className="text-[#D96B00] hover:underline">
                {' '}
                Riwayat Pesanan
              </Link>
              .
            </p>
          </Card>

          <Card title="6. Pesanan & Pembatalan">
            <p>
              Pesanan yang sudah dibayar akan segera diproses gudang. Pembatalan oleh pembeli hanya
              dapat dilakukan selama pesanan berstatus <em>Belum Dikirim</em> dan belum masuk proses
              packing/kurir.
            </p>
            <p>
              Pembatalan karena pelanggaran kebijakan, stok habis mendadak, atau indikasi kecurangan
              dapat dilakukan oleh {storeName} dengan pengembalian dana sesuai skema pada Kebijakan
              Pengembalian.
            </p>
            <p>
              Retur karena cacat produksi atau salah kirim mengikuti ketentuan 7 hari pada
              <Link href="/kebijakan-pengembalian" className="text-[#D96B00] hover:underline">
                {' '}
                Kebijakan Pengembalian
              </Link>
              .
            </p>
          </Card>

          <Card title="7. Hak Kekayaan Intelektual">
            <p>
              Seluruh konten situs — termasuk merek, logo, foto produk, deskripsi, ikon, dan desain
              antarmuka — merupakan hak milik {storeName} atau pemberi lisensi yang sah. Penggunaan
              tanpa izin tertulis dilarang, termasuk reproduksi, distribusi, atau modifikasi untuk
              tujuan komersial.
            </p>
            <p>
              Ulasan dan konten yang dikirim pengguna tetap menjadi tanggung jawab pengirim dan tidak
              boleh melanggar hak pihak ketiga maupun peraturan yang berlaku.
            </p>
          </Card>

          <Card title="8. Perubahan Syarat">
            <p>
              {storeName} dapat memperbarui Syarat & Ketentuan ini untuk menyesuaikan peraturan,
              kebijakan operasional, atau peningkatan layanan. Versi terbaru akan dipublikasikan di
              halaman ini beserta tanggal berlakunya.
            </p>
            <p>
              Penggunaan berkelanjutan atas layanan setelah perubahan dipublikasikan dianggap sebagai
              persetujuan terhadap versi terbaru.
            </p>
          </Card>

          <Card title="9. Kontak">
            <p>Pertanyaan terkait Syarat & Ketentuan dapat menghubungi:</p>
            <div className="rounded-2xl bg-[#FFF8F0] border border-[#FFE8D6] p-4 text-sm">
              <p className="font-heading font-bold text-slate-800">{storeName}</p>
              <p>
                Email:{' '}
                <a href={`mailto:${storeEmail}`} className="text-[#D96B00] hover:underline">
                  {storeEmail}
                </a>
              </p>
              <p>
                Telepon:{' '}
                <a href={`tel:${storePhone}`} className="text-[#D96B00] hover:underline">
                  {storePhone}
                </a>
              </p>
              <p className="text-slate-500">
                {storeAddress}, {storeCity} {storePostal}
              </p>
            </div>
            <p className="pt-2">
              <Link href="/" className="inline-flex items-center text-[#D96B00] hover:underline font-bold">
                ← Kembali ke Beranda
              </Link>
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
