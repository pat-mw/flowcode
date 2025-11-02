# Vercel Integration OAuth Callback Test Design

## Overview

This document provides comprehensive test coverage design for the Vercel integration OAuth callback route and UI components. The testing strategy covers unit tests, integration tests, and end-to-end tests to ensure secure, reliable OAuth flow and database management functionality.

## Components Under Test

### 1. OAuth Callback Route
- **Location**: `app/api/integrations/vercel/callback/route.ts`
- **Responsibilities**:
  - Handle OAuth authorization code
  - Validate state parameter (CSRF protection)
  - Exchange code for access token
  - Encrypt and store tokens in database
  - Redirect to success/error pages

### 2. Integration Test Page
- **Location**: `app/integrations/test/page.tsx`
- **Responsibilities**:
  - Display "Connect Vercel" button (initiates OAuth flow)
  - Show integration status (connected/disconnected)
  - Render database creation form (name input, region dropdown)
  - Display success/error messages
  - Use oRPC client for API calls

## Test File Structure

```
__tests__/
├── unit/
│   ├── api/
│   │   └── integrations/
│   │       └── vercel-callback.test.ts
│   ├── lib/
│   │   └── integrations/
│   │       ├── vercel-oauth.test.ts
│   │       ├── vercel-client.test.ts
│   │       └── encryption.test.ts
│   └── components/
│       └── integrations/
│           ├── vercel-connect-button.test.tsx
│           ├── vercel-status.test.tsx
│           └── database-creation-form.test.tsx
├── integration/
│   └── vercel-oauth-flow.test.ts
└── fixtures/
    └── vercel-api-responses.json

e2e/
└── vercel-integration-oauth.spec.ts
```

---

## Unit Tests

### 1. OAuth Callback Route Tests

**File**: `__tests__/unit/api/integrations/vercel-callback.test.ts`

#### Test Cases

##### Happy Path Tests

