import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { updateAddressSchema } from '@/server/validators/user.schema';
import { userService } from '@/server/services/user.service';

export const dynamic = 'force-dynamic';

async function resolveUserId(
  request: NextRequest,
  bodyUserId?: string | null
): Promise<string | null> {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (session?.user?.id) {
      return session.user.id;
    }
  } catch (err) {
    console.warn('Could not read session from headers in /api/user/addresses/[id]:', err);
  }

  if (bodyUserId) return bodyUserId;
  const headerUserId = request.headers.get('x-user-id');
  if (headerUserId) return headerUserId;
  const searchUserId = request.nextUrl.searchParams.get('userId');
  if (searchUserId) return searchUserId;
  const cookieUserId = request.cookies.get('user_id')?.value;
  if (cookieUserId) return cookieUserId;

  return null;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: addressId } = await params;
    if (!addressId) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID alamat wajib disertakan',
        },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const parseResult = updateAddressSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Data pembaruan alamat tidak valid',
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const userId = await resolveUserId(request, body.userId);
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Silakan masuk ke akun Anda untuk memperbarui alamat.',
        },
        { status: 401 }
      );
    }
    const updated = await userService.updateAddress(
      addressId,
      userId,
      parseResult.data
    );

    return NextResponse.json({
      success: true,
      message: 'Alamat berhasil diperbarui',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error in PUT /api/user/addresses/[id]:', error);
    const isNotFound = error.message?.includes('tidak ditemukan');
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal memperbarui alamat',
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
    const { id: addressId } = await params;
    if (!addressId) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID alamat wajib disertakan',
        },
        { status: 400 }
      );
    }

    const userId = await resolveUserId(request);
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Silakan masuk ke akun Anda.',
        },
        { status: 401 }
      );
    }
    await userService.deleteAddress(addressId, userId);

    return NextResponse.json({
      success: true,
      message: 'Alamat berhasil dihapus',
    });
  } catch (error: any) {
    console.error('Error in DELETE /api/user/addresses/[id]:', error);
    const isNotFound = error.message?.includes('tidak ditemukan');
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal menghapus alamat',
      },
      { status: isNotFound ? 404 : 500 }
    );
  }
}
