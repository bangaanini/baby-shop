import { eq, and, desc } from 'drizzle-orm';
import { db } from '@/db';
import { usersTable, addressesTable, accountsTable } from '@/db/schema';
import { verifyPassword, hashPassword } from 'better-auth/crypto';
import type {
  UpdateProfileInput,
  AddressInput,
  UpdateAddressInput,
} from '@/server/validators/user.schema';

export interface FormattedAddress {
  id: string;
  userId: string;
  recipientName: string;
  phone: string;
  label: string | null;
  fullAddress: string;
  province: string | null;
  city: string | null;
  district: string | null;
  postalCode: string | null;
  isPrimary: boolean;
  // Indonesian aliases
  namaPenerima: string;
  telepon: string;
  labelAlamat: string;
  alamatLengkap: string;
  provinsi: string;
  kotaKabupaten: string;
  kecamatan: string;
  kodePos: string;
  isUtama: boolean;
}

function mapAddressRow(row: typeof addressesTable.$inferSelect): FormattedAddress {
  return {
    id: row.id,
    userId: row.userId,
    recipientName: row.recipient_name,
    phone: row.phone,
    label: row.label,
    fullAddress: row.full_address,
    province: row.province,
    city: row.city,
    district: row.district,
    postalCode: row.postal_code,
    isPrimary: row.is_primary,
    namaPenerima: row.recipient_name,
    telepon: row.phone,
    labelAlamat: row.label || '',
    alamatLengkap: row.full_address,
    provinsi: row.province || '',
    kotaKabupaten: row.city || '',
    kecamatan: row.district || '',
    kodePos: row.postal_code || '',
    isUtama: row.is_primary,
  };
}

