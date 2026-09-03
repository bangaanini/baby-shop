import { NextResponse } from 'next/server';
import { adminService } from '@/server/services/admin.service';

export async function GET() {
  try {
    const stats = await adminService.getDashboardStats();
    return NextResponse.json({
      success: true,
      data: stats,
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
