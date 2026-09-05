import { desc, eq, sql } from 'drizzle-orm';
import { db } from '@/db';
import { vouchersTable, Voucher } from '@/db/schema/vouchers';
import { CreateVoucherInput, UpdateVoucherInput } from '@/server/validators/voucher.schema';

export interface VoucherValidationResult {
  isValid: boolean;
  discountAmount: number;
  message: string;
  discountType?: 'fixed' | 'percentage' | 'shipping';
  code?: string;
  voucher?: Voucher;
}

export async function getAllVouchers(): Promise<Voucher[]> {
  return await db
    .select()
    .from(vouchersTable)
    .orderBy(desc(vouchersTable.created_at));
}

export async function getVoucherById(id: string): Promise<Voucher | null> {
  const [voucher] = await db
    .select()
    .from(vouchersTable)
    .where(eq(vouchersTable.id, id))
    .limit(1);

  return voucher || null;
}

export async function getVoucherByCode(code: string): Promise<Voucher | null> {
  if (!code || !code.trim()) return null;

  const normalizedCode = code.trim().toUpperCase();
  const [voucher] = await db
    .select()
    .from(vouchersTable)
    .where(eq(sql`UPPER(${vouchersTable.code})`, normalizedCode))
    .limit(1);

  return voucher || null;
}

export async function createVoucher(data: CreateVoucherInput): Promise<Voucher> {
  const normalizedCode = data.code.trim().toUpperCase();

  const startDate = data.startDate ? new Date(data.startDate) : new Date();
  const endDate = data.endDate ? new Date(data.endDate) : null;

  const [newVoucher] = await db
    .insert(vouchersTable)
    .values({
      code: normalizedCode,
      name: data.name.trim(),
      description: data.description?.trim() || null,
      discount_type: data.discountType,
      discount_value: data.discountValue,
      max_discount_amount: data.maxDiscountAmount ?? null,
      min_order_amount: data.minOrderAmount ?? 0,
      usage_limit: data.usageLimit ?? null,
      used_count: 0,
      start_date: startDate,
      end_date: endDate,
      is_active: data.isActive ?? true,
      created_at: new Date(),
      updated_at: new Date(),
    })
    .returning();

  return newVoucher;
}

export async function updateVoucher(id: string, data: UpdateVoucherInput): Promise<Voucher> {
  const updatePayload: Partial<typeof vouchersTable.$inferInsert> = {
    updated_at: new Date(),
  };

  if (data.code !== undefined) {
    updatePayload.code = data.code.trim().toUpperCase();
  }
  if (data.name !== undefined) {
    updatePayload.name = data.name.trim();
  }
  if (data.description !== undefined) {
    updatePayload.description = data.description ? data.description.trim() : null;
  }
  if (data.discountType !== undefined) {
    updatePayload.discount_type = data.discountType;
  }
  if (data.discountValue !== undefined) {
    updatePayload.discount_value = data.discountValue;
  }
  if (data.maxDiscountAmount !== undefined) {
    updatePayload.max_discount_amount = data.maxDiscountAmount;
  }
  if (data.minOrderAmount !== undefined) {
    updatePayload.min_order_amount = data.minOrderAmount;
  }
  if (data.usageLimit !== undefined) {
    updatePayload.usage_limit = data.usageLimit;
  }
  if (data.startDate !== undefined) {
    updatePayload.start_date = data.startDate ? new Date(data.startDate) : new Date();
  }
  if (data.endDate !== undefined) {
    updatePayload.end_date = data.endDate ? new Date(data.endDate) : null;
  }
  if (data.isActive !== undefined) {
    updatePayload.is_active = data.isActive;
  }

  const [updatedVoucher] = await db
    .update(vouchersTable)
    .set(updatePayload)
    .where(eq(vouchersTable.id, id))
    .returning();

  if (!updatedVoucher) {
    throw new Error(`Voucher dengan ID "${id}" tidak ditemukan`);
  }

  return updatedVoucher;
}

