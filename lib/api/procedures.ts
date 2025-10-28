/**
 * oRPC Base Procedures
 * Defines public and protected procedure middlewares
 */

import { os } from '@orpc/server';
import type { Context } from './context';

/**
 * Base procedure
 */
export const baseProcedure = os;

/**
 * Public procedure - no authentication required
 */
export const publicProcedure = baseProcedure;

type AuthenticatedContext = {
  session: NonNullable<Context['session']>;
  userId: string;
};

/**
 * Protected procedure - requires authentication
 * Throws 401 error if user is not authenticated
 */
export const protectedProcedure = baseProcedure.use<AuthenticatedContext>(async ({ context, next }) => {
  const ctx = context as Context;

  console.log('[protectedProcedure] Checking auth:', {
    hasUserId: !!ctx.userId,
    hasSession: !!ctx.session,
    userId: ctx.userId,
  });

  if (!ctx.userId || !ctx.session) {
    console.error('[protectedProcedure] UNAUTHORIZED - missing userId or session');
    throw new Error('UNAUTHORIZED');
  }

  console.log('[protectedProcedure] Auth successful, proceeding...');

  return next({
    context: {
      session: ctx.session,
      userId: ctx.userId,
    },
  });
});
