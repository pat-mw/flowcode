/**
 * Auth Router
 * Handles user authentication operations
 * Note: Main auth operations (register, login, logout) are handled by Better Auth
 * This router provides session info and additional auth-related queries
 */

import { os } from '@orpc/server';
import { publicProcedure } from '../procedures';
import { db, people } from '@/lib/db';
import { eq } from 'drizzle-orm';

import type { Context } from '../context';

const getSession = publicProcedure.handler(async ({ context }) => {
  const ctx = context as Context;
  if (!ctx.session || !ctx.userId) {
    return null;
  }

  // Get user's person profile
  const person = await db.query.people.findFirst({
    where: eq(people.userId, ctx.userId),
  });

  return {
    user: ctx.session.user,
    person,
  };
});

const isAuthenticated = publicProcedure.handler(({ context }) => {
  const ctx = context as Context;
  return !!ctx.userId;
});

export const authRouter = os.router({
  getSession,
  isAuthenticated,
});
