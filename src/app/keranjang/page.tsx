import React from 'react';
import { Metadata } from 'next';
import { Navbar, Footer } from '@/components/layout/NavbarFooter';
import { CartView } from '@/components/checkout/CartView';

export const metadata: Metadata = {
  title: 'Keranjang Belanja — NBusiness',
  description: 'Daftar belanja perlengkapan, pakaian anak, dan mainan.',
};

export default function CartPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 text-slate-800">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <CartView />
      </main>
      <Footer />
    </div>
  );
}
