import { z } from 'zod';

export const shippingRateItemSchema = z.object({
  productId: z.string().min(1, 'Product ID wajib diisi'),
  variantId: z.string().optional().nullable(),
  quantity: z.coerce.number().int().min(1, 'Jumlah produk minimal 1').default(1),
});

export const calculateShippingRatesSchema = z.object({
  destinationPostalCode: z
    .union([z.string(), z.number()])
    .optional()
    .nullable()
    .transform((val) => (val !== undefined && val !== null ? String(val).trim() : undefined)),
  destinationCity: z.string().optional().nullable(),
  destinationProvince: z.string().optional().nullable(),
  destinationDistrict: z.string().optional().nullable(),
  items: z.array(shippingRateItemSchema).min(1, 'Daftar produk minimal 1 item'),
  courierCodes: z
    .union([
      z.array(z.string()),
      z.string().transform((val) =>
        val
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      ),
    ])
    .optional()
    .nullable(),
});

export type ShippingRateItemInput = z.infer<typeof shippingRateItemSchema>;
export type CalculateShippingRatesInput = z.infer<typeof calculateShippingRatesSchema>;

export interface ShippingRateOption {
  courierCode: string;
  courierName: string;
  serviceCode: string;
  serviceName: string;
  cost: number;
  etd: string;
  description?: string;
  isAvailable?: boolean;
}
