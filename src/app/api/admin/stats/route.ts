import { NextRequest, NextResponse } from 'next/server';
import { adminService } from '@/server/services/admin.service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const daysParam = request.nextUrl.searchParams.get('days');
    const days = daysParam ? parseInt(daysParam, 10) : 7;

    const [stats, analytics] = await Promise.all([
      adminService.getDashboardStats(),
      adminService.getSalesAnalytics(isNaN(days) ? 7 : days),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        ...stats,
        analytics,
      },
    });
  } catch (error: any) {
    console.error('Error in GET /api/admin/stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal memuat ringkasan statistik dashboard',
      },
      { status: 500 }
    );
  }
}
