import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import * as schema from '@/db/schema';

if (!process.env.BETTER_AUTH_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('BETTER_AUTH_SECRET environment variable is required in production.');
}

const adminEmails = (process.env.ADMIN_EMAILS || 'admin@nbusiness.id,admin@babykids.id')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

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
  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
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
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (user.email && adminEmails.includes(user.email.toLowerCase())) {
            return {
              data: {
                ...user,
                role: 'admin',
              },
            };
          }
          return { data: user };
        },
      },
    },
    session: {
      create: {
        before: async (session) => {
          try {
            const dbUser = await db.query.usersTable.findFirst({
              where: eq(schema.usersTable.id, session.userId),
            });
            if (
              dbUser &&
              adminEmails.includes(dbUser.email.toLowerCase()) &&
              dbUser.role !== 'admin'
            ) {
              await db
                .update(schema.usersTable)
                .set({ role: 'admin' })
                .where(eq(schema.usersTable.id, dbUser.id));
            }
          } catch (err) {
            console.error('Error in session create hook for admin check:', err);
          }
          return { data: session };
        },
      },
    },
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
});
