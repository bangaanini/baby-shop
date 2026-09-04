import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { Navbar, Footer } from '@/components/layout/NavbarFooter';
import { CatalogView } from '@/components/catalog/CatalogView';

export const metadata: Metadata = {
  title: 'Katalog Produk Kebutuhan Anak — NBusiness',
  description: 'Cari dan saring aneka perlengkapan bayi, pakaian anak, dan mainan edukatif dengan harga terbaik.',
};

export default function CatalogPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 text-slate-800">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Suspense fallback={<div className="py-20 text-center text-slate-400">Memuat katalog...</div>}>
          <CatalogView />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
