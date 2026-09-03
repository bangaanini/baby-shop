import { NextRequest, NextResponse } from 'next/server';
import { calculateCheckoutSchema } from '@/server/validators/checkout.schema';
import { checkoutService } from '@/server/services/checkout.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const parseResult = calculateCheckoutSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Parameter kalkulasi checkout tidak valid',
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const calculation = await checkoutService.calculateOrder(parseResult.data);

    return NextResponse.json({
      success: true,
      data: calculation,
    });
  } catch (error: any) {
    console.error('Error in POST /api/checkout/calculate:', error);
    const isClientError =
      error.message?.includes('tidak ditemukan') ||
      error.message?.includes('tidak valid') ||
      error.message?.includes('kosong');

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal menghitung ringkasan pesanan',
      },
      { status: isClientError ? 400 : 500 }
    );
  }
}
