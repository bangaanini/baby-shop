import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Navbar, Footer } from '@/components/layout/NavbarFooter';
import { ProductDetailView } from '@/components/product/ProductDetailView';
import { productService } from '@/server/services/product.service';
import { mapDbProductToProduct } from '@/lib/mappers';
import { MOCK_PRODUCTS } from '@/data/mock-products';
import { Product } from '@/types/product';

interface ProductDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const dbProduct = await productService.getProductBySlug(slug);
    if (dbProduct) {
      const product = mapDbProductToProduct(dbProduct);
      return {
        title: `${product.nama} — BabyKids`,
        description: product.deskripsi || `Beli ${product.nama} berkualitas hanya di BabyKids.`,
        openGraph: {
          title: `${product.nama} — BabyKids`,
          description: product.deskripsi || `Beli ${product.nama} berkualitas hanya di BabyKids.`,
          images: product.gambar ? [{ url: product.gambar }] : [],
        },
      };
    }
  } catch (error) {
    console.error('Failed to generate metadata from DB:', error);
  }

  // Fallback to mock product
  const mockProduct = MOCK_PRODUCTS.find((p) => p.slug === slug);
  if (!mockProduct) {
    return { title: 'Produk Tidak Ditemukan — BabyKids' };
  }

  return {
    title: `${mockProduct.nama} — BabyKids`,
    description: mockProduct.deskripsi,
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  let product: Product | null = null;
  let relatedProducts: Product[] = [];

  try {
    const dbProduct = await productService.getProductBySlug(slug);

    if (dbProduct) {
      product = mapDbProductToProduct(dbProduct);

      const dbRelated = await productService.getRelatedProducts(
        dbProduct.category_id,
        dbProduct.id,
        4
      );

      if (dbRelated && dbRelated.length > 0) {
        relatedProducts = dbRelated.map(mapDbProductToProduct);
      }
    }
  } catch (error) {
    console.error('Failed to fetch product from DB in ProductDetailPage:', error);
  }

  // Fallback to mock products if not found in DB
  if (!product) {
    const mockProduct = MOCK_PRODUCTS.find((p) => p.slug === slug);
    if (mockProduct) {
      product = mockProduct;
      relatedProducts = MOCK_PRODUCTS.filter(
        (p) => p.kategori === mockProduct.kategori && p.id !== mockProduct.id
      ).slice(0, 4);
    }
  }

  if (!product) {
    notFound();
  }

  // If relatedProducts is still empty, try fallback
  if (relatedProducts.length === 0) {
    relatedProducts = MOCK_PRODUCTS.filter(
      (p) => p.kategori === product?.kategori && p.id !== product?.id
    ).slice(0, 4);
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 text-slate-800">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <ProductDetailView product={product} relatedProducts={relatedProducts} />
      </main>
      <Footer />
    </div>
  );
}
