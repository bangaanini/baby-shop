import { pgTable, uuid, varchar, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { usersTable } from './users';
import { productsTable, productVariantsTable } from './products';

export const ordersTable = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  invoice_number: varchar('invoice_number', { length: 50 }).notNull().unique(),
  user_id: uuid('user_id').references(() => usersTable.id, { onDelete: 'set null' }),
  status: varchar('status', { length: 50 }).default('menunggu_pembayaran').notNull(),
  recipient_name: varchar('recipient_name', { length: 150 }).notNull(),
  recipient_phone: varchar('recipient_phone', { length: 50 }).notNull(),
  shipping_address: text('shipping_address').notNull(),
  courier_code: varchar('courier_code', { length: 50 }).notNull(),
  courier_service: varchar('courier_service', { length: 100 }).notNull(),
  tracking_number: varchar('tracking_number', { length: 100 }),
  payment_method: varchar('payment_method', { length: 100 }).notNull(),
  subtotal: integer('subtotal').notNull(),
  shipping_cost: integer('shipping_cost').notNull(),
  discount_amount: integer('discount_amount').default(0).notNull(),
  service_fee: integer('service_fee').default(1000).notNull(),
  total_amount: integer('total_amount').notNull(),
  notes: text('notes'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const orderItemsTable = pgTable('order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  order_id: uuid('order_id')
    .references(() => ordersTable.id, { onDelete: 'cascade' })
    .notNull(),
  product_id: uuid('product_id')
    .references(() => productsTable.id, { onDelete: 'set null' }),
  variant_id: uuid('variant_id')
    .references(() => productVariantsTable.id, { onDelete: 'set null' }),
  product_name: varchar('product_name', { length: 255 }).notNull(),
  variant_color: varchar('variant_color', { length: 100 }),
  variant_size: varchar('variant_size', { length: 100 }),
  price: integer('price').notNull(),
  quantity: integer('quantity').notNull(),
  image_url: text('image_url').notNull(),
});

export const trackingHistoryTable = pgTable('tracking_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  order_id: uuid('order_id')
    .references(() => ordersTable.id, { onDelete: 'cascade' })
    .notNull(),
  status_title: varchar('status_title', { length: 150 }).notNull(),
  description: text('description'),
  location: varchar('location', { length: 150 }),
  occurred_at: timestamp('occurred_at').defaultNow().notNull(),
});

export const ordersRelations = relations(ordersTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [ordersTable.user_id],
    references: [usersTable.id],
  }),
  items: many(orderItemsTable),
  trackingHistory: many(trackingHistoryTable),
}));

export const orderItemsRelations = relations(orderItemsTable, ({ one }) => ({
  order: one(ordersTable, {
    fields: [orderItemsTable.order_id],
    references: [ordersTable.id],
  }),
  product: one(productsTable, {
    fields: [orderItemsTable.product_id],
    references: [productsTable.id],
  }),
  variant: one(productVariantsTable, {
    fields: [orderItemsTable.variant_id],
    references: [productVariantsTable.id],
  }),
}));

export const trackingHistoryRelations = relations(trackingHistoryTable, ({ one }) => ({
  order: one(ordersTable, {
    fields: [trackingHistoryTable.order_id],
    references: [ordersTable.id],
  }),
}));
