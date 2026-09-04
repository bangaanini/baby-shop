import crypto from 'crypto';
import { eq, or } from 'drizzle-orm';
import { db } from '@/db';
import {
  storeSettingsTable,
  StoreSettings,
  NewStoreSettings,
} from '@/db/schema/settings';
import { ordersTable, trackingHistoryTable } from '@/db/schema/orders';
import { MOCK_PAYMENT_METHODS } from '@/data/mock-checkout';
import { PaymentMethod } from '@/types/checkout';

export interface CreatePaymentTransactionParams {
  orderId: string;
  invoiceNumber: string;
  totalAmount?: number;
  grossAmount?: number;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  paymentMethodId?: string;
  items?: Array<{
    id?: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}

export interface PaymentTransactionResult {
  provider: 'midtrans' | 'xendit' | 'simulator';
  token?: string;
  snapToken?: string;
  redirectUrl?: string;
  invoiceUrl?: string;
  clientKey?: string;
  isProduction?: boolean;
  isSimulator: boolean;
  message?: string;
}

export interface WebhookResult {
  success: boolean;
  provider: string;
  orderId?: string;
  invoiceNumber?: string;
  status?: string;
  message?: string;
}

export interface TestConnectionResult {
  success: boolean;
  message: string;
  details?: Record<string, unknown>;
}

function isValidUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

/**
 * Mendapatkan konfigurasi toko & payment gateway dari database dengan fallback aman ke environment variables.
 */
export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const existing = await db.query.storeSettingsTable.findFirst({
      where: eq(storeSettingsTable.id, 'default'),
    });

    if (existing) {
      return {
        ...existing,
        active_payment_gateway:
          existing.active_payment_gateway ||
          process.env.PAYMENT_GATEWAY_PROVIDER ||
          'midtrans',
        midtrans_server_key:
          existing.midtrans_server_key || process.env.MIDTRANS_SERVER_KEY || null,
        midtrans_client_key:
          existing.midtrans_client_key || process.env.MIDTRANS_CLIENT_KEY || null,
        midtrans_merchant_id:
          existing.midtrans_merchant_id || process.env.MIDTRANS_MERCHANT_ID || null,
        midtrans_is_production:
          existing.midtrans_is_production ??
          (process.env.MIDTRANS_IS_PRODUCTION === 'true'),
        xendit_secret_key:
          existing.xendit_secret_key || process.env.XENDIT_SECRET_KEY || null,
        xendit_public_key:
          existing.xendit_public_key || process.env.XENDIT_PUBLIC_KEY || null,
        xendit_webhook_token:
          existing.xendit_webhook_token || process.env.XENDIT_WEBHOOK_TOKEN || null,
        xendit_is_production:
          existing.xendit_is_production ??
          (process.env.XENDIT_IS_PRODUCTION === 'true'),
        enabled_payment_methods:
          existing.enabled_payment_methods &&
          existing.enabled_payment_methods.length > 0
            ? existing.enabled_payment_methods
            : ['pay-qris', 'pay-bca-va', 'pay-mandiri-va', 'pay-bri-va', 'pay-gopay'],
        enabled_couriers:
          existing.enabled_couriers && existing.enabled_couriers.length > 0
            ? existing.enabled_couriers
            : ['sicepat', 'jne', 'jnt', 'anteraja', 'cargo'],
      };
    }

    // Jika belum ada record default di database, buat baris default baru
    const defaultSettings: NewStoreSettings = {
      id: 'default',
      store_name: 'BabyKids Official Store',
      store_tagline: 'Marketplace Kebutuhan Anak Terlengkap #1 di Indonesia',
      store_email: 'halo@babykids.id',
      store_phone: '0812-3456-7890',
      store_address: 'Jl. Melati Indah No. 42, RT 03 / RW 07, Kebayoran Baru',
      store_city: process.env.SHIPPING_ORIGIN_CITY || 'Jakarta Selatan',
      store_postal_code: process.env.SHIPPING_ORIGIN_POSTAL_CODE || '12160',
      active_payment_gateway: process.env.PAYMENT_GATEWAY_PROVIDER || 'midtrans',
      midtrans_server_key: process.env.MIDTRANS_SERVER_KEY || null,
      midtrans_client_key: process.env.MIDTRANS_CLIENT_KEY || null,
      midtrans_merchant_id: process.env.MIDTRANS_MERCHANT_ID || null,
      midtrans_is_production: process.env.MIDTRANS_IS_PRODUCTION === 'true',
      xendit_secret_key: process.env.XENDIT_SECRET_KEY || null,
      xendit_public_key: process.env.XENDIT_PUBLIC_KEY || null,
      xendit_webhook_token: process.env.XENDIT_WEBHOOK_TOKEN || null,
      xendit_is_production: process.env.XENDIT_IS_PRODUCTION === 'true',
      enabled_payment_methods: [
        'pay-qris',
        'pay-bca-va',
        'pay-mandiri-va',
        'pay-bri-va',
        'pay-gopay',
      ],
      enabled_couriers: ['sicepat', 'jne', 'jnt', 'anteraja', 'cargo'],
      updated_at: new Date(),
    };

