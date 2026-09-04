import { NextResponse } from 'next/server';
import { paymentService } from '@/server/services/payment.service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await paymentService.getStoreSettings();
    const methods = await paymentService.getAvailablePaymentMethods();

    return NextResponse.json({
      success: true,
      data: {
        activeGateway: settings.active_payment_gateway || 'midtrans',
        methods,
      },
    });
  } catch (error: any) {
    console.error('[API] Error in GET /api/payment/methods:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal memuat daftar metode pembayaran',
      },
      { status: 500 }
    );
  }
}
