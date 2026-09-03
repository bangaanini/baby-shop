import { pgTable, uuid, varchar, text, boolean, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const usersTable = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 150 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 50 }),
  role: varchar('role', { length: 20 }).default('buyer').notNull(),
  avatar_url: text('avatar_url'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const addressesTable = pgTable('addresses', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: uuid('user_id')
    .references(() => usersTable.id, { onDelete: 'cascade' })
    .notNull(),
  recipient_name: varchar('recipient_name', { length: 150 }).notNull(),
  phone: varchar('phone', { length: 50 }).notNull(),
  label: varchar('label', { length: 50 }),
  full_address: text('full_address').notNull(),
  province: varchar('province', { length: 100 }),
  city: varchar('city', { length: 100 }),
  district: varchar('district', { length: 100 }),
  postal_code: varchar('postal_code', { length: 20 }),
  is_primary: boolean('is_primary').default(false).notNull(),
});

export const usersRelations = relations(usersTable, ({ many }) => ({
  addresses: many(addressesTable),
}));

export const addressesRelations = relations(addressesTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [addressesTable.user_id],
    references: [usersTable.id],
  }),
}));