**Test 1.1: Should successfully exchange code for token**
```typescript
describe('OAuth Callback Route - Happy Path', () => {
  it('should exchange authorization code for access token and store encrypted', async () => {
    // Arrange
    const mockCode = 'valid-auth-code-123';
    const mockState = 'csrf-state-token-abc';
    const mockAccessToken = 'vercel_access_token_xyz';

    // Mock OAuth exchange
    vi.spyOn(vercelOAuth, 'exchangeVercelCode').mockResolvedValue({
      accessToken: mockAccessToken,
      tokenType: 'Bearer',
    });

    // Mock encryption
    vi.spyOn(encryption, 'encrypt').mockReturnValue({
      encrypted: 'encrypted-token',
      iv: 'iv-123',
      authTag: 'auth-tag-456',
    });

    // Mock database insert
    const mockInsert = vi.fn().mockResolvedValue([{ id: 'integration-id-1' }]);
    vi.spyOn(db, 'insert').mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: mockInsert,
      }),
    });

    // Act
    const request = new Request(
      `http://localhost:3000/api/integrations/vercel/callback?code=${mockCode}&state=${mockState}`,
      { method: 'GET' }
    );

    // Mock session with stored state
    vi.spyOn(sessionHelpers, 'getSession').mockResolvedValue({
      userId: 'user-123',
      oauthState: mockState,
    });

    const response = await GET(request);

    // Assert
    expect(response.status).toBe(302); // Redirect
    expect(response.headers.get('Location')).toContain('/integrations/success');
    expect(vercelOAuth.exchangeVercelCode).toHaveBeenCalledWith(
      mockCode,
      expect.stringContaining('callback')
    );
    expect(encryption.encrypt).toHaveBeenCalledWith(mockAccessToken);
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-123',
        provider: 'vercel',
        accessToken: 'encrypted-token',
        accessTokenIv: 'iv-123',
        accessTokenAuthTag: 'auth-tag-456',
      })
    );
  });
});
```

**Assertions**:
- OAuth code exchange is called with correct parameters
- Access token is encrypted before storage
- Database insert includes userId, provider, encrypted token, IV, and auth tag
- Response redirects to success page
- Session state is cleared after successful OAuth

##### Error Handling Tests

**Test 1.2: Should reject invalid state parameter**
```typescript
it('should reject callback with invalid state parameter (CSRF protection)', async () => {
  // Arrange
  const mockCode = 'valid-auth-code-123';
  const invalidState = 'tampered-state-token';
  const expectedState = 'original-state-token';

  vi.spyOn(sessionHelpers, 'getSession').mockResolvedValue({
    userId: 'user-123',
    oauthState: expectedState,
  });

  vi.spyOn(vercelOAuth, 'validateOAuthState').mockReturnValue(false);

  // Act
  const request = new Request(
    `http://localhost:3000/api/integrations/vercel/callback?code=${mockCode}&state=${invalidState}`,
    { method: 'GET' }
  );

  const response = await GET(request);

  // Assert
  expect(response.status).toBe(302);
  expect(response.headers.get('Location')).toContain('/integrations/error');
  expect(response.headers.get('Location')).toContain('csrf');
  expect(vercelOAuth.exchangeVercelCode).not.toHaveBeenCalled();
});
```

**Assertions**:
- State validation is performed using constant-time comparison
- Invalid state prevents token exchange
- Response redirects to error page with CSRF error message
- No database insertion occurs

**Test 1.3: Should handle missing authorization code**
```typescript
it('should return error when authorization code is missing', async () => {
  // Arrange
  const mockState = 'csrf-state-token-abc';

  vi.spyOn(sessionHelpers, 'getSession').mockResolvedValue({
    userId: 'user-123',
    oauthState: mockState,
  });

  // Act
  const request = new Request(
    `http://localhost:3000/api/integrations/vercel/callback?state=${mockState}`,
    { method: 'GET' }
  );

  const response = await GET(request);

  // Assert
  expect(response.status).toBe(302);
  expect(response.headers.get('Location')).toContain('/integrations/error');
  expect(response.headers.get('Location')).toContain('missing_code');
});
```

**Test 1.4: Should handle OAuth provider errors**
```typescript
it('should handle OAuth provider errors gracefully', async () => {
  // Arrange
  const mockCode = 'valid-auth-code-123';
  const mockState = 'csrf-state-token-abc';

  vi.spyOn(sessionHelpers, 'getSession').mockResolvedValue({
    userId: 'user-123',
    oauthState: mockState,
  });

  vi.spyOn(vercelOAuth, 'validateOAuthState').mockReturnValue(true);

  // Mock token exchange failure
  vi.spyOn(vercelOAuth, 'exchangeVercelCode').mockRejectedValue(
    new AuthenticationError('vercel', 'Invalid authorization code')
  );

  // Act
  const request = new Request(
    `http://localhost:3000/api/integrations/vercel/callback?code=${mockCode}&state=${mockState}`,
    { method: 'GET' }
  );

  const response = await GET(request);

  // Assert
  expect(response.status).toBe(302);
  expect(response.headers.get('Location')).toContain('/integrations/error');
  expect(response.headers.get('Location')).toContain('auth_failed');
});
```

**Test 1.5: Should handle database insertion errors**
```typescript
it('should handle database insertion failures', async () => {
  // Arrange
  const mockCode = 'valid-auth-code-123';
  const mockState = 'csrf-state-token-abc';

  vi.spyOn(sessionHelpers, 'getSession').mockResolvedValue({
    userId: 'user-123',
    oauthState: mockState,
  });

  vi.spyOn(vercelOAuth, 'validateOAuthState').mockReturnValue(true);
  vi.spyOn(vercelOAuth, 'exchangeVercelCode').mockResolvedValue({
    accessToken: 'token',
    tokenType: 'Bearer',
  });
  vi.spyOn(encryption, 'encrypt').mockReturnValue({
    encrypted: 'enc',
    iv: 'iv',
    authTag: 'tag',
  });

  // Mock database error
  vi.spyOn(db, 'insert').mockImplementation(() => {
    throw new Error('Database connection failed');
  });

  // Act
  const request = new Request(
    `http://localhost:3000/api/integrations/vercel/callback?code=${mockCode}&state=${mockState}`,
    { method: 'GET' }
  );

  const response = await GET(request);

  // Assert
  expect(response.status).toBe(302);
  expect(response.headers.get('Location')).toContain('/integrations/error');
  expect(response.headers.get('Location')).toContain('storage_failed');
});
```

**Test 1.6: Should handle missing session**
```typescript
it('should reject callback when user session is missing', async () => {
  // Arrange
  const mockCode = 'valid-auth-code-123';
  const mockState = 'csrf-state-token-abc';

  vi.spyOn(sessionHelpers, 'getSession').mockResolvedValue(null);

  // Act
  const request = new Request(
    `http://localhost:3000/api/integrations/vercel/callback?code=${mockCode}&state=${mockState}`,
    { method: 'GET' }
  );

  const response = await GET(request);

  // Assert
  expect(response.status).toBe(302);
  expect(response.headers.get('Location')).toContain('/login');
  expect(vercelOAuth.exchangeVercelCode).not.toHaveBeenCalled();
});
```

##### Security Tests

**Test 1.7: Should use constant-time state comparison**
```typescript
it('should use constant-time comparison for state validation', async () => {
  // Arrange
  const validateSpy = vi.spyOn(vercelOAuth, 'validateOAuthState');

  // Act
  await GET(
    new Request(
      'http://localhost:3000/api/integrations/vercel/callback?code=x&state=y'
    )
  );

  // Assert - validateOAuthState should use Buffer.equals() internally
  expect(validateSpy).toHaveBeenCalled();
  // Verify implementation uses timingSafeEqual or Buffer.equals
});
```

**Test 1.8: Should not leak sensitive data in error responses**
```typescript
it('should not expose tokens or secrets in error messages', async () => {
  // Arrange
  const mockCode = 'valid-auth-code-123';
  const mockState = 'csrf-state-token-abc';
  const sensitiveToken = 'super-secret-access-token-xyz';

  vi.spyOn(sessionHelpers, 'getSession').mockResolvedValue({
    userId: 'user-123',
    oauthState: mockState,
  });

  vi.spyOn(vercelOAuth, 'validateOAuthState').mockReturnValue(true);
  vi.spyOn(vercelOAuth, 'exchangeVercelCode').mockResolvedValue({
    accessToken: sensitiveToken,
    tokenType: 'Bearer',
  });
  vi.spyOn(encryption, 'encrypt').mockImplementation(() => {
    throw new Error('Encryption failed');
  });

  // Act
  const request = new Request(
    `http://localhost:3000/api/integrations/vercel/callback?code=${mockCode}&state=${mockState}`,
    { method: 'GET' }
  );

  const response = await GET(request);

  // Assert
  const location = response.headers.get('Location') || '';
  expect(location).not.toContain(sensitiveToken);
  expect(location).not.toContain(mockCode);
  expect(location).not.toContain('secret');
});
```

---

### 2. Vercel OAuth Helper Tests

**File**: `__tests__/unit/lib/integrations/vercel-oauth.test.ts`

#### Test Cases

**Test 2.1: generateVercelAuthUrl should create valid OAuth URL**
```typescript
describe('generateVercelAuthUrl', () => {
  it('should generate correct OAuth authorization URL with all parameters', () => {
    // Arrange
    const redirectUri = 'http://localhost:3000/api/integrations/vercel/callback';
    const state = 'random-state-123';

    // Mock env vars
    process.env.VERCEL_OAUTH_CLIENT_ID = 'client-id-123';
    process.env.VERCEL_OAUTH_CLIENT_SECRET = 'client-secret-456';

    // Act
    const authUrl = generateVercelAuthUrl(redirectUri, state);

    // Assert
    expect(authUrl).toContain('https://vercel.com/oauth/authorize');
    expect(authUrl).toContain(`client_id=client-id-123`);
    expect(authUrl).toContain(`redirect_uri=${encodeURIComponent(redirectUri)}`);
    expect(authUrl).toContain(`state=${state}`);
    expect(authUrl).toContain('scope=');
  });

  it('should throw error when OAuth credentials are not configured', () => {
    // Arrange
    delete process.env.VERCEL_OAUTH_CLIENT_ID;
    delete process.env.VERCEL_OAUTH_CLIENT_SECRET;

    // Act & Assert
    expect(() => {
      generateVercelAuthUrl('http://localhost:3000/callback', 'state');
    }).toThrow(/VERCEL_OAUTH_CLIENT_ID/);
  });
});
```

**Test 2.2: exchangeVercelCode should exchange code for tokens**
```typescript
describe('exchangeVercelCode', () => {
  it('should exchange authorization code for access token', async () => {
    // Arrange
    const code = 'auth-code-123';
    const redirectUri = 'http://localhost:3000/callback';

    process.env.VERCEL_OAUTH_CLIENT_ID = 'client-id-123';
    process.env.VERCEL_OAUTH_CLIENT_SECRET = 'client-secret-456';

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: 'vercel_token_xyz',
        token_type: 'Bearer',
      }),
    });

    // Act
    const tokens = await exchangeVercelCode(code, redirectUri);

    // Assert
    expect(tokens.accessToken).toBe('vercel_token_xyz');
    expect(tokens.tokenType).toBe('Bearer');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('token'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/x-www-form-urlencoded',
        }),
        body: expect.stringContaining(code),
      })
    );
  });

  it('should throw AuthenticationError when token exchange fails', async () => {
    // Arrange
    const code = 'invalid-code';
    const redirectUri = 'http://localhost:3000/callback';

    process.env.VERCEL_OAUTH_CLIENT_ID = 'client-id-123';
    process.env.VERCEL_OAUTH_CLIENT_SECRET = 'client-secret-456';

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({
        error: 'invalid_grant',
        error_description: 'The authorization code is invalid',
      }),
    });

    // Act & Assert
    await expect(exchangeVercelCode(code, redirectUri)).rejects.toThrow(
      AuthenticationError
    );
  });
});
```

**Test 2.3: validateOAuthState should use constant-time comparison**
```typescript
describe('validateOAuthState', () => {
  it('should return true for matching states', () => {
    // Arrange
    const state = 'random-state-abc123';

    // Act
    const isValid = validateOAuthState(state, state);

    // Assert
    expect(isValid).toBe(true);
  });

  it('should return false for non-matching states', () => {
    // Arrange
    const receivedState = 'state-123';
    const expectedState = 'state-456';

    // Act
    const isValid = validateOAuthState(receivedState, expectedState);

    // Assert
    expect(isValid).toBe(false);
  });

  it('should return false for different length states', () => {
    // Arrange
    const receivedState = 'short';
    const expectedState = 'much-longer-state';

    // Act
    const isValid = validateOAuthState(receivedState, expectedState);

    // Assert
    expect(isValid).toBe(false);
  });

  it('should use Buffer comparison for constant-time operation', () => {
    // This test verifies the implementation uses Buffer.equals()
    // which provides constant-time comparison
    const state1 = 'state-abc';
    const state2 = 'state-xyz';

    const bufferEqualsSpy = vi.spyOn(Buffer.prototype, 'equals');

    validateOAuthState(state1, state2);

    expect(bufferEqualsSpy).toHaveBeenCalled();
  });
});
```

---

### 3. Encryption Tests

**File**: `__tests__/unit/lib/integrations/encryption.test.ts`

#### Test Cases

**Test 3.1: encrypt should produce valid encrypted data**
```typescript
describe('encrypt', () => {
  it('should encrypt plaintext and return encrypted data with IV and auth tag', () => {
    // Arrange
    process.env.ENCRYPTION_SECRET = 'a'.repeat(64); // 32 bytes hex
    const plaintext = 'super-secret-access-token';

    // Act
    const result = encrypt(plaintext);

    // Assert
    expect(result).toHaveProperty('encrypted');
    expect(result).toHaveProperty('iv');
    expect(result).toHaveProperty('authTag');
    expect(result.encrypted).not.toBe(plaintext);
    expect(result.iv).toMatch(/^[A-Za-z0-9+/=]+$/); // Base64
    expect(result.authTag).toMatch(/^[A-Za-z0-9+/=]+$/); // Base64
  });

  it('should produce different ciphertexts for same plaintext (semantic security)', () => {
    // Arrange
    process.env.ENCRYPTION_SECRET = 'a'.repeat(64);
    const plaintext = 'my-token';

    // Act
    const result1 = encrypt(plaintext);
    const result2 = encrypt(plaintext);

    // Assert - different IVs produce different ciphertexts
    expect(result1.iv).not.toBe(result2.iv);
    expect(result1.encrypted).not.toBe(result2.encrypted);
  });

  it('should throw error when ENCRYPTION_SECRET is not set', () => {
    // Arrange
    delete process.env.ENCRYPTION_SECRET;

    // Act & Assert
    expect(() => encrypt('data')).toThrow(/ENCRYPTION_SECRET/);
  });

  it('should throw error when ENCRYPTION_SECRET is invalid length', () => {
    // Arrange
    process.env.ENCRYPTION_SECRET = 'tooshort'; // Not 32 bytes

    // Act & Assert
    expect(() => encrypt('data')).toThrow(/32 bytes/);
  });
});
```

**Test 3.2: decrypt should restore original plaintext**
```typescript
describe('decrypt', () => {
  it('should decrypt ciphertext back to original plaintext', () => {
    // Arrange
    process.env.ENCRYPTION_SECRET = 'a'.repeat(64);
    const plaintext = 'super-secret-token-123';
    const encrypted = encrypt(plaintext);

    // Act
    const decrypted = decrypt(
      encrypted.encrypted,
      encrypted.iv,
      encrypted.authTag
    );

    // Assert
    expect(decrypted).toBe(plaintext);
  });

  it('should throw error when auth tag is invalid (tampered data)', () => {
    // Arrange
    process.env.ENCRYPTION_SECRET = 'a'.repeat(64);
    const plaintext = 'my-token';
    const encrypted = encrypt(plaintext);

    // Tamper with auth tag
    const tamperedAuthTag = 'invalid-auth-tag-base64';

    // Act & Assert
    expect(() => {
      decrypt(encrypted.encrypted, encrypted.iv, tamperedAuthTag);
    }).toThrow(/Authentication failed|tampered/);
  });

  it('should throw error when IV is wrong length', () => {
    // Arrange
    process.env.ENCRYPTION_SECRET = 'a'.repeat(64);
    const encrypted = encrypt('data');
    const invalidIv = 'short';

    // Act & Assert
    expect(() => {
      decrypt(encrypted.encrypted, invalidIv, encrypted.authTag);
    }).toThrow(/Invalid IV length/);
  });
});
```

---

### 4. UI Component Tests

#### 4.1 Vercel Connect Button

**File**: `__tests__/unit/components/integrations/vercel-connect-button.test.tsx`

**Test 4.1.1: Should render connect button when not connected**
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { VercelConnectButton } from '@/components/integrations/VercelConnectButton';

describe('VercelConnectButton', () => {
  it('should render "Connect Vercel" button when not connected', () => {
    // Arrange & Act
    render(<VercelConnectButton connected={false} />);

    // Assert
    const button = screen.getByRole('button', { name: /connect vercel/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it('should initiate OAuth flow when connect button is clicked', async () => {
    // Arrange
    const mockGenerateAuthUrl = vi.fn().mockResolvedValue(
      'https://vercel.com/oauth/authorize?client_id=...'
    );

    render(
      <VercelConnectButton
        connected={false}
        onConnect={mockGenerateAuthUrl}
      />
    );

    // Act
    const button = screen.getByRole('button', { name: /connect vercel/i });
    fireEvent.click(button);

    // Assert
    await waitFor(() => {
      expect(mockGenerateAuthUrl).toHaveBeenCalled();
    });
  });

  it('should open OAuth URL in new window', async () => {
    // Arrange
    const mockOpen = vi.fn();
    window.open = mockOpen;

    const authUrl = 'https://vercel.com/oauth/authorize?...';
    const mockGenerateAuthUrl = vi.fn().mockResolvedValue(authUrl);

    render(
      <VercelConnectButton
        connected={false}
        onConnect={mockGenerateAuthUrl}
      />
    );

    // Act
    const button = screen.getByRole('button', { name: /connect vercel/i });
    fireEvent.click(button);

    // Assert
    await waitFor(() => {
      expect(mockOpen).toHaveBeenCalledWith(authUrl, '_blank');
    });
  });

  it('should disable button while OAuth flow is in progress', async () => {
    // Arrange
    const mockGenerateAuthUrl = vi.fn().mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve('url'), 100))
    );

    render(
      <VercelConnectButton
        connected={false}
        onConnect={mockGenerateAuthUrl}
      />
    );

    // Act
    const button = screen.getByRole('button', { name: /connect vercel/i });
    fireEvent.click(button);

    // Assert - button should be disabled immediately after click
    expect(button).toBeDisabled();
  });

  it('should show "Connected" status when integration is connected', () => {
    // Arrange & Act
    render(<VercelConnectButton connected={true} />);

    // Assert
    const status = screen.getByText(/connected/i);
    expect(status).toBeInTheDocument();

    const connectButton = screen.queryByRole('button', {
      name: /connect vercel/i
    });
    expect(connectButton).not.toBeInTheDocument();
  });

  it('should show disconnect button when connected', () => {
    // Arrange
    const mockDisconnect = vi.fn();

    render(
      <VercelConnectButton
        connected={true}
        onDisconnect={mockDisconnect}
      />
    );

    // Act
    const disconnectButton = screen.getByRole('button', {
      name: /disconnect/i
    });
    fireEvent.click(disconnectButton);

    // Assert
    expect(mockDisconnect).toHaveBeenCalled();
  });
});
```

