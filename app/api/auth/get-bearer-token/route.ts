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
import { isOriginAllowed } from '@/app/api/config';


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

    const origin = request.headers.get('origin');
    const response = NextResponse.json({ token });
    if (origin && isOriginAllowed(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.append('Vary', 'Origin');
    }
    return response;
  } catch (error) {
    console.error('[Bearer Token] Error generating token:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}

// Allow CORS for Webflow domain
export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin');
  const response = new NextResponse(null, { status: 204 });
  if (origin && isOriginAllowed(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Max-Age', '86400');
  response.headers.append('Vary', 'Origin');
  return response;
}
