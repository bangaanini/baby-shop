import { z } from 'zod';

export const validateVoucherInputSchema = z.object({
  code: z.string().min(1, 'Kode voucher tidak boleh kosong'),
  subtotal: z.coerce.number().min(0, 'Subtotal harus berupa angka non-negatif'),
  shippingCost: z.coerce.number().min(0, 'Ongkos kirim harus berupa angka non-negatif').optional(),
});

export type ValidateVoucherInput = z.infer<typeof validateVoucherInputSchema>;

export const createVoucherSchema = z.object({
  code: z
    .string()
    .min(2, 'Kode voucher minimal 2 karakter')
    .max(50, 'Kode voucher maksimal 50 karakter')
    .transform((val) => val.trim().toUpperCase()),
  name: z
    .string()
    .min(2, 'Nama voucher minimal 2 karakter')
    .max(150, 'Nama voucher maksimal 150 karakter'),
  description: z.string().optional().nullable(),
  discountType: z.enum(['fixed', 'percentage', 'shipping']).default('fixed'),
  discountValue: z.coerce.number().min(1, 'Nilai diskon minimal 1'),
  maxDiscountAmount: z.coerce.number().min(0).optional().nullable(),
  minOrderAmount: z.coerce.number().min(0).default(0),
  usageLimit: z.coerce.number().min(1).optional().nullable(),
  startDate: z.union([z.string(), z.date()]).optional(),
  endDate: z.union([z.string(), z.date()]).optional().nullable(),
  isActive: z.boolean().default(true),
});

export type CreateVoucherInput = z.infer<typeof createVoucherSchema>;

export const updateVoucherSchema = createVoucherSchema.partial();

export type UpdateVoucherInput = z.infer<typeof updateVoucherSchema>;
