import { eq, and, sql } from 'drizzle-orm';
import { db } from '@/db';
import {
  ordersTable,
  orderItemsTable,
  trackingHistoryTable,
  productsTable,
  productVariantsTable,
  cartItemsTable,
  cartsTable,
  usersTable,
} from '@/db/schema';
import {
  CheckoutItemInput,
  CalculateCheckoutInput,
  CreateOrderInput,
} from '@/server/validators/checkout.schema';
import { calculateRates } from '@/server/services/shipping.service';
import { ShippingRateOption } from '@/server/validators/shipping.schema';
import {
  paymentService,
  PaymentTransactionResult,
} from '@/server/services/payment.service';

function isValidUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

function estimateWeightGram(productName: string, categorySlug?: string): number {
  const lower = productName.toLowerCase();
  if (lower.includes('stroller') || lower.includes('car seat') || lower.includes('kursi')) return 5000;
  if (lower.includes('baby carrier') || lower.includes('gendongan')) return 800;
  if (lower.includes('mainan') || lower.includes('balok') || lower.includes('puzzle') || lower.includes('edukasi')) return 1000;
  if (lower.includes('botol') || lower.includes('makan') || lower.includes('alat makan') || lower.includes('feeding')) return 400;
  if (lower.includes('piyama') || lower.includes('baju') || lower.includes('jumper') || lower.includes('kaos') || lower.includes('setelan')) return 250;
  if (categorySlug === 'perlengkapan') return 1500;
  if (categorySlug === 'mainan') return 800;
  if (categorySlug === 'pakaian') return 250;
  return 500;
}

export function getCourierRate(courierCode: string, courierService?: string | null): number {
  const code = (courierCode || '').toLowerCase().trim();
  const service = (courierService || '').toLowerCase().trim();

  if (code.includes('sicepat')) {
    if (service.includes('cargo') || service.includes('gokil')) return 35000;
    return 22000;
  }
  if (code.includes('jne')) {
    if (service.includes('yes') || service.includes('express')) return 34000;
    return 24000;
  }
  if (code.includes('jnt') || code.includes('j&t')) {
    return 23000;
  }
  if (code.includes('anteraja')) {
    if (service.includes('next') || service.includes('sameday')) return 38000;
    return 20000;
  }
  if (code.includes('pos')) {
    return 20000;
  }
  if (code.includes('tiki')) {
    return 22000;
  }
  return 22000;
}

export function calculateVoucherDiscount(
  voucherCode?: string | null,
  subtotal: number = 0
): { discountAmount: number; isValid: boolean; message?: string } {
  if (!voucherCode || !voucherCode.trim()) {
    return { discountAmount: 0, isValid: false };
  }

  const code = voucherCode.trim().toUpperCase();
  const validVouchers = ['ANAKHEMAT', 'BABY20', 'HEMAT20', 'PROMO20', 'DISKON20', 'NEWBORN'];

  if (validVouchers.includes(code)) {
    const discount = Math.min(20000, subtotal);
    return {
      discountAmount: discount,
      isValid: true,
      message: 'Voucher diskon Rp 20.000 berhasil diterapkan',
    };
  }

  return {
    discountAmount: 0,
    isValid: false,
    message: 'Kode voucher tidak valid atau sudah tidak berlaku',
  };
}

