import type { Metadata } from 'next';
import Link from 'next/link';
import { paymentService } from '@/server/services/payment.service';

export const metadata: Metadata = { title: 'Kebijakan Privasi — NBusiness' };

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-3xl border border-[#FFE8D6] shadow-md p-6 sm:p-7">
      <h2 className="font-heading font-bold text-lg text-slate-800 mb-3">{title}</h2>
      <div className="font-body text-[13px] leading-relaxed text-slate-600 space-y-2">{children}</div>
    </section>
  );
}

export default async function KebijakanPrivasiPage() {
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
            <span className="w-2 h-2 rounded-full bg-[#87CEEB]" />
            Dokumen Hukum
          </span>
          <h1 className="mt-4 font-heading font-black text-3xl sm:text-4xl text-slate-800">
            Kebijakan Privasi
          </h1>
          <p className="mt-2 font-body text-sm text-slate-500">
            Menjelaskan bagaimana {storeName} mengumpulkan, menggunakan, dan melindungi data pribadi Anda.
            Terakhir diperbarui: 5 September 2026.
          </p>
        </div>

        <div className="space-y-5">
          <Card title="1. Data yang Dikumpulkan">
            <p>{storeName} mengumpulkan data yang Anda berikan saat menggunakan layanan:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Akun (Better Auth)</strong>: nama, email, kredensial autentikasi, dan
                preferensi akun.
              </li>
              <li>
                <strong>Alamat</strong>: nama penerima, nomor telepon, alamat lengkap, kota,
                kode pos — untuk pengiriman dan penagihan.
              </li>
              <li>
                <strong>Pesanan</strong>: riwayat pesanan, item, metode pembayaran, status
                pengiriman, serta korespondensi terkait pesanan.
              </li>
              <li>
                <strong>Teknis otomatis</strong>: alamat IP, tipe perangkat/browser, log akses untuk
                keamanan dan analitik agregat.
              </li>
            </ul>
            <p>
              Pembayaran ditangani oleh penyedia payment gateway terintegrasi; {storeName} tidak
              menyimpan data kartu lengkap Anda.
            </p>
          </Card>

          <Card title="2. Tujuan Penggunaan Data">
            <ul className="list-disc pl-5 space-y-1">
              <li>Memproses pendaftaran, autentikasi, dan pengelolaan akun.</li>
              <li>Memproses pesanan, pembayaran, dan pengiriman termasuk pelacakan oleh kurir.</li>
              <li>Mengirim notifikasi transaksi, pengiriman, dan layanan pelanggan.</li>
              <li>Meningkatkan kualitas layanan, mencegah kecurangan, dan memenuhi kewajiban hukum.</li>
            </ul>
          </Card>

          <Card title="3. Dasar Hukum">
            <p>Pengolahan data dilakukan atas dasar:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Persetujuan Anda saat membuat akun dan melakukan transaksi.</li>
              <li>Pelaksanaan kontrak (pemenuhan pesanan dan pengiriman).</li>
              <li>Kepentingan yang sah (keamanan, pencegahan fraud, peningkatan layanan).</li>
              <li>Kewajiban hukum yang berlaku di Indonesia.</li>
            </ul>
          </Card>

          <Card title="4. Penyimpanan & Keamanan">
            <p>
              Data disimpan pada infrastruktur yang menerapkan kontrol akses, enkripsi saat transit,
              dan pembatasan akses operasional. Akses internal mengikuti prinsip least-privilege.
            </p>
            <p>
              {storeName} menerapkan upaya terbaik untuk menjaga keamanan, namun tidak ada sistem yang
              sepenuhnya kebal. Anda disarankan menjaga kerahasiaan kredensial dan mengaktifkan
              mekanisme keamanan yang tersedia.
            </p>
          </Card>

          <Card title="5. Cookie & Teknologi Serupa">
            <p>
              Situs dapat menggunakan cookie/teknologi serupa untuk menjaga sesi login, mengingat
              preferensi, keranjang, dan mengukur kinerja agregat. Anda dapat mengatur preferensi
              cookie melalui pengaturan browser; menonaktifkan cookie tertentu dapat mempengaruhi
              fungsi login dan checkout.
            </p>
          </Card>

          <Card title="6. Hak Pengguna">
            <p>Anda berhak untuk:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Mengakses dan memperbarui data profil serta alamat pada halaman akun.</li>
              <li>Meminta koreksi data yang tidak akurat dan penghapusan data sepanjang tidak bertentangan dengan kewajiban retensi/legal.</li>
              <li>Menolak atau menarik persetujuan untuk pemrosesan tertentu serta membatasi pemrosesan.</li>
              <li>Mengajukan keberatan dan permintaan terkait pemrosesan dengan menghubungi kontak di bawah ini.</li>
            </ul>
            <p>
              Permintaan terkait hak akan diproses dengan verifikasi identitas untuk mencegah
              penyalahgunaan.
            </p>
          </Card>

          <Card title="7. Retensi Data">
            <p>
              Data akun, alamat, dan pesanan disimpan selama akun aktif dan selama diperlukan untuk
              memenuhi kewajiban hukum, perpajakan, penyelesaian sengketa, serta penegakan
              perjanjian. Log teknis disimpan dalam jangka waktu terbatas sesuai kebutuhan operasional
              dan keamanan.
            </p>
            <p>
              Saat periode retensi berakhir atau akun dihapus sesuai ketentuan, data akan dihapus
              atau dianonimkan melalui prosedur yang wajar.
            </p>
          </Card>

          <Card title="8. Berbagi Data dengan Pihak Ketiga">
            <p>Data hanya dibagikan seperlunya kepada:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Penyedia payment gateway terintegrasi untuk verifikasi pembayaran.</li>
              <li>Mitra logistik (Biteship dan kurir terkait) untuk pengiriman dan pelacakan.</li>
              <li>Penyedia infrastruktur/hosting dan pendukung operasional yang terikat perjanjian kerahasiaan.</li>
            </ul>
            <p>Tidak ada penjualan data pribadi kepada pihak ketiga untuk tujuan pemasaran.</p>
          </Card>

          <Card title="9. Kontak & Pengaduan Privasi">
            <p>Pertanyaan, permintaan hak, atau pengaduan terkait privasi dapat menghubungi:</p>
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
            <p className="pt-2 text-slate-500">
              Lihat juga{' '}
              <Link href="/syarat-ketentuan" className="text-[#D96B00] hover:underline font-bold">
                Syarat & Ketentuan
              </Link>{' '}
              dan{' '}
              <Link href="/kebijakan-pengembalian" className="text-[#D96B00] hover:underline font-bold">
                Kebijakan Pengembalian
              </Link>
              .
            </p>
            <p className="pt-1">
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
