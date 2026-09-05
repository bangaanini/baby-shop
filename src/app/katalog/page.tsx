import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { Navbar, Footer } from '@/components/layout/NavbarFooter';
import { CatalogView } from '@/components/catalog/CatalogView';
import { paymentService } from '@/server/services/payment.service';

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  let settings = null;
  try {
    settings = await paymentService.getStoreSettings();
  } catch {}
  const storeName = settings?.store_name || 'NBusiness';

  const title = `Katalog Perlengkapan Bayi & Anak — ${storeName}`;
  const description = `Jelajahi seluruh katalog produk pakaian anak, perlengkapan bayi, dan mainan edukasi terstandar aman SNI dengan harga terjangkau di ${storeName}.`;

  return {
    title,
    description,
    keywords: ['katalog perlengkapan bayi', 'baju anak murah', 'mainan edukasi', storeName],
    openGraph: {
      title,
      description,
      url: `${baseUrl}/katalog`,
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

export default function CatalogPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F0] text-slate-800">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Suspense fallback={<div className="py-20 text-center text-slate-400 font-heading font-bold">Memuat katalog...</div>}>
          <CatalogView />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
