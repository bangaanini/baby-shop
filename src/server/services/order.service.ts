import { eq, and, or, ilike, inArray, desc, type SQL } from 'drizzle-orm';
import { db } from '@/db';
import {
  ordersTable,
  orderItemsTable,
  trackingHistoryTable,
  usersTable,
} from '@/db/schema';
import { Order, OrderItem, OrderStatus, TrackingStep } from '@/types/order';

function isValidUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

export function formatOrderDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return String(date);

  const day = String(d.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const month = months[d.getMonth()] || '';
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return `${day} ${month} ${year}, ${hours}:${minutes} WIB`;
}

export function formatCourierName(courierCode: string): string {
  const code = (courierCode || '').toLowerCase().trim();
  if (code.includes('sicepat')) return 'SiCepat Ekspres';
  if (code.includes('jne')) return 'JNE Express';
  if (code.includes('jnt') || code.includes('j&t')) return 'J&T Express';
  if (code.includes('anteraja')) return 'AnterAja';
  if (code.includes('gosend') || code.includes('go-send')) return 'GoSend';
  if (code.includes('grab')) return 'GrabExpress';
  return courierCode ? courierCode.toUpperCase() : 'Kurir Standar';
}

export function getStatusBadge(status: string): { label: string; color: string } {
  switch (status?.toLowerCase()) {
    case 'menunggu_pembayaran':
      return {
        label: 'Menunggu Pembayaran',
        color: 'bg-orange-100 text-orange-700 border-orange-200',
      };
    case 'diproses':
      return {
        label: 'Sedang Diproses Penjual',
        color: 'bg-amber-100 text-amber-700 border-amber-200',
      };
    case 'dikirim':
      return {
        label: 'Sedang Dikirim',
        color: 'bg-sky-100 text-sky-700 border-sky-200',
      };
    case 'selesai':
      return {
        label: 'Pesanan Selesai',
        color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      };
    case 'dibatalkan':
      return {
        label: 'Dibatalkan',
        color: 'bg-rose-100 text-rose-700 border-rose-200',
      };
    default:
      return {
        label: status || 'Status Tidak Diketahui',
        color: 'bg-slate-100 text-slate-700 border-slate-200',
      };
  }
}

