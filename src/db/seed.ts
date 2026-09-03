import * as dotenv from 'dotenv';
dotenv.config();

import { db, client } from './index';
import * as schema from './schema';
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from '../data/mock-products';
import { MOCK_SAVED_ADDRESSES, MOCK_INITIAL_CART } from '../data/mock-checkout';
import { MOCK_ORDERS } from '../data/mock-orders';

function parseIndonesianDate(dateStr: string): Date {
  const months: Record<string, number> = {
    jan: 0,
    feb: 1,
    mar: 2,
    apr: 3,
    mei: 4,
    may: 4,
    jun: 5,
    jul: 6,
    agu: 7,
    ags: 7,
    aug: 7,
    sep: 8,
    okt: 9,
    oct: 9,
    nov: 10,
    des: 11,
    dec: 11,
  };

  const regex = /(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})(?:,\s+(\d{1,2}):(\d{2}))?/;
  const match = dateStr.match(regex);
  if (match) {
    const day = parseInt(match[1], 10);
    const monthStr = match[2].toLowerCase().slice(0, 3);
    const month = months[monthStr] ?? 0;
    const year = parseInt(match[3], 10);
    const hours = match[4] ? parseInt(match[4], 10) : 0;
    const minutes = match[5] ? parseInt(match[5], 10) : 0;
    return new Date(Date.UTC(year, month, day, hours - 7, minutes)); // WIB is UTC+7
  }
  const fallback = new Date(dateStr);
  return isNaN(fallback.getTime()) ? new Date() : fallback;
}

function determineCourierCode(courierName: string): string {
  const lower = courierName.toLowerCase();
  if (lower.includes('sicepat')) return 'sicepat';
  if (lower.includes('jne')) return 'jne';
  if (lower.includes('j&t') || lower.includes('jnt')) return 'jnt';
  if (lower.includes('anteraja')) return 'anteraja';
  if (lower.includes('pos')) return 'pos';
  if (lower.includes('tiki')) return 'tiki';
  if (lower.includes('gosend') || lower.includes('gojek')) return 'gosend';
  if (lower.includes('grab')) return 'grabexpress';
  return 'custom';
}

