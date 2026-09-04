import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { Navbar, Footer } from '@/components/layout/NavbarFooter';
import { UserProfileView } from '@/components/user/UserProfileView';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Riwayat Pesanan Saya — NBusiness',
  description: 'Daftar riwayat pesanan, pelacakan posisi paket kurir, dan konfirmasi barang diterima.',
};

function OrdersLoadingFallback() {
  return (
    <div className="py-12 flex flex-col items-center justify-center min-h-[400px]">
      <Loader2 className="w-8 h-8 text-rose-500 animate-spin mb-3" />
      <p className="text-xs text-slate-500 font-medium">Memuat riwayat transaksi pesanan Anda...</p>
    </div>
  );
}

export default function OrderHistoryPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 text-slate-800">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Suspense fallback={<OrdersLoadingFallback />}>
          <UserProfileView initialTab="transaksi" />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