export interface DetailedOrder extends Order {
  userId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

function formatOrderRecord(record: any): DetailedOrder {
  const badge = getStatusBadge(record.status);

  const items: OrderItem[] = (record.items || []).map((item: any) => ({
    id: item.id,
    productId: item.product_id || '',
    nama: item.product_name,
    slug:
      item.product?.slug ||
      item.product_name
        ?.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') ||
      '',
    gambar: item.image_url,
    warna: item.variant_color || '',
    ukuran: item.variant_size || '',
    harga: item.price,
    jumlah: item.quantity,
  }));

  const trackingTimeline: TrackingStep[] = (record.trackingHistory || []).map((th: any) => ({
    id: th.id,
    waktu: formatOrderDate(th.occurred_at),
    status: th.status_title,
    keterangan: th.description || '',
    lokasi: th.location || '',
    isPassed: true,
  }));

  return {
    id: record.id,
    nomorInvoice: record.invoice_number,
    tanggalPesanan: formatOrderDate(record.created_at),
    status: record.status as OrderStatus,
    statusLabel: badge.label,
    statusColor: badge.color,
    namaPenerima: record.recipient_name,
    teleponPenerima: record.recipient_phone,
    alamatLengkap: record.shipping_address,
    kurir: formatCourierName(record.courier_code),
    layananKurir: record.courier_service,
    nomorResi: record.tracking_number || undefined,
    metodePembayaran: record.payment_method,
    subtotal: record.subtotal,
    ongkir: record.shipping_cost,
    diskon: record.discount_amount,
    biayaLayanan: record.service_fee,
    totalBayar: record.total_amount,
    items,
    trackingTimeline,
    catatan: record.notes || undefined,
    userId: record.user_id,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

/**
 * Get list of orders with items, status badges, formatted totals.
 * Supports filter by status, search query, and user ID / email.
 */
export async function getUserOrders(
  userIdOrEmail?: string,
  statusFilter?: string,
  searchQuery?: string
): Promise<DetailedOrder[]> {
  const conditions: SQL[] = [];

  // 1. User filter
  if (userIdOrEmail && userIdOrEmail.trim() !== '' && userIdOrEmail.toLowerCase() !== 'all') {
    const trimmedUser = userIdOrEmail.trim();
    if (isValidUUID(trimmedUser)) {
      conditions.push(eq(ordersTable.user_id, trimmedUser));
    } else if (trimmedUser.includes('@')) {
      const user = await db.query.usersTable.findFirst({
        where: eq(usersTable.email, trimmedUser),
      });

      if (!user) {
        return [];
      }
      conditions.push(eq(ordersTable.user_id, user.id));
    }
  }

  // 2. Status filter
  if (statusFilter && statusFilter.trim() !== '' && statusFilter.toLowerCase() !== 'semua') {
    conditions.push(eq(ordersTable.status, statusFilter.trim().toLowerCase()));
  }

  // 3. Search query (invoice number or product name)
  if (searchQuery && searchQuery.trim() !== '') {
    const q = `%${searchQuery.trim()}%`;
    const matchingItemOrderIds = db
      .select({ orderId: orderItemsTable.order_id })
      .from(orderItemsTable)
      .where(ilike(orderItemsTable.product_name, q));

    conditions.push(
      or(
        ilike(ordersTable.invoice_number, q),
        inArray(ordersTable.id, matchingItemOrderIds)
      )!
    );
  }

  const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

  const orders = await db.query.ordersTable.findMany({
    where: whereCondition,
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

  return orders.map(formatOrderRecord);
}

/**
 * Get detailed order by ID or Invoice Number with items and full tracking timeline.
 */
export async function getOrderByIdOrInvoice(idOrInvoice: string): Promise<DetailedOrder | null> {
  if (!idOrInvoice || !idOrInvoice.trim()) {
    return null;
  }

  const identifier = idOrInvoice.trim();
  const isUuid = isValidUUID(identifier);

  const order = await db.query.ordersTable.findFirst({
    where: isUuid
      ? or(eq(ordersTable.id, identifier), eq(ordersTable.invoice_number, identifier))
      : eq(ordersTable.invoice_number, identifier),
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

  if (!order) {
    return null;
  }

  return formatOrderRecord(order);
}

/**
 * Confirm order received by buyer.
 * Updates order status to 'selesai' and inserts a tracking step.
 */
export async function confirmOrderReceived(orderIdOrInvoice: string): Promise<DetailedOrder> {
  if (!orderIdOrInvoice || !orderIdOrInvoice.trim()) {
    throw new Error('ID pesanan atau nomor invoice wajib diisi');
  }

  const identifier = orderIdOrInvoice.trim();
  const isUuid = isValidUUID(identifier);

  // 1. Check order existence
  const existingOrder = await db.query.ordersTable.findFirst({
    where: isUuid
      ? or(eq(ordersTable.id, identifier), eq(ordersTable.invoice_number, identifier))
      : eq(ordersTable.invoice_number, identifier),
  });

  if (!existingOrder) {
    throw new Error(`Pesanan "${identifier}" tidak ditemukan`);
  }

  if (existingOrder.status === 'selesai') {
    // Already completed, return current order details
    const current = await getOrderByIdOrInvoice(existingOrder.id);
    if (!current) throw new Error('Pesanan tidak ditemukan');
    return current;
  }

  if (existingOrder.status === 'dibatalkan') {
    throw new Error('Pesanan yang telah dibatalkan tidak dapat dikonfirmasi selesai');
  }

  const now = new Date();

  // 2. Perform transaction: update order status & add tracking entry
  await db.transaction(async (tx) => {
    await tx
      .update(ordersTable)
      .set({
        status: 'selesai',
        updated_at: now,
      })
      .where(eq(ordersTable.id, existingOrder.id));

    await tx.insert(trackingHistoryTable).values({
      order_id: existingOrder.id,
      status_title: 'Konfirmasi Terima Pembeli',
      description: 'Pembeli telah mengonfirmasi bahwa pesanan telah diterima dengan baik.',
      location: 'Alamat Pembeli',
      occurred_at: now,
    });
  });

  // 3. Fetch and return updated order
  const updatedOrder = await getOrderByIdOrInvoice(existingOrder.id);
  if (!updatedOrder) {
    throw new Error('Gagal memuat data pesanan setelah konfirmasi');
  }

  return updatedOrder;
}

export const orderService = {
  getUserOrders,
  getOrderByIdOrInvoice,
  confirmOrderReceived,
  formatOrderDate,
  formatCourierName,
  getStatusBadge,
};
