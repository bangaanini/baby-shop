import { NextRequest, NextResponse } from 'next/server';
import { orderFilterSchema } from '@/server/validators/order.schema';
import { orderService } from '@/server/services/order.service';

function getSessionOrUserId(request: NextRequest, queryUserId?: string | null): string | undefined {
  if (queryUserId) return queryUserId;
  return (
    request.headers.get('x-user-id') ||
    request.cookies.get('user_id')?.value ||
    undefined
  );
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parseResult = orderFilterSchema.safeParse(searchParams);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Parameter filter pesanan tidak valid',
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { status, q, userId } = parseResult.data;
    const finalUserId = getSessionOrUserId(request, userId);

    const orders = await orderService.getUserOrders(finalUserId, status, q);

    return NextResponse.json({
      success: true,
      data: orders,
      count: orders.length,
    });
  } catch (error: any) {
    console.error('Error in GET /api/orders:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal memuat daftar pesanan',
      },
      { status: 500 }
    );
  }
}
