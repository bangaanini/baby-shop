import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { Navbar, Footer } from '@/components/layout/NavbarFooter';
import { FlashSaleView } from '@/components/flash-sale/FlashSaleView';
import { productService } from '@/server/services/product.service';
import { paymentService } from '@/server/services/payment.service';
import { mapDbProductToProduct } from '@/lib/mappers';
import { Product } from '@/types/product';

export const revalidate = 30;

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  let settings = null;
  try {
    settings = await paymentService.getStoreSettings();
  } catch {}
  const storeName = settings?.store_name || 'NBusiness';
  const flashSaleTitle = settings?.flash_sale_title || 'Flash Sale Spesial';

  const title = `${flashSaleTitle} — ${storeName}`;
  const description = `Serbu promo ${flashSaleTitle} di ${storeName}. Diskon harga hemat untuk perlengkapan bayi dan pakaian anak terstandar aman SNI!`;

  return {
    title,
    description,
    keywords: ['flash sale perlengkapan bayi', 'promo baju anak', 'diskon mainan edukasi', storeName],
    openGraph: {
      title,
      description,
      url: `${baseUrl}/flash-sale`,
      siteName: storeName,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function FlashSalePage() {
  let products: Product[] = [];
  let settings = null;

  try {
    const [productsResult, fetchedSettings] = await Promise.all([
      productService.getProducts({ isFlashSale: true, limit: 50 }),
      paymentService.getStoreSettings().catch(() => null),
    ]);

    if (productsResult?.items && productsResult.items.length > 0) {
      products = productsResult.items.map(mapDbProductToProduct);
    }
    settings = fetchedSettings;
  } catch (error) {
    console.error('Failed to load flash sale products in page:', error);
  }

  const flashSaleConfig = settings
    ? {
        isActive: settings.flash_sale_is_active,
        title: settings.flash_sale_title,
        endTime: settings.flash_sale_end_time,
      }
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F0] text-slate-800">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Suspense fallback={<div className="py-20 text-center text-slate-400 font-heading font-bold">Memuat flash sale...</div>}>
          <FlashSaleView initialProducts={products} settings={flashSaleConfig} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