    try {
      const [inserted] = await db
        .insert(storeSettingsTable)
        .values(defaultSettings)
        .onConflictDoNothing()
        .returning();

      if (inserted) return inserted;
    } catch {
      // Abaikan error duplicate atau connection
    }

    return defaultSettings as StoreSettings;
  } catch (error) {
    console.error('[PaymentService] Error fetching store settings:', error);
    return {
      id: 'default',
      store_name: 'BabyKids Official Store',
      store_tagline: 'Marketplace Kebutuhan Anak Terlengkap #1 di Indonesia',
      store_email: 'halo@babykids.id',
      store_phone: '0812-3456-7890',
      store_address: 'Jl. Melati Indah No. 42, RT 03 / RW 07, Kebayoran Baru',
      store_city: process.env.SHIPPING_ORIGIN_CITY || 'Jakarta Selatan',
      store_postal_code: process.env.SHIPPING_ORIGIN_POSTAL_CODE || '12160',
      active_payment_gateway: process.env.PAYMENT_GATEWAY_PROVIDER || 'midtrans',
      midtrans_server_key: process.env.MIDTRANS_SERVER_KEY || null,
      midtrans_client_key: process.env.MIDTRANS_CLIENT_KEY || null,
      midtrans_merchant_id: process.env.MIDTRANS_MERCHANT_ID || null,
      midtrans_is_production: process.env.MIDTRANS_IS_PRODUCTION === 'true',
      xendit_secret_key: process.env.XENDIT_SECRET_KEY || null,
      xendit_public_key: process.env.XENDIT_PUBLIC_KEY || null,
      xendit_webhook_token: process.env.XENDIT_WEBHOOK_TOKEN || null,
      xendit_is_production: process.env.XENDIT_IS_PRODUCTION === 'true',
      enabled_payment_methods: [
        'pay-qris',
        'pay-bca-va',
        'pay-mandiri-va',
        'pay-bri-va',
        'pay-gopay',
      ],
      enabled_couriers: ['sicepat', 'jne', 'jnt', 'anteraja', 'cargo'],
      updated_at: new Date(),
    };
  }
}

/**
 * Menyimpan atau memperbarui konfigurasi toko & kredensial payment gateway ke database.
 */
export async function saveStoreSettings(
  payload: Partial<NewStoreSettings>
): Promise<StoreSettings> {
  const existing = await db.query.storeSettingsTable.findFirst({
    where: eq(storeSettingsTable.id, 'default'),
  });

  const now = new Date();

  if (existing) {
    const [updated] = await db
      .update(storeSettingsTable)
      .set({
        ...payload,
        updated_at: now,
      })
      .where(eq(storeSettingsTable.id, 'default'))
      .returning();

    return updated;
  } else {
    const [inserted] = await db
      .insert(storeSettingsTable)
      .values({
        id: 'default',
        ...payload,
        updated_at: now,
      })
      .returning();

    return inserted;
  }
}

/**
 * Mengambil daftar metode pembayaran yang aktif sesuai checklist pengaturan admin.
 */
export async function getAvailablePaymentMethods(): Promise<PaymentMethod[]> {
  const settings = await getStoreSettings();
  const enabledIds = new Set(settings.enabled_payment_methods || []);

  if (enabledIds.size === 0) {
    return MOCK_PAYMENT_METHODS;
  }

  const filtered = MOCK_PAYMENT_METHODS.filter((method) =>
    enabledIds.has(method.id)
  );

  return filtered.length > 0 ? filtered : MOCK_PAYMENT_METHODS;
}

/**
 * Membuat transaksi pembayaran ke Payment Gateway aktif (Midtrans Snap, Xendit Invoice, atau Simulator).
 */
