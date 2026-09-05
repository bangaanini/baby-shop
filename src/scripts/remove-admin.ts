import * as dotenv from 'dotenv';
dotenv.config();

import { eq } from 'drizzle-orm';
import { db, client } from '@/db';
import { usersTable } from '@/db/schema';

async function removeAdmin() {
  const targetEmail = process.argv[2]?.trim().toLowerCase();

  if (!targetEmail || !targetEmail.includes('@')) {
    console.error('❌ Gunakan format: npm run remove-admin <email>');
    console.error('Contoh: npm run remove-admin mantanadmin@gmail.com');
    process.exit(1);
  }

  try {
    console.log(`🔍 Mencari pengguna dengan email: ${targetEmail}...`);
    const existingUser = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, targetEmail),
    });

    if (!existingUser) {
      console.error(`❌ Pengguna dengan email "${targetEmail}" tidak ditemukan di database.`);
      process.exit(1);
    }

    await db
      .update(usersTable)
      .set({
        role: 'buyer',
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, existingUser.id));

    console.log(`✅ SUKSES! Hak akses administrator untuk "${existingUser.name || 'User'}" (${existingUser.email}) telah DICABUT.`);
    console.log(`Role akun berhasil diubah menjadi pembeli biasa (role: 'buyer').`);
  } catch (error) {
    console.error('❌ Terjadi kesalahan saat mencabut hak admin:', error);
  } finally {
    await client.end();
    process.exit(0);
  }
}

removeAdmin();
