/**
 * oRPC Router
 * Combines all API routers into a single root router
 */

import { os } from '@orpc/server';
import { authRouter } from './routers/auth';
import { postsRouter } from './routers/posts';
import { peopleRouter } from './routers/people';

export const appRouter = os.router({
  auth: authRouter,
  posts: postsRouter,
  people: peopleRouter,
});

export type AppRouter = typeof appRouter;
