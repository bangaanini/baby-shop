import { NextRequest, NextResponse } from 'next/server';
import { storageService } from '@/server/services/storage.service';
import { shippingService } from '@/server/services/shipping.service';
import { paymentService } from '@/server/services/payment.service';
import { NewStoreSettings } from '@/db/schema/settings';

export const dynamic = 'force-dynamic';

function maskSecret(key: string | null | undefined, visiblePrefix = 8): string {
  if (!key || key.trim() === '') return '';
  if (key.length <= visiblePrefix) return '••••••••';
  return `${key.slice(0, visiblePrefix)}••••••••`;
}

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
    const biteshipOrigin = await shippingService.getOriginInfo();

    const storeSettings = await paymentService.getStoreSettings();

    return NextResponse.json({
      success: true,
      data: {
        store: {
          id: storeSettings.id,
          storeName: storeSettings.store_name,
          tagline: storeSettings.store_tagline,
          description: storeSettings.store_description,
          email: storeSettings.store_email,
          phone: storeSettings.store_phone,
          address: storeSettings.store_address,
          city: storeSettings.store_city,
          postalCode: storeSettings.store_postal_code,
        },
        seo: {
          metaTitle: storeSettings.seo_meta_title,
          metaDescription: storeSettings.seo_meta_description,
          keywords: storeSettings.seo_keywords,
          googleVerification: storeSettings.seo_google_verification,
          ogImage: storeSettings.seo_og_image,
        },
        settings: {
          ...storeSettings,
          midtrans_server_key_masked: maskSecret(storeSettings.midtrans_server_key, 8),
          xendit_secret_key_masked: maskSecret(storeSettings.xendit_secret_key, 8),
          xendit_webhook_token_masked: maskSecret(storeSettings.xendit_webhook_token, 4),
        },
        activePaymentGateway: storeSettings.active_payment_gateway || 'midtrans',
        enabledPaymentMethods: storeSettings.enabled_payment_methods || [],
        enabledCouriers: storeSettings.enabled_couriers || [],
        midtrans: {
          serverKeyMasked: maskSecret(storeSettings.midtrans_server_key, 8),
          clientKey: storeSettings.midtrans_client_key || '',
          merchantId: storeSettings.midtrans_merchant_id || '',
          isProduction: storeSettings.midtrans_is_production,
          isConfigured: Boolean(
            storeSettings.midtrans_server_key &&
              storeSettings.midtrans_server_key.trim() !== '' &&
              !storeSettings.midtrans_server_key.includes('your_midtrans_server_key')
          ),
        },
        xendit: {
          secretKeyMasked: maskSecret(storeSettings.xendit_secret_key, 8),
          publicKey: storeSettings.xendit_public_key || '',
          webhookTokenMasked: maskSecret(storeSettings.xendit_webhook_token, 4),
          isProduction: storeSettings.xendit_is_production,
          isConfigured: Boolean(
            storeSettings.xendit_secret_key &&
              storeSettings.xendit_secret_key.trim() !== '' &&
              !storeSettings.xendit_secret_key.includes('your_xendit')
          ),
        },
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

    // Support both direct Partial<NewStoreSettings> and nested objects from form
    const updatePayload: Partial<NewStoreSettings> = {};

    if (body.profile) {
      if (body.profile.storeName !== undefined) updatePayload.store_name = body.profile.storeName;
      if (body.profile.tagline !== undefined) updatePayload.store_tagline = body.profile.tagline;
      if (body.profile.storeDescription !== undefined)
        updatePayload.store_description = body.profile.storeDescription;
      if (body.profile.description !== undefined)
        updatePayload.store_description = body.profile.description;
      if (body.profile.customerServiceEmail !== undefined)
        updatePayload.store_email = body.profile.customerServiceEmail;
      if (body.profile.whatsappNumber !== undefined)
        updatePayload.store_phone = body.profile.whatsappNumber;
    }

    if (body.seo) {
      if (body.seo.metaTitle !== undefined) updatePayload.seo_meta_title = body.seo.metaTitle;
      if (body.seo.metaDescription !== undefined)
        updatePayload.seo_meta_description = body.seo.metaDescription;
      if (body.seo.keywords !== undefined) updatePayload.seo_keywords = body.seo.keywords;
      if (body.seo.googleVerification !== undefined)
        updatePayload.seo_google_verification = body.seo.googleVerification;
      if (body.seo.ogImage !== undefined) updatePayload.seo_og_image = body.seo.ogImage;
      if (body.seo.seo_meta_title !== undefined)
        updatePayload.seo_meta_title = body.seo.seo_meta_title;
      if (body.seo.seo_meta_description !== undefined)
        updatePayload.seo_meta_description = body.seo.seo_meta_description;
      if (body.seo.seo_keywords !== undefined)
        updatePayload.seo_keywords = body.seo.seo_keywords;
      if (body.seo.seo_google_verification !== undefined)
        updatePayload.seo_google_verification = body.seo.seo_google_verification;
      if (body.seo.seo_og_image !== undefined)
        updatePayload.seo_og_image = body.seo.seo_og_image;
    }

    if (body.warehouse) {
      if (body.warehouse.fullAddress !== undefined)
        updatePayload.store_address = body.warehouse.fullAddress;
      if (body.warehouse.city !== undefined) updatePayload.store_city = body.warehouse.city;
      if (body.warehouse.postalCode !== undefined)
        updatePayload.store_postal_code = body.warehouse.postalCode;
    }

    if (body.couriers && typeof body.couriers === 'object' && !Array.isArray(body.couriers)) {
      updatePayload.enabled_couriers = Object.entries(body.couriers)
        .filter(([_, enabled]) => Boolean(enabled))
        .map(([key]) => key);
    }

    if (body.payments && typeof body.payments === 'object' && !Array.isArray(body.payments)) {
      const methodMap: Record<string, string> = {
        qris: 'pay-qris',
        bcaVa: 'pay-bca-va',
        mandiriVa: 'pay-mandiri-va',
        briVa: 'pay-bri-va',
        gopay: 'pay-gopay',
      };
      updatePayload.enabled_payment_methods = Object.entries(body.payments)
        .filter(([_, enabled]) => Boolean(enabled))
        .map(([key]) => methodMap[key] || key);
    }

    const directKeys: (keyof NewStoreSettings)[] = [
      'store_name',
      'store_tagline',
      'store_description',
      'store_email',
      'store_phone',
      'store_address',
      'store_city',
      'store_postal_code',
      'seo_meta_title',
      'seo_meta_description',
      'seo_keywords',
      'seo_google_verification',
      'seo_og_image',
      'active_payment_gateway',
      'midtrans_server_key',
      'midtrans_client_key',
      'midtrans_merchant_id',
      'midtrans_is_production',
      'xendit_secret_key',
      'xendit_public_key',
      'xendit_webhook_token',
      'xendit_is_production',
      'enabled_payment_methods',
      'enabled_couriers',
    ];

    for (const key of directKeys) {
      if (body[key] !== undefined) {
        (updatePayload as any)[key] = body[key];
      }
    }

    // Do not overwrite secret keys if they are masked values
    if (
      typeof updatePayload.midtrans_server_key === 'string' &&
      updatePayload.midtrans_server_key.includes('••••')
    ) {
      delete updatePayload.midtrans_server_key;
    }
    if (
      typeof updatePayload.xendit_secret_key === 'string' &&
      updatePayload.xendit_secret_key.includes('••••')
    ) {
      delete updatePayload.xendit_secret_key;
    }
    if (
      typeof updatePayload.xendit_webhook_token === 'string' &&
      updatePayload.xendit_webhook_token.includes('••••')
    ) {
      delete updatePayload.xendit_webhook_token;
    }

    const updatedSettings = await paymentService.saveStoreSettings(updatePayload);

    return NextResponse.json({
      success: true,
      message: 'Pengaturan toko berhasil disimpan!',
      data: updatedSettings,
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
