import { NextRequest, NextResponse } from 'next/server';
import { shippingService } from '@/server/services/shipping.service';
import { orderService } from '@/server/services/order.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    let waybill = searchParams.get('waybill') || searchParams.get('resi');
    let courier = searchParams.get('courier') || searchParams.get('kurir');

    // Jika membawa orderId, ambil data nomor resi & kurir dari database pesanan
    if (orderId && (!waybill || !courier)) {
      const order = await orderService.getOrderByIdOrInvoice(orderId);
      if (order) {
        if (!waybill && order.nomorResi) {
          waybill = order.nomorResi;
        }
        if (!courier && order.kurir) {
          courier = order.kurir;
        }
      }
    }

    if (!waybill || !waybill.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Nomor resi (waybill) wajib disertakan untuk melacak kiriman',
        },
        { status: 400 }
      );
    }

    const trackingData = await shippingService.getLiveTracking(
      waybill,
      courier || 'sicepat'
    );

    return NextResponse.json({
      success: true,
      data: trackingData,
    });
  } catch (error: any) {
    console.error('Error in GET /api/shipping/tracking:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal melacak nomor resi',
      },
      { status: 500 }
    );
  }
}