export async function createPaymentTransaction(
  params: CreatePaymentTransactionParams
): Promise<PaymentTransactionResult> {
  const settings = await getStoreSettings();
  const activeGateway = (
    settings.active_payment_gateway ||
    process.env.PAYMENT_GATEWAY_PROVIDER ||
    'midtrans'
  ).toLowerCase();

  const totalAmount = Math.round(params.totalAmount ?? params.grossAmount ?? 0);

  // 1. Jalur Midtrans Snap API
  if (activeGateway === 'midtrans') {
    const serverKey = settings.midtrans_server_key;
    const isKeyValid =
      serverKey &&
      serverKey.trim() !== '' &&
      !serverKey.includes('your_midtrans_server_key');

    if (!isKeyValid) {
      console.warn(
        '[PaymentService] Midtrans Server Key tidak terkonfigurasi. Menggunakan mode Simulator.'
      );
      return {
        provider: 'simulator',
        token: `sim-snap-${params.invoiceNumber}`,
        snapToken: `sim-snap-${params.invoiceNumber}`,
        redirectUrl: `/user/pesanan?invoice=${params.invoiceNumber}&simulated=true`,
        clientKey: settings.midtrans_client_key || undefined,
        isProduction: settings.midtrans_is_production,
        isSimulator: true,
        message: 'Midtrans belum dikonfigurasi, mode simulator aktif.',
      };
    }

    try {
      const isProduction = settings.midtrans_is_production;
      const snapUrl = isProduction
        ? 'https://app.midtrans.com/snap/v1/transactions'
        : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

      const authHeader = `Basic ${Buffer.from(`${serverKey}:`).toString('base64')}`;

      const payload: Record<string, unknown> = {
        transaction_details: {
          order_id: params.invoiceNumber,
          gross_amount: totalAmount,
        },
        customer_details: {
          first_name: params.customerName,
          email: params.customerEmail || 'customer@babykids.id',
          phone: params.customerPhone || '08123456789',
        },
      };

      // Di Midtrans Snap API, jumlah item_details (price * quantity) WAJIB sama persis dengan gross_amount
      if (params.items && params.items.length > 0) {
        const sumItemDetails = params.items.reduce(
          (acc, it) => acc + Math.round(it.price) * it.quantity,
          0
        );

        if (sumItemDetails === totalAmount) {
          payload.item_details = params.items.map((item) => ({
            id: item.id || item.name.slice(0, 30),
            name: item.name.slice(0, 50),
            price: Math.round(item.price),
            quantity: item.quantity,
          }));
        } else {
          // Bila ada ongkir atau potongan diskon yang membuat total berbeda,
          // sediakan satu item total yang konsisten
          payload.item_details = [
            {
              id: params.invoiceNumber,
              name: `Pesanan #${params.invoiceNumber}`.slice(0, 50),
              price: totalAmount,
              quantity: 1,
            },
          ];
        }
      }

      const response = await fetch(snapUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: authHeader,
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          provider: 'midtrans',
          token: data.token,
          snapToken: data.token,
          redirectUrl: data.redirect_url,
          clientKey: settings.midtrans_client_key || undefined,
          isProduction: settings.midtrans_is_production,
          isSimulator: false,
        };
      } else {
        const errBody = await response.text();
        console.error(
          `[PaymentService] Midtrans Snap API error (${response.status}):`,
          errBody
        );
      }
    } catch (err) {
      console.error('[PaymentService] Midtrans Snap API call failed:', err);
    }

    // Fallback gracefully jika request Midtrans gagal
    return {
      provider: 'simulator',
      token: `sim-snap-${params.invoiceNumber}`,
      snapToken: `sim-snap-${params.invoiceNumber}`,
      redirectUrl: `/user/pesanan?invoice=${params.invoiceNumber}&simulated=true`,
      clientKey: settings.midtrans_client_key || undefined,
      isProduction: settings.midtrans_is_production,
      isSimulator: true,
      message: 'Koneksi Midtrans gagal, menggunakan mode simulasi.',
    };
  }

  // 2. Jalur Xendit XenInvoice API
  if (activeGateway === 'xendit') {
    const secretKey = settings.xendit_secret_key;
    const isKeyValid =
      secretKey &&
      secretKey.trim() !== '' &&
      !secretKey.includes('your_xendit_secret_key');

    if (!isKeyValid) {
      console.warn(
        '[PaymentService] Xendit Secret Key tidak terkonfigurasi. Menggunakan mode Simulator.'
      );
      return {
        provider: 'simulator',
        token: `sim-xendit-${params.invoiceNumber}`,
        redirectUrl: `/user/pesanan?invoice=${params.invoiceNumber}&simulated=true`,
        invoiceUrl: `/user/pesanan?invoice=${params.invoiceNumber}&simulated=true`,
        isSimulator: true,
        message: 'Xendit belum dikonfigurasi, mode simulator aktif.',
      };
    }

    try {
      const invoiceUrl = 'https://api.xendit.co/v2/invoices';
      const authHeader = `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`;
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

      const payload = {
        external_id: params.invoiceNumber,
        amount: totalAmount,
        description: `Pembayaran Pesanan #${params.invoiceNumber} - BabyKids`,
        payer_email: params.customerEmail || 'customer@babykids.id',
        customer: {
          given_names: params.customerName,
          email: params.customerEmail || 'customer@babykids.id',
          mobile_number: params.customerPhone || '08123456789',
        },
        success_redirect_url: `${appUrl}/user/pesanan?invoice=${params.invoiceNumber}&payment_status=success`,
        failure_redirect_url: `${appUrl}/user/pesanan?invoice=${params.invoiceNumber}&payment_status=failed`,
      };

      const response = await fetch(invoiceUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          provider: 'xendit',
          token: data.id,
          redirectUrl: data.invoice_url,
          invoiceUrl: data.invoice_url,
          isSimulator: false,
        };
      } else {
        const errBody = await response.text();
        console.error(
          `[PaymentService] Xendit Invoice API error (${response.status}):`,
          errBody
        );
      }
    } catch (err) {
      console.error('[PaymentService] Xendit Invoice API call failed:', err);
    }

    // Fallback gracefully jika request Xendit gagal
    return {
      provider: 'simulator',
      token: `sim-xendit-${params.invoiceNumber}`,
      redirectUrl: `/user/pesanan?invoice=${params.invoiceNumber}&simulated=true`,
      invoiceUrl: `/user/pesanan?invoice=${params.invoiceNumber}&simulated=true`,
      isSimulator: true,
      message: 'Koneksi Xendit gagal, menggunakan mode simulasi.',
    };
  }

  // 3. Mode Simulator Default
  return {
    provider: 'simulator',
    token: `sim-${params.invoiceNumber}`,
    redirectUrl: `/user/pesanan?invoice=${params.invoiceNumber}&simulated=true`,
    invoiceUrl: `/user/pesanan?invoice=${params.invoiceNumber}&simulated=true`,
    isSimulator: true,
    message: 'Transaksi dibuat dalam mode simulator lokal.',
  };
}

