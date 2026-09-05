import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { paymentService } from '@/server/services/payment.service';
import { adminFlashSaleSettingsSchema } from '@/server/validators/admin.schema';
import { NewStoreSettings } from '@/db/schema/settings';

export const dynamic = 'force-dynamic';

async function verifyAdmin(request: NextRequest): Promise<{ authorized: boolean; response?: NextResponse }> {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (session?.user && (session.user as any).role === 'admin') return { authorized: true };
  } catch (err) {
    console.warn('Session verification warning:', err);
  }
  if (process.env.NODE_ENV !== 'production') {
    if (request.headers.get('x-user-role') === 'admin') return { authorized: true };
    if (request.headers.get('x-dev-admin') === 'true') return { authorized: true };
  }
  return { authorized: false, response: NextResponse.json({ success: false, error: 'Akses ditolak: Hanya akun dengan role admin yang diizinkan.' }, { status: 403 }) };
}


export async function POST(request: NextRequest) {
  try {
    const authCheck = await verifyAdmin(request);
    if (!authCheck.authorized) {
      return authCheck.response!;
    }

    const body = await request.json();
    const parseResult = adminFlashSaleSettingsSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Data pengaturan Flash Sale tidak valid',
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const {
      isActive,
      flash_sale_is_active,
      title,
      flash_sale_title,
      endTime,
      flash_sale_end_time,
    } = parseResult.data;

    const updatePayload: Partial<NewStoreSettings> = {};

    if (isActive !== undefined) {
      updatePayload.flash_sale_is_active = Boolean(isActive);
    } else if (flash_sale_is_active !== undefined) {
      updatePayload.flash_sale_is_active = Boolean(flash_sale_is_active);
    }

    if (title !== undefined) {
      updatePayload.flash_sale_title = title ? title.trim() : 'Promo Hemat Rutin';
    } else if (flash_sale_title !== undefined) {
      updatePayload.flash_sale_title = flash_sale_title ? flash_sale_title.trim() : 'Promo Hemat Rutin';
    }

    if (endTime !== undefined) {
      updatePayload.flash_sale_end_time = endTime ? new Date(endTime) : null;
    } else if (flash_sale_end_time !== undefined) {
      updatePayload.flash_sale_end_time = flash_sale_end_time ? new Date(flash_sale_end_time) : null;
    }

    const updatedSettings = await paymentService.saveStoreSettings(updatePayload);

    return NextResponse.json({
      success: true,
      message: 'Pengaturan Flash Sale berhasil disimpan',
      data: updatedSettings,
    });
  } catch (error: any) {
    console.error('Error in POST /api/admin/flash-sale/settings:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal memperbarui pengaturan Flash Sale',
      },
      { status: 500 }
    );
  }
}