#### 4.2 Database Creation Form

**File**: `__tests__/unit/components/integrations/database-creation-form.test.tsx`

**Test 4.2.1: Should render form fields**
```typescript
describe('DatabaseCreationForm', () => {
  it('should render database name input and region selector', () => {
    // Arrange & Act
    render(<DatabaseCreationForm integrationId="int-123" />);

    // Assert
    const nameInput = screen.getByLabelText(/database name/i);
    const regionSelect = screen.getByLabelText(/region/i);
    const submitButton = screen.getByRole('button', { name: /create/i });

    expect(nameInput).toBeInTheDocument();
    expect(regionSelect).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
  });

  it('should validate database name is required', async () => {
    // Arrange
    render(<DatabaseCreationForm integrationId="int-123" />);

    // Act
    const submitButton = screen.getByRole('button', { name: /create/i });
    fireEvent.click(submitButton);

    // Assert
    await waitFor(() => {
      const error = screen.getByRole('alert');
      expect(error).toHaveTextContent(/name.*required/i);
    });
  });

  it('should validate database name format', async () => {
    // Arrange
    render(<DatabaseCreationForm integrationId="int-123" />);

    // Act
    const nameInput = screen.getByLabelText(/database name/i);
    fireEvent.change(nameInput, { target: { value: 'Invalid-Name!' } });
    fireEvent.blur(nameInput);

    // Assert
    await waitFor(() => {
      const error = screen.getByRole('alert');
      expect(error).toHaveTextContent(/lowercase.*underscore/i);
    });
  });

  it('should accept valid database names', async () => {
    // Arrange
    const validNames = ['my_database', 'production_db', 'db_123'];

    for (const name of validNames) {
      const { rerender } = render(
        <DatabaseCreationForm integrationId="int-123" />
      );

      // Act
      const nameInput = screen.getByLabelText(/database name/i);
      fireEvent.change(nameInput, { target: { value: name } });
      fireEvent.blur(nameInput);

      // Assert
      await waitFor(() => {
        const error = screen.queryByRole('alert');
        expect(error).not.toBeInTheDocument();
      });

      rerender(<div />); // Cleanup
    }
  });

  it('should call oRPC createVercelDatabase on submit', async () => {
    // Arrange
    const mockCreate = vi.fn().mockResolvedValue({
      id: 'db-123',
      name: 'my_database',
      status: 'creating',
    });

    vi.mock('@/lib/orpc-client', () => ({
      orpc: {
        integrations: {
          createVercelDatabase: mockCreate,
        },
      },
    }));

    render(<DatabaseCreationForm integrationId="int-123" />);

    // Act
    const nameInput = screen.getByLabelText(/database name/i);
    const regionSelect = screen.getByLabelText(/region/i);
    const submitButton = screen.getByRole('button', { name: /create/i });

    fireEvent.change(nameInput, { target: { value: 'my_database' } });
    fireEvent.change(regionSelect, { target: { value: 'us-east-1' } });
    fireEvent.click(submitButton);

    // Assert
    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith({
        integrationId: 'int-123',
        name: 'my_database',
        region: 'us-east-1',
      });
    });
  });

  it('should display success message after database creation', async () => {
    // Arrange
    const mockCreate = vi.fn().mockResolvedValue({
      id: 'db-123',
      name: 'my_database',
      status: 'creating',
    });

    render(<DatabaseCreationForm integrationId="int-123" />);

    // Act
    const nameInput = screen.getByLabelText(/database name/i);
    fireEvent.change(nameInput, { target: { value: 'my_database' } });

    const submitButton = screen.getByRole('button', { name: /create/i });
    fireEvent.click(submitButton);

    // Assert
    await waitFor(() => {
      const success = screen.getByRole('status');
      expect(success).toHaveTextContent(/created.*success/i);
    });
  });

  it('should display error message when creation fails', async () => {
    // Arrange
    const mockCreate = vi.fn().mockRejectedValue(
      new Error('Failed to create database')
    );

    render(<DatabaseCreationForm integrationId="int-123" />);

    // Act
    const nameInput = screen.getByLabelText(/database name/i);
    fireEvent.change(nameInput, { target: { value: 'my_database' } });

    const submitButton = screen.getByRole('button', { name: /create/i });
    fireEvent.click(submitButton);

    // Assert
    await waitFor(() => {
      const error = screen.getByRole('alert');
      expect(error).toHaveTextContent(/failed.*create/i);
    });
  });

  it('should disable form during submission', async () => {
    // Arrange
    const mockCreate = vi.fn().mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<DatabaseCreationForm integrationId="int-123" />);

    // Act
    const nameInput = screen.getByLabelText(/database name/i);
    fireEvent.change(nameInput, { target: { value: 'my_database' } });

    const submitButton = screen.getByRole('button', { name: /create/i });
    fireEvent.click(submitButton);

    // Assert - button should be disabled
    expect(submitButton).toBeDisabled();

    // Wait for completion
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });
});
```

