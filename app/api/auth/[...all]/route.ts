/**
 * Better Auth API route handler with CORS support
 * Handles all authentication endpoints at /api/auth/*
 */

import { auth } from '@/lib/auth/config';
import { toNextJsHandler } from 'better-auth/next-js';
import { isOriginAllowed } from '@/app/api/config';

function setCorsHeaders(response: Response, origin: string | null): Response {
  if (origin && isOriginAllowed(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }

  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours

  return response;
}

// Get Better Auth handlers
const handlers = toNextJsHandler(auth);

// Wrap handlers with CORS
async function handleGET(request: Request) {
  const origin = request.headers.get('origin');
  const response = await handlers.GET(request);
  return setCorsHeaders(response, origin);
}

async function handlePOST(request: Request) {
  const origin = request.headers.get('origin');
  const response = await handlers.POST(request);
  return setCorsHeaders(response, origin);
}

// Handle preflight OPTIONS requests
export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin');
  const response = new Response(null, { status: 204 });
  return setCorsHeaders(response, origin);
}

export { handleGET as GET, handlePOST as POST };
