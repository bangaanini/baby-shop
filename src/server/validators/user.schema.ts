import { z } from 'zod';

export const genderEnum = z.enum(['female', 'male']);

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Nama minimal 2 karakter').max(150, 'Nama maksimal 150 karakter'),
  phone: z.string().trim().max(50, 'Nomor HP maksimal 50 karakter').optional().nullable(),
  image: z.string().trim().optional().nullable(),
  birthDate: z.string().trim().optional().nullable(),
  gender: genderEnum.optional().nullable(),
  childrenInfo: z.string().trim().optional().nullable(),
  userId: z.string().optional(),
});

export const baseAddressSchema = z.object({
  recipientName: z.string().trim().min(2, 'Nama penerima minimal 2 karakter').max(150, 'Nama penerima maksimal 150 karakter'),
  phone: z.string().trim().min(8, 'Nomor HP minimal 8 karakter').max(50, 'Nomor HP maksimal 50 karakter'),
  label: z.string().trim().max(50, 'Label maksimal 50 karakter').optional().nullable(),
  fullAddress: z.string().trim().min(5, 'Alamat lengkap minimal 5 karakter'),
  province: z.string().trim().min(2, 'Provinsi minimal 2 karakter'),
  city: z.string().trim().min(2, 'Kota/Kabupaten minimal 2 karakter'),
  district: z.string().trim().optional().nullable(),
  postalCode: z.string().trim().min(3, 'Kode pos minimal 3 karakter').max(20, 'Kode pos maksimal 20 karakter'),
  isPrimary: z.boolean().optional().default(false),
});

export const addressSchema = z.preprocess((val: any) => {
  if (typeof val === 'object' && val !== null) {
    return {
      ...val,
      recipientName: val.recipientName ?? val.namaPenerima,
      phone: val.phone ?? val.telepon,
      label: val.label ?? val.labelAlamat,
      fullAddress: val.fullAddress ?? val.alamatLengkap,
      province: val.province ?? val.provinsi,
      city: val.city ?? val.kotaKabupaten,
      district: val.district ?? val.kecamatan,
      postalCode: val.postalCode ?? val.kodePos,
      isPrimary: val.isPrimary ?? val.isUtama ?? false,
    };
  }
  return val;
}, baseAddressSchema);

export const updateAddressSchema = z.preprocess((val: any) => {
  if (typeof val === 'object' && val !== null) {
    return {
      ...val,
      ...(val.namaPenerima !== undefined && val.recipientName === undefined ? { recipientName: val.namaPenerima } : {}),
      ...(val.telepon !== undefined && val.phone === undefined ? { phone: val.telepon } : {}),
      ...(val.labelAlamat !== undefined && val.label === undefined ? { label: val.labelAlamat } : {}),
      ...(val.alamatLengkap !== undefined && val.fullAddress === undefined ? { fullAddress: val.alamatLengkap } : {}),
      ...(val.provinsi !== undefined && val.province === undefined ? { province: val.provinsi } : {}),
      ...(val.kotaKabupaten !== undefined && val.city === undefined ? { city: val.kotaKabupaten } : {}),
      ...(val.kecamatan !== undefined && val.district === undefined ? { district: val.kecamatan } : {}),
      ...(val.kodePos !== undefined && val.postalCode === undefined ? { postalCode: val.kodePos } : {}),
      ...(val.isUtama !== undefined && val.isPrimary === undefined ? { isPrimary: val.isUtama } : {}),
    };
  }
  return val;
}, baseAddressSchema.partial());

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(6, 'Password saat ini minimal 6 karakter'),
    newPassword: z.string().min(8, 'Password baru minimal 8 karakter'),
    confirmPassword: z.string().min(8, 'Konfirmasi password baru minimal 8 karakter'),
    userId: z.string().optional(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Konfirmasi password tidak cocok dengan password baru',
    path: ['confirmPassword'],
  });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type AddressInput = z.infer<typeof baseAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
