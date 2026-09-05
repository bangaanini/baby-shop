import { eq, ne, and, or, ilike, inArray, desc, asc, count, sum, lte, gte, sql, type SQL } from 'drizzle-orm';
import { db } from '@/db';
import {
  categoriesTable,
  productsTable,
  productVariantsTable,
  productImagesTable,
  ordersTable,
  orderItemsTable,
  trackingHistoryTable,
  usersTable,
} from '@/db/schema';
import { OrderStatus } from '@/types/order';
import {
  AdminProductInput,
  AdminOrderFilterInput,
} from '@/server/validators/admin.schema';
import {
  formatOrderRecord,
  getOrderByIdOrInvoice,
  DetailedOrder,
} from './order.service';

/**
 * Restore stock for every line-item of an order. Handles both variant and non-variant
 * lines. Must be called inside a db.transaction(tx => ...) context so all writes are atomic.
 * Exported so sibling services (e.g. payment.service) can reuse without circular imports —
 * callers may also inline the same loop.
 */
export async function restoreStockForOrder(tx: any, orderId: string): Promise<void> {
  const items = await tx.select().from(orderItemsTable).where(eq(orderItemsTable.order_id, orderId));
  for (const it of items) {
    if ((it as any).variant_id) {
      await tx
        .update(productVariantsTable)
        .set({ stock: sql`${productVariantsTable.stock} + ${(it as any).quantity}` })
        .where(eq(productVariantsTable.id, (it as any).variant_id));
    } else if ((it as any).product_id) {
      await tx
        .update(productsTable)
        .set({
          stock: sql`${productsTable.stock} + ${(it as any).quantity}`,
          sold_count: sql`GREATEST(0, ${productsTable.sold_count} - ${(it as any).quantity})`,
          updated_at: new Date(),
        })
        .where(eq(productsTable.id, (it as any).product_id));
    }
  }
}

function isValidUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  ordersByStatus: Record<string, number>;
  totalProducts: number;
  totalStock: number;
  lowStockCount: number;
  averageRating: number;
  completedTodayCount: number;
  recentOrders: DetailedOrder[];
}

export interface DailySalesPoint {
  date: string;
  label: string;
  fullDate: string;
  revenue: number;
  orders: number;
  percentage: number;
}

export interface CategorySalesBreakdown {
  id: string;
  name: string;
  slug: string;
  revenue: number;
  ordersCount: number;
  percentage: number;
  productCount: number;
  color: string;
  badgeBg: string;
}

export interface SalesAnalyticsResult {
  dailySales: DailySalesPoint[];
  categorySales: CategorySalesBreakdown[];
  totalPeriodRevenue: number;
  totalPeriodOrders: number;
  completedPeriodOrders: number;
  cancelledPeriodOrders: number;
  aov: number;
  completionRate: number;
}

export interface AdminOrdersResult {
  items: DetailedOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Get aggregated statistics for the admin dashboard.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  // 1. Total sales from non-cancelled orders
  const [salesResult] = await db
    .select({
      totalSales: sum(ordersTable.total_amount),
    })
    .from(ordersTable)
    .where(ne(ordersTable.status, 'dibatalkan'));
  const totalSales = Number(salesResult?.totalSales) || 0;

  // 2. Total orders count
  const [ordersCountResult] = await db
    .select({ totalOrders: count() })
    .from(ordersTable);
  const totalOrders = Number(ordersCountResult?.totalOrders) || 0;

  // 3. Orders count grouped by status
  const statusGroup = await db
    .select({
      status: ordersTable.status,
      count: count(),
    })
    .from(ordersTable)
    .groupBy(ordersTable.status);

  const ordersByStatus: Record<string, number> = {
    menunggu_pembayaran: 0,
    diproses: 0,
    dikirim: 0,
    selesai: 0,
    dibatalkan: 0,
  };

  for (const row of statusGroup) {
    if (row.status) {
      ordersByStatus[row.status] = Number(row.count) || 0;
    }
  }

  // 4. Total products count
  const [productsCountResult] = await db
    .select({ totalProducts: count() })
    .from(productsTable);
  const totalProducts = Number(productsCountResult?.totalProducts) || 0;

