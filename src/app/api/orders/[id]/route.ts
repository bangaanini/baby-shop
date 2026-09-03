import { NextRequest, NextResponse } from 'next/server';
import { orderService } from '@/server/services/order.service';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || !id.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID pesanan atau nomor invoice wajib disertakan',
        },
        { status: 400 }
      );
    }

    const order = await orderService.getOrderByIdOrInvoice(id);

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: `Pesanan "${id}" tidak ditemukan`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    console.error('Error in GET /api/orders/[id]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal memuat detail pesanan',
      },
      { status: 500 }
    );
  }
}