export class UserService {
  /**
   * Get user profile by userId
   */
  async getUserProfile(userId: string) {
    const [user] = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        emailVerified: usersTable.emailVerified,
        image: usersTable.image,
        phone: usersTable.phone,
        role: usersTable.role,
        createdAt: usersTable.createdAt,
        updatedAt: usersTable.updatedAt,
      })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!user) {
      return null;
    }

    const memberSinceDate = user.createdAt ? new Date(user.createdAt) : new Date();
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    ];
    const memberSince = `${months[memberSinceDate.getMonth()]} ${memberSinceDate.getFullYear()}`;

    return {
      ...user,
      memberSince,
    };
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, data: UpdateProfileInput) {
    const existing = await this.getUserProfile(userId);
    if (!existing) {
      throw new Error(`Pengguna dengan ID ${userId} tidak ditemukan`);
    }

    const updateFields: {
      name?: string;
      phone?: string | null;
      image?: string | null;
      updatedAt: Date;
    } = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) {
      updateFields.name = data.name;
    }
    if (data.phone !== undefined) {
      updateFields.phone = data.phone;
    }
    if (data.image !== undefined) {
      updateFields.image = data.image;
    }

    await db
      .update(usersTable)
      .set(updateFields)
      .where(eq(usersTable.id, userId));

    const updatedProfile = await this.getUserProfile(userId);
    return {
      ...updatedProfile,
      birthDate: data.birthDate || null,
      gender: data.gender || null,
      childrenInfo: data.childrenInfo || null,
    };
  }

  /**
   * Get all addresses for a user ordered by primary status
   */
  async getUserAddresses(userId: string): Promise<FormattedAddress[]> {
    const rows = await db
      .select()
      .from(addressesTable)
      .where(eq(addressesTable.userId, userId))
      .orderBy(desc(addressesTable.is_primary));

    return rows.map(mapAddressRow);
  }

  /**
   * Create a new address for a user
   */
  async createAddress(userId: string, data: AddressInput): Promise<FormattedAddress> {
    const user = await this.getUserProfile(userId);
    if (!user) {
      throw new Error(`Pengguna dengan ID ${userId} tidak ditemukan`);
    }

    const existingAddresses = await db
      .select({ id: addressesTable.id })
      .from(addressesTable)
      .where(eq(addressesTable.userId, userId));

    const shouldBePrimary = data.isPrimary || existingAddresses.length === 0;

    if (shouldBePrimary) {
      await db
        .update(addressesTable)
        .set({ is_primary: false })
        .where(eq(addressesTable.userId, userId));
    }

    const [inserted] = await db
      .insert(addressesTable)
      .values({
        userId,
        recipient_name: data.recipientName,
        phone: data.phone,
        label: data.label || null,
        full_address: data.fullAddress,
        province: data.province,
        city: data.city,
        district: data.district || null,
        postal_code: data.postalCode,
        is_primary: shouldBePrimary,
      })
      .returning();

    return mapAddressRow(inserted);
  }

  /**
   * Update an existing address
   */
  async updateAddress(
    addressId: string,
    userId: string,
    data: UpdateAddressInput
  ): Promise<FormattedAddress> {
    const [existing] = await db
      .select()
      .from(addressesTable)
      .where(and(eq(addressesTable.id, addressId), eq(addressesTable.userId, userId)))
      .limit(1);

    if (!existing) {
      throw new Error('Alamat tidak ditemukan atau bukan milik Anda');
    }

    if (data.isPrimary === true) {
      await db
        .update(addressesTable)
        .set({ is_primary: false })
        .where(eq(addressesTable.userId, userId));
    }

    const updateValues: Record<string, any> = {};
    if (data.recipientName !== undefined) updateValues.recipient_name = data.recipientName;
    if (data.phone !== undefined) updateValues.phone = data.phone;
    if (data.label !== undefined) updateValues.label = data.label;
    if (data.fullAddress !== undefined) updateValues.full_address = data.fullAddress;
    if (data.province !== undefined) updateValues.province = data.province;
    if (data.city !== undefined) updateValues.city = data.city;
    if (data.district !== undefined) updateValues.district = data.district;
    if (data.postalCode !== undefined) updateValues.postal_code = data.postalCode;
    if (data.isPrimary !== undefined) updateValues.is_primary = data.isPrimary;

    const [updated] = await db
      .update(addressesTable)
      .set(updateValues)
      .where(and(eq(addressesTable.id, addressId), eq(addressesTable.userId, userId)))
      .returning();

    return mapAddressRow(updated);
  }

  /**
   * Delete an address
   */
  async deleteAddress(addressId: string, userId: string): Promise<{ success: boolean }> {
    const [existing] = await db
      .select()
      .from(addressesTable)
      .where(and(eq(addressesTable.id, addressId), eq(addressesTable.userId, userId)))
      .limit(1);

    if (!existing) {
      throw new Error('Alamat tidak ditemukan atau bukan milik Anda');
    }

    await db
      .delete(addressesTable)
      .where(and(eq(addressesTable.id, addressId), eq(addressesTable.userId, userId)));

    // If deleted address was primary, make the first remaining address primary
    if (existing.is_primary) {
      const [firstRemaining] = await db
        .select({ id: addressesTable.id })
        .from(addressesTable)
        .where(eq(addressesTable.userId, userId))
        .limit(1);

      if (firstRemaining) {
        await db
          .update(addressesTable)
          .set({ is_primary: true })
          .where(eq(addressesTable.id, firstRemaining.id));
      }
    }

    return { success: true };
  }

  /**
   * Set address as primary
   */
  async setPrimaryAddress(addressId: string, userId: string): Promise<FormattedAddress> {
    const [existing] = await db
      .select()
      .from(addressesTable)
      .where(and(eq(addressesTable.id, addressId), eq(addressesTable.userId, userId)))
      .limit(1);

    if (!existing) {
      throw new Error('Alamat tidak ditemukan atau bukan milik Anda');
    }

    await db
      .update(addressesTable)
      .set({ is_primary: false })
      .where(eq(addressesTable.userId, userId));

    const [updated] = await db
      .update(addressesTable)
      .set({ is_primary: true })
      .where(and(eq(addressesTable.id, addressId), eq(addressesTable.userId, userId)))
      .returning();

    return mapAddressRow(updated);
  }

  /**
   * Change user password
   */
  async changeUserPassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    const accounts = await db
      .select()
      .from(accountsTable)
      .where(eq(accountsTable.userId, userId));

    if (!accounts || accounts.length === 0) {
      throw new Error('Akun pengguna tidak ditemukan');
    }

    // Find credential account or any account with existing password
    const credentialAccount =
      accounts.find((acc) => acc.providerId === 'credential' && acc.password) ||
      accounts.find((acc) => acc.password);

    if (!credentialAccount || !credentialAccount.password) {
      throw new Error('Akun ini tidak terdaftar dengan kata sandi (login pihak ketiga)');
    }

    const isMatch = await verifyPassword({
      hash: credentialAccount.password,
      password: currentPassword,
    });

    if (!isMatch) {
      throw new Error('Kata sandi saat ini tidak cocok');
    }

    const hashedNewPassword = await hashPassword(newPassword);

    await db
      .update(accountsTable)
      .set({
        password: hashedNewPassword,
        updatedAt: new Date(),
      })
      .where(eq(accountsTable.id, credentialAccount.id));

    return {
      success: true,
      message: 'Kata sandi berhasil diperbarui',
    };
  }
}

export const userService = new UserService();
