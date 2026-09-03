import React from 'react';
import { Navbar, Footer } from '@/components/layout/NavbarFooter';
import { HeroBanner, CategorySection } from '@/components/home/HeroBanner';
import {
  PopularSection,
  NewArrivalsSection,
  RecommendedSection,
  PromoSection,
} from '@/components/home/HomeSections';
import { MOCK_PRODUCTS } from '@/data/mock-products';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 text-slate-800">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Hero Banner Promo & Keunggulan */}
        <HeroBanner />

        {/* 3 Kategori Utama */}
        <CategorySection />

        {/* 1. Bagian Promo Hemat Rutin (Flash Sale) */}
        <PromoSection products={MOCK_PRODUCTS} />

        {/* 2. Bagian Produk Populer */}
        <PopularSection products={MOCK_PRODUCTS} />

        {/* 3. Bagian Produk Terbaru */}
        <NewArrivalsSection products={MOCK_PRODUCTS} />

        {/* 4. Bagian Rekomendasi untuk Anak */}
        <RecommendedSection products={MOCK_PRODUCTS} />
      </main>

      <Footer />
    </div>
  );
}
