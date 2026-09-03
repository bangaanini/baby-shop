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
} from '@/db/schema';
import {
  CheckoutItemInput,
  CalculateCheckoutInput,
  CreateOrderInput,
} from '@/server/validators/checkout.schema';

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
  availableStock: number;
}

export interface CheckoutCalculationResult {
  items: CalculatedItem[];
  totalItems: number;
  subtotalProduk: number;
  totalBeratGram: number;
  totalBeratKg: number;
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
        throw new Error(`Varian produk tidak ditemukan atau tidak sesuai untuk produk "${product.name}"`);
      }

      variantColor = variant.color;
      variantSize = variant.size;
      unitPrice = product.price + (variant.additional_price || 0);
      availableStock = variant.stock;
    }

    const itemSubtotal = unitPrice * item.quantity;
    const unitWeight = estimateWeightGram(product.name, product.category?.slug);
    const itemTotalWeight = unitWeight * item.quantity;

    subtotal += itemSubtotal;
    totalWeightGram += itemTotalWeight;

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
      availableStock,
    });
  }

  const totalBeratKg = Math.max(1, Math.ceil(totalWeightGram / 1000));
  const courierRatePerKg = getCourierRate(courierCode, courierService);
  const ongkir = courierRatePerKg * totalBeratKg;
  const voucherResult = calculateVoucherDiscount(voucherCode, subtotal);
  const biayaLayanan = 1000;
  const totalBayar = Math.max(0, subtotal + ongkir + biayaLayanan - voucherResult.discountAmount);

  return {
    items: calculatedItems,
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotalProduk: subtotal,
    totalBeratGram: totalWeightGram,
    totalBeratKg,
    courierCode,
    courierService,
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

  return await db.transaction(async (tx) => {
    let subtotal = 0;
    let totalWeightGram = 0;

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

      const itemTotalWeight = estimateWeightGram(product.name, product.category?.slug) * item.quantity;
      subtotal += unitPrice * item.quantity;
      totalWeightGram += itemTotalWeight;

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
    const totalBeratKg = Math.max(1, Math.ceil(totalWeightGram / 1000));
    const courierRatePerKg = getCourierRate(courierCode, courierService);
    const shippingCost = courierRatePerKg * totalBeratKg;
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
        courier_service: courierService,
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
      orderId: newOrder.id,
      invoiceNumber: newOrder.invoice_number,
      totalBayar: newOrder.total_amount,
      status: newOrder.status,
      paymentMethod: newOrder.payment_method,
      subtotal: newOrder.subtotal,
      shippingCost: newOrder.shipping_cost,
      discountAmount: newOrder.discount_amount,
      serviceFee: newOrder.service_fee,
      recipientName: newOrder.recipient_name,
      recipientPhone: newOrder.recipient_phone,
      shippingAddress: newOrder.shipping_address,
      courierCode: newOrder.courier_code,
      courierService: newOrder.courier_service,
      createdAt: newOrder.created_at,
    };
  });
}

export const checkoutService = {
  calculateOrder,
  createOrder,
  getCourierRate,
  calculateVoucherDiscount,
};
