import { pgTable, text, varchar, boolean, timestamp, json } from 'drizzle-orm/pg-core';

export const storeSettingsTable = pgTable('store_settings', {
  id: text('id').primaryKey().default('default'),
  store_name: varchar('store_name', { length: 150 }).default('NBusiness').notNull(),
  store_tagline: varchar('store_tagline', { length: 255 }).default('Marketplace & Toko Kebutuhan Anak Terpercaya'),
  store_description: text('store_description').default('Pusat belanja perlengkapan bayi, pakaian anak, dan mainan edukasi terstandar SNI di NBusiness.'),
  store_email: varchar('store_email', { length: 255 }).default('halo@babykids.id'),
  store_phone: varchar('store_phone', { length: 50 }).default('0812-3456-7890'),
  store_address: text('store_address').default('Jl. Melati Indah No. 42, RT 03 / RW 07, Kebayoran Baru'),
  store_city: varchar('store_city', { length: 100 }).default('Jakarta Selatan'),
  store_postal_code: varchar('store_postal_code', { length: 20 }).default('12160'),
  seo_meta_title: varchar('seo_meta_title', { length: 255 }).default('NBusiness — Toko Kebutuhan Anak & Perlengkapan Terlengkap'),
  seo_meta_description: text('seo_meta_description').default('Beli perlengkapan bayi, baju anak modis, dan mainan edukatif terpercaya dengan pengiriman cepat ke seluruh Indonesia di NBusiness.'),
  seo_keywords: text('seo_keywords').default('nbusiness, toko anak, perlengkapan bayi, baju anak, mainan edukasi, belanja anak online'),
  seo_google_verification: varchar('seo_google_verification', { length: 255 }),
  seo_og_image: text('seo_og_image'),
  active_payment_gateway: varchar('active_payment_gateway', { length: 50 }).default('midtrans').notNull(),
  midtrans_server_key: text('midtrans_server_key'),
  midtrans_client_key: text('midtrans_client_key'),
  midtrans_merchant_id: text('midtrans_merchant_id'),
  midtrans_is_production: boolean('midtrans_is_production').default(false).notNull(),
  xendit_secret_key: text('xendit_secret_key'),
  xendit_public_key: text('xendit_public_key'),
  xendit_webhook_token: text('xendit_webhook_token'),
  xendit_is_production: boolean('xendit_is_production').default(false).notNull(),
  enabled_payment_methods: json('enabled_payment_methods').$type<string[]>().default(['pay-qris', 'pay-bca-va', 'pay-mandiri-va', 'pay-bri-va', 'pay-gopay']).notNull(),
  enabled_couriers: json('enabled_couriers').$type<string[]>().default(['sicepat', 'jne', 'jnt', 'anteraja', 'cargo']).notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export type StoreSettings = typeof storeSettingsTable.$inferSelect;
export type NewStoreSettings = typeof storeSettingsTable.$inferInsert;
