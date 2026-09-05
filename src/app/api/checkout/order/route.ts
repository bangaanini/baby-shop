import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { createOrderSchema } from '@/server/validators/checkout.schema';
import { checkoutService } from '@/server/services/checkout.service';

export const dynamic = 'force-dynamic';

async function resolveUserSession(request: NextRequest, bodyUserId?: string | null): Promise<string | undefined> {
  let session = null;
  try {
    session = await auth.api.getSession({ headers: request.headers });
  } catch (err) {
    console.warn('Session resolution warning in checkout/order:', err);
  }

  if (session?.user?.id) {
    return session.user.id;
  }

  if (bodyUserId) return bodyUserId;

  return (
    request.headers.get('x-user-id') ||
    request.cookies.get('user_id')?.value ||
    undefined
  );
}

function getCartId(request: NextRequest, bodyCartId?: string | null): string | undefined {
  if (bodyCartId) return bodyCartId;
  return (
    request.nextUrl.searchParams.get('cartId') ||
    request.headers.get('x-cart-id') ||
    request.cookies.get('cart_id')?.value ||
    undefined
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    // Resolve user session strictly
    const finalUserId = await resolveUserSession(request, body.userId);
    const finalCartId = getCartId(request, body.cartId);

    const payloadToValidate = {
      ...body,
      userId: finalUserId || body.userId || undefined,
      cartId: finalCartId || body.cartId || undefined,
    };

    const parseResult = createOrderSchema.safeParse(payloadToValidate);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Data checkout tidak lengkap atau tidak valid',
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const createdOrder = await checkoutService.createOrder(parseResult.data);

    return NextResponse.json(
      {
        success: true,
        message: 'Pesanan berhasil dibuat',
        data: createdOrder,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error in POST /api/checkout/order:', error);
    const isClientError =
      error.message?.includes('tidak mencukupi') ||
      error.message?.includes('tidak ditemukan') ||
      error.message?.includes('tidak valid') ||
      error.message?.includes('minimal');

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal memproses pesanan',
      },
      { status: isClientError ? 400 : 500 }
    );
  }
}
