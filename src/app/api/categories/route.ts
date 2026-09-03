import { NextResponse } from 'next/server';
import { productService } from '@/server/services/product.service';

export async function GET() {
  try {
    const categories = await productService.getCategories();
    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal memuat kategori produk',
      },
      { status: 500 }
    );
  }
}
