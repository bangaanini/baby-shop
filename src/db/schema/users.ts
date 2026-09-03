import { pgTable, text, varchar, boolean, timestamp, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const usersTable = pgTable('user', {
  id: text('id').primaryKey(),
  name: varchar('name', { length: 150 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  phone: varchar('phone', { length: 50 }),
  role: varchar('role', { length: 20 }).default('buyer').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const addressesTable = pgTable('addresses', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id')
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
    fields: [addressesTable.userId],
    references: [usersTable.id],
  }),
}));

// Better Auth alias
export const user = usersTable;
