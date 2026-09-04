import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth';
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
    console.warn('Could not read session from headers in /api/user/addresses/[id]/primary:', err);
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

export async function PATCH(
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
    const userId = await resolveUserId(request, body.userId);
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Silakan masuk ke akun Anda.',
        },
        { status: 401 }
      );
    }
    const updated = await userService.setPrimaryAddress(addressId, userId);

    return NextResponse.json({
      success: true,
      message: 'Alamat utama berhasil diperbarui',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error in PATCH /api/user/addresses/[id]/primary:', error);
    const isNotFound = error.message?.includes('tidak ditemukan');
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal mengubah status alamat utama',
      },
      { status: isNotFound ? 404 : 500 }
    );
  }
}
