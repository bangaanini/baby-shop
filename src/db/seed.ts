import * as dotenv from 'dotenv';
dotenv.config();

import { db, client } from './index';
import * as schema from './schema';
import { hashPassword } from 'better-auth/crypto';
import { createLocalAccountIssuer } from 'better-auth';
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from '../data/mock-products';

async function seed() {
  console.log('🌱 Starting database seed for NBusiness (Products, Categories & Admin Only)...');

  try {
    // 1. Clean existing tables (in foreign key safe order)
    console.log('🧹 Cleaning existing table records...');
    await db.delete(schema.sessionsTable);
    await db.delete(schema.accountsTable);
    await db.delete(schema.verificationsTable);
    await db.delete(schema.trackingHistoryTable);
    await db.delete(schema.orderItemsTable);
    await db.delete(schema.ordersTable);
    await db.delete(schema.cartItemsTable);
    await db.delete(schema.cartsTable);
    await db.delete(schema.addressesTable);
    await db.delete(schema.productImagesTable);
    await db.delete(schema.productVariantsTable);
    await db.delete(schema.productsTable);
    await db.delete(schema.categoriesTable);
    await db.delete(schema.usersTable);

    // 2. Seed Categories
    console.log(`📂 Seeding ${MOCK_CATEGORIES.length} categories...`);
    const categoryMap = new Map<string, string>(); // slug -> category_id
    for (const cat of MOCK_CATEGORIES) {
      const [insertedCat] = await db
        .insert(schema.categoriesTable)
        .values({
          slug: cat.slug,
          name: cat.nama,
          description: cat.deskripsi,
          icon_name: cat.iconName,
          color_bg: cat.warnaBg,
        })
        .returning({ id: schema.categoriesTable.id, slug: schema.categoriesTable.slug });
      categoryMap.set(insertedCat.slug, insertedCat.id);
    }
    console.log(`✅ Categories seeded successfully (${categoryMap.size} records).`);

    // 3. Seed Products, Variants, and Images
    console.log(`🧸 Seeding ${MOCK_PRODUCTS.length} products with variants and images...`);
    let totalVariants = 0;
    let totalImages = 0;

    for (const prod of MOCK_PRODUCTS) {
      const categoryId = categoryMap.get(prod.kategori);
      if (!categoryId) {
        throw new Error(`Category not found for slug: ${prod.kategori}`);
      }

      const [insertedProd] = await db
        .insert(schema.productsTable)
        .values({
          category_id: categoryId,
          name: prod.nama,
          slug: prod.slug,
          description: prod.deskripsi,
          price: prod.harga,
          original_price: prod.hargaCoret ?? null,
          discount_percent: prod.diskonPersen ?? null,
          sold_count: 0,
          rating: '5.0',
          review_count: 0,
          stock: prod.stok,
          material: prod.bahan ?? null,
          suitable_age: prod.usiaCocok ?? null,
          image_url: prod.gambar,
          is_popular: Boolean(prod.isPopuler),
          is_new_arrival: Boolean(prod.isTerbaru),
          is_recommended: Boolean(prod.isRekomendasi),
          is_promo: Boolean(prod.isPromo),
          tag: prod.tag ?? null,
          weight_gram: 500,
          dimension_length: 15,
          dimension_width: 10,
          dimension_height: 5,
        })
        .returning({ id: schema.productsTable.id, slug: schema.productsTable.slug });

      if (prod.varian && prod.varian.length > 0) {
        for (const v of prod.varian) {
          await db
            .insert(schema.productVariantsTable)
            .values({
              product_id: insertedProd.id,
              color: v.warna,
              size: v.ukuran,
              stock: v.stok,
              additional_price: v.hargaTambahan ?? 0,
            });
          totalVariants++;
        }
      }

      const galleryUrls = [
        prod.gambar,
        'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=500&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=500&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=500&auto=format&fit=crop&q=60',
      ];

      let sortOrder = 0;
      for (const imgUrl of galleryUrls) {
        await db.insert(schema.productImagesTable).values({
          product_id: insertedProd.id,
          url: imgUrl,
          alt_text: `${prod.nama} - Foto ${sortOrder + 1}`,
          sort_order: sortOrder,
        });
        totalImages++;
        sortOrder++;
      }
    }
    console.log(
      `✅ Products seeded: ${MOCK_PRODUCTS.length} products, ${totalVariants} variants, ${totalImages} gallery images.`
    );

    // 4. Seed Default Admin User
    console.log('👤 Seeding default admin user...');
    const adminPasswordHash = await hashPassword('admin123');

    const [adminUser] = await db
      .insert(schema.usersTable)
      .values({
        id: 'user_admin_demo_1',
        name: 'Admin Toko NBusiness',
        email: 'admin@nbusiness.id',
        emailVerified: true,
        phone: '0812-0000-9999',
        role: 'admin',
      })
      .returning({ id: schema.usersTable.id });

    await db.insert(schema.accountsTable).values({
      id: 'acc_admin_demo_1',
      userId: adminUser.id,
      accountId: 'admin@nbusiness.id',
      providerId: 'credential',
      password: adminPasswordHash,
      issuer: createLocalAccountIssuer('credential'),
    });
    console.log('✅ Admin user created: admin@nbusiness.id / admin123');

    // 5. Seed Default Store Settings if not present
    console.log('⚙️ Initializing default store settings...');
    const existingSettings = await db.query.storeSettingsTable.findFirst();
    if (!existingSettings) {
      await db.insert(schema.storeSettingsTable).values({
        id: 'default',
        store_name: 'NBusiness',
        store_tagline: 'Marketplace & Toko Kebutuhan Anak Terpercaya',
        store_email: 'halo@nbusiness.id',
        store_phone: '0812-3456-7890',
        store_address: 'Jl. Senopati Raya No. 45, RT.05/RW.02, Kel. Selong, Kebayoran Baru',
        store_city: 'Jakarta Selatan',
        store_postal_code: '12160',
        active_payment_gateway: 'midtrans',
        enabled_payment_methods: ['pay-qris', 'pay-bca-va', 'pay-mandiri-va', 'pay-bri-va', 'pay-gopay'],
        enabled_couriers: ['sicepat', 'jne', 'jnt', 'anteraja', 'cargo'],
      });
      console.log('✅ Default store settings initialized.');
    }

    console.log('✨ Seed completed cleanly! Zero mock orders or dummy transactions.');
  } catch (error) {
    console.error('❌ Error during database seed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

seed().catch((err) => {
  console.error('Fatal error during seed:', err);
  process.exit(1);
});
