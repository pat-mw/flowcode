# Vercel Integration Guide

Complete guide to setting up and using the Vercel integration in Blogflow. This integration allows you to manage Vercel databases, deployments, and projects directly from your application using OAuth authentication.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [OAuth Application Setup](#oauth-application-setup)
4. [Environment Configuration](#environment-configuration)
5. [Connecting Your Vercel Account](#connecting-your-vercel-account)
6. [Database Management](#database-management)
7. [Deployment Management](#deployment-management)
8. [Security Considerations](#security-considerations)
9. [Troubleshooting](#troubleshooting)
10. [API Reference](#api-reference)

---

## Overview

The Vercel integration provides:

- **OAuth 2.0 Authentication** - Secure connection to your Vercel account
- **Database Provisioning** - Create and manage Vercel Postgres databases
- **Deployment Management** - Deploy static sites and Next.js applications
- **Project Management** - List and create Vercel projects
- **Environment Variables** - Update project environment variables
- **Encrypted Token Storage** - AES-256-GCM encryption for OAuth tokens

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User (Browser)                            │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    │ 1. Click "Connect Vercel"
                    ▼
┌─────────────────────────────────────────────────────────────┐
│              /api/integrations/vercel/auth-url               │
│              Generates OAuth URL + state token               │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    │ 2. Redirect to Vercel OAuth
                    ▼
┌─────────────────────────────────────────────────────────────┐
│                 Vercel OAuth Page                            │
│            User authorizes application                       │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    │ 3. Callback with authorization code
                    ▼
┌─────────────────────────────────────────────────────────────┐
│           /api/integrations/vercel/callback                  │
│   1. Exchange code for access token                          │
│   2. Encrypt token with AES-256-GCM                          │
│   3. Store in database (encrypted)                           │
│   4. Redirect to /integrations/vercel/success               │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    │ 4. Success page
                    ▼
┌─────────────────────────────────────────────────────────────┐
│          /integrations/vercel/success                        │
│          Integration confirmed                               │
│          Navigate to features                                │
└─────────────────────────────────────────────────────────────┘
```

---

## Prerequisites

Before setting up the Vercel integration, ensure you have:

- ✅ Vercel account (free tier works)
- ✅ PostgreSQL database for Blogflow (for storing encrypted tokens)
- ✅ Node.js 18+ and pnpm installed
- ✅ Blogflow application running locally or deployed

---

## OAuth Application Setup

### Step 1: Create Vercel Integration

1. Go to [Vercel Integrations Dashboard](https://vercel.com/account/integrations)
2. Click **"Create Integration"**
3. Fill in application details:
   - **Name:** Blogflow (or your app name)
   - **Description:** Blog management platform with Vercel integration
   - **Logo:** Upload your logo (optional)
   - **Website:** Your application URL

### Step 2: Configure OAuth Settings

1. In your integration settings, navigate to **OAuth Configuration**
2. Set **Redirect URI:**
   ```
   http://localhost:3000/api/integrations/vercel/callback
   ```

   For production:
   ```
   https://yourdomain.com/api/integrations/vercel/callback
   ```

   ⚠️ **Important:** The redirect URI must match EXACTLY (including protocol, port, and trailing slash)

3. Request OAuth Scopes:
   - ✅ `deployment:create` - Create deployments
   - ✅ `deployment:read` - Read deployment information
   - ✅ `project:read` - List projects
   - ✅ `project:write` - Create projects
   - ✅ `database:create` - Create databases
   - ✅ `database:read` - List databases
   - ✅ `database:delete` - Delete databases
   - ✅ `env:read` - Read environment variables
   - ✅ `env:write` - Update environment variables

4. Save your integration

### Step 3: Get OAuth Credentials

1. Navigate to the **Credentials** section
2. Copy your **Client ID**
3. Copy your **Client Secret** (keep this secure!)
4. Note your **Integration Slug** (optional, but recommended)

---

## Environment Configuration

### Step 1: Generate Encryption Secret

The integration uses AES-256-GCM encryption to secure OAuth tokens. Generate a strong 256-bit key:

```bash
openssl rand -hex 32
```

This outputs a 64-character hex string like:
```
8f7a2b4c6e1d9f3a5c8e2b7d4f9a1c6e3b8d2f5a9c4e7b1d6f3a8c5e2b9d4f7a
```

### Step 2: Update `.env` File

Add the following to your `.env` or `.env.local`:

```env
# Encryption Secret (required)
ENCRYPTION_SECRET=8f7a2b4c6e1d9f3a5c8e2b7d4f9a1c6e3b8d2f5a9c4e7b1d6f3a8c5e2b9d4f7a

# Vercel OAuth Credentials (required)
VERCEL_OAUTH_CLIENT_ID=your_client_id_here
VERCEL_OAUTH_CLIENT_SECRET=your_client_secret_here

# Redirect URI (required - must match OAuth app config)
VERCEL_OAUTH_REDIRECT_URI=http://localhost:3000/api/integrations/vercel/callback

# Integration Slug (optional - enables integration-specific OAuth URL)
VERCEL_INTEGRATION_SLUG=your-integration-slug
```

### Step 3: Verify Configuration

Restart your development server:

```bash
pnpm dev
```

Check that environment variables are loaded:

```bash
# Should output your client ID
node -e "require('dotenv').config(); console.log(process.env.VERCEL_OAUTH_CLIENT_ID)"
```

---

## Connecting Your Vercel Account

### From the UI

1. Navigate to `/integrations/test` in your browser
2. Click **"Connect Vercel"** button
3. You'll be redirected to Vercel's OAuth page
4. Review the requested permissions
5. Click **"Authorize"**
6. You'll be redirected back to `/integrations/vercel/success`
7. Success! Your Vercel account is now connected

### What Happens Behind the Scenes

1. **Authorization URL Generated:**
   ```
   https://vercel.com/integrations/your-slug/oauth/authorize?
     response_type=code&
     client_id=YOUR_CLIENT_ID&
     redirect_uri=http://localhost:3000/api/integrations/vercel/callback&
     state=RANDOM_STATE_TOKEN&
     scope=deployment database project env
   ```

2. **User Authorizes:** You approve the connection on Vercel

3. **Callback Received:**
   ```
   http://localhost:3000/api/integrations/vercel/callback?
     code=AUTHORIZATION_CODE&
     state=RANDOM_STATE_TOKEN
   ```

4. **Token Exchange:**
   ```typescript
   // Exchange code for tokens
   POST https://api.vercel.com/v2/oauth/access_token
   {
     client_id: 'YOUR_CLIENT_ID',
     client_secret: 'YOUR_CLIENT_SECRET',
     code: 'AUTHORIZATION_CODE',
     redirect_uri: 'http://localhost:3000/api/integrations/vercel/callback'
   }

   // Response:
   {
     access_token: 'TOKEN',
     token_type: 'Bearer',
     team_id: 'team_xxx' (if applicable)
   }
   ```

5. **Token Encrypted & Stored:**
   ```typescript
   const encrypted = encrypt(accessToken);

   await db.insert(integrations).values({
     userId: currentUser.id,
     provider: 'vercel',
     accessToken: encrypted.encrypted,
     accessTokenIv: encrypted.iv,
     accessTokenAuthTag: encrypted.authTag,
     metadata: { teamId: response.team_id },
   });
   ```

6. **Redirect to Success Page:** `/integrations/vercel/success`

### Verifying Connection

After connecting, verify your integration:

```typescript
// Frontend (React Query)
const { data: integrations } = useQuery(
  orpc.integrations.listIntegrations.queryOptions({ input: {} })
);

console.log(integrations);
// [{ id: '...', provider: 'vercel', createdAt: '...', metadata: { teamId: '...' } }]
```

---

## Database Management

### Creating a Database

**From UI:**
1. Navigate to `/integrations/test#databases`
2. Fill in:
   - **Database Name:** `my-database` (alphanumeric, hyphens allowed)
   - **Region:** Select from dropdown
3. Click **"Create Database"**
4. Wait for status to change from `creating` to `active`

**Available Regions:**
- `us-east-1` - US East (N. Virginia)
- `us-west-1` - US West (N. California)
- `eu-west-1` - EU West (Ireland)
- `ap-southeast-1` - Asia Pacific (Singapore)
- `ap-northeast-1` - Asia Pacific (Tokyo)

**Programmatically:**
```typescript
const createDb = useMutation(
  orpc.integrations.createVercelDatabase.mutationOptions()
);

createDb.mutate({
  integrationId: 'int_123',
  name: 'production-db',
  region: 'us-east-1',
});
```

**API Response:**
```json
{
  "id": "postgres_abc123",
  "name": "production-db",
  "connectionString": "postgres://username:password@host:port/database",
  "type": "postgres",
  "region": "us-east-1",
  "status": "creating",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "metadata": { /* Vercel-specific data */ }
}
```

### Listing Databases

**From UI:**
- Navigate to `/integrations/test#databases`
- Click **"Refresh"** to update list
- Table shows: Name, Region, Status, Created date

**Programmatically:**
```typescript
const { data: databases } = useQuery(
  orpc.integrations.listVercelDatabases.queryOptions({
    input: { integrationId: 'int_123' },
  })
);
```

### Deleting a Database

**From UI:**
1. Navigate to `/integrations/test#databases`
2. Click **trash icon** next to database
3. Confirm deletion in dialog
4. Database is permanently deleted

⚠️ **Warning:** This action is irreversible. All data will be lost.

**Programmatically:**
```typescript
const deleteDb = useMutation(
  orpc.integrations.deleteVercelDatabase.mutationOptions()
);

deleteDb.mutate({
  integrationId: 'int_123',
  databaseId: 'postgres_abc123',
});
```

---

## Deployment Management

### Creating a Deployment

The integration supports two deployment templates:

#### 1. Static HTML (Instant)

Deploys a simple HTML file with gradient design. Perfect for testing.

**From UI:**
1. Navigate to `/integrations/test#deployments`
2. Fill in:
   - **Deployment Name:** `my-static-site`
   - **Template:** Static HTML (Instant)
3. Click **"Create Deployment"**
4. Watch status change: `QUEUED` → `BUILDING` → `READY`
5. Click **"View Live Site"** when ready

**Programmatically:**
```typescript
const createDeployment = useMutation(
  orpc.integrations.createVercelDeployment.mutationOptions()
);

createDeployment.mutate({
  integrationId: 'int_123',
  name: 'my-static-site',
  template: 'static',
});
```

**Generated HTML:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>my-static-site</title>
  <style>
    body {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
  </style>
</head>
<body>
  <div>
    <h1>🚀 my-static-site</h1>
    <p>Your deployment is live!</p>
    <p>Created with Blogflow Vercel Integration</p>
  </div>
</body>
</html>
```

#### 2. Next.js Hello World

Deploys from Vercel's official examples repository.

**From UI:**
1. Navigate to `/integrations/test#deployments`
2. Fill in:
   - **Deployment Name:** `my-nextjs-app`
   - **Template:** Next.js Hello World
3. Click **"Create Deployment"**
4. Build takes ~2-3 minutes
5. Click **"View Live Site"** when ready

**Programmatically:**
```typescript
createDeployment.mutate({
  integrationId: 'int_123',
  name: 'my-nextjs-app',
  template: 'nextjs-hello-world',
});
```

**Deployment Config:**
```typescript
{
  name: 'my-nextjs-app',
  gitSource: {
    type: 'github',
    repo: 'vercel/next.js',
    ref: 'canary',
    path: 'examples/hello-world',
  },
  projectSettings: {
    framework: 'nextjs',
  },
}
```

### Monitoring Deployment Status

**Real-Time Polling (Frontend):**
```typescript
const { data: deployment } = useQuery({
  ...orpc.integrations.getVercelDeploymentStatus.queryOptions({
    input: { integrationId, deploymentId },
  }),
  // Poll every 3 seconds while building
  refetchInterval: deployment?.readyState === 'BUILDING' ? 3000 : false,
});
```

**Status States:**
- `QUEUED` - Waiting to start
- `BUILDING` - Build in progress
- `READY` - Deployment successful
- `ERROR` - Build failed
- `CANCELED` - Deployment canceled

**Deployment Response:**
```json
{
  "id": "dpl_xyz789",
  "name": "my-nextjs-app",
  "url": "my-nextjs-app-xyz789.vercel.app",
  "readyState": "READY",
  "createdAt": 1705318200000,
  "inspectorUrl": "https://vercel.com/username/my-nextjs-app/xyz789",
  "projectId": "prj_abc123"
}
```

### Listing Deployments

**From UI:**
- Navigate to `/integrations/test#deployments`
- Table shows: Name, Status, URL (clickable), Created date
- Click URL to open live site
- Click Inspector link for build details

**Programmatically:**
```typescript
const { data: deploymentList } = useQuery(
  orpc.integrations.listVercelDeployments.queryOptions({
    input: {
      integrationId: 'int_123',
      projectId: 'prj_abc123', // Optional filter
    },
  })
);
```

---

## Security Considerations

### Token Encryption

All OAuth tokens are encrypted before storage using AES-256-GCM:

```typescript
// Encryption
const encrypted = encrypt(accessToken);
// Returns: { encrypted: string, iv: string, authTag: string }

// Each component stored separately in database:
- accessToken: encrypted data
- accessTokenIv: initialization vector (unique per token)
- accessTokenAuthTag: authentication tag (verifies integrity)
```

**Security Benefits:**
- 256-bit encryption strength
- Unique IV prevents pattern detection
- Auth tag prevents tampering
- No plaintext tokens in database

### Token Access Control

**User Isolation:**
```typescript
// All operations verify ownership
const integration = await db.query.integrations.findFirst({
  where: and(
    eq(integrations.id, input.integrationId),
    eq(integrations.userId, context.userId),  // Must match current user
    eq(integrations.provider, 'vercel')
  ),
});

if (!integration) {
  throw new Error('Integration not found or access denied');
}
```

**Token Decryption:**
```typescript
// Only decrypted in server-side procedures
const accessToken = decrypt(
  integration.accessToken,
  integration.accessTokenIv,
  integration.accessTokenAuthTag
);

// Never sent to client
// Never logged
// Only used for API requests
```

### Best Practices

1. **Environment Variables:**
   - ✅ Use strong encryption secret (256-bit)
   - ✅ Rotate secrets periodically
   - ✅ Different secrets per environment
   - ❌ Never commit to version control

2. **OAuth Credentials:**
   - ✅ Keep client secret secure
   - ✅ Use HTTPS for redirect URIs in production
   - ✅ Validate state tokens
   - ❌ Never expose in client-side code

3. **Database:**
   - ✅ Use connection pooling
   - ✅ Enable SSL for database connections
   - ✅ Regular backups
   - ✅ Audit token access logs

4. **Error Handling:**
   - ✅ Catch and log errors server-side
   - ✅ Return generic error messages to client
   - ❌ Don't expose internal error details
   - ❌ Don't log decrypted tokens

---

## Troubleshooting

### OAuth Connection Issues

**Problem:** OAuth redirect fails or shows "Invalid redirect URI"

**Solution:**
1. Verify redirect URI matches exactly in:
   - Vercel OAuth app settings
   - `VERCEL_OAUTH_REDIRECT_URI` environment variable
   - Include protocol (http/https), port, and path
2. Check for trailing slashes - they must match
3. Ensure OAuth app is enabled in Vercel

---

**Problem:** "Encryption failed" error

**Solution:**
1. Check `ENCRYPTION_SECRET` is set:
   ```bash
   echo $ENCRYPTION_SECRET
   ```
2. Verify it's 64 hex characters (32 bytes):
   ```bash
   echo -n $ENCRYPTION_SECRET | wc -c  # Should output 64
   ```
3. Regenerate if needed:
   ```bash
   openssl rand -hex 32
   ```

---

**Problem:** "Integration not found" when creating database/deployment

**Solution:**
1. Verify integration exists:
   ```typescript
   const { data } = useQuery(
     orpc.integrations.listIntegrations.queryOptions({ input: {} })
   );
   console.log(data);
   ```
2. Check `integrationId` matches your connected integration
3. Ensure user is authenticated
4. Verify integration hasn't been disconnected

---

### Deployment Issues

**Problem:** Deployment stuck in `BUILDING` state

**Solution:**
1. Check Vercel dashboard for build logs
2. Click "Inspector URL" from deployment list
3. Look for build errors
4. For Next.js deployments, ensure repository is accessible
5. Check Vercel build minutes quota

---

**Problem:** "Rate limit exceeded" error

**Solution:**
1. Vercel API has rate limits (typically 100 requests/hour)
2. Wait for rate limit reset (check error for reset time)
3. Implement exponential backoff:
   ```typescript
   try {
     await provider.createDatabase(config, token);
   } catch (error) {
     if (error instanceof RateLimitError) {
       const retryAfter = error.resetAt.getTime() - Date.now();
       console.log(`Retry after ${retryAfter}ms`);
     }
   }
   ```

---

## API Reference

### oRPC Procedures

All procedures require authentication and use the `integrations` router.

#### `connectVercel`

Store OAuth connection after authorization.

**Input:**
```typescript
{
  accessToken: string;
  teamId?: string;
}
```

**Output:**
```typescript
{
  id: string;           // Integration ID
  provider: 'vercel';
  connected: true;
}
```

---

#### `listIntegrations`

List user's cloud provider integrations.

**Input:** None (uses authenticated user)

**Output:**
```typescript
Array<{
  id: string;
  provider: string;
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, unknown> | null;
}>
```

---

#### `disconnectIntegration`

Remove integration and delete encrypted tokens.

**Input:**
```typescript
{
  integrationId: string;
}
```

**Output:**
```typescript
{
  success: boolean;
}
```

---

#### `createVercelDatabase`

Create Postgres database on Vercel.

**Input:**
```typescript
{
  integrationId: string;
  name: string;  // 1-64 chars, alphanumeric + hyphens
  region?: 'us-east-1' | 'us-west-1' | 'eu-west-1' | 'ap-southeast-1' | 'ap-northeast-1';
}
```

**Output:**
```typescript
{
  id: string;
  name: string;
  connectionString: string;
  type: 'postgres';
  region: string;
  status: 'creating' | 'active' | 'error' | 'deleting';
  createdAt: Date;
  metadata: unknown;
}
```

---

#### `listVercelDatabases`

List all Vercel Postgres databases.

**Input:**
```typescript
{
  integrationId: string;
}
```

**Output:** Array of `DatabaseResult`

---

#### `deleteVercelDatabase`

Permanently delete a Vercel database.

**Input:**
```typescript
{
  integrationId: string;
  databaseId: string;
}
```

**Output:**
```typescript
{
  success: boolean;
}
```

---

#### `createVercelDeployment`

Deploy static site or Next.js application.

**Input:**
```typescript
{
  integrationId: string;
  name: string;  // 1-64 chars
  template: 'static' | 'nextjs-hello-world';
}
```

**Output:**
```typescript
{
  id: string;
  url: string;
  name: string;
  readyState: 'QUEUED' | 'BUILDING' | 'READY' | 'ERROR' | 'CANCELED';
  createdAt: number;
  inspectorUrl?: string;
  projectId?: string;
}
```

---

#### `getVercelDeploymentStatus`

Get current deployment status (for polling).

**Input:**
```typescript
{
  integrationId: string;
  deploymentId: string;
}
```

**Output:** Same as `createVercelDeployment`

---

#### `listVercelDeployments`

List deployments, optionally filtered by project.

**Input:**
```typescript
{
  integrationId: string;
  projectId?: string;
}
```

**Output:**
```typescript
{
  deployments: Array<VercelDeployment>;
  pagination: {
    count: number;
    next?: number;
    prev?: number;
  };
}
```

---

#### `listVercelProjects`

List all Vercel projects.

**Input:**
```typescript
{
  integrationId: string;
}
```

**Output:**
```typescript
{
  projects: Array<{
    id: string;
    name: string;
    accountId: string;
    createdAt: number;
    updatedAt: number;
    framework: string | null;
  }>;
}
```

---

## Related Documentation

- **[CLAUDE.md](../CLAUDE.md)** - Project overview and Vercel integration architecture
- **[Integration System](../lib/integrations/README.md)** - Backend provider abstraction
- **[Integration UI](../app/integrations/README.md)** - Frontend flows and components
- **[Vercel API Docs](https://vercel.com/docs/rest-api)** - Official Vercel API reference

---

## Additional Resources

- **Vercel OAuth Guide:** https://vercel.com/docs/integrations/creating-an-integration/oauth
- **Vercel Database Docs:** https://vercel.com/docs/storage/vercel-postgres
- **Vercel Deployments API:** https://vercel.com/docs/rest-api#endpoints/deployments
- **oRPC Documentation:** https://orpc.unnoq.com/
- **TanStack Query:** https://tanstack.com/query/latest
