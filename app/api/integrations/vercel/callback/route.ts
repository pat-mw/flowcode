/**
 * Vercel OAuth Callback Route
 * Handles the OAuth 2.0 authorization code flow callback from Vercel
 */

import { NextRequest, NextResponse } from 'next/server';
import { exchangeVercelCode, validateOAuthState } from '@/lib/integrations/vercel/oauth';
import { encrypt } from '@/lib/integrations/encryption';
import { db, integrations } from '@/lib/db';
import { nanoid } from 'nanoid';
import { auth } from '@/lib/auth/config';
import { headers } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const teamId = searchParams.get('teamId');
    const configurationId = searchParams.get('configurationId');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Handle OAuth provider errors
    if (error) {
      console.error('Vercel OAuth error:', error, errorDescription);
      return NextResponse.redirect(
        new URL(
          `/integrations/test?error=${encodeURIComponent(error)}&error_description=${encodeURIComponent(errorDescription || 'OAuth failed')}`,
          request.url
        )
      );
    }

    // Validate required parameters
    if (!code) {
      return NextResponse.redirect(
        new URL('/integrations/test?error=invalid_request&error_description=Missing code parameter', request.url)
      );
    }

    // For Vercel integrations using /integrations/{slug}/new flow, state parameter is optional
    // Only validate state if it was provided
    if (state) {
      const storedState = request.cookies.get('vercel_oauth_state')?.value;
      if (!storedState || !validateOAuthState(state, storedState)) {
        return NextResponse.redirect(
          new URL('/integrations/test?error=invalid_state&error_description=CSRF validation failed', request.url)
        );
      }
    }

    // Get authenticated user session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.redirect(
        new URL('/integrations/test?error=unauthorized&error_description=User not authenticated', request.url)
      );
    }

    // Exchange authorization code for access token
    const redirectUri = `${new URL(request.url).origin}/api/integrations/vercel/callback`;
    const tokens = await exchangeVercelCode(code, redirectUri);

    // Encrypt the access token
    const encrypted = encrypt(tokens.accessToken);

    // Store integration in database with teamId from query params
    const metadata: Record<string, unknown> = {};
    if (teamId) metadata.teamId = teamId;
    if (configurationId) metadata.configurationId = configurationId;

    await db.insert(integrations).values({
      id: nanoid(),
      userId: session.user.id,
      provider: 'vercel',
      accessToken: encrypted.encrypted,
      accessTokenIv: encrypted.iv,
      accessTokenAuthTag: encrypted.authTag,
      metadata: Object.keys(metadata).length > 0 ? metadata : null,
    });

    // Clear OAuth state cookie and redirect to success page
    const response = NextResponse.redirect(
      new URL('/integrations/vercel/success', request.url)
    );
    response.cookies.delete('vercel_oauth_state');

    return response;
  } catch (err) {
    console.error('OAuth callback error:', err);

    // Don't leak sensitive error details to client
    const errorMessage = err instanceof Error ? 'OAuth failed' : 'Unknown error';

    return NextResponse.redirect(
      new URL(`/integrations/test?error=callback_failed&error_description=${encodeURIComponent(errorMessage)}`, request.url)
    );
  }
}