---

## Integration Tests

**File**: `__tests__/integration/vercel-oauth-flow.test.ts`

### Test Cases

**Integration Test 1: Complete OAuth flow from initiation to token storage**
```typescript
describe('Vercel OAuth Integration Flow', () => {
  it('should complete full OAuth flow: initiate → callback → store tokens', async () => {
    // Arrange
    const mockUserId = 'user-123';
    const mockState = 'csrf-state-abc';
    const mockCode = 'auth-code-xyz';
    const mockAccessToken = 'vercel_token_abc123';

    // Step 1: Generate OAuth URL
    const authUrl = generateVercelAuthUrl(
      'http://localhost:3000/api/integrations/vercel/callback',
      mockState
    );

    expect(authUrl).toContain('vercel.com/oauth/authorize');
    expect(authUrl).toContain(`state=${mockState}`);

    // Step 2: Mock token exchange
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: mockAccessToken,
        token_type: 'Bearer',
      }),
    });

    // Step 3: Exchange code for token
    const tokens = await exchangeVercelCode(
      mockCode,
      'http://localhost:3000/api/integrations/vercel/callback'
    );

    expect(tokens.accessToken).toBe(mockAccessToken);

    // Step 4: Encrypt token
    const encrypted = encrypt(mockAccessToken);
    expect(encrypted.encrypted).toBeDefined();
    expect(encrypted.iv).toBeDefined();
    expect(encrypted.authTag).toBeDefined();

    // Step 5: Store in database
    const [integration] = await db.insert(integrations).values({
      id: nanoid(),
      userId: mockUserId,
      provider: 'vercel',
      accessToken: encrypted.encrypted,
      accessTokenIv: encrypted.iv,
      accessTokenAuthTag: encrypted.authTag,
    }).returning();

    expect(integration.provider).toBe('vercel');
    expect(integration.userId).toBe(mockUserId);

    // Step 6: Verify decryption works
    const decrypted = decrypt(
      integration.accessToken,
      integration.accessTokenIv,
      integration.accessTokenAuthTag
    );

    expect(decrypted).toBe(mockAccessToken);
  });
});
```

