# Cloud Provider Integration System

This directory contains the cloud provider integration system for Blogflow, providing a pluggable architecture for OAuth-based connections to cloud platforms like Vercel, Netlify, Railway, etc.

## Architecture Overview

```
lib/integrations/
├── types.ts                 # Core interfaces and types
├── encryption.ts            # Token encryption utilities
├── registry.ts              # Provider registry (if implemented)
├── vercel/
│   ├── types.ts            # Vercel-specific types
│   ├── client.ts           # VercelProvider implementation
│   └── oauth.ts            # OAuth helpers
└── __tests__/              # Unit tests
    ├── encryption.test.ts
    ├── types.test.ts
    └── vercel/
        ├── client.test.ts
        ├── oauth.test.ts
        └── database.test.ts
```

## Core Concepts

### 1. Provider Abstraction (`types.ts`)

All cloud providers implement the `CloudProvider` interface:

```typescript
interface CloudProvider {
  readonly info: ProviderInfo;

  // OAuth methods
  generateAuthUrl(config: OAuthConfig, state: string): string;
  exchangeCodeForTokens(code: string, config: OAuthConfig): Promise<OAuthTokens>;
  refreshAccessToken(refreshToken: string): Promise<OAuthTokens>;

  // Database methods
  createDatabase(config: DatabaseConfig, accessToken: string): Promise<DatabaseResult>;
  listDatabases(accessToken: string): Promise<DatabaseResult[]>;
  deleteDatabase(databaseId: string, accessToken: string): Promise<boolean>;

  // Environment variables
  updateEnvVars(config: EnvVarsConfig, accessToken: string): Promise<EnvVarsResult>;
}
```

**Benefits:**
- Consistent API across all providers
- Easy to add new cloud platforms
- Type-safe operations
- Centralized error handling

### 2. OAuth Flow

**Standard OAuth 2.0 Authorization Code Flow:**

1. **Generate Authorization URL**
   ```typescript
   const provider = new VercelProvider();
   const authUrl = provider.generateAuthUrl({
     clientId: process.env.VERCEL_OAUTH_CLIENT_ID!,
     clientSecret: process.env.VERCEL_OAUTH_CLIENT_SECRET!,
     redirectUri: 'http://localhost:3000/api/integrations/vercel/callback',
     scopes: ['deployment', 'database', 'project'],
   }, stateToken);
   ```

2. **User Authorizes** - Redirected to provider's OAuth page

3. **Callback Receives Code** - Provider redirects back with authorization code

4. **Exchange Code for Tokens**
   ```typescript
   const tokens = await provider.exchangeCodeForTokens(code, oauthConfig);
   // Returns: { accessToken, refreshToken?, expiresAt?, tokenType, scope, teamId? }
   ```

5. **Encrypt and Store Tokens**
   ```typescript
   import { encrypt } from '@/lib/integrations/encryption';

   const encrypted = encrypt(tokens.accessToken);
   // Store: encrypted.encrypted, encrypted.iv, encrypted.authTag
   ```

### 3. Token Encryption (`encryption.ts`)

**AES-256-GCM Encryption** for secure OAuth token storage:

```typescript
// Encryption
const encrypted = encrypt(plaintext);
// Returns: { encrypted: string, iv: string, authTag: string }

// Decryption
const plaintext = decrypt(encrypted, iv, authTag);
```

**Security Features:**
- 256-bit encryption key from `ENCRYPTION_SECRET`
- Unique initialization vector (IV) per token
- Authentication tag for integrity verification
- Prevents tampering and replay attacks

**Environment Setup:**
```bash
# Generate a secure 256-bit key
openssl rand -hex 32
# Add to .env
ENCRYPTION_SECRET=<generated-key>
```

### 4. Error Handling

**Typed Error Hierarchy:**

```typescript
// Base error
class ProviderError extends Error {
  constructor(
    message: string,
    provider: string,
    code?: string,
    statusCode?: number,
    details?: Record<string, unknown>
  )
}

// Specialized errors
class AuthenticationError extends ProviderError  // 401/403
class RateLimitError extends ProviderError      // 429 with resetAt
class QuotaExceededError extends ProviderError  // Quota limits
```

**Usage in Code:**
```typescript
try {
  await provider.createDatabase(config, token);
} catch (error) {
  if (error instanceof RateLimitError) {
    console.log(`Rate limited until ${error.resetAt}`);
  } else if (error instanceof AuthenticationError) {
    // Refresh token or re-authenticate
  } else if (error instanceof ProviderError) {
    console.error(`${error.provider} error: ${error.code}`);
  }
}
```

## Vercel Provider Implementation

### Features

- **OAuth 2.0** - Full authorization code flow
- **Database Management** - Create, list, delete Postgres databases
- **Deployment Management** - Create deployments from files or Git repositories
- **Project Management** - List and create Vercel projects
- **Environment Variables** - Update project environment variables
- **Rate Limit Tracking** - Monitors API rate limits via response headers

