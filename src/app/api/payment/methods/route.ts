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
        clientKey: settings.midtrans_client_key || process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || null,
        isProduction: settings.midtrans_is_production ?? false,
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
