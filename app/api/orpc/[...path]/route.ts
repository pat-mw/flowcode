/**
 * oRPC API Route Handler
 * Handles all API requests at /api/orpc/*
 */

import { RPCHandler } from '@orpc/server/fetch';
import { appRouter } from '@/lib/api';
import { createContext } from '@/lib/api/context';

const rpcHandler = new RPCHandler(appRouter, {
  prefix: '/api/orpc',
});

async function handleRequest(request: Request) {
  const context = await createContext(request);
  const { response } = await rpcHandler.handle(request, {
    prefix: '/api/orpc',
    context,
  });

  return response ?? new Response('Not Found', { status: 404 });
}

export const GET = handleRequest;
export const POST = handleRequest;
export const HEAD = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