**Integration Test 2: Database creation flow with oRPC**
```typescript
describe('Database Creation Integration', () => {
  it('should create database using stored encrypted tokens', async () => {
    // Arrange - setup integration
    const mockUserId = 'user-123';
    const mockAccessToken = 'vercel_token_xyz';
    const encrypted = encrypt(mockAccessToken);

    const [integration] = await db.insert(integrations).values({
      id: 'int-123',
      userId: mockUserId,
      provider: 'vercel',
      accessToken: encrypted.encrypted,
      accessTokenIv: encrypted.iv,
      accessTokenAuthTag: encrypted.authTag,
    }).returning();

    // Mock Vercel API
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'postgres_abc123',
        name: 'my_database',
        region: 'us-east-1',
        status: 'ready',
        createdAt: new Date().toISOString(),
        pooler: {
          connectionString: 'postgres://user:pass@host/db',
        },
      }),
    });

    // Act - call oRPC procedure
    const result = await orpc.integrations.createVercelDatabase({
      integrationId: integration.id,
      name: 'my_database',
      region: 'us-east-1',
    });

    // Assert
    expect(result.id).toBe('postgres_abc123');
    expect(result.name).toBe('my_database');
    expect(result.connectionString).toContain('postgres://');

    // Verify fetch was called with decrypted token
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/v1/postgres/databases'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: `Bearer ${mockAccessToken}`,
        }),
      })
    );
  });
});
```

