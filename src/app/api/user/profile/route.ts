import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { updateProfileSchema } from '@/server/validators/user.schema';
import { userService } from '@/server/services/user.service';

export const dynamic = 'force-dynamic';

async function resolveUserId(
  request: NextRequest,
  bodyUserId?: string | null
): Promise<string> {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (session?.user?.id) {
      return session.user.id;
    }
  } catch (err) {
    console.warn('Could not read session from headers:', err);
  }

  if (bodyUserId) return bodyUserId;
  const headerUserId = request.headers.get('x-user-id');
  if (headerUserId) return headerUserId;
  const searchUserId = request.nextUrl.searchParams.get('userId');
  if (searchUserId) return searchUserId;
  const cookieUserId = request.cookies.get('user_id')?.value;
  if (cookieUserId) return cookieUserId;

  return 'user_buyer_demo_1';
}

export async function GET(request: NextRequest) {
  try {
    const userId = await resolveUserId(request);
    const profile = await userService.getUserProfile(userId);

    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          error: 'Profil pengguna tidak ditemukan',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error: any) {
    console.error('Error in GET /api/user/profile:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal memuat profil pengguna',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const parseResult = updateProfileSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Input profil tidak valid',
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const userId = await resolveUserId(request, parseResult.data.userId);
    const updatedProfile = await userService.updateUserProfile(
      userId,
      parseResult.data
    );

    return NextResponse.json({
      success: true,
      message: 'Profil berhasil diperbarui',
      data: updatedProfile,
    });
  } catch (error: any) {
    console.error('Error in PATCH /api/user/profile:', error);
    const isNotFound = error.message?.includes('tidak ditemukan');
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal memperbarui profil pengguna',
      },
      { status: isNotFound ? 404 : 500 }
    );
  }
}
