import { z } from 'zod';
import { orderStatusEnum } from './order.schema';

import { productSortEnum } from './product.schema';

export const updateOrderStatusSchema = z.object({
  status: orderStatusEnum,
  trackingNumber: z.string().trim().optional().nullable(),
  notes: z.string().trim().optional().nullable(),
});

export const productVariantInputSchema = z.object({
  id: z.string().optional().nullable(),
  color: z.string().trim().optional().nullable(),
  size: z.string().trim().optional().nullable(),
  stock: z.coerce.number().int().min(0, 'Stok varian minimal 0').default(0),
  additionalPrice: z.coerce.number().int().min(0).default(0).optional(),
});

export const productImageInputSchema = z.object({
  id: z.string().optional().nullable(),
  url: z.string().trim().min(1, 'URL gambar wajib diisi'),
  altText: z.string().trim().optional().nullable(),
  sortOrder: z.coerce.number().int().min(0).default(0).optional(),
});

export const adminProductSchema = z.object({
  categoryId: z.string().min(1, 'Kategori wajib dipilih'),
  name: z.string().trim().min(2, 'Nama produk minimal 2 karakter'),
  slug: z.string().trim().min(2).optional().nullable(),
  description: z.string().trim().optional().nullable(),
  price: z.coerce.number().int().min(0, 'Harga produk minimal 0'),
  originalPrice: z.coerce.number().int().min(0).optional().nullable(),
  stock: z.coerce.number().int().min(0, 'Stok produk minimal 0').default(0),
  material: z.string().trim().optional().nullable(),
  suitableAge: z.string().trim().optional().nullable(),
  imageUrl: z.string().trim().min(1, 'URL gambar utama wajib diisi'),
  isPopular: z.preprocess((val) => (val === 'true' || val === true ? true : val === 'false' || val === false ? false : undefined), z.boolean().optional().default(false)),
  isNewArrival: z.preprocess((val) => (val === 'true' || val === true ? true : val === 'false' || val === false ? false : undefined), z.boolean().optional().default(false)),
  isRecommended: z.preprocess((val) => (val === 'true' || val === true ? true : val === 'false' || val === false ? false : undefined), z.boolean().optional().default(false)),
  isPromo: z.preprocess((val) => (val === 'true' || val === true ? true : val === 'false' || val === false ? false : undefined), z.boolean().optional().default(false)),
  tag: z.string().trim().optional().nullable(),
  variants: z.array(productVariantInputSchema).optional().default([]),
  images: z.array(productImageInputSchema).optional().default([]),
});

export const adminProductUpdateSchema = adminProductSchema.partial();

export const adminOrderFilterSchema = z.object({
  status: z.string().optional(),
  q: z.string().optional(),
  userId: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const adminProductFilterSchema = z.object({
  q: z.string().optional(),
  categoryId: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  sort: productSortEnum.optional().default('rekomendasi'),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type ProductVariantInput = z.infer<typeof productVariantInputSchema>;
export type ProductImageInput = z.infer<typeof productImageInputSchema>;
export type AdminProductInput = z.infer<typeof adminProductSchema>;
export type AdminProductUpdateInput = z.infer<typeof adminProductUpdateSchema>;
export type AdminOrderFilterInput = z.infer<typeof adminOrderFilterSchema>;
export type AdminProductFilterInput = z.infer<typeof adminProductFilterSchema>;
