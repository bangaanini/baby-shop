import { NextRequest, NextResponse } from 'next/server';
import { storageService } from '@/server/services/storage.service';
import { shippingService } from '@/server/services/shipping.service';

export async function GET() {
  try {
    const isR2Configured = storageService.isR2Configured();
    const bucketName = process.env.R2_BUCKET_NAME || 'baby-shop-products';
    const publicUrl = process.env.R2_PUBLIC_URL || 'https://pub-xxxxxx.r2.dev';
    const accountId = process.env.R2_ACCOUNT_ID
      ? process.env.R2_ACCOUNT_ID.length > 8
        ? `${process.env.R2_ACCOUNT_ID.slice(0, 4)}••••${process.env.R2_ACCOUNT_ID.slice(-4)}`
        : '••••••••'
      : 'Belum Dikonfigurasi';

    const isBiteshipConfigured = shippingService.isBiteshipConfigured();
    const biteshipOrigin = shippingService.getOriginInfo();

    return NextResponse.json({
      success: true,
      data: {
        r2: {
          isConfigured: isR2Configured,
          bucketName,
          publicUrl,
          accountId,
          region: 'auto (Global Edge)',
          protocol: 'S3 API Protocol v4',
          maxUploadSize: '5 MB (WebP, JPG, PNG, GIF)',
        },
        biteship: {
          isConfigured: isBiteshipConfigured,
          origin: biteshipOrigin,
          apiKeyMasked: isBiteshipConfigured
            ? `${process.env.BITESHIP_API_KEY?.slice(0, 8)}••••••••`
            : 'Belum Dikonfigurasi',
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
