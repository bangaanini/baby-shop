import { NextRequest, NextResponse } from 'next/server';
import { orderService } from '@/server/services/order.service';

export async function POST(
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

    const updatedOrder = await orderService.confirmOrderReceived(id);

    return NextResponse.json({
      success: true,
      message: 'Pesanan telah berhasil dikonfirmasi selesai',
      data: updatedOrder,
    });
  } catch (error: any) {
    console.error('Error in POST /api/orders/[id]/confirm:', error);
    const isNotFound = error.message?.includes('tidak ditemukan');
    const isClientError =
      isNotFound ||
      error.message?.includes('tidak dapat') ||
      error.message?.includes('wajib diisi') ||
      error.message?.includes('dibatalkan');

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal mengonfirmasi penerimaan pesanan',
      },
      { status: isNotFound ? 404 : isClientError ? 400 : 500 }
    );
  }
}
