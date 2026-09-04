import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/server/services/payment.service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { provider, credentials } = body;

    if (!provider || !['midtrans', 'xendit', 'simulator'].includes(provider)) {
      return NextResponse.json(
        {
          success: false,
          message: "Provider tidak valid. Pilih 'midtrans', 'xendit', atau 'simulator'.",
        },
        { status: 400 }
      );
    }

    const testResult = await paymentService.testGatewayConnection(
      provider,
      credentials
    );

    return NextResponse.json(testResult, {
      status: testResult.success ? 200 : 400,
    });
  } catch (error: any) {
    console.error('[API] Error in test-gateway route:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Gagal menguji koneksi payment gateway',
      },
      { status: 500 }
    );
  }
}
