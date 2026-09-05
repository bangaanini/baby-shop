import { NextRequest, NextResponse } from 'next/server';
import { voucherService } from '@/server/services/voucher.service';
import { validateVoucherInputSchema } from '@/server/validators/voucher.schema';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parseResult = validateVoucherInputSchema.safeParse(searchParams);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Parameter validasi voucher tidak valid',
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { code, subtotal, shippingCost } = parseResult.data;
    const result = await voucherService.validateVoucher(code, subtotal, shippingCost);

    return NextResponse.json({
      success: true,
      data: {
        isValid: result.isValid,
        discountAmount: result.discountAmount,
        message: result.message,
        discountType: result.discountType,
        code: result.code,
      },
    });
  } catch (error: any) {
    console.error('Error in GET /api/vouchers/validate:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Terjadi kesalahan saat memvalidasi voucher',
      },
      { status: 500 }
    );
  }
}