function extractAddressDetails(
  shippingAddress?: string | null,
  explicitPostalCode?: string | number | null,
  explicitCity?: string | null,
  explicitProvince?: string | null,
  explicitDistrict?: string | null
): {
  postalCode?: string;
  city?: string;
  province?: string;
  district?: string;
} {
  let postalCode =
    explicitPostalCode !== undefined && explicitPostalCode !== null
      ? String(explicitPostalCode).trim()
      : undefined;
  let city = explicitCity?.trim() || undefined;
  let province = explicitProvince?.trim() || undefined;
  let district = explicitDistrict?.trim() || undefined;

  if (!postalCode && shippingAddress) {
    const postalMatch = shippingAddress.match(/\b\d{5}\b/);
    if (postalMatch) {
      postalCode = postalMatch[0];
    }
  }

  if (!city && shippingAddress) {
    const lower = shippingAddress.toLowerCase();
    const cityKeywords = [
      'jakarta selatan',
      'jakarta timur',
      'jakarta barat',
      'jakarta pusat',
      'jakarta utara',
      'bogor',
      'depok',
      'tangerang selatan',
      'tangerang',
      'bekasi',
      'bandung',
      'surabaya',
      'semarang',
      'yogyakarta',
      'jogja',
      'solo',
      'surakarta',
      'malang',
      'medan',
      'denpasar',
      'makassar',
      'palembang',
      'pekanbaru',
      'batam',
      'padang',
      'lampung',
      'banjarmasin',
      'pontianak',
      'samarinda',
      'balikpapan',
      'manado',
    ];
    for (const kw of cityKeywords) {
      if (lower.includes(kw)) {
        city = kw;
        break;
      }
    }
  }

  return { postalCode, city, province, district };
}

function findMatchingRate(
  rates: ShippingRateOption[],
  courierCode: string,
  courierService?: string | null
): ShippingRateOption | undefined {
  if (!rates || rates.length === 0) return undefined;

  const cCode = (courierCode || '').toLowerCase().trim();
  const cService = (courierService || '').toLowerCase().trim();

  // 1. Filter by courier code
  const courierRates = rates.filter(
    (r) =>
      r.courierCode.toLowerCase() === cCode ||
      r.courierCode.toLowerCase().includes(cCode) ||
      cCode.includes(r.courierCode.toLowerCase())
  );

  const candidateRates = courierRates.length > 0 ? courierRates : rates;

  // 2. If courierService provided, match service
  if (cService) {
    const exactMatch = candidateRates.find(
      (r) =>
        r.serviceCode.toLowerCase() === cService ||
        r.serviceName.toLowerCase() === cService
    );
    if (exactMatch) return exactMatch;

    const partialMatch = candidateRates.find(
      (r) =>
        r.serviceCode.toLowerCase().includes(cService) ||
        cService.includes(r.serviceCode.toLowerCase()) ||
        r.serviceName.toLowerCase().includes(cService) ||
        cService.includes(r.serviceName.toLowerCase())
    );
    if (partialMatch) return partialMatch;
  }

  return candidateRates[0];
}

export interface CalculatedItem {
  productId: string;
  variantId: string | null;
  productName: string;
  variantColor?: string | null;
  variantSize?: string | null;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
  itemSubtotal: number;
  unitWeightGram: number;
  totalWeightGram: number;
  dimensionLength?: number;
  dimensionWidth?: number;
  dimensionHeight?: number;
  volumeWeightGram?: number;
  availableStock: number;
}

export interface CheckoutCalculationResult {
  items: CalculatedItem[];
  totalItems: number;
  subtotalProduk: number;
  totalBeratGram: number;
  totalWeightGram?: number;
  totalVolumeWeightGram?: number;
  totalBeratKg: number;
  chargeableWeightKg?: number;
  courierCode: string;
  courierService?: string | null;
  courierRatePerKg: number;
  ongkir: number;
  voucherCode?: string | null;
  diskonVoucher: number;
  voucherMessage?: string;
  biayaLayanan: number;
  totalBayar: number;
}

export interface CreatedOrderResult {
  orderId: string;
  invoiceNumber: string;
  totalBayar: number;
  status: string;
  paymentMethod: string;
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  serviceFee: number;
  recipientName: string;
  recipientPhone: string;
  shippingAddress: string;
  courierCode: string;
  courierService: string;
  createdAt: Date;
  paymentTransaction?: PaymentTransactionResult;
}

/**
 * Calculate checkout costs, weights, courier rates, voucher discounts, and grand total.
 */
