/**
 * oRPC API Route Handler
 * Handles all API requests at /api/orpc/*
 */

import { RPCHandler } from '@orpc/server/fetch';
import { appRouter } from '@/lib/api';
import { createContext } from '@/lib/api/context';

const rpcHandler = new RPCHandler(appRouter);

export async function GET(request: Request) {
  const context = await createContext(request);
  const result = await rpcHandler.handle(request, { context });
  return result.matched ? result.response : new Response('Not Found', { status: 404 });
}

export async function POST(request: Request) {
  const context = await createContext(request);
  const result = await rpcHandler.handle(request, { context });
  return result.matched ? result.response : new Response('Not Found', { status: 404 });
}
