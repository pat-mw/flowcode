/**
 * oRPC Context
 * Defines the context available to all API procedures
 */

import { auth, type Session } from '@/lib/auth/config';

export interface Context {
  session: Session | null;
  userId: string | null;
}

/**
 * Create context for each API request
 * Extracts session from Better Auth
 */
export async function createContext(req: Request): Promise<Context> {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    return {
      session: session || null,
      userId: session?.user?.id || null,
    };
  } catch {
    return {
      session: null,
      userId: null,
    };
  }
}
