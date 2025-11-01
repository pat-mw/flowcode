/**
 * Generate Vercel OAuth Authorization URL
 * Server-side endpoint to generate OAuth URL with state parameter
 */

import { NextResponse } from 'next/server';
import { generateVercelAuthUrl, generateOAuthState } from '@/lib/integrations/vercel/oauth';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const redirectUri = `${url.origin}/api/integrations/vercel/callback`;

    // Generate CSRF state
    const state = generateOAuthState();

    // Generate OAuth URL
    const authUrl = generateVercelAuthUrl(redirectUri, state);

    return NextResponse.json({ url: authUrl, state });
  } catch (error) {
    console.error('Failed to generate OAuth URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate OAuth URL' },
      { status: 500 }
    );
  }
}