  // 5. Total stock sum
  const [stockResult] = await db
    .select({ totalStock: sum(productsTable.stock) })
    .from(productsTable);
  const totalStock = Number(stockResult?.totalStock) || 0;

  // 6. Low stock products (stock <= 5)
  const [lowStockResult] = await db
    .select({ lowStockCount: count() })
    .from(productsTable)
    .where(lte(productsTable.stock, 5));
  const lowStockCount = Number(lowStockResult?.lowStockCount) || 0;

  // 7. Average store rating
  const [ratingResult] = await db
    .select({
      avgRating: sql<number>`COALESCE(AVG(CAST(${productsTable.rating} AS NUMERIC)), 5.0)`,
    })
    .from(productsTable);
  const averageRating = Number(Number(ratingResult?.avgRating || 5.0).toFixed(1));

  // 8. Orders completed today
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const [completedTodayResult] = await db
    .select({ count: count() })
    .from(ordersTable)
    .where(
      and(
        eq(ordersTable.status, 'selesai'),
        gte(ordersTable.updated_at, todayStart)
      )
    );
  const completedTodayCount = Number(completedTodayResult?.count) || ordersByStatus.selesai || 0;

  // 9. Recent 5 orders with items & tracking
  const recentOrderRecords = await db.query.ordersTable.findMany({
    orderBy: [desc(ordersTable.created_at)],
    limit: 5,
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

  const recentOrders = recentOrderRecords.map(formatOrderRecord);

  return {
    totalSales,
    totalOrders,
    ordersByStatus,
    totalProducts,
    totalStock,
    lowStockCount,
    averageRating,
    completedTodayCount,
    recentOrders,
  };
}

/**
 * Get real sales analytics data for /admin/statistik derived from database orders.
 */
export async function getSalesAnalytics(days: number = 7): Promise<SalesAnalyticsResult> {
  const now = new Date();
  const startDate = new Date();
  startDate.setDate(now.getDate() - (days - 1));
  startDate.setHours(0, 0, 0, 0);

  // 1. Fetch non-cancelled orders within the period
  const orders = await db.query.ordersTable.findMany({
    where: gte(ordersTable.created_at, startDate),
    with: {
      items: {
        with: {
          product: {
            with: {
              category: true,
            },
          },
        },
      },
    },
    orderBy: [asc(ordersTable.created_at)],
  });

  const validOrders = orders.filter((o) => o.status !== 'dibatalkan');
  const completedOrders = orders.filter((o) => o.status === 'selesai');
  const cancelledOrders = orders.filter((o) => o.status === 'dibatalkan');

  const totalPeriodRevenue = validOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const totalPeriodOrders = validOrders.length;
  const aov = totalPeriodOrders > 0 ? Math.round(totalPeriodRevenue / totalPeriodOrders) : 0;
  const completionRate =
    orders.length > 0
      ? Math.round(((orders.length - cancelledOrders.length) / orders.length) * 100)
      : 100;

  // 2. Generate daily buckets for the period
  const dayBuckets = new Map<string, { label: string; fullDate: string; revenue: number; orders: number }>();

  for (let i = 0; i < days; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const dateKey = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
    const fullDate = d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    dayBuckets.set(dateKey, {
      label,
      fullDate,
      revenue: 0,
      orders: 0,
    });
  }

  // Populate buckets with real orders
  for (const ord of validOrders) {
    if (ord.created_at) {
      const ordKey = new Date(ord.created_at).toISOString().split('T')[0];
      const bucket = dayBuckets.get(ordKey);
      if (bucket) {
        bucket.revenue += ord.total_amount || 0;
        bucket.orders += 1;
      }
    }
  }

  const dailySales: DailySalesPoint[] = Array.from(dayBuckets.entries()).map(([dateKey, b]) => {
    const percentage = totalPeriodRevenue > 0 ? Math.round((b.revenue / totalPeriodRevenue) * 100) : 0;
    return {
      date: dateKey,
      label: b.label,
      fullDate: b.fullDate,
      revenue: b.revenue,
      orders: b.orders,
      percentage,
    };
  });

  // 3. Compute real category breakdown from database
  const categoryMap = new Map<string, { id: string; name: string; slug: string; revenue: number; ordersCount: number; productCount: number }>();

  const allCategories = await db.query.categoriesTable.findMany({
    with: {
      products: true,
    },
  });

  for (const cat of allCategories) {
    categoryMap.set(cat.id, {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      revenue: 0,
      ordersCount: 0,
      productCount: cat.products?.length || 0,
    });
  }

  // Accumulate from real order items
  for (const ord of validOrders) {
    for (const it of ord.items || []) {
      const catId = it.product?.category_id;
      if (catId && categoryMap.has(catId)) {
        const catObj = categoryMap.get(catId)!;
        catObj.revenue += it.price * it.quantity;
        catObj.ordersCount += it.quantity;
      }
    }
  }

  const colorPalette = [
    { color: 'bg-rose-500', badgeBg: 'bg-rose-50 text-rose-700 border-rose-200' },
    { color: 'bg-amber-500', badgeBg: 'bg-amber-50 text-amber-700 border-amber-200' },
    { color: 'bg-sky-500', badgeBg: 'bg-sky-50 text-sky-700 border-sky-200' },
    { color: 'bg-purple-500', badgeBg: 'bg-purple-50 text-purple-700 border-purple-200' },
  ];

  let colorIdx = 0;
  const categorySales: CategorySalesBreakdown[] = Array.from(categoryMap.values()).map((c) => {
    const pal = colorPalette[colorIdx % colorPalette.length];
    colorIdx++;
    const percentage = totalPeriodRevenue > 0 ? Math.round((c.revenue / totalPeriodRevenue) * 100) : 0;
    return {
      ...c,
      percentage,
      color: pal.color,
      badgeBg: pal.badgeBg,
    };
  });

  return {
    dailySales,
    categorySales,
    totalPeriodRevenue,
    totalPeriodOrders,
    completedPeriodOrders: completedOrders.length,
    cancelledPeriodOrders: cancelledOrders.length,
    aov,
    completionRate,
  };
}

/**
 * Get all orders with filtering, searching, and pagination for admin.
 */
export async function getAllOrders(filters: Partial<AdminOrderFilterInput> = {}): Promise<AdminOrdersResult> {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;
  const offset = (page - 1) * limit;

  const conditions: SQL[] = [];

  if (filters.status && filters.status !== 'semua') {
    if (filters.status === 'perlu_diproses') {
      conditions.push(
        or(
          eq(ordersTable.status, 'menunggu_pembayaran'),
          eq(ordersTable.status, 'diproses')
        )!
      );
    } else if (filters.status.includes(',')) {
      const statuses = filters.status.split(',').map((s) => s.trim());
      conditions.push(inArray(ordersTable.status, statuses));
    } else {
      conditions.push(eq(ordersTable.status, filters.status));
    }
  }

  if (filters.userId) {
    if (isValidUUID(filters.userId)) {
      conditions.push(eq(ordersTable.user_id, filters.userId));
    } else {
      const user = await db.query.usersTable.findFirst({
        where: eq(usersTable.email, filters.userId),
      });
      if (user) {
        conditions.push(eq(ordersTable.user_id, user.id));
      }
    }
  }

  if (filters.q && filters.q.trim()) {
    const qTerm = `%${filters.q.trim()}%`;

    const matchingItemOrderIds = db
      .select({ orderId: orderItemsTable.order_id })
      .from(orderItemsTable)
      .where(ilike(orderItemsTable.product_name, qTerm));

    conditions.push(
      or(
        ilike(ordersTable.invoice_number, qTerm),
        ilike(ordersTable.recipient_name, qTerm),
        ilike(ordersTable.recipient_phone, qTerm),
        ilike(ordersTable.shipping_address, qTerm),
        ilike(ordersTable.tracking_number, qTerm),
        inArray(ordersTable.id, matchingItemOrderIds)
      )!
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Count total matching orders
  const [{ totalCount }] = await db
    .select({ totalCount: count() })
    .from(ordersTable)
    .where(whereClause);

  const total = Number(totalCount) || 0;
  const totalPages = Math.ceil(total / limit);

  const orderRecords = await db.query.ordersTable.findMany({
    where: whereClause,
    orderBy: [desc(ordersTable.created_at)],
    limit,
    offset,
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

  const items = orderRecords.map(formatOrderRecord);

  return {
    items,
    total,
    page,
    limit,
    totalPages,
  };
}

/**
 * Update order status and append corresponding tracking timeline entry.
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  trackingNumber?: string | null,
  notes?: string | null
): Promise<DetailedOrder> {
  if (!orderId || !orderId.trim()) {
    throw new Error('ID pesanan atau nomor invoice wajib diisi');
  }

  const trimmed = orderId.trim();

  // Find existing order
  let existingOrder = null;
  if (isValidUUID(trimmed)) {
    existingOrder = await db.query.ordersTable.findFirst({
      where: eq(ordersTable.id, trimmed),
    });
  }

  if (!existingOrder) {
    existingOrder = await db.query.ordersTable.findFirst({
      where: eq(ordersTable.invoice_number, trimmed),
    });
  }

  if (!existingOrder) {
    throw new Error(`Pesanan "${orderId}" tidak ditemukan`);
  }

  const now = new Date();
  const effectiveTrackingNumber = trackingNumber !== undefined
    ? (trackingNumber && trackingNumber.trim() ? trackingNumber.trim() : null)
    : existingOrder.tracking_number;

  const effectiveNotes = notes !== undefined
    ? (notes && notes.trim() ? notes.trim() : null)
    : existingOrder.notes;

  // Idempotency guard: don't double-restore stock if already cancelled.
  if (status === 'dibatalkan' && existingOrder.status === 'dibatalkan') {
    const existing = await getOrderByIdOrInvoice(existingOrder.id);
    if (!existing) throw new Error('Gagal memuat data pesanan setelah diperbarui');
    return existing;
  }

  // Resolve tracking event upfront so it can be inserted inside the transaction
  let trackingEvent: {
    status_title: string;
    description: string;
    location: string;
  } | null = null;

  switch (status) {
    case 'diproses':
      trackingEvent = {
        status_title: 'Pesanan Sedang Diproses Penjual',
        description: 'Penjual sedang menyiapkan dan mengemas barang pesanan.',
        location: 'Toko NBusiness',
      };
      break;
    case 'dikirim':
      trackingEvent = {
        status_title: 'Paket Telah Dikirim oleh Toko',
        description: effectiveTrackingNumber
          ? `Paket telah diserahkan ke pihak kurir dengan nomor resi ${effectiveTrackingNumber}.`
          : 'Paket telah diserahkan kepada pihak kurir dan dalam proses pengiriman.',
        location: 'Gudang Pusat / Drop Point',
      };
      break;
    case 'selesai':
      trackingEvent = {
        status_title: 'Pesanan Selesai',
        description: 'Pesanan telah berhasil diselesaikan dan diterima dengan baik.',
        location: 'Alamat Pembeli',
      };
      break;
    case 'dibatalkan':
      trackingEvent = {
        status_title: 'Pesanan Dibatalkan',
        description: effectiveNotes || 'Pesanan telah dibatalkan oleh pihak toko / pembeli.',
        location: 'Sistem Toko',
      };
      break;
    case 'menunggu_pembayaran':
      trackingEvent = {
        status_title: 'Menunggu Pembayaran',
        description: 'Pesanan telah dibuat dan menunggu pembayaran dari pembeli.',
        location: 'Sistem Pembayaran',
      };
      break;
  }

  // Wrap cancellation stock-restore + status update + tracking in one transaction.
  // Non-cancellation status updates are also done inside the transaction for consistency.
  await db.transaction(async (tx) => {
    if (status === 'dibatalkan') {
      await restoreStockForOrder(tx, existingOrder.id);
    }

    await tx
      .update(ordersTable)
      .set({
        status,
        tracking_number: effectiveTrackingNumber,
        notes: effectiveNotes,
        updated_at: now,
      })
      .where(eq(ordersTable.id, existingOrder.id));

    if (trackingEvent) {
      await tx.insert(trackingHistoryTable).values({
        order_id: existingOrder.id,
        status_title: trackingEvent!.status_title,
        description: trackingEvent!.description,
        location: trackingEvent!.location,
        occurred_at: now,
      });
    }
  });

  const updated = await getOrderByIdOrInvoice(existingOrder.id);
  if (!updated) {
    throw new Error('Gagal memuat data pesanan setelah diperbarui');
  }

  return updated;
}

/**
 * Create a new product with category verification, slug generation, variants, and gallery images.
 */
export async function createProduct(payload: AdminProductInput) {
  // 1. Verify category exists
  let categoryId = payload.categoryId;
  if (!isValidUUID(categoryId)) {
    const foundCat = await db.query.categoriesTable.findFirst({
      where: eq(categoriesTable.slug, categoryId),
    });
    if (!foundCat) {
      throw new Error(`Kategori "${payload.categoryId}" tidak ditemukan`);
    }
    categoryId = foundCat.id;
  } else {
    const foundCat = await db.query.categoriesTable.findFirst({
      where: eq(categoriesTable.id, categoryId),
    });
    if (!foundCat) {
      throw new Error(`Kategori dengan ID "${payload.categoryId}" tidak ditemukan`);
    }
  }

  // 2. Generate slug if not provided or ensure uniqueness
  let baseSlug = payload.slug && payload.slug.trim()
    ? slugify(payload.slug)
    : slugify(payload.name);

  if (!baseSlug) {
    baseSlug = `product-${Date.now()}`;
  }

  let finalSlug = baseSlug;
  const existingWithSlug = await db.query.productsTable.findFirst({
    where: eq(productsTable.slug, finalSlug),
  });

  if (existingWithSlug) {
    finalSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
  }

  // 3. Calculate discount percent
  let discountPercent: number | null = null;
  if (payload.originalPrice && payload.originalPrice > payload.price) {
    discountPercent = Math.round(
      ((payload.originalPrice - payload.price) / payload.originalPrice) * 100
    );
  }

  // 4. Calculate total stock if variants provided
  let calculatedStock = payload.stock;
  if (payload.variants && payload.variants.length > 0) {
    const variantStockSum = payload.variants.reduce((acc, v) => acc + (v.stock || 0), 0);
    if (variantStockSum > 0) {
      calculatedStock = variantStockSum;
    }
  }

  // 5. Insert product into database
  const [newProduct] = await db
    .insert(productsTable)
    .values({
      category_id: categoryId,
      name: payload.name.trim(),
      slug: finalSlug,
      description: payload.description?.trim() || null,
      price: payload.price,
      original_price: payload.originalPrice || null,
      discount_percent: discountPercent,
      stock: calculatedStock,
      material: payload.material?.trim() || null,
      suitable_age: payload.suitableAge?.trim() || null,
      image_url: payload.imageUrl.trim(),
      is_popular: Boolean(payload.isPopular),
      is_new_arrival: Boolean(payload.isNewArrival),
      is_recommended: Boolean(payload.isRecommended),
      is_promo: Boolean(payload.isPromo),
      tag: payload.tag?.trim() || null,
      weight_gram: payload.weightGram !== undefined ? payload.weightGram : 500,
      dimension_length: payload.dimensionLength !== undefined ? payload.dimensionLength : 10,
      dimension_width: payload.dimensionWidth !== undefined ? payload.dimensionWidth : 10,
      dimension_height: payload.dimensionHeight !== undefined ? payload.dimensionHeight : 10,
    })
    .returning();

  // 6. Insert variants if any
  if (payload.variants && payload.variants.length > 0) {
    for (const v of payload.variants) {
      await db.insert(productVariantsTable).values({
        product_id: newProduct.id,
        color: v.color?.trim() || null,
        size: v.size?.trim() || null,
        stock: v.stock || 0,
        additional_price: v.additionalPrice || 0,
      });
    }
  }

  // 7. Insert gallery images or primary image
  if (payload.images && payload.images.length > 0) {
    let order = 0;
    for (const img of payload.images) {
      await db.insert(productImagesTable).values({
        product_id: newProduct.id,
        url: img.url.trim(),
        alt_text: img.altText?.trim() || payload.name,
        sort_order: img.sortOrder ?? order++,
      });
    }
  } else if (payload.imageUrl) {
    await db.insert(productImagesTable).values({
      product_id: newProduct.id,
      url: payload.imageUrl.trim(),
      alt_text: payload.name,
      sort_order: 0,
    });
  }

  // 8. Fetch complete product details
  const createdProduct = await db.query.productsTable.findFirst({
    where: eq(productsTable.id, newProduct.id),
    with: {
      category: true,
      variants: true,
      images: {
        orderBy: (images, { asc }) => [asc(images.sort_order)],
      },
    },
  });

  return createdProduct;
}

/**
 * Update an existing product and its variants/images.
 */
export async function updateProduct(id: string, payload: Partial<AdminProductInput>) {
  if (!id || !id.trim()) {
    throw new Error('ID produk wajib diisi');
  }

  const trimmedId = id.trim();

  // 1. Find existing product
  let existingProduct = null;
  if (isValidUUID(trimmedId)) {
    existingProduct = await db.query.productsTable.findFirst({
      where: eq(productsTable.id, trimmedId),
    });
  }

  if (!existingProduct) {
    existingProduct = await db.query.productsTable.findFirst({
      where: eq(productsTable.slug, trimmedId),
    });
  }

  if (!existingProduct) {
    throw new Error(`Produk "${id}" tidak ditemukan`);
  }

  const productId = existingProduct.id;

  // 2. Validate category if provided
  let categoryId = existingProduct.category_id;
  if (payload.categoryId) {
    if (!isValidUUID(payload.categoryId)) {
      const foundCat = await db.query.categoriesTable.findFirst({
        where: eq(categoriesTable.slug, payload.categoryId),
      });
      if (!foundCat) {
        throw new Error(`Kategori "${payload.categoryId}" tidak ditemukan`);
      }
      categoryId = foundCat.id;
    } else {
      const foundCat = await db.query.categoriesTable.findFirst({
        where: eq(categoriesTable.id, payload.categoryId),
      });
      if (!foundCat) {
        throw new Error(`Kategori dengan ID "${payload.categoryId}" tidak ditemukan`);
      }
      categoryId = foundCat.id;
    }
  }

  // 3. Handle slug updates
  let finalSlug = existingProduct.slug;
  if (payload.slug && payload.slug.trim()) {
    const candidateSlug = slugify(payload.slug);
    if (candidateSlug !== existingProduct.slug) {
      const existingWithSlug = await db.query.productsTable.findFirst({
        where: and(eq(productsTable.slug, candidateSlug), ne(productsTable.id, productId)),
      });
      if (existingWithSlug) {
        finalSlug = `${candidateSlug}-${Date.now().toString().slice(-4)}`;
      } else {
        finalSlug = candidateSlug;
      }
    }
  }

  // 4. Calculate discount percent
  const price = payload.price !== undefined ? payload.price : existingProduct.price;
  const originalPrice = payload.originalPrice !== undefined
    ? payload.originalPrice
    : existingProduct.original_price;

  let discountPercent: number | null = null;
  if (originalPrice && originalPrice > price) {
    discountPercent = Math.round(((originalPrice - price) / originalPrice) * 100);
  }

  // 5. Calculate stock
  let finalStock = payload.stock !== undefined ? payload.stock : existingProduct.stock;
  if (payload.variants && payload.variants.length > 0) {
    const variantStockSum = payload.variants.reduce((acc, v) => acc + (v.stock || 0), 0);
    if (variantStockSum > 0) {
      finalStock = variantStockSum;
    }
  }

  // 6. Update product table
  await db
    .update(productsTable)
    .set({
      category_id: categoryId,
      name: payload.name !== undefined ? payload.name.trim() : existingProduct.name,
      slug: finalSlug,
      description: payload.description !== undefined ? (payload.description?.trim() || null) : existingProduct.description,
      price,
      original_price: originalPrice,
      discount_percent: discountPercent,
      stock: finalStock,
      material: payload.material !== undefined ? (payload.material?.trim() || null) : existingProduct.material,
      suitable_age: payload.suitableAge !== undefined ? (payload.suitableAge?.trim() || null) : existingProduct.suitable_age,
      image_url: payload.imageUrl !== undefined ? payload.imageUrl.trim() : existingProduct.image_url,
      is_popular: payload.isPopular !== undefined ? Boolean(payload.isPopular) : existingProduct.is_popular,
      is_new_arrival: payload.isNewArrival !== undefined ? Boolean(payload.isNewArrival) : existingProduct.is_new_arrival,
      is_recommended: payload.isRecommended !== undefined ? Boolean(payload.isRecommended) : existingProduct.is_recommended,
      is_promo: payload.isPromo !== undefined ? Boolean(payload.isPromo) : existingProduct.is_promo,
      tag: payload.tag !== undefined ? (payload.tag?.trim() || null) : existingProduct.tag,
      weight_gram: payload.weightGram !== undefined ? payload.weightGram : existingProduct.weight_gram,
      dimension_length: payload.dimensionLength !== undefined ? payload.dimensionLength : existingProduct.dimension_length,
      dimension_width: payload.dimensionWidth !== undefined ? payload.dimensionWidth : existingProduct.dimension_width,
      dimension_height: payload.dimensionHeight !== undefined ? payload.dimensionHeight : existingProduct.dimension_height,
      updated_at: new Date(),
    })
    .where(eq(productsTable.id, productId));

  // 7. Update variants if provided
  if (payload.variants !== undefined) {
    await db.delete(productVariantsTable).where(eq(productVariantsTable.product_id, productId));

    if (payload.variants.length > 0) {
      for (const v of payload.variants) {
        await db.insert(productVariantsTable).values({
          product_id: productId,
          color: v.color?.trim() || null,
          size: v.size?.trim() || null,
          stock: v.stock || 0,
          additional_price: v.additionalPrice || 0,
        });
      }
    }
  }

  // 8. Update images if provided
  if (payload.images !== undefined) {
    await db.delete(productImagesTable).where(eq(productImagesTable.product_id, productId));

    if (payload.images.length > 0) {
      let order = 0;
      for (const img of payload.images) {
        await db.insert(productImagesTable).values({
          product_id: productId,
          url: img.url.trim(),
          alt_text: img.altText?.trim() || existingProduct.name,
          sort_order: img.sortOrder ?? order++,
        });
      }
    }
  } else if (payload.imageUrl && payload.imageUrl !== existingProduct.image_url) {
    const existingImages = await db.query.productImagesTable.findMany({
      where: eq(productImagesTable.product_id, productId),
    });
    if (existingImages.length === 0) {
      await db.insert(productImagesTable).values({
        product_id: productId,
        url: payload.imageUrl.trim(),
        alt_text: existingProduct.name,
        sort_order: 0,
      });
    } else {
      await db
        .update(productImagesTable)
        .set({ url: payload.imageUrl.trim() })
        .where(
          and(
            eq(productImagesTable.product_id, productId),
            eq(productImagesTable.sort_order, 0)
          )
        );
    }
  }

  // 9. Return updated product
  const updatedProduct = await db.query.productsTable.findFirst({
    where: eq(productsTable.id, productId),
    with: {
      category: true,
      variants: true,
      images: {
        orderBy: (images, { asc }) => [asc(images.sort_order)],
      },
    },
  });

  return updatedProduct;
}

/**
 * Delete a product and its associated variants and images.
 */
export async function deleteProduct(id: string) {
  if (!id || !id.trim()) {
    throw new Error('ID produk wajib diisi');
  }

  const trimmedId = id.trim();

  let existingProduct = null;
  if (isValidUUID(trimmedId)) {
    existingProduct = await db.query.productsTable.findFirst({
      where: eq(productsTable.id, trimmedId),
    });
  }

  if (!existingProduct) {
    existingProduct = await db.query.productsTable.findFirst({
      where: eq(productsTable.slug, trimmedId),
    });
  }

  if (!existingProduct) {
    throw new Error(`Produk "${id}" tidak ditemukan`);
  }

  await db.delete(productsTable).where(eq(productsTable.id, existingProduct.id));

  return {
    success: true,
    id: existingProduct.id,
    name: existingProduct.name,
    message: `Produk "${existingProduct.name}" berhasil dihapus`,
  };
}

export const adminService = {
  getDashboardStats,
  getSalesAnalytics,
  getAllOrders,
  updateOrderStatus,
  createProduct,
  updateProduct,
  deleteProduct,
};
