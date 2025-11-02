/**
 * Vercel OAuth flow helper functions
 * Manages the OAuth 2.0 authorization flow for Vercel
 *
 * @module lib/integrations/vercel/oauth
 */

import 'server-only';

import { randomBytes } from 'crypto';
import type { OAuthConfig, OAuthTokens } from '../types';
import { VercelProvider } from './client';

/**
 * Get Vercel OAuth configuration from environment variables
 */
export function getVercelOAuthConfig(redirectUri: string): OAuthConfig {
  const clientId = process.env.BLOGFLOW_VERCEL_CLIENT_ID;
  const clientSecret = process.env.BLOGFLOW_VERCEL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      'Vercel OAuth credentials not configured. ' +
      'Please set BLOGFLOW_VERCEL_CLIENT_ID and BLOGFLOW_VERCEL_CLIENT_SECRET in .env'
    );
  }

  return {
    clientId,
    clientSecret,
    redirectUri,
    scopes: ['user', 'team'], // Add more scopes as needed
  };
}

/**
 * Generate a secure random state parameter for CSRF protection
 */
export function generateOAuthState(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Generate the Vercel OAuth authorization URL
 *
 * @param redirectUri The callback URL to redirect to after authorization
 * @param state CSRF protection state parameter
 * @returns Authorization URL to redirect the user to
 *
 * @example
 * const state = generateOAuthState();
 * // Store state in session for validation
 * const authUrl = generateVercelAuthUrl('http://localhost:3000/api/integrations/vercel/callback', state);
 * // Redirect user to authUrl
 */
export function generateVercelAuthUrl(redirectUri: string, state: string): string {
  const config = getVercelOAuthConfig(redirectUri);
  const provider = new VercelProvider();
  return provider.generateAuthUrl(config, state);
}

/**
 * Exchange authorization code for access tokens
 *
 * @param code Authorization code from OAuth callback
 * @param redirectUri The redirect URI used in the authorization request
 * @returns OAuth tokens
 *
 * @example
 * const tokens = await exchangeVercelCode(code, 'http://localhost:3000/api/integrations/vercel/callback');
 * // Store tokens.accessToken encrypted in database
 */
export async function exchangeVercelCode(
  code: string,
  redirectUri: string
): Promise<OAuthTokens> {
  const config = getVercelOAuthConfig(redirectUri);
  const provider = new VercelProvider();
  return provider.exchangeCodeForTokens(code, config);
}

/**
 * Validate OAuth state parameter to prevent CSRF attacks
 *
 * @param receivedState State parameter from OAuth callback
 * @param expectedState State parameter stored in session
 * @returns true if state is valid
 *
 * @example
 * const isValid = validateOAuthState(
 *   request.query.state,
 *   session.oauthState
 * );
 * if (!isValid) {
 *   throw new Error('Invalid OAuth state');
 * }
 */
export function validateOAuthState(receivedState: string, expectedState: string): boolean {
  // Use constant-time comparison to prevent timing attacks
  if (receivedState.length !== expectedState.length) {
    return false;
  }

  const receivedBuffer = Buffer.from(receivedState);
  const expectedBuffer = Buffer.from(expectedState);

  return receivedBuffer.equals(expectedBuffer);
}
