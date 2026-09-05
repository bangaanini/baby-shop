import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { addToCartSchema } from '@/server/validators/cart.schema';
import { cartService } from '@/server/services/cart.service';

export const dynamic = 'force-dynamic';

async function resolveCartIdentity(request: NextRequest, bodyUserId?: string) {
  let session = null;
  try {
    session = await auth.api.getSession({ headers: request.headers });
  } catch (err) {
    console.warn('Session resolution error in /api/cart:', err);
  }

  const sessionUserId = session?.user?.id;
  const headerUserId = request.headers.get('x-user-id');
  const cookieUserId = request.cookies.get('user_id')?.value;

  const resolvedUserId = sessionUserId || bodyUserId || headerUserId || cookieUserId || null;

  const guestCartId =
    request.cookies.get('cart_id')?.value ||
    request.headers.get('x-cart-id') ||
    request.nextUrl.searchParams.get('cartId') ||
    null;

  return {
    userId: resolvedUserId,
    guestCartId,
    isAuthenticated: Boolean(sessionUserId || bodyUserId),
  };
}

export async function GET(request: NextRequest) {
  try {
    const { userId, guestCartId } = await resolveCartIdentity(request);
    const cart = await cartService.getCartItems(userId, guestCartId);

    const response = NextResponse.json({
      success: true,
      data: cart,
    });

    // Ensure cookie matches the active cart
    if (cart.cartId) {
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

    const { userId, guestCartId } = await resolveCartIdentity(
      request,
      parseResult.data.userIdOrSession
    );
    const cart = await cartService.addToCart(userId, guestCartId, parseResult.data);

    const response = NextResponse.json(
      {
        success: true,
        message: 'Produk berhasil ditambahkan ke keranjang',
        data: cart,
      },
      { status: 201 }
    );

    if (cart.cartId) {
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
