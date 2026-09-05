import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { db } from '@/db';
import { usersTable, ordersTable, addressesTable, orderItemsTable } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { formatOrderRecord } from '@/server/services/order.service';

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
  return {
    authorized: false,
    response: NextResponse.json(
      { success: false, error: 'Akses ditolak: Hanya akun dengan role admin yang diizinkan.' },
      { status: 403 }
    ),
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await verifyAdmin(request);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    const { id } = await params;
    if (!id || !id.trim()) {
      return NextResponse.json({ success: false, error: 'ID Pelanggan wajib disertakan' }, { status: 400 });
    }

    const customerId = id.trim();

    // 1. Fetch User Record
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, customerId),
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: `Pelanggan dengan ID "${customerId}" tidak ditemukan` },
        { status: 404 }
      );
    }

    // 2. Fetch User Saved Addresses
    const addresses = await db.query.addressesTable.findMany({
      where: eq(addressesTable.userId, customerId),
      orderBy: (addr, { desc }) => [desc(addr.is_primary)],
    });

    // 3. Fetch User Orders with Items and Tracking History
    const orderRecords = await db.query.ordersTable.findMany({
      where: eq(ordersTable.user_id, customerId),
      orderBy: [desc(ordersTable.created_at)],
      with: {
        items: {
          with: {
            product: true,
          },
        },
        trackingHistory: {
          orderBy: (th, { desc }) => [desc(th.occurred_at)],
        },
      },
    });

    const orders = orderRecords.map(formatOrderRecord);

    const totalOrders = orders.length;
    const totalSpent = orders
      .filter((o) => o.status !== 'dibatalkan')
      .reduce((sum, o) => sum + (Number(o.totalBayar) || 0), 0);
    const completedOrders = orders.filter((o) => o.status === 'selesai').length;

    return NextResponse.json({
      success: true,
      data: {
        customer: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          image: user.image,
          role: user.role,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        metrics: {
          totalOrders,
          completedOrders,
          totalSpent,
        },
        addresses,
        orders,
      },
    });
  } catch (error: any) {
    console.error('Error in GET /api/admin/customers/[id]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memuat rincian data pelanggan' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await verifyAdmin(request);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    const { id } = await params;
    if (!id || !id.trim()) {
      return NextResponse.json({ success: false, error: 'ID Pelanggan wajib disertakan' }, { status: 400 });
    }

    const customerId = id.trim();
    const body = await request.json().catch(() => ({}));
    const { role } = body;

    if (!role || !['admin', 'buyer'].includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Role harus berupa "admin" atau "buyer"' },
        { status: 400 }
      );
    }

    // 1. Fetch Target User
    const targetUser = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, customerId),
    });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: `Pengguna dengan ID "${customerId}" tidak ditemukan` },
        { status: 404 }
      );
    }

    // 2. Proteksi Master Admin dari .env
    const masterAdminEmails = (process.env.ADMIN_EMAILS || 'admin@nbusiness.id,admin@babykids.id')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    if (
      role === 'buyer' &&
      targetUser.email &&
      masterAdminEmails.includes(targetUser.email.toLowerCase())
    ) {
      return NextResponse.json(
        {
          success: false,
          error: `Akun "${targetUser.email}" terdaftar sebagai Master Admin di konfigurasi server (.env). Hak akses tidak dapat dicabut melalui dashboard web.`,
        },
        { status: 403 }
      );
    }

    // 3. Update User Role
    await db
      .update(usersTable)
      .set({
        role,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, customerId));

    return NextResponse.json({
      success: true,
      message: `Role pengguna "${targetUser.name || targetUser.email}" berhasil diubah menjadi "${role}".`,
      data: {
        id: targetUser.id,
        email: targetUser.email,
        name: targetUser.name,
        role,
      },
    });
  } catch (error: any) {
    console.error('Error in PATCH /api/admin/customers/[id]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal mengubah role pengguna' },
      { status: 500 }
    );
  }
}
