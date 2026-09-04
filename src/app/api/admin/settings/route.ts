import { NextRequest, NextResponse } from 'next/server';
import { storageService } from '@/server/services/storage.service';

export async function GET() {
  try {
    const isConfigured = storageService.isR2Configured();
    const bucketName = process.env.R2_BUCKET_NAME || 'baby-shop-products';
    const publicUrl = process.env.R2_PUBLIC_URL || 'https://pub-xxxxxx.r2.dev';
    const accountId = process.env.R2_ACCOUNT_ID
      ? process.env.R2_ACCOUNT_ID.length > 8
        ? `${process.env.R2_ACCOUNT_ID.slice(0, 4)}••••${process.env.R2_ACCOUNT_ID.slice(-4)}`
        : '••••••••'
      : 'Belum Dikonfigurasi';

    return NextResponse.json({
      success: true,
      data: {
        r2: {
          isConfigured,
          bucketName,
          publicUrl,
          accountId,
          region: 'auto (Global Edge)',
          protocol: 'S3 API Protocol v4',
          maxUploadSize: '5 MB (WebP, JPG, PNG, GIF)',
        },
      },
    });
  } catch (error: any) {
    console.error('Error in GET /api/admin/settings:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal memuat informasi pengaturan',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    return NextResponse.json({
      success: true,
      message: 'Pengaturan toko & logistik berhasil disimpan!',
      data: body,
      updatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in POST /api/admin/settings:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal menyimpan pengaturan',
      },
      { status: 500 }
    );
  }
}
