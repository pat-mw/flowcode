/**
 * oRPC API Route Handler with CORS support
 * Handles all API requests at /api/orpc/*
 */

import { RPCHandler } from '@orpc/server/fetch';
import { appRouter } from '@/lib/api';
import { createContext } from '@/lib/api/context';

const rpcHandler = new RPCHandler(appRouter);

// CORS configuration - allow Webflow domain to make API requests
const ALLOWED_ORIGINS = [
  'https://blogflow-three.webflow.io',  // Production Webflow site
  'http://localhost:3000',               // Local development
  'https://blogflow-three.vercel.app',   // Production backend (for testing)
];

/**
 * Check if the request origin is in the allowed list
 */
function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.includes(origin);
}

/**
 * Add CORS headers to response
 */
function setCorsHeaders(response: Response, origin: string | null): Response {
  // Clone the response to modify headers
  const newResponse = new Response(response.body, response);

  if (origin && isOriginAllowed(origin)) {
    newResponse.headers.set('Access-Control-Allow-Origin', origin);
    newResponse.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  newResponse.headers.set('Access-Control-Max-Age', '86400'); // 24 hours

  return newResponse;
}

async function handleRequest(request: Request) {
  const origin = request.headers.get('origin');

  try {
    // Handle preflight OPTIONS request
    if (request.method === 'OPTIONS') {
      const response = new Response(null, { status: 204 });
      return setCorsHeaders(response, origin);
    }

    // Log request details
    console.log('[oRPC] Handling request:', {
      method: request.method,
      url: request.url,
      origin,
    });

    // Handle actual request
    const context = await createContext(request);
    console.log('[oRPC] Context created:', {
      hasSession: !!context.session,
      userId: context.userId,
    });

    const { response } = await rpcHandler.handle(request, {
      prefix: '/api/orpc',
      context,
    });

    console.log('[oRPC] Handler response:', {
      status: response?.status,
      ok: response?.ok,
    });

    const finalResponse = response ?? new Response('Not Found', { status: 404 });
    return setCorsHeaders(finalResponse, origin);
  } catch (error) {
    console.error('[oRPC] Unhandled error in route handler:', error);
    console.error('[oRPC] Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });

    const errorResponse = new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );

    return setCorsHeaders(errorResponse, origin);
  }
}

export const GET = handleRequest;
export const POST = handleRequest;
export const HEAD = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
export const OPTIONS = handleRequest;
