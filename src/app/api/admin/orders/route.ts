import { NextRequest, NextResponse } from 'next/server';
import { adminOrderFilterSchema, updateOrderStatusSchema } from '@/server/validators/admin.schema';
import { adminService } from '@/server/services/admin.service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parseResult = adminOrderFilterSchema.safeParse(searchParams);

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

    const result = await adminService.getAllOrders(parseResult.data);

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
    console.error('Error in GET /api/admin/orders:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal memuat daftar pesanan admin',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    const orderId = body.orderId || body.id;
    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID pesanan (orderId) wajib disertakan',
        },
        { status: 400 }
      );
    }

    const parseResult = updateOrderStatusSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Data pembaruan status pesanan tidak valid',
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { status, trackingNumber, notes } = parseResult.data;
    const updatedOrder = await adminService.updateOrderStatus(
      orderId,
      status,
      trackingNumber,
      notes
    );

    return NextResponse.json({
      success: true,
      message: `Status pesanan berhasil diperbarui menjadi "${status}"`,
      data: updatedOrder,
    });
  } catch (error: any) {
    console.error('Error in PATCH /api/admin/orders:', error);
    const isNotFound = error.message?.includes('tidak ditemukan');
    const isClientError =
      isNotFound ||
      error.message?.includes('wajib diisi') ||
      error.message?.includes('tidak valid');

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal memperbarui status pesanan',
      },
      { status: isNotFound ? 404 : isClientError ? 400 : 500 }
    );
  }
}
