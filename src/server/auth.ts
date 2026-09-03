import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/db';
import * as schema from '@/db/schema';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.usersTable,
      session: schema.sessionsTable,
      account: schema.accountsTable,
      verification: schema.verificationsTable,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'buyer',
      },
      phone: {
        type: 'string',
        required: false,
      },
    },
  },
  secret: process.env.BETTER_AUTH_SECRET || 'super-secret-baby-shop-auth-key-2026',
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
});
