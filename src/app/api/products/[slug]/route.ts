import { NextRequest, NextResponse } from 'next/server';
import { productService } from '@/server/services/product.service';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          error: 'Slug produk wajib disertakan',
        },
        { status: 400 }
      );
    }

    const product = await productService.getProductBySlug(slug);

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: 'Produk tidak ditemukan',
        },
        { status: 404 }
      );
    }

    const relatedProducts = await productService.getRelatedProducts(
      product.category_id,
      product.id,
      4
    );

    return NextResponse.json({
      success: true,
      data: {
        ...product,
        relatedProducts,
      },
    });
  } catch (error: any) {
    console.error('Error in GET /api/products/[slug]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal memuat detail produk',
      },
      { status: 500 }
    );
  }
}