### Vercel-Specific Types (`vercel/types.ts`)

```typescript
// Database types
type VercelDatabaseType = 'postgres' | 'redis' | 'blob';
type VercelDatabaseRegion = 'us-east-1' | 'us-west-1' | 'eu-west-1' | ...;

interface VercelPostgresDatabase {
  id: string;
  name: string;
  region: string;
  status: 'creating' | 'ready' | 'error';
  pooler?: { connectionString: string };
  createdAt: number;
}

// Deployment types
type VercelDeploymentReadyState = 'QUEUED' | 'BUILDING' | 'READY' | 'ERROR' | 'CANCELED';

interface VercelDeployment {
  id: string;
  url: string;
  name: string;
  readyState: VercelDeploymentReadyState;
  createdAt: number;
  inspectorUrl?: string;
  projectId?: string;
}

interface VercelDeploymentConfig {
  name: string;
  gitSource?: VercelGitSource;        // Deploy from Git
  files?: VercelDeploymentFile[];     // Deploy from files
  projectSettings?: VercelProjectSettings;
  target?: 'production' | 'staging';
  env?: Record<string, string>;
}
```

### Client Methods (`vercel/client.ts`)

**Database Operations:**
```typescript
const provider = new VercelProvider();

// Create database
const db = await provider.createDatabase({
  name: 'my-database',
  region: 'us-east-1',
}, accessToken);

// List databases
const databases = await provider.listDatabases(accessToken);

// Delete database
const success = await provider.deleteDatabase(databaseId, accessToken);
```

**Deployment Operations:**
```typescript
// Deploy static files
const deployment = await provider.createDeployment({
  name: 'my-site',
  files: [{
    file: 'index.html',
    data: Buffer.from('<html>...</html>').toString('base64'),
  }],
  projectSettings: { framework: 'static' },
}, accessToken);

// Deploy from Git
const deployment = await provider.createDeployment({
  name: 'my-app',
  gitSource: {
    type: 'github',
    repo: 'owner/repo',
    ref: 'main',
    path: 'apps/web',
  },
  projectSettings: { framework: 'nextjs' },
}, accessToken);

// Get deployment status
const status = await provider.getDeployment(deploymentId, accessToken);

// List deployments
const deployments = await provider.listDeployments(accessToken, projectId);
```

**Project Operations:**
```typescript
// List projects
const { projects } = await provider.listProjects(accessToken);

// Create project
const project = await provider.createProject('my-project', accessToken, 'nextjs');
```

**Environment Variables:**
```typescript
const result = await provider.updateEnvVars({
  projectId: 'prj_123',
  vars: {
    DATABASE_URL: 'postgres://...',
    API_KEY: 'secret',
  },
  target: ['production', 'preview'],
}, accessToken);
```

## Integration with oRPC

### Router Definition (`lib/api/routers/integrations.ts`)

All integration procedures are protected (require authentication) and follow this pattern:

```typescript
import { protectedProcedure } from '../procedures';
import { VercelProvider } from '@/lib/integrations/vercel/client';
import { encrypt, decrypt } from '@/lib/integrations/encryption';

const createVercelDatabase = protectedProcedure
  .input(z.object({
    integrationId: z.string(),
    name: z.string(),
    region: z.enum([...]).optional(),
  }))
  .handler(async ({ input, context }) => {
    // 1. Verify user owns integration
    const integration = await db.query.integrations.findFirst({
      where: and(
        eq(integrations.id, input.integrationId),
        eq(integrations.userId, context.userId),
        eq(integrations.provider, 'vercel')
      ),
    });

    if (!integration) throw new Error('Integration not found');

    // 2. Decrypt access token
    const accessToken = decrypt(
      integration.accessToken,
      integration.accessTokenIv,
      integration.accessTokenAuthTag
    );

    // 3. Call provider method
    const provider = new VercelProvider();
    return await provider.createDatabase({
      name: input.name,
      region: input.region,
    }, accessToken);
  });
```

**Available Procedures:**

- `connectVercel(accessToken, teamId?)` - Store OAuth connection
- `listIntegrations()` - Get user's integrations
- `disconnectIntegration(integrationId)` - Remove integration
- `createVercelDatabase(integrationId, name, region?)` - Provision database
- `listVercelDatabases(integrationId)` - List databases
- `deleteVercelDatabase(integrationId, databaseId)` - Delete database
- `createVercelDeployment(integrationId, name, template)` - Create deployment
- `getVercelDeploymentStatus(integrationId, deploymentId)` - Get status
- `listVercelDeployments(integrationId, projectId?)` - List deployments
- `listVercelProjects(integrationId)` - List projects
- `updateVercelEnvVars(integrationId, projectId, vars, target?)` - Update env vars

### Frontend Usage (oRPC Client)

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc-client';

