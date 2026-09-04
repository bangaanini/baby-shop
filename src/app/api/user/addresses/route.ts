import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { addressSchema } from '@/server/validators/user.schema';
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
    const addresses = await userService.getUserAddresses(userId);

    return NextResponse.json({
      success: true,
      data: addresses,
      count: addresses.length,
    });
  } catch (error: any) {
    console.error('Error in GET /api/user/addresses:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal memuat daftar alamat',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const parseResult = addressSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Input alamat tidak valid',
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const userId = await resolveUserId(request, body.userId);
    const createdAddress = await userService.createAddress(
      userId,
      parseResult.data
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Alamat berhasil ditambahkan',
        data: createdAddress,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error in POST /api/user/addresses:', error);
    const isClientError = error.message?.includes('tidak ditemukan');
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal menambahkan alamat',
      },
      { status: isClientError ? 400 : 500 }
    );
  }
}
