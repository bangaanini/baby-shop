import { NextRequest, NextResponse } from 'next/server';
import { addToCartSchema } from '@/server/validators/cart.schema';
import { cartService } from '@/server/services/cart.service';

function getSessionOrUserId(request: NextRequest, bodyUserId?: string): string | undefined {
  if (bodyUserId) return bodyUserId;
  return (
    request.nextUrl.searchParams.get('userId') ||
    request.nextUrl.searchParams.get('cartId') ||
    request.nextUrl.searchParams.get('sessionId') ||
    request.headers.get('x-user-id') ||
    request.headers.get('x-cart-id') ||
    request.headers.get('x-session-id') ||
    request.cookies.get('cart_id')?.value ||
    request.cookies.get('user_id')?.value ||
    undefined
  );
}

export async function GET(request: NextRequest) {
  try {
    const userIdOrSession = getSessionOrUserId(request);
    const cart = await cartService.getCartItems(userIdOrSession);

    const response = NextResponse.json({
      success: true,
      data: cart,
    });

    if (!request.cookies.get('cart_id')?.value && cart.cartId) {
      response.cookies.set('cart_id', cart.cartId, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    return response;
  } catch (error: any) {
    console.error('Error in GET /api/cart:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal memuat isi keranjang',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const parseResult = addToCartSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Input keranjang tidak valid',
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const userIdOrSession = getSessionOrUserId(request, parseResult.data.userIdOrSession);
    const cart = await cartService.addToCart(userIdOrSession, parseResult.data);

    const response = NextResponse.json(
      {
        success: true,
        message: 'Produk berhasil ditambahkan ke keranjang',
        data: cart,
      },
      { status: 201 }
    );

    if (!request.cookies.get('cart_id')?.value && cart.cartId) {
      response.cookies.set('cart_id', cart.cartId, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return response;
  } catch (error: any) {
    console.error('Error in POST /api/cart:', error);
    const isClientError =
      error.message?.includes('tidak ditemukan') ||
      error.message?.includes('tidak mencukupi') ||
      error.message?.includes('melebihi stok');

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal menambahkan produk ke keranjang',
      },
      { status: isClientError ? 400 : 500 }
    );
  }
}
