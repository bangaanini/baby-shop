import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Navbar, Footer } from '@/components/layout/NavbarFooter';
import { CatalogView } from '@/components/catalog/CatalogView';
import { MOCK_CATEGORIES } from '@/data/mock-products';

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = MOCK_CATEGORIES.find((c) => c.slug === slug);
  if (!category) {
    return { title: 'Kategori Tidak Ditemukan — BabyKids' };
  }
  return {
    title: `${category.nama} — BabyKids`,
    description: category.deskripsi,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = MOCK_CATEGORIES.find((c) => c.slug === slug);

  if (!category && slug !== 'semua') {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 text-slate-800">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Suspense fallback={<div className="py-20 text-center text-slate-400">Memuat kategori...</div>}>
          <CatalogView initialCategory={slug} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
