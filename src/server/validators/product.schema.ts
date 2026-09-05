import { z } from 'zod';

export const productSortEnum = z.enum([
  'rekomendasi',
  'terpopuler',
  'terbaru',
  'harga-asc',
  'harga-desc',
  'rating',
]);

export const productFilterSchema = z.object({
  q: z.string().optional(),
  kategori: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  sort: productSortEnum.optional().default('rekomendasi'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  isPopular: z.preprocess((val) => (val === 'true' || val === true ? true : val === 'false' || val === false ? false : undefined), z.boolean().optional()),
  isNewArrival: z.preprocess((val) => (val === 'true' || val === true ? true : val === 'false' || val === false ? false : undefined), z.boolean().optional()),
  isRecommended: z.preprocess((val) => (val === 'true' || val === true ? true : val === 'false' || val === false ? false : undefined), z.boolean().optional()),
  isPromo: z.preprocess((val) => (val === 'true' || val === true ? true : val === 'false' || val === false ? false : undefined), z.boolean().optional()),
  isFlashSale: z.preprocess((val) => (val === 'true' || val === true ? true : val === 'false' || val === false ? false : undefined), z.boolean().optional()),
});

export type ProductFilterInput = z.infer<typeof productFilterSchema>;
