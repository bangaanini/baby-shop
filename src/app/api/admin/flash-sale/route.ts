import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { productsTable } from '@/db/schema';
import { auth } from '@/server/auth';
import { asc } from 'drizzle-orm';
import { productService } from '@/server/services/product.service';
import { paymentService } from '@/server/services/payment.service';
import { adminFlashSaleProductSchema } from '@/server/validators/admin.schema';

export const dynamic = 'force-dynamic';

async function verifyAdmin(request: NextRequest): Promise<{ authorized: boolean; response?: NextResponse }> {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (session?.user && (session.user as any).role === 'admin') return { authorized: true };
  } catch (err) {
    console.warn('Session verification warning:', err);
  }
  if (process.env.NODE_ENV !== 'production') {
    if (request.headers.get('x-user-role') === 'admin') return { authorized: true };
    if (request.headers.get('x-dev-admin') === 'true') return { authorized: true };
  }
  return { authorized: false, response: NextResponse.json({ success: false, error: 'Akses ditolak: Hanya akun dengan role admin yang diizinkan.' }, { status: 403 }) };
}


export async function GET(request: NextRequest) {
  try {
    const authCheck = await verifyAdmin(request);
    if (!authCheck.authorized) {
      return authCheck.response!;
    }

    const [settings, flashSaleProducts, allProducts] = await Promise.all([
      paymentService.getStoreSettings(),
      productService.getFlashSaleProducts(),
      db.query.productsTable.findMany({
        orderBy: [asc(productsTable.name)],
        with: {
          category: true,
          variants: true,
          images: {
            orderBy: (images, { asc }) => [asc(images.sort_order)],
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        settings,
        flashSaleProducts,
        allProducts,
      },
    });
  } catch (error: any) {
    console.error('Error in GET /api/admin/flash-sale:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal memuat data Flash Sale',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authCheck = await verifyAdmin(request);
    if (!authCheck.authorized) {
      return authCheck.response!;
    }

    const body = await request.json();
    const parseResult = adminFlashSaleProductSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Data Flash Sale produk tidak valid',
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { productId, isFlashSale, flashSalePrice } = parseResult.data;

    const updatedProduct = await productService.updateProductFlashSale(
      productId,
      isFlashSale,
      flashSalePrice
    );

    return NextResponse.json({
      success: true,
      message: isFlashSale
        ? 'Produk berhasil dimasukkan ke daftar Flash Sale'
        : 'Produk berhasil dikeluarkan dari Flash Sale',
      data: updatedProduct,
    });
  } catch (error: any) {
    console.error('Error in POST /api/admin/flash-sale:', error);
    const isNotFound = error.message?.includes('tidak ditemukan');
    const isClientError =
      error.message?.includes('wajib diisi') ||
      error.message?.includes('tidak valid');

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal memperbarui status Flash Sale produk',
      },
      { status: isNotFound ? 404 : isClientError ? 400 : 500 }
    );
  }
}