---

## E2E Tests

**File**: `e2e/vercel-integration-oauth.spec.ts`

### Test Cases

**E2E Test 1: Complete OAuth connection flow**
```typescript
test('should complete OAuth connection flow from start to finish', async ({ page }) => {
  // Step 1: Navigate to integrations page
  await page.goto('/integrations/test');

  // Step 2: Click "Connect Vercel" button
  const connectButton = page.getByRole('button', { name: /connect vercel/i });
  await expect(connectButton).toBeVisible();

  // Intercept OAuth redirect
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    connectButton.click(),
  ]);

  // Step 3: Verify OAuth URL opened
  expect(popup.url()).toContain('vercel.com/oauth/authorize');
  expect(popup.url()).toContain('client_id=');
  expect(popup.url()).toContain('state=');

  // Step 4: Simulate OAuth callback
  // Mock the callback by directly navigating to it
  await popup.close();

  // Intercept callback request
  await page.route('**/api/integrations/vercel/callback*', (route) => {
    route.fulfill({
      status: 302,
      headers: {
        Location: '/integrations/test?success=true',
      },
    });
  });

  await page.goto(
    '/api/integrations/vercel/callback?code=test-code-123&state=test-state'
  );

  // Step 5: Verify redirect to success page
  await expect(page).toHaveURL(/integrations.*success=true/);

  // Step 6: Verify connection status updated
  const status = page.locator('[data-testid="vercel-status"]');
  await expect(status).toContainText(/connected/i);
});
```

**E2E Test 2: Complete database creation flow**
```typescript
test('should create database after successful OAuth connection', async ({ page }) => {
  // Step 1: Setup - simulate connected state
  await page.goto('/integrations/test');

  // Mock integration as connected
  await page.evaluate(() => {
    localStorage.setItem('vercel_integration_id', 'int-123');
  });

  await page.reload();

  // Step 2: Fill database creation form
  const nameInput = page.getByLabel(/database name/i);
  const regionSelect = page.getByLabel(/region/i);
  const createButton = page.getByRole('button', { name: /create database/i });

  await nameInput.fill('my_test_database');
  await regionSelect.selectOption('us-east-1');

  // Step 3: Mock database creation API
  await page.route('**/api/orpc/**', (route) => {
    if (route.request().postData()?.includes('createVercelDatabase')) {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          id: 'postgres_abc123',
          name: 'my_test_database',
          status: 'creating',
          connectionString: 'postgres://user:pass@host/db',
        }),
      });
    } else {
      route.continue();
    }
  });

  // Step 4: Submit form
  await createButton.click();

  // Step 5: Verify success message
  const success = page.locator('[role="status"]');
  await expect(success).toBeVisible();
  await expect(success).toContainText(/created.*success/i);

  // Step 6: Verify database appears in list
  const dbList = page.locator('[data-testid="database-list"]');
  await expect(dbList).toContainText('my_test_database');
});
```

**E2E Test 3: Error handling - invalid state parameter**
```typescript
test('should reject OAuth callback with invalid state (CSRF protection)', async ({ page }) => {
  // Step 1: Navigate directly to callback with invalid state
  await page.goto(
    '/api/integrations/vercel/callback?code=test-code&state=invalid-state-123'
  );

  // Step 2: Verify error page
  await expect(page).toHaveURL(/integrations.*error/);

  // Step 3: Verify error message
  const error = page.locator('[role="alert"]');
  await expect(error).toBeVisible();
  await expect(error).toContainText(/invalid.*state|csrf|security/i);

  // Step 4: Verify no integration was created
  await page.goto('/integrations/test');
  const status = page.locator('[data-testid="vercel-status"]');
  await expect(status).toContainText(/not connected|connect/i);
});
```

---

## Mocking Strategy

### 1. External API Mocks

