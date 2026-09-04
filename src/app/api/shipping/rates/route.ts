import { NextRequest, NextResponse } from 'next/server';
import { calculateShippingRatesSchema } from '@/server/validators/shipping.schema';
import { shippingService } from '@/server/services/shipping.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const parseResult = calculateShippingRatesSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Parameter kalkulasi tarif pengiriman tidak valid',
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const result = await shippingService.calculateRates(parseResult.data);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Error in POST /api/shipping/rates:', error);
    const isClientError =
      error.message?.includes('tidak ditemukan') ||
      error.message?.includes('tidak valid') ||
      error.message?.includes('kosong');

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal menghitung tarif pengiriman',
      },
      { status: isClientError ? 400 : 500 }
    );
  }
}
