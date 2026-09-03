import React from 'react';
import { Metadata } from 'next';
import { Navbar, Footer } from '@/components/layout/NavbarFooter';
import { OrderHistoryView } from '@/components/order/OrderHistoryView';

export const metadata: Metadata = {
  title: 'Riwayat Pesanan Saya — BabyKids',
  description: 'Daftar riwayat pesanan, pelacakan posisi paket kurir, dan konfirmasi barang diterima.',
};

export default function OrderHistoryPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 text-slate-800">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <OrderHistoryView />
      </main>
      <Footer />
    </div>
  );
}
