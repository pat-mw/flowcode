/**
 * Unit tests for Vercel OAuth callback route
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/integrations/vercel/callback/route';

// Mock modules
vi.mock('@/lib/integrations/vercel/oauth', () => ({
  exchangeVercelCode: vi.fn(),
  validateOAuthState: vi.fn(),
}));

vi.mock('@/lib/integrations/encryption', () => ({
  encrypt: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn(),
  },
  integrations: {},
}));

vi.mock('@/lib/auth/config', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}));

import { exchangeVercelCode, validateOAuthState } from '@/lib/integrations/vercel/oauth';
import { encrypt } from '@/lib/integrations/encryption';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth/config';

describe('Vercel OAuth Callback Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should successfully exchange code for tokens and store in database', async () => {
    // Mock successful OAuth flow
    const mockTokens = {
      accessToken: 'test_access_token',
      teamId: 'team_123',
    };

    const mockEncrypted = {
      encrypted: 'encrypted_token',
      iv: 'test_iv',
      authTag: 'test_auth_tag',
    };

    const mockSession = {
      user: { id: 'user_123', email: 'test@example.com' },
    };

    vi.mocked(validateOAuthState).mockReturnValue(true);
    vi.mocked(exchangeVercelCode).mockResolvedValue(mockTokens);
    vi.mocked(encrypt).mockReturnValue(mockEncrypted);
    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);

    const mockInsert = vi.fn().mockReturnValue({
      values: vi.fn().mockReturnThis(),
    });
    vi.mocked(db.insert).mockReturnValue(mockInsert as any);

    // Create request with valid parameters
    const url = new URL('http://localhost:3000/api/integrations/vercel/callback?code=test_code&state=test_state');
    const request = new NextRequest(url, {
      headers: {
        cookie: 'vercel_oauth_state=test_state',
      },
    });

    const response = await GET(request);

    // Verify redirect to success page
    expect(response.status).toBe(307); // Redirect status
    expect(response.headers.get('location')).toContain('/integrations/test?success=true');

    // Verify OAuth validation was called
    expect(validateOAuthState).toHaveBeenCalledWith('test_state', 'test_state');

    // Verify token exchange was called
    expect(exchangeVercelCode).toHaveBeenCalledWith('test_code');

    // Verify encryption was called
    expect(encrypt).toHaveBeenCalledWith('test_access_token');

    // Verify database insert was called
    expect(db.insert).toHaveBeenCalled();
  });

  it('should reject request with invalid state (CSRF protection)', async () => {
    vi.mocked(validateOAuthState).mockReturnValue(false);

    const url = new URL('http://localhost:3000/api/integrations/vercel/callback?code=test_code&state=invalid_state');
    const request = new NextRequest(url, {
      headers: {
        cookie: 'vercel_oauth_state=valid_state',
      },
    });

    const response = await GET(request);

    // Verify redirect to error page
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('error=invalid_state');
    expect(response.headers.get('location')).toContain('CSRF validation failed');

    // Verify token exchange was NOT called
    expect(exchangeVercelCode).not.toHaveBeenCalled();
  });

  it('should handle missing authorization code', async () => {
    const url = new URL('http://localhost:3000/api/integrations/vercel/callback?state=test_state');
    const request = new NextRequest(url, {
      headers: {
        cookie: 'vercel_oauth_state=test_state',
      },
    });

    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('error=invalid_request');
    expect(response.headers.get('location')).toContain('Missing code or state parameter');
  });

  it('should handle missing state parameter', async () => {
    const url = new URL('http://localhost:3000/api/integrations/vercel/callback?code=test_code');
    const request = new NextRequest(url, {
      headers: {
        cookie: 'vercel_oauth_state=test_state',
      },
    });

    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('error=invalid_request');
  });

  it('should handle OAuth provider errors', async () => {
    const url = new URL(
      'http://localhost:3000/api/integrations/vercel/callback?error=access_denied&error_description=User%20denied%20access'
    );
    const request = new NextRequest(url);

    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('error=access_denied');
    expect(response.headers.get('location')).toContain('User denied access');
  });

  it('should handle missing user session', async () => {
    vi.mocked(validateOAuthState).mockReturnValue(true);
    vi.mocked(auth.api.getSession).mockResolvedValue(null);

    const url = new URL('http://localhost:3000/api/integrations/vercel/callback?code=test_code&state=test_state');
    const request = new NextRequest(url, {
      headers: {
        cookie: 'vercel_oauth_state=test_state',
      },
    });

    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('error=unauthorized');
    expect(response.headers.get('location')).toContain('User not authenticated');
  });

  it('should handle token exchange failures', async () => {
    vi.mocked(validateOAuthState).mockReturnValue(true);
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: 'user_123', email: 'test@example.com' },
    });
    vi.mocked(exchangeVercelCode).mockRejectedValue(new Error('Token exchange failed'));

    const url = new URL('http://localhost:3000/api/integrations/vercel/callback?code=test_code&state=test_state');
    const request = new NextRequest(url, {
      headers: {
        cookie: 'vercel_oauth_state=test_state',
      },
    });

    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('error=callback_failed');
    // Verify sensitive error details are not leaked
    expect(response.headers.get('location')).not.toContain('Token exchange failed');
  });

  it('should not leak sensitive data in error responses', async () => {
    vi.mocked(validateOAuthState).mockReturnValue(true);
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: 'user_123', email: 'test@example.com' },
    });
    vi.mocked(exchangeVercelCode).mockRejectedValue(
      new Error('Internal API key validation failed')
    );

    const url = new URL('http://localhost:3000/api/integrations/vercel/callback?code=test_code&state=test_state');
    const request = new NextRequest(url, {
      headers: {
        cookie: 'vercel_oauth_state=test_state',
      },
    });

    const response = await GET(request);

    const location = response.headers.get('location') || '';

    // Should not contain sensitive error messages
    expect(location).not.toContain('API key');
    expect(location).not.toContain('validation failed');
    expect(location).toContain('error=callback_failed');
  });
});