/**
 * Menangani Webhook Notifikasi Transaksi dari Midtrans, Xendit, atau Simulator
 * untuk melakukan auto-settlement dan memperbarui status pesanan ke 'diproses'.
 */
export async function handleWebhookNotification(
  body: any,
  headers?: Record<string, string | string[] | undefined> | Headers
): Promise<WebhookResult> {
  const settings = await getStoreSettings();

  const getHeader = (key: string): string | undefined => {
    if (!headers) return undefined;
    if (typeof (headers as Headers).get === 'function') {
      return (headers as Headers).get(key) || undefined;
    }
    const rec = headers as Record<string, string | string[] | undefined>;
    const val =
      rec[key] ||
      rec[key.toLowerCase()] ||
      rec[key.toUpperCase()] ||
      rec[key.replace(/-/g, '_')];
    return Array.isArray(val) ? val[0] : val;
  };

  const now = new Date();

  // ==========================================
  // 1. Deteksi & Penanganan Webhook MIDTRANS
  // ==========================================
  if (body?.signature_key || (body?.order_id && body?.status_code)) {
    const orderId = String(body.order_id || '');
    const statusCode = String(body.status_code || '');
    const grossAmount = String(body.gross_amount || '');
    const signatureKey = String(body.signature_key || '');
    const transactionStatus = String(body.transaction_status || '').toLowerCase();
    const fraudStatus = String(body.fraud_status || '').toLowerCase();
    const paymentType = String(body.payment_type || 'midtrans');

    // Validasi Signature SHA512 jika Server Key tersedia
    const serverKey = settings.midtrans_server_key;
    if (serverKey && signatureKey) {
      const payloadString = `${orderId}${statusCode}${grossAmount}${serverKey}`;
      const expectedSignature = crypto
        .createHash('sha512')
        .update(payloadString)
        .digest('hex');

      if (signatureKey !== expectedSignature) {
        console.warn(
          `[PaymentService] Midtrans Webhook Invalid Signature for Order ${orderId}`
        );
        return {
          success: false,
          provider: 'midtrans',
          message: 'Signature key Midtrans tidak valid.',
        };
      }
    }

    // Cari pesanan berdasarkan invoice_number atau ID
    const existingOrder = await db.query.ordersTable.findFirst({
      where: or(
        eq(ordersTable.invoice_number, orderId),
        isValidUUID(orderId) ? eq(ordersTable.id, orderId) : undefined
      ),
    });

    if (!existingOrder) {
      console.warn(`[PaymentService] Midtrans Webhook: Order ${orderId} tidak ditemukan.`);
      return {
        success: false,
        provider: 'midtrans',
        message: `Pesanan ${orderId} tidak ditemukan`,
      };
    }

    const isSuccess =
      transactionStatus === 'settlement' ||
      (transactionStatus === 'capture' && fraudStatus === 'accept');

    const isFailed =
      transactionStatus === 'cancel' ||
      transactionStatus === 'deny' ||
      transactionStatus === 'expire';

    if (isSuccess) {
      // Update status pesanan ke 'diproses'
      await db
        .update(ordersTable)
        .set({
          status: 'diproses',
          updated_at: now,
        })
        .where(eq(ordersTable.id, existingOrder.id));

      // Tambahkan riwayat tracking auto-settlement
      await db.insert(trackingHistoryTable).values({
        order_id: existingOrder.id,
        status_title: 'Pembayaran Berhasil Diverifikasi Otomatis',
        description: `Pembayaran sebesar Rp ${Number(
          existingOrder.total_amount
        ).toLocaleString(
          'id-ID'
        )} telah diverifikasi lunas melalui Midtrans (${paymentType}). Pesanan diteruskan ke penjual.`,
        location: 'Midtrans Payment Gateway',
        occurred_at: now,
      });

      return {
        success: true,
        provider: 'midtrans',
        orderId: existingOrder.id,
        invoiceNumber: existingOrder.invoice_number,
        status: 'diproses',
        message: 'Pembayaran Midtrans berhasil diverifikasi dan pesanan diproses.',
      };
    }

    if (isFailed) {
      await db
        .update(ordersTable)
        .set({
          status: 'dibatalkan',
          updated_at: now,
        })
        .where(eq(ordersTable.id, existingOrder.id));

      await db.insert(trackingHistoryTable).values({
        order_id: existingOrder.id,
        status_title: 'Pembayaran Dibatalkan / Kedaluwarsa',
        description: `Transaksi pembayaran dibatalkan atau kedaluwarsa oleh sistem payment gateway (${transactionStatus}).`,
        location: 'Midtrans Payment Gateway',
        occurred_at: now,
      });

      return {
        success: true,
        provider: 'midtrans',
        orderId: existingOrder.id,
        invoiceNumber: existingOrder.invoice_number,
        status: 'dibatalkan',
        message: `Status transaksi Midtrans: ${transactionStatus}`,
      };
    }

    return {
      success: true,
      provider: 'midtrans',
      orderId: existingOrder.id,
      invoiceNumber: existingOrder.invoice_number,
      status: existingOrder.status,
      message: `Status Midtrans diterima: ${transactionStatus}`,
    };
  }

  // ==========================================
  // 2. Deteksi & Penanganan Webhook XENDIT
  // ==========================================
  if (
    body?.status &&
    (body?.external_id || body?.id) &&
    (body?.paid_amount !== undefined || body?.payment_channel || body?.payment_method)
  ) {
    const externalId = String(body.external_id || body.id || '');
    const status = String(body.status || '').toUpperCase();
    const paymentMethod = String(
      body.payment_method || body.payment_channel || 'Xendit Invoice'
    );

    // Validasi Xendit Callback Token
    const webhookToken = settings.xendit_webhook_token;
    const receivedToken = getHeader('x-callback-token');

    if (webhookToken && receivedToken && webhookToken !== receivedToken) {
      console.warn(
        `[PaymentService] Xendit Callback Token Mismatch for Invoice ${externalId}`
      );
      return {
        success: false,
        provider: 'xendit',
        message: 'Callback token Xendit tidak valid.',
      };
    }

    const existingOrder = await db.query.ordersTable.findFirst({
      where: or(
        eq(ordersTable.invoice_number, externalId),
        isValidUUID(externalId) ? eq(ordersTable.id, externalId) : undefined
      ),
    });

    if (!existingOrder) {
      console.warn(`[PaymentService] Xendit Webhook: Order ${externalId} tidak ditemukan.`);
      return {
        success: false,
        provider: 'xendit',
        message: `Pesanan ${externalId} tidak ditemukan`,
      };
    }

    const isSuccess = status === 'PAID' || status === 'SETTLED';
    const isFailed = status === 'EXPIRED';

    if (isSuccess) {
      await db
        .update(ordersTable)
        .set({
          status: 'diproses',
          updated_at: now,
        })
        .where(eq(ordersTable.id, existingOrder.id));

      await db.insert(trackingHistoryTable).values({
        order_id: existingOrder.id,
        status_title: 'Pembayaran Berhasil Diverifikasi Otomatis',
        description: `Pembayaran sebesar Rp ${Number(
          existingOrder.total_amount
        ).toLocaleString(
          'id-ID'
        )} telah diverifikasi lunas melalui Xendit (${paymentMethod}). Pesanan siap diproses.`,
        location: 'Xendit Payment Gateway',
        occurred_at: now,
      });

      return {
        success: true,
        provider: 'xendit',
        orderId: existingOrder.id,
        invoiceNumber: existingOrder.invoice_number,
        status: 'diproses',
        message: 'Pembayaran Xendit berhasil diverifikasi dan pesanan diproses.',
      };
    }

    if (isFailed) {
      await db
        .update(ordersTable)
        .set({
          status: 'dibatalkan',
          updated_at: now,
        })
        .where(eq(ordersTable.id, existingOrder.id));

      await db.insert(trackingHistoryTable).values({
        order_id: existingOrder.id,
        status_title: 'Invoice Xendit Kedaluwarsa',
        description: 'Batas waktu pembayaran invoice Xendit telah berakhir.',
        location: 'Xendit Payment Gateway',
        occurred_at: now,
      });

      return {
        success: true,
        provider: 'xendit',
        orderId: existingOrder.id,
        invoiceNumber: existingOrder.invoice_number,
        status: 'dibatalkan',
        message: 'Invoice Xendit kedaluwarsa.',
      };
    }

    return {
      success: true,
      provider: 'xendit',
      orderId: existingOrder.id,
      invoiceNumber: existingOrder.invoice_number,
      status: existingOrder.status,
      message: `Status invoice Xendit: ${status}`,
    };
  }

  // ==========================================
  // 3. Jalur Simulasi Instant Settlement
  // ==========================================
  const simulatedIdentifier =
    body?.invoiceNumber ||
    body?.orderId ||
    body?.order_id ||
    body?.external_id ||
    body?.invoice_number;

  if (simulatedIdentifier) {
    const existingOrder = await db.query.ordersTable.findFirst({
      where: or(
        eq(ordersTable.invoice_number, String(simulatedIdentifier)),
        isValidUUID(String(simulatedIdentifier))
          ? eq(ordersTable.id, String(simulatedIdentifier))
          : undefined
      ),
    });

    if (existingOrder) {
      await db
        .update(ordersTable)
        .set({
          status: 'diproses',
          updated_at: now,
        })
        .where(eq(ordersTable.id, existingOrder.id));

      await db.insert(trackingHistoryTable).values({
        order_id: existingOrder.id,
        status_title: 'Pembayaran Berhasil Diverifikasi Otomatis',
        description: `Pembayaran sebesar Rp ${Number(
          existingOrder.total_amount
        ).toLocaleString(
          'id-ID'
        )} berhasil disimulasikan lunas. Pesanan diteruskan ke status 'diproses'.`,
        location: 'Simulator Payment Gateway',
        occurred_at: now,
      });

      return {
        success: true,
        provider: 'simulator',
        orderId: existingOrder.id,
        invoiceNumber: existingOrder.invoice_number,
        status: 'diproses',
        message: 'Simulasi pembayaran berhasil! Pesanan kini dalam status diproses.',
      };
    }
  }

  return {
    success: false,
    provider: 'unknown',
    message: 'Format webhook payload tidak dikenali.',
  };
}

