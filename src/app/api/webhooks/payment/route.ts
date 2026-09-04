import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/server/services/payment.service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const headers = request.headers;

    const result = await paymentService.handleWebhookNotification(body, headers);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.message || 'Webhook verification failed',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: result.message || 'Webhook processed successfully',
        data: result,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[API] Error processing payment webhook:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error processing webhook',
      },
      { status: 500 }
    );
  }
}