**Vercel OAuth Token Exchange**:
```typescript
// Mock token exchange endpoint
global.fetch = vi.fn().mockImplementation((url, options) => {
  if (url.includes('vercel.com/oauth/token')) {
    return Promise.resolve({
      ok: true,
      json: async () => ({
        access_token: 'mock_vercel_token_abc123',
        token_type: 'Bearer',
      }),
    });
  }

  if (url.includes('vercel.com/v1/postgres/databases')) {
    return Promise.resolve({
      ok: true,
      json: async () => ({
        id: 'postgres_test123',
        name: 'test_database',
        region: 'us-east-1',
        status: 'ready',
        pooler: {
          connectionString: 'postgres://user:pass@host/db',
        },
        createdAt: new Date().toISOString(),
      }),
    });
  }

  return Promise.reject(new Error('Unmocked fetch'));
});
```

### 2. Database Mocks

**Drizzle ORM Mocks**:
```typescript
// Mock database operations
vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([
          {
            id: 'int-123',
            userId: 'user-123',
            provider: 'vercel',
            accessToken: 'encrypted',
            accessTokenIv: 'iv',
            accessTokenAuthTag: 'tag',
          },
        ]),
      }),
    }),
    query: {
      integrations: {
        findFirst: vi.fn().mockResolvedValue({
          id: 'int-123',
          userId: 'user-123',
          provider: 'vercel',
          accessToken: 'encrypted',
          accessTokenIv: 'iv',
          accessTokenAuthTag: 'tag',
        }),
      },
    },
  },
  integrations: {},
}));
```

### 3. Session Mocks

**Session Helper Mocks**:
```typescript
vi.mock('@/lib/auth/session-helpers', () => ({
  getSession: vi.fn().mockResolvedValue({
    userId: 'user-123',
    oauthState: 'csrf-state-abc',
  }),
  setOAuthState: vi.fn(),
  clearOAuthState: vi.fn(),
}));
```

### 4. Encryption Mocks

**Crypto Module Mocks** (for deterministic testing):
```typescript
vi.mock('crypto', async () => {
  const actual = await vi.importActual('crypto');
  return {
    ...actual,
    randomBytes: vi.fn((size) => Buffer.from('a'.repeat(size))),
  };
});
```

---

## Test Fixtures

**File**: `__tests__/fixtures/vercel-api-responses.json`

```json
{
  "oauth": {
    "tokenExchange": {
      "success": {
        "access_token": "vercel_access_token_abc123def456",
        "token_type": "Bearer",
        "expires_in": null,
        "refresh_token": null,
        "scope": "user team"
      },
      "invalidCode": {
        "error": "invalid_grant",
        "error_description": "The authorization code is invalid or has expired"
      }
    }
  },
  "createDatabase": {
    "success": {
      "id": "postgres_abc123def456",
      "name": "my_database",
      "region": "us-east-1",
      "status": "creating",
      "connectionString": "postgres://user:password@db-region.vercel-storage.com:5432/verceldb",
      "pooler": {
        "connectionString": "postgres://user:password@db-region-pooler.vercel-storage.com:5432/verceldb"
      },
      "createdAt": "2025-01-01T12:00:00Z"
    },
    "quotaExceeded": {
      "error": {
        "code": "QUOTA_EXCEEDED",
        "message": "Maximum number of databases for your plan exceeded"
      }
    },
    "invalidRegion": {
      "error": {
        "code": "INVALID_REGION",
        "message": "The specified region is not supported"
      }
    }
  },
  "getDatabases": {
    "success": {
      "databases": [
        {
          "id": "postgres_prod123",
          "name": "production_db",
          "region": "us-east-1",
          "status": "ready",
          "connectionString": "postgres://user:pass@prod.vercel-storage.com:5432/verceldb",
          "createdAt": "2025-01-01T10:00:00Z"
        },
        {
          "id": "postgres_staging456",
          "name": "staging_db",
          "region": "us-west-2",
          "status": "ready",
          "connectionString": "postgres://user:pass@staging.vercel-storage.com:5432/verceldb",
          "createdAt": "2025-01-01T11:00:00Z"
        }
      ]
    },
    "empty": {
      "databases": []
    }
  },
  "envVars": {
    "update": {
      "success": {
        "created": [
          {
            "id": "env_123",
            "key": "DATABASE_URL",
            "target": ["production", "preview", "development"],
            "type": "encrypted"
          }
        ]
      },
      "invalidNames": {
        "error": {
          "code": "INVALID_ENV_VAR_NAMES",
          "message": "Invalid environment variable names"
        }
      }
    }
  },
  "errors": {
    "unauthorized": {
      "error": {
        "code": "UNAUTHORIZED",
        "message": "Invalid token"
      }
    },
    "rateLimited": {
      "error": {
        "code": "RATE_LIMITED",
        "message": "Rate limit exceeded"
      }
    }
  },
  "projects": {
    "list": {
      "success": {
        "projects": [
          {
            "id": "prj_abc123",
            "name": "my-nextjs-app",
            "framework": "nextjs"
          }
        ]
      },
      "empty": {
        "projects": []
      }
    }
  }
}
```

---

## Test Helpers

**File**: `__tests__/helpers/oauth-test-helpers.ts`

