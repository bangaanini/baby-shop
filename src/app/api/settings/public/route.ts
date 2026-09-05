import { NextResponse } from 'next/server';
import { paymentService } from '@/server/services/payment.service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await paymentService.getStoreSettings();
    return NextResponse.json({
      success: true,
      data: {
        announcement: {
          enabled: settings.header_announcement_enabled ?? true,
          text: settings.header_announcement_text ?? '🎉 Gratis Ongkir s/d Rp 20.000 ke Seluruh Indonesia Belanja Min. Rp 100.000!',
          link: settings.header_announcement_link ?? null,
        },
        store: {
          name: settings.store_name || 'NBusiness',
          tagline: settings.store_tagline || 'Kebutuhan & Mainan Anak',
          logoUrl: settings.store_logo || null,
          faviconUrl: settings.store_favicon || null,
          headerLogoDisplay: settings.header_logo_display || 'both',
          phone: settings.store_phone || '0812-3456-7890',
          email: settings.store_email || 'halo@babykids.id',
          address: settings.store_address,
          city: settings.store_city || 'Jakarta Selatan',
          postalCode: settings.store_postal_code || '12160',
        },
      },
    });
  } catch (error: any) {
    console.error('Error in GET /api/settings/public:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal memuat pengaturan publik',
      },
      { status: 500 }
    );
  }
}