export async function calculateOrder(
  input: CalculateCheckoutInput
): Promise<CheckoutCalculationResult> {
  const { items, courierCode, courierService, voucherCode } = input;

  if (!items || items.length === 0) {
    throw new Error('Daftar item checkout tidak boleh kosong');
  }

  let subtotal = 0;
  let totalWeightGram = 0;
  let totalVolumeWeightGram = 0;
  const calculatedItems: CalculatedItem[] = [];

  for (const item of items) {
    if (!isValidUUID(item.productId)) {
      throw new Error(`Product ID tidak valid: ${item.productId}`);
    }

    const product = await db.query.productsTable.findFirst({
      where: eq(productsTable.id, item.productId),
      with: {
        category: true,
      },
    });

    if (!product) {
      throw new Error(`Produk dengan ID ${item.productId} tidak ditemukan`);
    }

    let unitPrice = product.price;
    let variantColor: string | null = null;
    let variantSize: string | null = null;
    let availableStock = product.stock;

    if (item.variantId) {
      if (!isValidUUID(item.variantId)) {
        throw new Error(`Variant ID tidak valid: ${item.variantId}`);
      }

      const variant = await db.query.productVariantsTable.findFirst({
        where: and(
          eq(productVariantsTable.id, item.variantId),
          eq(productVariantsTable.product_id, product.id)
        ),
      });

      if (!variant) {
        throw new Error(
          `Varian produk tidak ditemukan atau tidak sesuai untuk produk "${product.name}"`
        );
      }

      variantColor = variant.color;
      variantSize = variant.size;
      unitPrice = product.price + (variant.additional_price || 0);
      availableStock = variant.stock;
    }

    const itemSubtotal = unitPrice * item.quantity;
    const unitWeight =
      product.weight_gram && product.weight_gram > 0
        ? product.weight_gram
        : estimateWeightGram(product.name, product.category?.slug);
    const dimLength =
      product.dimension_length && product.dimension_length > 0
        ? product.dimension_length
        : 10;
    const dimWidth =
      product.dimension_width && product.dimension_width > 0
        ? product.dimension_width
        : 10;
    const dimHeight =
      product.dimension_height && product.dimension_height > 0
        ? product.dimension_height
        : 10;
    const unitVolumeWeightGram = Math.round(((dimLength * dimWidth * dimHeight) / 6000) * 1000);

    const itemTotalWeight = unitWeight * item.quantity;
    const itemTotalVolumeWeight = unitVolumeWeightGram * item.quantity;

    subtotal += itemSubtotal;
    totalWeightGram += itemTotalWeight;
    totalVolumeWeightGram += itemTotalVolumeWeight;

    calculatedItems.push({
      productId: product.id,
      variantId: item.variantId || null,
      productName: product.name,
      variantColor,
      variantSize,
      imageUrl: product.image_url,
      unitPrice,
      quantity: item.quantity,
      itemSubtotal,
      unitWeightGram: unitWeight,
      totalWeightGram: itemTotalWeight,
      dimensionLength: dimLength,
      dimensionWidth: dimWidth,
      dimensionHeight: dimHeight,
      volumeWeightGram: unitVolumeWeightGram,
      availableStock,
    });
  }

  const destinationInfo = extractAddressDetails(
    undefined,
    input.destinationPostalCode,
    input.destinationCity,
    input.destinationProvince,
    input.destinationDistrict
  );

  let shippingResult: Awaited<ReturnType<typeof calculateRates>> | null = null;
  try {
    shippingResult = await calculateRates({
      destinationPostalCode: destinationInfo.postalCode,
      destinationCity: destinationInfo.city,
      destinationProvince: destinationInfo.province,
      destinationDistrict: destinationInfo.district,
      items: items.map((it) => ({
        productId: it.productId,
        variantId: it.variantId,
        quantity: it.quantity,
      })),
      courierCodes: courierCode ? [courierCode] : undefined,
    });
  } catch (err) {
    console.error('[checkoutService] calculateRates error in calculateOrder:', err);
  }

  const chargeableWeightGram = Math.max(totalWeightGram, totalVolumeWeightGram);
  const totalBeratKg =
    shippingResult?.chargeableWeightKg || Math.max(1, Math.ceil(chargeableWeightGram / 1000));

  const matchedRate = shippingResult?.rates
    ? findMatchingRate(shippingResult.rates, courierCode, courierService)
    : undefined;

  let ongkir: number;
  let courierRatePerKg: number;
  let resolvedCourierService = courierService || null;

  if (matchedRate) {
    ongkir = matchedRate.cost;
    courierRatePerKg = Math.round(ongkir / Math.max(1, totalBeratKg));
    resolvedCourierService = matchedRate.serviceName || matchedRate.serviceCode || courierService || null;
  } else {
    courierRatePerKg = getCourierRate(courierCode, courierService);
    ongkir = courierRatePerKg * totalBeratKg;
  }

  const voucherResult = calculateVoucherDiscount(voucherCode, subtotal);
  const biayaLayanan = 1000;
  const totalBayar = Math.max(0, subtotal + ongkir + biayaLayanan - voucherResult.discountAmount);

  return {
    items: calculatedItems,
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotalProduk: subtotal,
    totalBeratGram: totalWeightGram,
    totalWeightGram,
    totalVolumeWeightGram,
    chargeableWeightKg: totalBeratKg,
    totalBeratKg,
    courierCode,
    courierService: resolvedCourierService,
    courierRatePerKg,
    ongkir,
    voucherCode: voucherCode || null,
    diskonVoucher: voucherResult.discountAmount,
    voucherMessage: voucherResult.message,
    biayaLayanan,
    totalBayar,
  };
}