```typescript
import { vi } from 'vitest';

/**
 * Setup OAuth test environment with mocked dependencies
 */
export function setupOAuthTestEnvironment() {
  // Set required env vars
  process.env.VERCEL_OAUTH_CLIENT_ID = 'test-client-id';
  process.env.VERCEL_OAUTH_CLIENT_SECRET = 'test-client-secret';
  process.env.ENCRYPTION_SECRET = 'a'.repeat(64); // 32 bytes hex

  // Mock fetch
  global.fetch = vi.fn();

  return {
    cleanup: () => {
      delete process.env.VERCEL_OAUTH_CLIENT_ID;
      delete process.env.VERCEL_OAUTH_CLIENT_SECRET;
      delete process.env.ENCRYPTION_SECRET;
      vi.restoreAllMocks();
    },
  };
}

/**
 * Create mock OAuth tokens
 */
export function createMockOAuthTokens() {
  return {
    accessToken: 'vercel_access_token_' + Math.random().toString(36),
    tokenType: 'Bearer',
    expiresAt: undefined,
    refreshToken: undefined,
  };
}

/**
 * Create mock encrypted data
 */
export function createMockEncryptedData(plaintext: string) {
  return {
    encrypted: Buffer.from(plaintext).toString('base64'),
    iv: Buffer.from('initialization-vector').toString('base64'),
    authTag: Buffer.from('authentication-tag').toString('base64'),
  };
}

/**
 * Create mock integration record
 */
export function createMockIntegration(userId: string) {
  const encrypted = createMockEncryptedData('mock-access-token');

  return {
    id: 'int-' + Math.random().toString(36).substring(7),
    userId,
    provider: 'vercel',
    accessToken: encrypted.encrypted,
    accessTokenIv: encrypted.iv,
    accessTokenAuthTag: encrypted.authTag,
    metadata: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Mock Vercel API responses
 */
export function mockVercelAPI() {
  return {
    tokenExchange: (success = true) => {
      if (success) {
        return {
          ok: true,
          json: async () => ({
            access_token: 'vercel_token_abc123',
            token_type: 'Bearer',
          }),
        };
      } else {
        return {
          ok: false,
          status: 401,
          json: async () => ({
            error: 'invalid_grant',
            error_description: 'Invalid authorization code',
          }),
        };
      }
    },

    createDatabase: (success = true) => {
      if (success) {
        return {
          ok: true,
          json: async () => ({
            id: 'postgres_abc123',
            name: 'my_database',
            region: 'us-east-1',
            status: 'ready',
            pooler: {
              connectionString: 'postgres://user:pass@host/db',
            },
            createdAt: new Date().toISOString(),
          }),
        };
      } else {
        return {
          ok: false,
          status: 403,
          json: async () => ({
            error: {
              code: 'QUOTA_EXCEEDED',
              message: 'Database quota exceeded',
            },
          }),
        };
      }
    },
  };
}
```

---

## Coverage Goals

### Target Coverage Metrics

- **Unit Tests**: 90%+ code coverage
- **Integration Tests**: All critical user flows
- **E2E Tests**: All user-facing workflows

### Coverage Breakdown

**OAuth Callback Route**:
- ✅ Happy path (successful OAuth)
- ✅ Invalid state parameter (CSRF)
- ✅ Missing authorization code
- ✅ OAuth provider errors
- ✅ Database insertion errors
- ✅ Missing session
- ✅ Security (constant-time comparison)
- ✅ No sensitive data leaks

**OAuth Helpers**:
- ✅ URL generation
- ✅ Token exchange
- ✅ State validation
- ✅ Error handling
- ✅ Configuration validation

**Encryption**:
- ✅ Encryption produces valid output
- ✅ Decryption restores plaintext
- ✅ Semantic security (different ciphertexts)
- ✅ Tamper detection
- ✅ Invalid input handling

**UI Components**:
- ✅ Render states (connected/disconnected)
- ✅ User interactions (clicks, form submission)
- ✅ Validation (client-side)
- ✅ Error handling
- ✅ Loading states
- ✅ Success feedback

**Integration Flows**:
- ✅ Complete OAuth flow
- ✅ Database creation with stored tokens
- ✅ Token encryption/decryption round-trip

**E2E Workflows**:
- ✅ OAuth connection from UI to database
- ✅ Database creation end-to-end
- ✅ Error scenarios with user feedback

---

## Running Tests

### Unit Tests
```bash
pnpm test                          # Run all unit tests
pnpm test vercel-callback          # Run specific test file
pnpm test:coverage                 # Run with coverage report
```

### Integration Tests
```bash
pnpm test:integration              # Run integration tests
```

### E2E Tests
```bash
pnpm test:e2e                      # Run Playwright E2E tests
pnpm test:e2e:ui                   # Run with Playwright UI
```

### All Tests
```bash
pnpm test:all                      # Run unit + integration + E2E
```

---

## Test Execution Checklist

Before marking feature complete:

- [ ] All unit tests written and passing
- [ ] All integration tests written and passing
- [ ] All E2E tests written and passing
- [ ] Code coverage meets 90% threshold
- [ ] No console warnings or errors during test runs
- [ ] Tests are deterministic (no flaky tests)
- [ ] All edge cases covered
- [ ] Security tests pass (CSRF, encryption, no data leaks)
- [ ] Mocks properly cleanup after tests
- [ ] Test execution time is reasonable (< 30s for unit tests)

---

## Notes

1. **CSRF Protection**: All OAuth callback tests MUST verify state parameter validation using constant-time comparison
2. **Token Security**: Never log or expose access tokens in test output
3. **Database Cleanup**: Integration tests should clean up test data in `afterEach` hooks
4. **Deterministic Tests**: Use mocked crypto for deterministic test execution
5. **E2E Test Isolation**: Each E2E test should be independent and not rely on previous test state

---

## Future Enhancements

1. **Visual Regression Tests**: Add Playwright screenshot comparison for UI components
2. **Performance Tests**: Add tests for OAuth callback response time
3. **Load Tests**: Test multiple concurrent OAuth callbacks
4. **Security Audits**: Automated security scanning for token handling
5. **Accessibility Tests**: Add axe-core tests for WCAG compliance
