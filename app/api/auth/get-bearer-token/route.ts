/**
 * Bearer Token Generation Endpoint
 * Returns the session token that can be used as a bearer token
 *
 * This endpoint is called after login to get a bearer token that can be
 * stored in localStorage and used for cross-origin requests (Webflow → Vercel).
 *
 * Flow:
 * 1. User logs in → session cookie set
 * 2. Call this endpoint with cookie → get session token
 * 3. Store token in localStorage
 * 4. Use token in Authorization header for cross-origin requests
 *
 * The Better Auth bearer plugin validates bearer tokens as session tokens,
 * so we just return the session token itself.
 */

import { auth } from '@/lib/auth/config';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get session from cookie
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // The bearer token IS the session token
    // Better Auth's bearer plugin validates bearer tokens as session tokens
    const token = session.session.token;

    return NextResponse.json({ token });
  } catch (error) {
    console.error('[Bearer Token] Error generating token:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}

// Allow CORS for Webflow domain
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': 'https://blogflow-three.webflow.io',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}
