import { z } from 'zod';

export const orderStatusEnum = z.enum([
  'menunggu_pembayaran',
  'diproses',
  'dikirim',
  'selesai',
  'dibatalkan',
]);

export const orderFilterSchema = z.object({
  status: z.string().optional(),
  q: z.string().optional(),
  userId: z.string().optional(),
});

export type OrderFilterInput = z.infer<typeof orderFilterSchema>;
