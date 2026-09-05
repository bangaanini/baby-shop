import { pgTable, uuid, varchar, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';

export const vouchersTable = pgTable('vouchers', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 150 }).notNull(),
  description: text('description'),
  discount_type: varchar('discount_type', { length: 20 }).default('fixed').notNull(), // 'fixed' | 'percentage' | 'shipping'
  discount_value: integer('discount_value').notNull(),
  max_discount_amount: integer('max_discount_amount'),
  min_order_amount: integer('min_order_amount').default(0).notNull(),
  usage_limit: integer('usage_limit'),
  used_count: integer('used_count').default(0).notNull(),
  start_date: timestamp('start_date').defaultNow().notNull(),
  end_date: timestamp('end_date'),
  is_active: boolean('is_active').default(true).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export type Voucher = typeof vouchersTable.$inferSelect;
export type NewVoucher = typeof vouchersTable.$inferInsert;
