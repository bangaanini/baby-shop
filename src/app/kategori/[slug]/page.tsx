import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Navbar, Footer } from '@/components/layout/NavbarFooter';
import { CatalogView } from '@/components/catalog/CatalogView';
import { productService } from '@/server/services/product.service';
import { paymentService } from '@/server/services/payment.service';
import { MOCK_CATEGORIES } from '@/data/mock-products';

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  let settings = null;
  try {
    settings = await paymentService.getStoreSettings();
  } catch {}
  const storeName = settings?.store_name || 'NBusiness';

  let category = null;
  try {
    const categories = await productService.getCategories();
    category = categories.find((c: any) => c.slug === slug);
  } catch {}

  if (!category) {
    category = MOCK_CATEGORIES.find((c) => c.slug === slug);
  }

  if (!category) {
    return { title: `Kategori Tidak Ditemukan — ${storeName}` };
  }

  const catName = (category as any).name || (category as any).nama || 'Kategori Produk';
  const catDesc = (category as any).description || (category as any).deskripsi || `Koleksi ${catName} pilihan terbaik di ${storeName}.`;

  return {
    title: `${catName} — ${storeName}`,
    description: catDesc,
    openGraph: {
      title: `${catName} — ${storeName}`,
      description: catDesc,
      url: `${baseUrl}/kategori/${slug}`,
      siteName: storeName,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${catName} — ${storeName}`,
      description: catDesc,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  let category = null;

  try {
    const categories = await productService.getCategories();
    category = categories.find((c: any) => c.slug === slug);
  } catch {}

  if (!category) {
    category = MOCK_CATEGORIES.find((c) => c.slug === slug);
  }

  if (!category && slug !== 'semua') {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F0] text-slate-800">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Suspense fallback={<div className="py-20 text-center text-slate-400 font-heading font-bold">Memuat kategori...</div>}>
          <CatalogView initialCategory={slug} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
