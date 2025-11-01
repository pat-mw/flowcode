/**
 * oRPC Router
 * Combines all API routers into a single root router
 */

import { os } from '@orpc/server';
import { authRouter } from './routers/auth';
import { postsRouter } from './routers/posts';
import { peopleRouter } from './routers/people';
import { waitlistRouter } from './routers/waitlist';
import { integrationsRouter } from './routers/integrations';

export const appRouter = os.router({
  auth: authRouter,
  posts: postsRouter,
  people: peopleRouter,
  waitlist: waitlistRouter,
  integrations: integrationsRouter,
});

export type AppRouter = typeof appRouter;
