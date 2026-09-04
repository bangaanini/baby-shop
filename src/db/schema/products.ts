import { pgTable, uuid, varchar, text, integer, numeric, boolean, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { categoriesTable } from './categories';

export const productsTable = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  category_id: uuid('category_id')
    .references(() => categoriesTable.id, { onDelete: 'restrict' })
    .notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  price: integer('price').notNull(),
  original_price: integer('original_price'),
  discount_percent: integer('discount_percent'),
  sold_count: integer('sold_count').default(0).notNull(),
  rating: numeric('rating', { precision: 2, scale: 1 }).default('5.0').notNull(),
  review_count: integer('review_count').default(0).notNull(),
  stock: integer('stock').default(0).notNull(),
  material: varchar('material', { length: 255 }),
  suitable_age: varchar('suitable_age', { length: 100 }),
  image_url: text('image_url').notNull(),
  is_popular: boolean('is_popular').default(false).notNull(),
  is_new_arrival: boolean('is_new_arrival').default(false).notNull(),
  is_recommended: boolean('is_recommended').default(false).notNull(),
  is_promo: boolean('is_promo').default(false).notNull(),
  tag: varchar('tag', { length: 100 }),
  weight_gram: integer('weight_gram').default(500).notNull(),
  dimension_length: integer('dimension_length').default(10).notNull(),
  dimension_width: integer('dimension_width').default(10).notNull(),
  dimension_height: integer('dimension_height').default(10).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const productVariantsTable = pgTable('product_variants', {
  id: uuid('id').defaultRandom().primaryKey(),
  product_id: uuid('product_id')
    .references(() => productsTable.id, { onDelete: 'cascade' })
    .notNull(),
  color: varchar('color', { length: 100 }),
  size: varchar('size', { length: 100 }),
  stock: integer('stock').default(0).notNull(),
  additional_price: integer('additional_price').default(0).notNull(),
});

export const productImagesTable = pgTable('product_images', {
  id: uuid('id').defaultRandom().primaryKey(),
  product_id: uuid('product_id')
    .references(() => productsTable.id, { onDelete: 'cascade' })
    .notNull(),
  url: text('url').notNull(),
  alt_text: varchar('alt_text', { length: 255 }),
  sort_order: integer('sort_order').default(0).notNull(),
});

export const productsRelations = relations(productsTable, ({ one, many }) => ({
  category: one(categoriesTable, {
    fields: [productsTable.category_id],
    references: [categoriesTable.id],
  }),
  variants: many(productVariantsTable),
  images: many(productImagesTable),
}));

export const productVariantsRelations = relations(productVariantsTable, ({ one }) => ({
  product: one(productsTable, {
    fields: [productVariantsTable.product_id],
    references: [productsTable.id],
  }),
}));

export const productImagesRelations = relations(productImagesTable, ({ one }) => ({
  product: one(productsTable, {
    fields: [productImagesTable.product_id],
    references: [productsTable.id],
  }),
}));
