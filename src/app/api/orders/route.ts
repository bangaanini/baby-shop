import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { orderFilterSchema } from '@/server/validators/order.schema';
import { orderService } from '@/server/services/order.service';

export const dynamic = 'force-dynamic';

async function resolveRequester(request: NextRequest, queryUserId?: string | null) {
  let session = null;
  try {
    session = await auth.api.getSession({ headers: request.headers });
  } catch (err) {
    console.warn('Could not read session in /api/orders:', err);
  }

  const currentUserId = session?.user?.id;
  const userRole = (session?.user as any)?.role;

  // If query specifies userId, allow it if admin or if matching current user
  if (queryUserId) {
    if (userRole === 'admin' || queryUserId === currentUserId) {
      return { targetUserId: queryUserId, isAuthenticated: true };
    }
  }

  if (currentUserId) {
    return { targetUserId: currentUserId, isAuthenticated: true };
  }

  // Fallback to explicit header/cookie if any
  const fallbackId =
    request.headers.get('x-user-id') ||
    request.cookies.get('user_id')?.value;

  if (fallbackId) {
    return { targetUserId: fallbackId, isAuthenticated: true };
  }

  return { targetUserId: null, isAuthenticated: false };
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
    const { targetUserId, isAuthenticated } = await resolveRequester(request, userId);

    // If unauthenticated guest without a specific valid target user, return empty orders list
    if (!isAuthenticated || !targetUserId) {
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
      });
    }

    const orders = await orderService.getUserOrders(targetUserId, status, q);

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
