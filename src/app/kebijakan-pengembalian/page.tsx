import type { Metadata } from 'next';
import Link from 'next/link';
import { paymentService } from '@/server/services/payment.service';

export const metadata: Metadata = { title: 'Kebijakan Pengembalian — NBusiness' };

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-3xl border border-[#FFE8D6] shadow-md p-6 sm:p-7">
      <h2 className="font-heading font-bold text-lg text-slate-800 mb-3">{title}</h2>
      <div className="font-body text-[13px] leading-relaxed text-slate-600 space-y-2">{children}</div>
    </section>
  );
}

export default async function KebijakanPengembalianPage() {
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
            Kebijakan Pengembalian
          </h1>
          <p className="mt-2 font-body text-sm text-slate-500">
            Ketentuan pembatalan, retur, dan refund di {storeName}. Terakhir diperbarui: 5 September
            2026.
          </p>
        </div>

        <div className="space-y-5">
          <Card title="1. Belum Dikirim → Refund Penuh">
            <p>
              Pesanan yang berstatus <strong>Belum Dikirim</strong> (belum diserahkan ke kurir) dapat
              dibatalkan dan mendapatkan <strong>refund penuh</strong> ke metode pembayaran asal atau
              mekanisme yang disepakati.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Pembatalan diajukan sebelum paket diproses packing/kurir.</li>
              <li>Jika pembayaran belum terverifikasi, pesanan akan otomatis dibatalkan sesuai batas waktu pembayaran.</li>
            </ul>
          </Card>

          <Card title="2. 7-Hari Retur untuk Cacat / Salah Kirim">
            <p>
              Untuk barang <strong>cacat produksi</strong> atau <strong>salah kirim</strong>, pembeli
              dapat mengajukan retur/penggantian dalam waktu <strong>7 hari kalender</strong> sejak
              paket diterima, dengan syarat:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Wajib menyertakan <strong>foto dan/atau video</strong> yang jelas memperlihatkan
                cacat/kesalahan, termasuk label/packaging bila diminta.
              </li>
              <li>Produk, label, dan kemasan asli masih tersedia (untuk verifikasi).</li>
              <li>Pengajuan dilakukan sebelum batas 7 hari berakhir; lewat batas tidak dapat diproses.</li>
            </ul>
            <p>
              Kasus penukaran ukuran/warna karena preferensi (bukan cacat/salah kirim) dipertimbangkan
              kasuistis dan dapat dikenakan biaya kirim.
            </p>
          </Card>

          <Card title="3. Prosedur Pengajuan">
            <ol className="list-decimal pl-5 space-y-1">
              <li>
                Hubungi CS {storeName} melalui email{' '}
                <a href={`mailto:${storeEmail}`} className="text-[#D96B00] hover:underline font-bold">
                  {storeEmail}
                </a>{' '}
                atau telepon{' '}
                <a href={`tel:${storePhone}`} className="text-[#D96B00] hover:underline font-bold">
                  {storePhone}
                </a>{' '}
                dengan menyertakan: nomor pesanan/invoice, deskripsi masalah, serta foto/video bukti.
              </li>
              <li>CS akan memverifikasi kelayakan retur dan memberikan instruksi pengembalian (alamat/retur kurir).</li>
              <li>
                Kirimkan kembali barang sesuai instruksi. Setelah barang diterima dan diperiksa gudang,
                pengembalian dana atau penggantian barang akan diproses.
              </li>
              <li>Seluruh komunikasi & status dapat dipantau pada halaman akun/pesanan.</li>
            </ol>
          </Card>

          <Card title="4. Estimasi Waktu Pemrosesan">
            <p>
              Setelah retur disetujui dan barang diterima gudang, estimasi pemrosesan
              <strong> 3–7 hari kerja</strong> (di luar hari libur nasional dan operasional kurir)
              untuk refund atau pengiriman pengganti.
            </p>
            <p>
              Lama pencairan ke rekening/e-wallet tujuan dapat berbeda tergantung penyedia pembayaran
              dan bank masing-masing. {storeName} akan menginformasikan update status melalui email atau
              halaman pesanan.
            </p>
          </Card>

          <Card title="5. Pengecualian">
            <p>Retur/refund tidak berlaku untuk:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Produk yang segel/kemasan sudah dibuka tanpa cacat/salah kirim yang terbukti.</li>
              <li>Kerusakan akibat kesalahan penggunaan, penyimpanan, atau modifikasi oleh pembeli.</li>
              <li>Produk higienitas/personal yang sudah dibuka (mis. empeng, botol yang sudah dipakai) kecuali cacat pabrik terbukti.</li>
              <li>Keluhan tanpa bukti foto/video yang memadai atau melewati batas 7 hari.</li>
              <li>Perubahan preferensi (warna/ukuran/model) tanpa alasan cacat/salah kirim — dipertimbangkan kasuistis.</li>
            </ul>
            <p className="text-slate-500">
              {storeName} berhak menolak pengajuan yang tidak memenuhi syarat di atas dengan penjelasan
              tertulis.
            </p>
          </Card>

          <Card title="6. Biaya Pengiriman Retur">
            <p>
              Untuk kasus cacat/salah kirim yang terverifikasi, biaya retur ditanggung {storeName}
              sesuai instruksi CS. Untuk kasus di luar cacat/salah kirim, biaya kirim bolak-balik
              ditanggung pembeli.
            </p>
          </Card>

          <Card title="7. Kontak">
            <p>Pertanyaan lebih lanjut terkait retur dan refund:</p>
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
              Lihat juga{' '}
              <Link href="/syarat-ketentuan" className="text-[#D96B00] hover:underline font-bold">
                Syarat & Ketentuan
              </Link>{' '}
              dan{' '}
              <Link href="/kebijakan-privasi" className="text-[#D96B00] hover:underline font-bold">
                Kebijakan Privasi
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
