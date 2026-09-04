import * as dotenv from 'dotenv';
dotenv.config();

import { eq } from 'drizzle-orm';
import { db, client } from '@/db';
import { usersTable } from '@/db/schema';

async function setAdmin() {
  const targetEmail = process.argv[2]?.trim().toLowerCase();

  if (!targetEmail || !targetEmail.includes('@')) {
    console.error('❌ Gunakan format: npm run set-admin <email>');
    console.error('Contoh: npm run set-admin pemilik@gmail.com');
    process.exit(1);
  }

  try {
    console.log(`🔍 Mencari pengguna dengan email: ${targetEmail}...`);
    const existingUser = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, targetEmail),
    });

    if (!existingUser) {
      console.log(`ℹ️ Pengguna belum terdaftar di database.`);
      console.log(`💡 Menambahkan email ke environment variable ADMIN_EMAILS.`);
      console.log(`Begitu pengguna login pertama kali via Google OAuth, akunnya otomatis menjadi Administrator.`);
      process.exit(0);
    }

    await db
      .update(usersTable)
      .set({
        role: 'admin',
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, existingUser.id));

    console.log(`✅ SUKSES! Akun "${existingUser.name}" (${existingUser.email}) berhasil diangkat menjadi Administrator Toko (role: 'admin')!`);
  } catch (error) {
    console.error('❌ Terjadi kesalahan saat mengangkat admin:', error);
  } finally {
    await client.end();
    process.exit(0);
  }
}

setAdmin();