async function seed() {
  console.log('🌱 Starting database seed for BabyKids...');

  try {
    // 1. Clean existing tables (in foreign key safe order)
    console.log('🧹 Cleaning existing table records...');
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
    const productMap = new Map<string, { id: string; variants: Map<string, string> }>();
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
          sold_count: prod.terjual,
          rating: prod.rating.toFixed(1),
          review_count: prod.reviewCount,
          stock: prod.stok,
          material: prod.bahan ?? null,
          suitable_age: prod.usiaCocok ?? null,
          image_url: prod.gambar,
          is_popular: Boolean(prod.isPopuler),
          is_new_arrival: Boolean(prod.isTerbaru),
          is_recommended: Boolean(prod.isRekomendasi),
          is_promo: Boolean(prod.isPromo),
          tag: prod.tag ?? null,
        })
        .returning({ id: schema.productsTable.id, slug: schema.productsTable.slug });

      const variantMap = new Map<string, string>();
      if (prod.varian && prod.varian.length > 0) {
        for (const v of prod.varian) {
          const [insertedVariant] = await db
            .insert(schema.productVariantsTable)
            .values({
              product_id: insertedProd.id,
              color: v.warna,
              size: v.ukuran,
              stock: v.stok,
              additional_price: v.hargaTambahan ?? 0,
            })
            .returning({ id: schema.productVariantsTable.id });
          const key = `${v.warna.toLowerCase().trim()}|${v.ukuran.toLowerCase().trim()}`;
          variantMap.set(key, insertedVariant.id);
          totalVariants++;
        }
      }

      // Insert primary image
      await db.insert(schema.productImagesTable).values({
        product_id: insertedProd.id,
        url: prod.gambar,
        alt_text: prod.nama,
        sort_order: 0,
      });
      totalImages++;

      // Insert gallery images if any
      if (prod.galeri && prod.galeri.length > 0) {
        let order = 1;
        for (const img of prod.galeri) {
          if (img.url !== prod.gambar) {
            await db.insert(schema.productImagesTable).values({
              product_id: insertedProd.id,
              url: img.url,
              alt_text: img.altText || prod.nama,
              sort_order: order++,
            });
            totalImages++;
          }
        }
      }

      productMap.set(insertedProd.slug, { id: insertedProd.id, variants: variantMap });
    }
    console.log(
      `✅ Products seeded: ${productMap.size} products, ${totalVariants} variants, ${totalImages} images.`
    );

    // 4. Seed Users (Demo Buyer & Admin) and Addresses
    console.log('👤 Seeding demo users and addresses...');
    const [buyerUser] = await db
      .insert(schema.usersTable)
      .values({
        name: 'Bunda Sarah Clarissa',
        email: 'sarah.clarissa@example.com',
        phone: '0812-3456-7890',
        role: 'buyer',
        avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=60',
      })
      .returning({ id: schema.usersTable.id, email: schema.usersTable.email });

    const [adminUser] = await db
      .insert(schema.usersTable)
      .values({
        name: 'Admin BabyKids',
        email: 'admin@babykids.id',
        phone: '0811-0000-0000',
        role: 'admin',
        avatar_url: null,
      })
      .returning({ id: schema.usersTable.id, email: schema.usersTable.email });

    console.log(`✅ Users created: Buyer (${buyerUser.email}), Admin (${adminUser.email}).`);

    // Seed Saved Addresses for demo buyer
    for (const addr of MOCK_SAVED_ADDRESSES) {
      await db.insert(schema.addressesTable).values({
        user_id: buyerUser.id,
        recipient_name: addr.namaPenerima,
        phone: addr.telepon,
        label: addr.labelAlamat,
        full_address: addr.alamatLengkap,
        district: addr.kecamatan,
        city: addr.kotaKabupaten,
        province: addr.provinsi,
        postal_code: addr.kodePos,
        is_primary: addr.isUtama,
      });
    }
    console.log(`✅ Addresses seeded (${MOCK_SAVED_ADDRESSES.length} addresses for buyer).`);

    // 5. Seed Initial Cart for Demo Buyer
    const [buyerCart] = await db
      .insert(schema.cartsTable)
      .values({
        user_id: buyerUser.id,
      })
      .returning({ id: schema.cartsTable.id });

    let cartItemCount = 0;
    for (const cartItem of MOCK_INITIAL_CART) {
      const prodInfo = productMap.get(cartItem.slug);
      if (prodInfo) {
        let variantId: string | null = null;
        if (cartItem.warna && cartItem.ukuran) {
          const vKey = `${cartItem.warna.toLowerCase().trim()}|${cartItem.ukuran.toLowerCase().trim()}`;
          variantId = prodInfo.variants.get(vKey) ?? null;
        }
        await db.insert(schema.cartItemsTable).values({
          cart_id: buyerCart.id,
          product_id: prodInfo.id,
          variant_id: variantId,
          quantity: cartItem.jumlah,
        });
        cartItemCount++;
      }
    }
    console.log(`✅ Cart seeded for buyer (${cartItemCount} items in cart).`);

    // 6. Seed Orders, Order Items, and Tracking History
    console.log(`📦 Seeding ${MOCK_ORDERS.length} demo orders with timeline...`);
    let totalOrderItems = 0;
    let totalTrackingEvents = 0;

    for (const order of MOCK_ORDERS) {
      const orderCreatedAt = parseIndonesianDate(order.tanggalPesanan);
      const [insertedOrder] = await db
        .insert(schema.ordersTable)
        .values({
          invoice_number: order.nomorInvoice,
          user_id: buyerUser.id,
          status: order.status,
          recipient_name: order.namaPenerima,
          recipient_phone: order.teleponPenerima,
          shipping_address: order.alamatLengkap,
          courier_code: determineCourierCode(order.kurir),
          courier_service: order.layananKurir,
          tracking_number: order.nomorResi || null,
          payment_method: order.metodePembayaran,
          subtotal: order.subtotal,
          shipping_cost: order.ongkir,
          discount_amount: order.diskon,
          service_fee: order.biayaLayanan,
          total_amount: order.totalBayar,
          notes: order.catatan || null,
          created_at: orderCreatedAt,
          updated_at: orderCreatedAt,
        })
        .returning({ id: schema.ordersTable.id });

      // Insert items for this order
      for (const item of order.items) {
        const productInfo = productMap.get(item.slug);
        const productId = productInfo?.id ?? null;
        let variantId: string | null = null;
        if (productInfo && item.warna && item.ukuran) {
          const vKey = `${item.warna.toLowerCase().trim()}|${item.ukuran.toLowerCase().trim()}`;
          variantId = productInfo.variants.get(vKey) ?? null;
        }

        await db.insert(schema.orderItemsTable).values({
          order_id: insertedOrder.id,
          product_id: productId,
          variant_id: variantId,
          product_name: item.nama,
          variant_color: item.warna || null,
          variant_size: item.ukuran || null,
          price: item.harga,
          quantity: item.jumlah,
          image_url: item.gambar,
        });
        totalOrderItems++;
      }

      // Insert tracking history for this order
      if (order.trackingTimeline && order.trackingTimeline.length > 0) {
        for (const step of order.trackingTimeline) {
          const stepTime = parseIndonesianDate(step.waktu);
          await db.insert(schema.trackingHistoryTable).values({
            order_id: insertedOrder.id,
            status_title: step.status,
            description: step.keterangan || null,
            location: step.lokasi || null,
            occurred_at: stepTime,
          });
          totalTrackingEvents++;
        }
      }
    }

    console.log(
      `✅ Orders seeded: ${MOCK_ORDERS.length} orders, ${totalOrderItems} items, ${totalTrackingEvents} tracking events.`
    );
    console.log('✨ All seed data populated successfully!');
  } catch (error) {
    console.error('❌ Error during database seed:', error);
    throw error;
  } finally {
    console.log('🔒 Closing database connection...');
    await client.end();
    console.log('👋 Database connection closed.');
  }
}

seed()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
