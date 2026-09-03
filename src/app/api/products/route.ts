import { NextRequest, NextResponse } from 'next/server';
import { productFilterSchema } from '@/server/validators/product.schema';
import { productService } from '@/server/services/product.service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parseResult = productFilterSchema.safeParse(searchParams);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Parameter query tidak valid',
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const result = await productService.getProducts(parseResult.data);

    return NextResponse.json({
      success: true,
      data: result.items,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  } catch (error: any) {
    console.error('Error in GET /api/products:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal memuat daftar produk',
      },
      { status: 500 }
    );
  }
}