// List integrations
const { data: integrations } = useQuery(
  orpc.integrations.listIntegrations.queryOptions({ input: {} })
);

// Create database
const createDb = useMutation(
  orpc.integrations.createVercelDatabase.mutationOptions()
);

createDb.mutate({
  integrationId: integration.id,
  name: 'my-database',
  region: 'us-east-1',
});

// Poll deployment status
const { data: deployment } = useQuery({
  ...orpc.integrations.getVercelDeploymentStatus.queryOptions({
    input: { integrationId, deploymentId },
  }),
  refetchInterval: deployment?.readyState === 'BUILDING' ? 3000 : false,
});
```

## Database Schema

**Integrations Table:**

```sql
CREATE TABLE integrations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,  -- 'vercel', 'netlify', etc.

  -- Encrypted OAuth tokens
  access_token TEXT NOT NULL,
  access_token_iv TEXT NOT NULL,
  access_token_auth_tag TEXT NOT NULL,
  refresh_token TEXT,
  refresh_token_iv TEXT,
  refresh_token_auth_tag TEXT,

  -- Provider metadata (JSON)
  metadata JSONB,  -- { teamId: '...', etc. }

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_integrations_user_id ON integrations(user_id);
CREATE INDEX idx_integrations_provider ON integrations(provider);
```

## Adding a New Provider

1. **Create provider directory:**
   ```
   lib/integrations/new-provider/
   ├── types.ts     # Provider-specific types
   ├── client.ts    # CloudProvider implementation
   └── oauth.ts     # OAuth helpers (if needed)
   ```

2. **Implement CloudProvider interface:**
   ```typescript
   export class NewProvider implements CloudProvider {
     readonly info: ProviderInfo = {
       id: 'new-provider',
       name: 'New Provider',
       supportedDatabases: ['postgres', 'mysql'],
       requiresTeam: false,
       oauthAuthUrl: 'https://provider.com/oauth/authorize',
       oauthTokenUrl: 'https://provider.com/oauth/token',
     };

     // Implement required methods...
   }
   ```

3. **Add oRPC procedures:**
   ```typescript
   const createNewProviderDatabase = protectedProcedure
     .input(z.object({ integrationId: z.string(), ... }))
     .handler(async ({ input, context }) => {
       // Follow the pattern from Vercel procedures
     });
   ```

4. **Create OAuth routes:**
   ```
   app/api/integrations/new-provider/
   ├── auth-url/route.ts
   └── callback/route.ts
   ```

5. **Add success page (optional):**
   ```
   app/integrations/new-provider/success/page.tsx
   ```

6. **Write tests:**
   ```
   lib/integrations/__tests__/new-provider/
   ├── client.test.ts
   └── oauth.test.ts
   ```

## Security Best Practices

### Token Storage
- ✅ Always encrypt tokens before database storage
- ✅ Use unique IV for each encrypted token
- ✅ Store IV and auth tag separately
- ✅ Never expose encrypted tokens in API responses
- ❌ Never log decrypted tokens
- ❌ Never send tokens to client-side code

### User Authorization
- ✅ Verify user ownership before all operations
- ✅ Use `userId` + `integrationId` for isolation
- ✅ Validate integration provider matches operation
- ✅ Use `protectedProcedure` for all endpoints

### Error Handling
- ✅ Catch and classify provider errors
- ✅ Don't expose internal error details to clients
- ✅ Log errors server-side for debugging
- ✅ Handle rate limits gracefully

### Environment Variables
- ✅ Use strong encryption secret (256-bit minimum)
- ✅ Rotate secrets periodically
- ✅ Use different secrets per environment
- ❌ Never commit secrets to version control

## Testing

Run integration tests:
```bash
pnpm test lib/integrations
```

**Test Coverage:**
- ✅ Encryption/decryption round-trip
- ✅ OAuth flow (mocked HTTP requests)
- ✅ Database operations (mocked API)
- ✅ Deployment operations (mocked API)
- ✅ Error handling (rate limits, auth errors, etc.)
- ✅ User authorization checks

## Troubleshooting

### "Encryption failed" Error
- Verify `ENCRYPTION_SECRET` is set and 64 hex characters (32 bytes)
- Generate new secret: `openssl rand -hex 32`

### OAuth Callback Fails
- Verify redirect URI matches exactly (including protocol, port, path)
- Check OAuth application credentials
- Ensure state token validation passes

### "Integration not found" Error
- Verify user is authenticated
- Check integration belongs to current user
- Ensure integration hasn't been deleted

### Rate Limit Errors
- Check provider's rate limit headers
- Implement exponential backoff
- Use `RateLimitError.resetAt` to schedule retries

## Related Documentation

- **CLAUDE.md** - Project overview and Vercel integration architecture
- **lib/api/routers/integrations.ts** - oRPC procedure implementations
- **app/integrations/README.md** - Frontend integration UI documentation
- **docs/vercel-integration-guide.md** - Complete Vercel setup guide