/**
 * Menguji koneksi kredensial Payment Gateway (Midtrans atau Xendit).
 */
export async function testGatewayConnection(
  provider: 'midtrans' | 'xendit' | 'simulator',
  credentials?: {
    midtrans_server_key?: string;
    midtrans_client_key?: string;
    midtrans_is_production?: boolean;
    xendit_secret_key?: string;
    xendit_is_production?: boolean;
  }
): Promise<TestConnectionResult> {
  const settings = await getStoreSettings();

  if (provider === 'simulator') {
    return {
      success: true,
      message: 'Mode Simulator aktif. Transaksi pembayaran akan disimulasikan secara lokal.',
    };
  }

  if (provider === 'midtrans') {
    const serverKey =
      credentials?.midtrans_server_key !== undefined
        ? credentials.midtrans_server_key
        : settings.midtrans_server_key;

    if (!serverKey || serverKey.trim() === '' || serverKey.includes('your_midtrans')) {
      return {
        success: false,
        message: 'Server Key Midtrans belum diisi atau masih menggunakan nilai placeholder.',
      };
    }

    try {
      const isProduction =
        credentials?.midtrans_is_production !== undefined
          ? credentials.midtrans_is_production
          : settings.midtrans_is_production;

      const pingUrl = isProduction
        ? 'https://api.midtrans.com/v2/ping'
        : 'https://api.sandbox.midtrans.com/v2/ping';

      const authHeader = `Basic ${Buffer.from(`${serverKey}:`).toString('base64')}`;

      const response = await fetch(pingUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: authHeader,
        },
        signal: AbortSignal.timeout(8000),
      });

      if (response.ok) {
        return {
          success: true,
          message: `Koneksi Midtrans API (${isProduction ? 'Production' : 'Sandbox'}) berhasil diverifikasi!`,
        };
      }

      // Jika endpoint /v2/ping tidak tersedia, coba buat dummy Snap token request
      const snapUrl = isProduction
        ? 'https://app.midtrans.com/snap/v1/transactions'
        : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

      const snapTestResponse = await fetch(snapUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: authHeader,
        },
        body: JSON.stringify({
          transaction_details: {
            order_id: `PING-TEST-${Date.now()}`,
            gross_amount: 10000,
          },
        }),
        signal: AbortSignal.timeout(8000),
      });

      if (snapTestResponse.ok) {
        return {
          success: true,
          message: `Koneksi Snap Token Midtrans (${isProduction ? 'Production' : 'Sandbox'}) berhasil terhubung!`,
        };
      }

      const errText = await snapTestResponse.text();
      return {
        success: false,
        message: `Koneksi Midtrans gagal (HTTP ${snapTestResponse.status}): ${errText.slice(0, 120)}`,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Gagal menghubungi server Midtrans: ${error.message || String(error)}`,
      };
    }
  }

  if (provider === 'xendit') {
    const secretKey =
      credentials?.xendit_secret_key !== undefined
        ? credentials.xendit_secret_key
        : settings.xendit_secret_key;

    if (!secretKey || secretKey.trim() === '' || secretKey.includes('your_xendit')) {
      return {
        success: false,
        message: 'Secret Key Xendit belum diisi atau masih menggunakan nilai placeholder.',
      };
    }

    try {
      const authHeader = `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`;

      const response = await fetch('https://api.xendit.co/balance', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: authHeader,
        },
        signal: AbortSignal.timeout(8000),
      });

      if (response.ok) {
        const data = await response.json();
        const balance =
          typeof data.balance === 'number'
            ? ` (Saldo Akun: Rp ${data.balance.toLocaleString('id-ID')})`
            : '';
        return {
          success: true,
          message: `Koneksi ke Xendit XenInvoice API berhasil terhubung!${balance}`,
          details: data,
        };
      }

      const errData = await response.json().catch(() => ({ message: response.statusText }));
      return {
        success: false,
        message: `Koneksi Xendit gagal (HTTP ${response.status}): ${errData.message || 'Kredensial tidak valid'}`,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Gagal menghubungi server Xendit: ${error.message || String(error)}`,
      };
    }
  }

  return {
    success: false,
    message: `Provider '${provider}' tidak didukung.`,
  };
}

export const paymentService = {
  getStoreSettings,
  getPaymentSettings: getStoreSettings,
  saveStoreSettings,
  savePaymentSettings: saveStoreSettings,
  getAvailablePaymentMethods,
  createPaymentTransaction,
  handleWebhookNotification,
  testGatewayConnection,
};
