import { z } from 'zod';

export const checkoutItemSchema = z.object({
  productId: z.string().min(1, 'Product ID wajib diisi'),
  variantId: z.string().optional().nullable(),
  quantity: z.coerce.number().int().min(1, 'Jumlah produk minimal 1'),
});

export const calculateCheckoutSchema = z.object({
  items: z.array(checkoutItemSchema).min(1, 'Daftar produk minimal 1 item'),
  courierCode: z.string().min(1, 'Kode kurir wajib diisi').default('sicepat'),
  courierService: z.string().optional().nullable(),
  voucherCode: z.string().optional().nullable(),
  destinationPostalCode: z.union([z.string(), z.number()]).optional().nullable(),
  destinationCity: z.string().optional().nullable(),
  destinationProvince: z.string().optional().nullable(),
  destinationDistrict: z.string().optional().nullable(),
});

export const createOrderSchema = z.object({
  recipientName: z.string().trim().min(3, 'Nama penerima minimal 3 karakter'),
  recipientPhone: z.string().trim().min(8, 'Nomor telepon penerima minimal 8 karakter'),
  shippingAddress: z.string().trim().min(10, 'Alamat pengiriman minimal 10 karakter'),
  courierCode: z.string().trim().min(1, 'Kode kurir wajib dipilih'),
  courierService: z.string().trim().min(1, 'Layanan kurir wajib dipilih'),
  paymentMethod: z.string().trim().min(1, 'Metode pembayaran wajib dipilih'),
  notes: z.string().optional().nullable(),
  voucherCode: z.string().optional().nullable(),
  cartId: z.string().optional().nullable(),
  userId: z.string().optional().nullable(),
  destinationPostalCode: z.union([z.string(), z.number()]).optional().nullable(),
  destinationCity: z.string().optional().nullable(),
  destinationProvince: z.string().optional().nullable(),
  destinationDistrict: z.string().optional().nullable(),
  items: z.array(checkoutItemSchema).min(1, 'Pesanan harus memiliki minimal 1 produk'),
});

export type CheckoutItemInput = z.infer<typeof checkoutItemSchema>;
export type CalculateCheckoutInput = z.infer<typeof calculateCheckoutSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
