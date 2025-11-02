/**
 * Better Auth server configuration
 * Handles authentication with email/password, Google OAuth, and session management
 */

import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { bearer } from 'better-auth/plugins';
import { db } from '@/lib/db';
import { users, sessions, accounts, verifications } from '@/lib/db';
import { nanoid } from 'nanoid';
import { getAllowedOrigins } from '@/lib/cors-config';

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
  plugins: [
    bearer(), // Enable bearer token authentication for cross-origin requests
  ],
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      enabled: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    },
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,

  // Session configuration
  session: {
    // Extend session expiration to 7 days
    expiresIn: 60 * 60 * 24 * 7, // 7 days in seconds
    // Update session expiration on each request (rolling sessions)
    updateAge: 60 * 60 * 24, // Update if older than 1 day
    // Cookie name
    cookieName: 'better-auth.session_token',
  },

  // Advanced cookie settings
  advanced: {
    // Ensure cookies work in development (localhost)
    useSecureCookies: process.env.NODE_ENV === 'production',
    // Cookie options
    cookieOptions: {
      sameSite: 'none', // Allow cross-origin cookies (required for Webflow → Vercel)
      httpOnly: true, // Security: prevent JavaScript access
      secure: true, // REQUIRED when sameSite: 'none' - HTTPS only
      path: '/', // Available across entire site
    },
  },

  // CORS configuration - automatically includes BETTER_AUTH_URL and NEXT_PUBLIC_API_URL
  // Additional origins can be configured via ALLOWED_CORS_ORIGINS env var
  trustedOrigins: getAllowedOrigins(),

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
