import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { changePasswordSchema } from '@/server/validators/user.schema';
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const parseResult = changePasswordSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Input kata sandi tidak valid',
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const userId = await resolveUserId(request, parseResult.data.userId);
    const result = await userService.changeUserPassword(
      userId,
      parseResult.data.currentPassword,
      parseResult.data.newPassword
    );

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    console.error('Error in POST /api/user/change-password:', error);
    const isClientError =
      error.message?.includes('tidak cocok') ||
      error.message?.includes('tidak ditemukan') ||
      error.message?.includes('tidak terdaftar');

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal mengubah kata sandi',
      },
      { status: isClientError ? 400 : 500 }
    );
  }
}
