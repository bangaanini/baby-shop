import { NextRequest, NextResponse } from 'next/server';
import { createOrderSchema } from '@/server/validators/checkout.schema';
import { checkoutService } from '@/server/services/checkout.service';

function getSessionOrUserId(request: NextRequest, bodyUserId?: string | null): string | undefined {
  if (bodyUserId) return bodyUserId;
  return (
    request.nextUrl.searchParams.get('userId') ||
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

    // If userId or cartId is not in body, try to extract from headers/cookies
    const finalUserId = getSessionOrUserId(request, body.userId);
    const finalCartId = getCartId(request, body.cartId);

    const payloadToValidate = {
      ...body,
      userId: body.userId || finalUserId,
      cartId: body.cartId || finalCartId,
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
