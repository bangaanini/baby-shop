import React from 'react';
import { Navbar, Footer } from '@/components/layout/NavbarFooter';
import { HeroBanner, CategorySection } from '@/components/home/HeroBanner';
import {
  PopularSection,
  NewArrivalsSection,
  RecommendedSection,
  PromoSection,
} from '@/components/home/HomeSections';
import { productService } from '@/server/services/product.service';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '@/data/mock-products';
import { Product, CategoryItem } from '@/types/product';
import { mapDbProductToProduct, mapDbCategoryToCategoryItem } from '@/lib/mappers';

export const revalidate = 60;

export default async function Home() {
  let products: Product[] = MOCK_PRODUCTS;
  let categories: CategoryItem[] = MOCK_CATEGORIES;

  try {
    const [productsResult, categoriesResult] = await Promise.all([
      productService.getProducts({ limit: 50 }),
      productService.getCategories(),
    ]);

    if (productsResult?.items && productsResult.items.length > 0) {
      products = productsResult.items.map(mapDbProductToProduct);
    }

    if (categoriesResult && categoriesResult.length > 0) {
      categories = categoriesResult.map(mapDbCategoryToCategoryItem);
    }
  } catch (error) {
    console.error('Failed to load products/categories in Home page:', error);
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 text-slate-800">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Hero Banner Promo & Keunggulan */}
        <HeroBanner />

        {/* 3 Kategori Utama */}
        <CategorySection categories={categories} />

        {/* 1. Bagian Promo Hemat Rutin (Flash Sale) */}
        <PromoSection products={products} />

        {/* 2. Bagian Produk Populer */}
        <PopularSection products={products} />

        {/* 3. Bagian Produk Terbaru */}
        <NewArrivalsSection products={products} />

        {/* 4. Bagian Rekomendasi untuk Anak */}
        <RecommendedSection products={products} />
      </main>

      <Footer />
    </div>
  );
}