/**
 * Place a transactional order:
 * - Validates & decrements stock
 * - Generates unique invoice number (BK-YYYYMM-XXXXXX)
 * - Inserts into ordersTable
 * - Inserts snapshot items into orderItemsTable
 * - Inserts initial tracking step into trackingHistoryTable
 * - Clears corresponding cart items
 */
export async function createOrder(payload: CreateOrderInput): Promise<CreatedOrderResult> {
  const {
    recipientName,
    recipientPhone,
    shippingAddress,
    courierCode,
    courierService,
    paymentMethod,
    notes,
    voucherCode,
    cartId,
    userId,
    items,
  } = payload;

  if (!items || items.length === 0) {
    throw new Error('Pesanan harus memiliki minimal 1 produk');
  }

  const destinationInfo = extractAddressDetails(
    shippingAddress,
    payload.destinationPostalCode,
    payload.destinationCity,
    payload.destinationProvince,
    payload.destinationDistrict
  );

  let shippingResult: Awaited<ReturnType<typeof calculateRates>> | null = null;
  try {
    shippingResult = await calculateRates({
      destinationPostalCode: destinationInfo.postalCode,
      destinationCity: destinationInfo.city,
      destinationProvince: destinationInfo.province,
      destinationDistrict: destinationInfo.district,
      items: items.map((it) => ({
        productId: it.productId,
        variantId: it.variantId,
        quantity: it.quantity,
      })),
      courierCodes: courierCode ? [courierCode] : undefined,
    });
  } catch (err) {
    console.error('[checkoutService] calculateRates error in createOrder:', err);
  }

  const matchedRate = shippingResult?.rates
    ? findMatchingRate(shippingResult.rates, courierCode, courierService)
    : undefined;

  const { orderRecord, itemSnapshots } = await db.transaction(async (tx) => {
    let subtotal = 0;
    let totalWeightGram = 0;
    let totalVolumeWeightGram = 0;

    interface ValidatedItemSnapshot {
      productId: string;
      variantId: string | null;
      productName: string;
      variantColor: string | null;
      variantSize: string | null;
      price: number;
      quantity: number;
      imageUrl: string;
    }

    const itemSnapshots: ValidatedItemSnapshot[] = [];

    // 1. Stock validation and stock decrement per item
    for (const item of items) {
      if (!isValidUUID(item.productId)) {
        throw new Error(`Product ID tidak valid: ${item.productId}`);
      }

      const product = await tx.query.productsTable.findFirst({
        where: eq(productsTable.id, item.productId),
        with: {
          category: true,
        },
      });

      if (!product) {
        throw new Error(`Produk dengan ID "${item.productId}" tidak ditemukan`);
      }

      let unitPrice = product.price;
      let variantColor: string | null = null;
      let variantSize: string | null = null;

      if (item.variantId) {
        if (!isValidUUID(item.variantId)) {
          throw new Error(`Variant ID tidak valid: ${item.variantId}`);
        }

        const variant = await tx.query.productVariantsTable.findFirst({
          where: and(
            eq(productVariantsTable.id, item.variantId),
            eq(productVariantsTable.product_id, product.id)
          ),
        });

        if (!variant) {
          throw new Error(
            `Varian produk tidak ditemukan atau tidak sesuai untuk produk "${product.name}"`
          );
        }

        if (variant.stock < item.quantity) {
          throw new Error(
            `Stok varian ${variant.color || ''} ${variant.size || ''} untuk "${product.name}" tidak mencukupi (tersedia: ${variant.stock}, diminta: ${item.quantity})`
          );
        }

        // Decrement variant stock
        await tx
          .update(productVariantsTable)
          .set({
            stock: sql`${productVariantsTable.stock} - ${item.quantity}`,
          })
          .where(eq(productVariantsTable.id, variant.id));

        variantColor = variant.color;
        variantSize = variant.size;
        unitPrice = product.price + (variant.additional_price || 0);
      }

      if (product.stock < item.quantity) {
        throw new Error(
          `Stok produk "${product.name}" tidak mencukupi (tersedia: ${product.stock}, diminta: ${item.quantity})`
        );
      }

      // Decrement product stock and increment sold count
      await tx
        .update(productsTable)
        .set({
          stock: sql`${productsTable.stock} - ${item.quantity}`,
          sold_count: sql`${productsTable.sold_count} + ${item.quantity}`,
          updated_at: new Date(),
        })
        .where(eq(productsTable.id, product.id));

      const unitWeight =
        product.weight_gram && product.weight_gram > 0
          ? product.weight_gram
          : estimateWeightGram(product.name, product.category?.slug);
      const dimLength =
        product.dimension_length && product.dimension_length > 0
          ? product.dimension_length
          : 10;
      const dimWidth =
        product.dimension_width && product.dimension_width > 0
          ? product.dimension_width
          : 10;
      const dimHeight =
        product.dimension_height && product.dimension_height > 0
          ? product.dimension_height
          : 10;
      const unitVolumeWeightGram = Math.round(((dimLength * dimWidth * dimHeight) / 6000) * 1000);

      const itemTotalWeight = unitWeight * item.quantity;
      const itemTotalVolumeWeight = unitVolumeWeightGram * item.quantity;

      subtotal += unitPrice * item.quantity;
      totalWeightGram += itemTotalWeight;
      totalVolumeWeightGram += itemTotalVolumeWeight;

      itemSnapshots.push({
        productId: product.id,
        variantId: item.variantId || null,
        productName: product.name,
        variantColor,
        variantSize,
        price: unitPrice,
        quantity: item.quantity,
        imageUrl: product.image_url,
      });
    }

    // 2. Cost calculations
    const chargeableWeightGram = Math.max(totalWeightGram, totalVolumeWeightGram);
    const totalBeratKg =
      shippingResult?.chargeableWeightKg || Math.max(1, Math.ceil(chargeableWeightGram / 1000));

    let shippingCost: number;
    if (matchedRate) {
      shippingCost = matchedRate.cost;
    } else {
      const courierRatePerKg = getCourierRate(courierCode, courierService);
      shippingCost = courierRatePerKg * totalBeratKg;
    }

    const voucherResult = calculateVoucherDiscount(voucherCode, subtotal);
    const discountAmount = voucherResult.discountAmount;
    const serviceFee = 1000;
    const totalAmount = Math.max(0, subtotal + shippingCost + serviceFee - discountAmount);

    // 3. Generate unique invoice number: BK-YYYYMM-XXXXXX
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const invoiceNumber = `BK-${year}${month}-${randomDigits}`;

    const validUserId = userId && isValidUUID(userId) ? userId : null;

    // 4. Insert Order
    const [newOrder] = await tx
      .insert(ordersTable)
      .values({
        invoice_number: invoiceNumber,
        user_id: validUserId,
        status: 'menunggu_pembayaran',
        recipient_name: recipientName,
        recipient_phone: recipientPhone,
        shipping_address: shippingAddress,
        courier_code: courierCode,
        courier_service: matchedRate?.serviceName || courierService,
        payment_method: paymentMethod,
        subtotal,
        shipping_cost: shippingCost,
        discount_amount: discountAmount,
        service_fee: serviceFee,
        total_amount: totalAmount,
        notes: notes || null,
      })
      .returning();

    // 5. Insert Order Items snapshots
    for (const snapshot of itemSnapshots) {
      await tx.insert(orderItemsTable).values({
        order_id: newOrder.id,
        product_id: snapshot.productId,
        variant_id: snapshot.variantId,
        product_name: snapshot.productName,
        variant_color: snapshot.variantColor,
        variant_size: snapshot.variantSize,
        price: snapshot.price,
        quantity: snapshot.quantity,
        image_url: snapshot.imageUrl,
      });
    }

    // 6. Insert initial tracking step
    await tx.insert(trackingHistoryTable).values({
      order_id: newOrder.id,
      status_title: 'Pembayaran Dikonfirmasi',
      description: 'Pesanan telah diterima toko dan menunggu pengemasan.',
      location: 'Gudang Pusat Jakarta',
    });

    // 7. Clear cart items if cartId or userId was provided
    if (cartId && isValidUUID(cartId)) {
      await tx.delete(cartItemsTable).where(eq(cartItemsTable.cart_id, cartId));
    }

    if (validUserId) {
      const userCarts = await tx
        .select({ id: cartsTable.id })
        .from(cartsTable)
        .where(eq(cartsTable.user_id, validUserId));

      for (const uc of userCarts) {
        await tx.delete(cartItemsTable).where(eq(cartItemsTable.cart_id, uc.id));
      }
    }

    return {
      orderRecord: newOrder,
      itemSnapshots,
    };
  });

  // After the transaction completes, generate payment transaction
  let customerEmail = 'pembeli@example.com';
  if (orderRecord.user_id) {
    try {
      const userRecord = await db.query.usersTable.findFirst({
        where: eq(usersTable.id, orderRecord.user_id),
      });
      if (userRecord?.email) {
        customerEmail = userRecord.email;
      }
    } catch (err) {
      console.warn('[checkoutService] Failed to query user email:', err);
    }
  }

  const paymentTx = await paymentService.createPaymentTransaction({
    orderId: orderRecord.id,
    invoiceNumber: orderRecord.invoice_number,
    grossAmount: orderRecord.total_amount,
    customerName: orderRecord.recipient_name,
    customerEmail,
    customerPhone: orderRecord.recipient_phone,
    paymentMethodId: payload.paymentMethod,
    items: itemSnapshots.map((it) => ({
      name: it.productName,
      price: it.price,
      quantity: it.quantity,
    })),
  });

  return {
    orderId: orderRecord.id,
    invoiceNumber: orderRecord.invoice_number,
    totalBayar: orderRecord.total_amount,
    status: orderRecord.status,
    paymentMethod: orderRecord.payment_method,
    subtotal: orderRecord.subtotal,
    shippingCost: orderRecord.shipping_cost,
    discountAmount: orderRecord.discount_amount,
    serviceFee: orderRecord.service_fee,
    recipientName: orderRecord.recipient_name,
    recipientPhone: orderRecord.recipient_phone,
    shippingAddress: orderRecord.shipping_address,
    courierCode: orderRecord.courier_code,
    courierService: orderRecord.courier_service,
    createdAt: orderRecord.created_at,
    paymentTransaction: paymentTx,
  };
}

export const checkoutService = {
  calculateOrder,
  createOrder,
  getCourierRate,
  calculateVoucherDiscount,
};
