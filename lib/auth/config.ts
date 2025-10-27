/**
 * Better Auth server configuration
 * Handles authentication with email/password, Google OAuth, and session management
 */

import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/lib/db';
import { users, sessions, accounts, verifications } from '@/lib/db';
import { nanoid } from 'nanoid';

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error('BETTER_AUTH_SECRET is required');
}

if (!process.env.BETTER_AUTH_URL) {
  throw new Error('BETTER_AUTH_URL is required');
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Can be enabled later with email service
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      enabled: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    },
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,

  // Callbacks
  callbacks: {
    async afterSignUp(user: { id: string; name: string; email: string; image?: string | null }) {
      // Create person profile after user registration
      const { db: dbInstance, people } = await import('@/lib/db');

      await dbInstance.insert(people).values({
        id: nanoid(),
        userId: user.id,
        displayName: user.name,
        avatar: user.image || null,
        bio: null,
        website: null,
      });
    },
  },
});

export type Session = typeof auth.$Infer.Session;
