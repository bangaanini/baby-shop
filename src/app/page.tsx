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
import { paymentService } from '@/server/services/payment.service';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '@/data/mock-products';
import { Product, CategoryItem } from '@/types/product';
import { mapDbProductToProduct, mapDbCategoryToCategoryItem } from '@/lib/mappers';

export const revalidate = 60;

export default async function Home() {
  let products: Product[] = MOCK_PRODUCTS;
  let categories: CategoryItem[] = MOCK_CATEGORIES;
  let storeSettings = null;

  try {
    const [productsResult, categoriesResult, fetchedSettings] = await Promise.all([
      productService.getProducts({ limit: 50 }),
      productService.getCategories(),
      paymentService.getStoreSettings().catch((err) => {
        console.error('Failed to load store settings:', err);
        return null;
      }),
    ]);

    if (productsResult?.items && productsResult.items.length > 0) {
      products = productsResult.items.map(mapDbProductToProduct);
    }

    if (categoriesResult && categoriesResult.length > 0) {
      categories = categoriesResult.map(mapDbCategoryToCategoryItem);
    }

    if (fetchedSettings) {
      storeSettings = fetchedSettings;
    }
  } catch (error) {
    console.error('Failed to load products/categories in Home page:', error);
  }

  // Filter flash sale products or fallback to promo products
  const flashSaleProducts = products.filter((p) => p.isFlashSale);
  const promoProducts =
    flashSaleProducts.length > 0
      ? flashSaleProducts
      : products.filter((p) => p.isPromo);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 text-slate-800">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Hero Banner Promo & Keunggulan */}
        <HeroBanner />

        {/* 3 Kategori Utama */}
        <CategorySection categories={categories} />

        {/* 1. Bagian Promo Hemat Rutin (Flash Sale) */}
        <PromoSection
          products={promoProducts}
          flashSaleSettings={
            storeSettings
              ? {
                  isActive: storeSettings.flash_sale_is_active,
                  title: storeSettings.flash_sale_title,
                  endTime: storeSettings.flash_sale_end_time,
                }
              : undefined
          }
        />

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
