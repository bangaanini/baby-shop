import React from 'react';
import { Metadata } from 'next';
import { Navbar, Footer } from '@/components/layout/NavbarFooter';
import { RegisterForm } from '@/components/auth/RegisterForm';
import {
  PackageCheck,
  MapPin,
  TicketPercent,
  Sparkles,
  ShieldCheck,
  Truck,
  Heart,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Daftar Akun Baru — NBusiness Store',
  description: 'Daftar akun NBusiness untuk kemudahan pelacakan pesanan, voucher member eksklusif, dan simpan alamat pengiriman tanpa batas.',
};

export default function RegisterPage() {
  const benefits = [
    {
      icon: <PackageCheck className="w-5 h-5 text-rose-500" />,
      title: 'Pelacakan Pesanan Real-Time',
      desc: 'Pantau posisi kurir dan status pesanan kebutuhan si kecil setiap saat.',
    },
    {
      icon: <TicketPercent className="w-5 h-5 text-amber-500" />,
      title: 'Voucher Member & Cashback',
      desc: 'Dapatkan kupon diskon spesial dan gratis ongkir khusus akun terdaftar.',
    },
    {
      icon: <MapPin className="w-5 h-5 text-emerald-500" />,
      title: 'Buku Alamat Tersimpan',
      desc: 'Simpan alamat rumah, mertua, atau penitipan anak untuk checkout super cepat.',
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-sky-500" />,
      title: 'Jaminan 100% Produk Aman',
      desc: 'Garansi produk ber-SNI, BPA-free, dan jaminan retur mudah bila tidak sesuai.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-rose-50/40 via-white to-rose-50/30 text-slate-800">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left / Benefits Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-100/80 text-rose-700 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                <span>Keuntungan Member NBusiness</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-800 leading-tight">
                Belanja Praktis & Nyaman untuk Si Buah Hati
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Nikmati berbagai kemudahan dan promo eksklusif dengan menjadi bagian dari keluarga besar NBusiness Store.
              </p>
            </div>

            {/* Benefit Items */}
            <div className="space-y-3.5">
              {benefits.map((b, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-white/90 border border-rose-100/80 shadow-2xs flex items-start gap-3.5 transition-transform hover:scale-[1.01]"
                >
                  <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
                    {b.icon}
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-800">{b.title}</h3>
                    <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-normal">
                      {b.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust badge */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white flex items-center gap-3 shadow-md shadow-rose-500/20">
              <Heart className="w-6 h-6 text-white shrink-0 fill-white" />
              <div className="text-xs">
                <p className="font-bold">Lebih dari 50.000+ Orang Tua Mempercayai Kami</p>
                <p className="text-rose-100 text-[11px]">Layanan ramah, pengiriman aman, dan garansi keaslian.</p>
              </div>
            </div>
          </div>

          {/* Right / Register Form Column */}
          <div className="lg:col-span-7 flex justify-center">
            <RegisterForm />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
