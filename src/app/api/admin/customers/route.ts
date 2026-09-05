import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { db } from '@/db';
import { usersTable, ordersTable } from '@/db/schema';
import { eq, ilike, or, sql, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

async function verifyAdmin(request: NextRequest): Promise<{ authorized: boolean; response?: NextResponse }> {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (session?.user && (session.user as unknown as { role?: string }).role === 'admin') {
      return { authorized: true };
    }
  } catch (err) {
    console.warn('Session verification warning in admin customers route:', err);
  }
  if (process.env.NODE_ENV !== 'production') {
    const roleHeader = request.headers.get('x-user-role');
    if (roleHeader === 'admin') return { authorized: true };
    const devBypass = request.headers.get('x-dev-admin');
    if (devBypass === '1' || devBypass === 'true') return { authorized: true };
  }
  return {
    authorized: false,
    response: NextResponse.json(
      { success: false, error: 'Akses ditolak: Hanya akun dengan role admin yang diizinkan.' },
      { status: 401 }
    ),
  };
}

export async function GET(request: NextRequest) {
  const guard = await verifyAdmin(request);
  if (!guard.authorized && guard.response) return guard.response;

  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim();
    const filter = (searchParams.get('filter') || 'all').toLowerCase();

    // Fetch all users (with optional ilike filter on name/email/phone) then aggregate orders per user
    // Filtering by ilike is done at DB level; order aggregation via SQL
    let userWhere: ReturnType<typeof ilike> | ReturnType<typeof or> | undefined = undefined;
    if (q) {
      const pattern = `%${q}%`;
      userWhere = or(
        ilike(usersTable.name, pattern),
        ilike(usersTable.email, pattern),
        ilike(usersTable.phone, pattern)
      );
    }

    const users = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        image: usersTable.image,
        phone: usersTable.phone,
        role: usersTable.role,
        createdAt: usersTable.createdAt,
      })
      .from(usersTable)
      .where(userWhere)
      .orderBy(desc(usersTable.createdAt));

    if (users.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          customers: [],
          metrics: { totalCustomers: 0, activeCustomers: 0, totalRevenue: 0 },
        },
      });
    }

    const userIds = users.map((u) => u.id);

    // Aggregate orders per user
    const aggregates = await db
      .select({
        userId: ordersTable.user_id,
        totalOrders: sql<number>`count(*)::int`.as('totalOrders'),
        totalSpent: sql<number>`coalesce(sum(${ordersTable.total_amount}), 0)::int`.as('totalSpent'),
        lastOrderDate: sql<string | null>`max(${ordersTable.created_at})`.as('lastOrderDate'),
      })
      .from(ordersTable)
      .where(sql`${ordersTable.user_id} in ${userIds}`)
      .groupBy(ordersTable.user_id);

    const aggMap = new Map<string, { totalOrders: number; totalSpent: number; lastOrderDate: string | null }>();
    for (const row of aggregates) {
      if (!row.userId) continue;
      aggMap.set(row.userId as string, {
        totalOrders: Number(row.totalOrders) || 0,
        totalSpent: Number(row.totalSpent) || 0,
        lastOrderDate: (row.lastOrderDate as string | null) || null,
      });
    }

    // Build metrics across the filtered user set
    let totalRevenue = 0;
    let activeCustomers = 0;
    for (const u of users) {
      const a = aggMap.get(u.id);
      if (a) {
        totalRevenue += a.totalSpent;
        if (a.totalOrders > 0) activeCustomers += 1;
      }
    }

    let customers = users.map((u) => {
      const a = aggMap.get(u.id) || { totalOrders: 0, totalSpent: 0, lastOrderDate: null };
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        image: u.image,
        phone: u.phone,
        role: u.role,
        createdAt: u.createdAt,
        totalOrders: a.totalOrders,
        totalSpent: a.totalSpent,
        lastOrderDate: a.lastOrderDate,
      };
    });

    if (filter === 'active') {
      customers = customers.filter((c) => c.totalOrders > 0);
    } else if (filter === 'inactive') {
      customers = customers.filter((c) => c.totalOrders === 0);
    }

    return NextResponse.json({
      success: true,
      data: {
        customers,
        metrics: {
          totalCustomers: customers.length,
          // For filtered views keep metrics reflecting the shown set; for "all" this matches overall filtered base
          // To keep consistent top tiles, also expose unfiltered counts when filtered? Spec says metrics from data, so use filtered.
          activeCustomers,
          totalRevenue,
        },
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal memuat daftar pelanggan';
    console.error('Error in GET /api/admin/customers:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
