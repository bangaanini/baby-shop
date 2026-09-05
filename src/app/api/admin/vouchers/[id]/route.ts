import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { voucherService } from '@/server/services/voucher.service';
import { updateVoucherSchema } from '@/server/validators/voucher.schema';

export const dynamic = 'force-dynamic';

async function verifyAdmin(request: NextRequest): Promise<{ authorized: boolean; response?: NextResponse }> {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (session?.user && (session.user as any).role === 'admin') {
      return { authorized: true };
    }
  } catch (err) {
    console.warn('Session verification warning in admin vouchers [id] route:', err);
  }

  // Non-production development bypass/headers
  if (process.env.NODE_ENV !== 'production') {
    const roleHeader = request.headers.get('x-user-role');
    if (roleHeader === 'admin') {
      return { authorized: true };
    }
    const devBypass = request.headers.get('x-dev-admin');
    if (devBypass === 'true') {
      return { authorized: true };
    }
  }

  return {
    authorized: false,
    response: NextResponse.json(
      {
        success: false,
        error: 'Akses ditolak: Hanya akun dengan role admin yang diizinkan.',
      },
      { status: 403 }
    ),
  };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCheck = await verifyAdmin(request);
    if (!authCheck.authorized) {
      return authCheck.response!;
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID voucher tidak valid',
        },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const parseResult = updateVoucherSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Data pembaruan voucher tidak valid',
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    // If code is being updated, check uniqueness
    if (parseResult.data.code) {
      const existing = await voucherService.getVoucherByCode(parseResult.data.code);
      if (existing && existing.id !== id) {
        return NextResponse.json(
          {
            success: false,
            error: `Kode voucher "${parseResult.data.code}" sudah digunakan voucher lain`,
          },
          { status: 400 }
        );
      }
    }

    const updatedVoucher = await voucherService.updateVoucher(id, parseResult.data);

    return NextResponse.json({
      success: true,
      message: 'Voucher berhasil diperbarui',
      data: updatedVoucher,
    });
  } catch (error: any) {
    console.error('Error in PATCH /api/admin/vouchers/[id]:', error);
    const isNotFound = error.message?.includes('tidak ditemukan');

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal memperbarui voucher',
      },
      { status: isNotFound ? 404 : 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCheck = await verifyAdmin(request);
    if (!authCheck.authorized) {
      return authCheck.response!;
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID voucher tidak valid',
        },
        { status: 400 }
      );
    }

    await voucherService.deleteVoucher(id);

    return NextResponse.json({
      success: true,
      message: 'Voucher berhasil dihapus',
    });
  } catch (error: any) {
    console.error('Error in DELETE /api/admin/vouchers/[id]:', error);
    const isNotFound = error.message?.includes('tidak ditemukan');

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal menghapus voucher',
      },
      { status: isNotFound ? 404 : 500 }
    );
  }
}
