import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Navbar, Footer } from '@/components/layout/NavbarFooter';
import { ProductDetailView } from '@/components/product/ProductDetailView';
import { productService } from '@/server/services/product.service';
import { paymentService } from '@/server/services/payment.service';
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
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  let settings = null;
  try {
    settings = await paymentService.getStoreSettings();
  } catch {}
  const storeName = settings?.store_name || 'NBusiness';

  try {
    const dbProduct = await productService.getProductBySlug(slug);
    if (dbProduct) {
      const product = mapDbProductToProduct(dbProduct);
      const isFlash = Boolean(product.isFlashSale && product.hargaFlashSale);
      const activePrice = isFlash ? product.hargaFlashSale! : product.harga;

      return {
        title: `${product.nama} — ${storeName}`,
        description:
          product.deskripsi?.slice(0, 160) ||
          `Beli ${product.nama} berkualitas terstandar SNI hanya di ${storeName}. Pengiriman cepat dan aman ke seluruh Indonesia.`,
        keywords: [
          product.nama,
          product.kategoriLabel,
          'perlengkapan anak',
          'baju anak',
          'mainan SNI',
          storeName,
        ],
        openGraph: {
          title: `${product.nama} — ${storeName}`,
          description: product.deskripsi || `Beli ${product.nama} dengan harga terbaik di ${storeName}.`,
          url: `${baseUrl}/produk/${product.slug}`,
          siteName: storeName,
          type: 'website',
          images: product.gambar
            ? [
                {
                  url: product.gambar,
                  width: 800,
                  height: 800,
                  alt: product.nama,
                },
              ]
            : [],
        },
        twitter: {
          card: 'summary_large_image',
          title: `${product.nama} — ${storeName}`,
          description: product.deskripsi || `Beli ${product.nama} di ${storeName}.`,
          images: product.gambar ? [product.gambar] : undefined,
        },
      };
    }
  } catch (error) {
    console.error('Failed to generate metadata from DB:', error);
  }

  // Fallback to mock product
  const mockProduct = MOCK_PRODUCTS.find((p) => p.slug === slug);
  if (!mockProduct) {
    return { title: `Produk Tidak Ditemukan — ${storeName}` };
  }

  return {
    title: `${mockProduct.nama} — ${storeName}`,
    description: mockProduct.deskripsi,
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
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

  if (relatedProducts.length === 0) {
    relatedProducts = MOCK_PRODUCTS.filter(
      (p) => p.kategori === product?.kategori && p.id !== product?.id
    ).slice(0, 4);
  }

  const isFlash = Boolean(product.isFlashSale && product.hargaFlashSale);
  const activePrice = isFlash ? product.hargaFlashSale! : product.harga;

  // Schema.org Product Structured Data for Marketplace Google Rich Snippets
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.nama,
    image: product.gambar ? [product.gambar] : [],
    description: product.deskripsi || product.nama,
    sku: product.id || product.slug,
    brand: {
      '@type': 'Brand',
      name: 'NBusiness',
    },
    offers: {
      '@type': 'Offer',
      url: `${baseUrl}/produk/${product.slug}`,
      priceCurrency: 'IDR',
      price: activePrice,
      priceValidUntil: '2027-12-31',
      availability:
        product.stok > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating || 5.0,
      reviewCount: Math.max(1, product.reviewCount || 10),
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F0] text-slate-800">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
      </head>
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <ProductDetailView product={product} relatedProducts={relatedProducts} />
      </main>
      <Footer />
    </div>
  );
}
