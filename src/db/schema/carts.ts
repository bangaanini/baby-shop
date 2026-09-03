import { pgTable, uuid, integer, timestamp, text } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { usersTable } from './users';
import { productsTable, productVariantsTable } from './products';

export const cartsTable = pgTable('carts', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: text('user_id').references(() => usersTable.id, { onDelete: 'cascade' }),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const cartItemsTable = pgTable('cart_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  cart_id: uuid('cart_id')
    .references(() => cartsTable.id, { onDelete: 'cascade' })
    .notNull(),
  product_id: uuid('product_id')
    .references(() => productsTable.id, { onDelete: 'cascade' })
    .notNull(),
  variant_id: uuid('variant_id').references(() => productVariantsTable.id, { onDelete: 'set null' }),
  quantity: integer('quantity').default(1).notNull(),
});

export const cartsRelations = relations(cartsTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [cartsTable.user_id],
    references: [usersTable.id],
  }),
  items: many(cartItemsTable),
}));

export const cartItemsRelations = relations(cartItemsTable, ({ one }) => ({
  cart: one(cartsTable, {
    fields: [cartItemsTable.cart_id],
    references: [cartsTable.id],
  }),
  product: one(productsTable, {
    fields: [cartItemsTable.product_id],
    references: [productsTable.id],
  }),
  variant: one(productVariantsTable, {
    fields: [cartItemsTable.variant_id],
    references: [productVariantsTable.id],
  }),
}));