export async function deleteVoucher(id: string): Promise<boolean> {
  const result = await db
    .delete(vouchersTable)
    .where(eq(vouchersTable.id, id))
    .returning({ id: vouchersTable.id });

  if (!result.length) {
    throw new Error(`Voucher dengan ID "${id}" tidak ditemukan`);
  }

  return true;
}

export async function validateVoucher(
  code?: string | null,
  subtotal: number = 0,
  shippingCost: number = 20000
): Promise<VoucherValidationResult> {
  if (!code || !code.trim()) {
    return {
      isValid: false,
      discountAmount: 0,
      message: 'Kode voucher tidak boleh kosong',
    };
  }

  const normalizedCode = code.trim().toUpperCase();
  const voucher = await getVoucherByCode(normalizedCode);

  if (!voucher) {
    return {
      isValid: false,
      discountAmount: 0,
      message: 'Kode voucher tidak valid atau tidak ditemukan',
    };
  }

  if (!voucher.is_active) {
    return {
      isValid: false,
      discountAmount: 0,
      message: 'Voucher tidak aktif atau sudah dinonaktifkan',
      voucher,
    };
  }

  const now = new Date();

  if (voucher.start_date && now < new Date(voucher.start_date)) {
    return {
      isValid: false,
      discountAmount: 0,
      message: 'Voucher belum dapat digunakan',
      voucher,
    };
  }

  if (voucher.end_date && now > new Date(voucher.end_date)) {
    return {
      isValid: false,
      discountAmount: 0,
      message: 'Voucher sudah kedaluwarsa',
      voucher,
    };
  }

  if (voucher.usage_limit !== null && voucher.usage_limit !== undefined && voucher.used_count >= voucher.usage_limit) {
    return {
      isValid: false,
      discountAmount: 0,
      message: 'Kuota penggunaan voucher telah habis',
      voucher,
    };
  }

  if (subtotal < voucher.min_order_amount) {
    return {
      isValid: false,
      discountAmount: 0,
      message: `Minimal pembelian Rp ${voucher.min_order_amount.toLocaleString('id-ID')} untuk menggunakan voucher ini`,
      voucher,
    };
  }

  let discountAmount = 0;
  const discountType = voucher.discount_type as 'fixed' | 'percentage' | 'shipping';

  if (discountType === 'percentage') {
    const rawDiscount = Math.round((subtotal * voucher.discount_value) / 100);
    const maxDiscount = voucher.max_discount_amount && voucher.max_discount_amount > 0
      ? voucher.max_discount_amount
      : Infinity;
    discountAmount = Math.min(rawDiscount, maxDiscount);
  } else if (discountType === 'shipping') {
    discountAmount = Math.min(voucher.discount_value, shippingCost);
  } else {
    // 'fixed'
    discountAmount = Math.min(voucher.discount_value, subtotal);
  }

  // Ensure discount does not exceed subtotal (for fixed/percentage) or shipping cost (for shipping)
  discountAmount = Math.max(0, discountAmount);

  return {
    isValid: true,
    discountAmount,
    message: `Voucher ${voucher.code} berhasil diterapkan! Hemat Rp ${discountAmount.toLocaleString('id-ID')}`,
    discountType,
    code: voucher.code,
    voucher,
  };
}

export async function incrementVoucherUsage(code: string): Promise<void> {
  if (!code || !code.trim()) return;

  const normalizedCode = code.trim().toUpperCase();
  await db
    .update(vouchersTable)
    .set({
      used_count: sql`${vouchersTable.used_count} + 1`,
      updated_at: new Date(),
    })
    .where(eq(sql`UPPER(${vouchersTable.code})`, normalizedCode));
}

export const voucherService = {
  getAllVouchers,
  getVoucherById,
  getVoucherByCode,
  createVoucher,
  updateVoucher,
  deleteVoucher,
  validateVoucher,
  incrementVoucherUsage,
};
