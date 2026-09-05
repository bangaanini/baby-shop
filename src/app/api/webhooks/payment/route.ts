import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/server/services/payment.service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const result = await paymentService.handleWebhookNotification(body, request.headers);
  if (!result.success) return NextResponse.json({ success: false, error: result.message }, { status: 400 });
  return NextResponse.json({ success: true, message: result.message, data: result }, { status: 200 });
}
