import { z } from 'zod';

export const addToCartSchema = z.object({
  productId: z.string().min(1, 'Product ID wajib diisi'),
  variantId: z.string().optional().nullable(),
  quantity: z.coerce.number().int().min(1, 'Jumlah produk minimal 1').default(1),
  userIdOrSession: z.string().optional(),
});

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().min(1, 'Jumlah produk minimal 1'),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
