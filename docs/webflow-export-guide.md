# Webflow Component Export System Guide

This guide explains the Webflow Component Export System (Feature #3), which enables users to export selected Webflow components directly to their Webflow workspace with encrypted token management and automated builds.

## Overview

The export system is built on a **modular, provider-based architecture** with three swappable layers:

1. **Component Discovery** - Finds and analyzes available components
2. **Webflow Authentication** - Manages workspace tokens securely
3. **Build Execution** - Builds and deploys components

```
User Interface
    ↓
oRPC API Layer
    ↓
┌─────────────────────────────────────┐
│  Webflow Export System              │
├─────────────────────────────────────┤
│ Discovery  │ Auth Provider │ Builder │
│ (Filesystem)│ (ManualToken) │ (Vercel)│
├─────────────────────────────────────┤
│ (Future: Database, OAuth, AWS Lambda)
└─────────────────────────────────────┘
```

## Architecture

### Provider Interfaces

#### 1. ComponentDiscovery (`lib/integrations/webflow/discovery/types.ts`)

Scans the project for Webflow components and analyzes their dependencies.

```typescript
interface ComponentDiscovery {
  name: 'filesystem' | 'database';

  listComponents(): Promise<WebflowComponent[]>;
  getComponentDetails(componentId: string): Promise<WebflowComponent | null>;
  getComponentFiles(componentIds: string[]): Promise<ComponentFiles>;
  getDependencies(componentId: string): Promise<string[]>;
}
```

**WebflowComponent Details:**
- `id` - Unique identifier (e.g., "lanyard-3d", "slider-duo")
- `name` - Display name from `declareComponent()`
- `path` - File path relative to project root (e.g., "src/components/Lanyard.webflow.tsx")
- `description` - Component purpose
- `group` - Category (e.g., "3D", "Interactive")
- `dependencies` - Direct import dependencies
- `fileSize` - Component size in bytes

**ComponentFiles:**
```typescript
{
  components: [
    { path: "src/components/Lanyard.webflow.tsx", content: "..." },
  ],
  dependencies: [
    { path: "src/components/Lanyard.tsx", content: "..." },
    { path: "lib/stores/slider-store.ts", content: "..." },
  ]
}
```

**Current Implementation:** `FilesystemDiscovery` (`lib/integrations/webflow/discovery/filesystem.ts`)
- Scans `./src/**/*.webflow.tsx` using glob patterns
- Extracts component metadata from file headers
- Parses import statements for dependencies
- Resolves transitive dependencies recursively
- Excludes Node.js builtins and Next.js-specific code

#### 2. WebflowAuthProvider (`lib/integrations/webflow/auth/types.ts`)

Manages Webflow workspace tokens with encryption.

```typescript
interface WebflowAuthProvider {
  name: 'manual-token' | 'oauth';

  getToken(userId: string): Promise<string>;
  saveToken(userId: string, token: string): Promise<void>;
  hasToken(userId: string): Promise<boolean>;
  revokeToken(userId: string): Promise<void>;
}
```

**Current Implementation:** `ManualTokenProvider` (`lib/integrations/webflow/auth/manual-token.ts`)
- **Encryption:** AES-256-GCM (same as Vercel integration)
- **Storage:** Encrypted in database `integrations` table with `provider: 'webflow'`
- **Security:**
  - Token never returned in API responses
  - Only decrypted when needed for export
  - Separate IV and auth tag columns for security
- **User Isolation:** All tokens filtered by authenticated `userId`

**Future Implementations:**
- OAuth provider for automatic token exchange
- Third-party provider abstraction

#### 3. BuildProvider (`lib/integrations/build-providers/types.ts`)

Executes webpack build and deploys to Webflow.

```typescript
interface BuildProvider {
  name: 'vercel' | 'aws-lambda';
  supportsStreaming: boolean;

  buildComponents(config: BuildConfig): Promise<BuildResult>;
}
```

**BuildConfig:**
```typescript
{
  componentIds: ["lanyard-3d"],
  webflowToken: "wf_...", // Decrypted user token
  outputDir: "/tmp/webflow-export-job-123",
  componentFiles: [
    { path: "src/components/Lanyard.webflow.tsx", content: "..." },
    { path: "src/components/Lanyard.tsx", content: "..." },
  ]
}
```

**BuildResult:**
```typescript
{
  success: true,
  logs: [
    "[1/5] Writing component files...",
    "[2/5] Running webpack...",
    "[3/5] Uploading to Webflow...",
  ],
  deploymentUrl: "https://webflow.com/dashboard/workspace/...",
  artifacts: ["dist/bundle.js"]
}
```

**Current Implementation:** `VercelBuildProvider` (`lib/integrations/build-providers/vercel.ts`)
- Runs Webflow CLI in Vercel Function context
- Temporary isolated directory per build: `/tmp/webflow-export-{jobId}/`
- Single synchronous job (300s timeout limit)
- Webpack integration using existing `webpack.webflow.js` config
- Logs streamed to frontend in real-time

**Future Implementations:**
- AWS Lambda for async builds
- Direct webpack bundling
- CDN deployment targets

## User Workflow

### 1. Setup Webflow Token

```typescript
// Frontend: User enters token
await orpc.webflow.saveWebflowToken.mutate({
  token: "wf_user_workspace_token_123"
});

// Backend:
// 1. Validate token format
// 2. Encrypt with AES-256-GCM
// 3. Store in database with user isolation
// 4. Return success confirmation
```

**Token Storage:**
- Encrypted in: `integrations` table
- Columns: `token_iv`, `token_encrypted`, `token_auth_tag`
- User isolation: Filtered by `userId`
- Provider: `'webflow'` (not to be confused with Vercel provider)

### 2. Browse Components

```typescript
// Frontend: Check token status
const { data: status } = useQuery(
  orpc.webflow.getWebflowToken.queryOptions()
);

// If token exists, fetch components
const { data: components } = useQuery(
  orpc.webflow.listWebflowComponents.queryOptions()
);

// Returns:
[
  {
    id: "lanyard-3d",
    name: "Lanyard 3D",
    path: "src/components/Lanyard.webflow.tsx",
    description: "Interactive 3D lanyard visualization",
    group: "3D",
    dependencies: [
      "src/components/Lanyard.tsx",
      "lib/stores/slider-store.ts",
      "@react-three/fiber",
    ],
  },
  // ... more components
]
```

**Component List UI Features:**
- Search and filter by name/group
- Display dependencies with badges
- Show file size and last modified
- Select multiple components with checkboxes
- "Select All" / "Deselect All" buttons
- Selection count badge

### 3. Export Components

```typescript
// Frontend: User clicks export button
const result = await orpc.webflow.exportComponents.mutate({
  componentIds: ["lanyard-3d", "slider-duo"],
});

// Returns:
{
  success: true,
  logs: [
    "📦 Component Discovery: Found 2 components, 5 dependencies",
    "🔍 Resolving imports...",
    "📝 Writing files to /tmp/webflow-export-job-123/",
    "⚙️  Webpack bundling...",
    "✅ Build successful: 247KB",
    "🚀 Uploading to Webflow...",
    "✨ Deployment complete!"
  ],
  deploymentUrl: "https://webflow.com/dashboard/workspace/...",
}
```

**Build Process:**
1. Decrypt user's Webflow token
2. Discover selected components and dependencies
3. Write files to temporary directory
4. Run webpack with `webpack.webflow.js` config
5. Execute Webflow CLI for deployment
6. Return deployment URL and logs

**Failure Handling:**
```typescript
{
  success: false,
  logs: [
    "📦 Component Discovery: Found 2 components...",
    "⚙️  Webpack bundling...",
    "❌ Build failed: Missing dependency 'lib/utils.ts'"
  ],
  error: "Unresolved dependency: @/lib/utils",
}
```

## API Routes

### oRPC Procedures (`lib/api/routers/webflow.ts`)

All procedures require authentication (`protectedProcedure`).

#### 1. saveWebflowToken

Save encrypted Webflow workspace token.

```typescript
Input: { token: string }

Output: {
  success: boolean,
  message: string
}

Errors:
- Token validation failed
- Encryption failed
- Database storage failed
```

**Security:**
- Token is immediately encrypted after validation
- Original token never stored in plaintext
- Encryption happens server-side only

#### 2. getWebflowToken

Check if user has a stored token (does NOT return token).

```typescript
Input: (none)

Output: {
  hasToken: boolean
}
```

**Purpose:** Frontend checks token status to show/hide token input form.

#### 3. revokeWebflowToken

Delete stored token for user.

```typescript
Input: (none)

Output: {
  success: boolean,
  message: string
}
```

**Security:** Removes all token data from database permanently.

#### 4. listWebflowComponents

Discover all available Webflow components in the project.

```typescript
Input: (none)

Output: WebflowComponent[]
```

**Requires:** Token must exist for user (checked at middleware level).

#### 5. exportComponents

Build and deploy selected components to Webflow.

```typescript
Input: {
  componentIds: string[] // Minimum 1 component
}

Output: {
  success: boolean,
  logs: string[],
  deploymentUrl?: string,
  error?: string,
  artifacts?: string[]
}
```

**Process:**
1. Verify at least one component selected
2. Get user's decrypted Webflow token
3. Discover selected components and dependencies
4. Build with webpack
5. Deploy to Webflow
6. Return result with logs

## Frontend Implementation

### UI Component (`app/integrations/webflow/page.tsx`)

Complete UI for:
1. **Token Setup Form**
   - Password input for token
   - Save button with loading state
   - Error messaging
   - Info alert with Webflow docs link

2. **Token Status**
   - Connected badge when token is saved
   - Option to disconnect/revoke

3. **Component Selection**
   - Loading state during component discovery
   - Searchable list with checkboxes
   - Dependency badges
   - Select All / Deselect All buttons
   - Selection count badge

4. **Export Section**
   - Export button disabled until components selected
   - Real-time build logs in code block
   - Success/failure alert
   - Webflow dashboard link on success

### Key UI Patterns

**Token Input:**
```typescript
<Input
  type="password"
  placeholder="wf_..."
  value={token}
  onChange={(e) => setToken(e.target.value)}
/>
```

**Component Selection:**
```typescript
<div className="space-y-2">
  {components.map((component) => (
    <div key={component.id} className="flex items-start gap-3">
      <Checkbox
        checked={selectedComponents.has(component.id)}
        onCheckedChange={() => toggleComponent(component.id)}
      />
      <div>
        <div className="font-medium">{component.name}</div>
        {component.dependencies.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {component.dependencies.map((dep) => (
              <Badge key={dep} variant="outline">{dep}</Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  ))}
</div>
```

**Build Logs:**
```typescript
<div className="bg-muted p-4 rounded-lg font-mono text-xs max-h-64 overflow-y-auto">
  {exportLogs.map((log, i) => (
    <div key={i} className="whitespace-pre-wrap">{log}</div>
  ))}
</div>
```

## Environment Variables

No new environment variables required. The system reuses:

- `ENCRYPTION_SECRET` - For AES-256-GCM encryption (already in .env)
- `DATABASE_URL` - For storing encrypted tokens
- Webflow token provided by user at runtime

## Database Integration

### Storage Location

Webflow tokens stored in existing `integrations` table:

```sql
INSERT INTO integrations (
  user_id,
  provider,
  token_iv,
  token_encrypted,
  token_auth_tag,
  created_at,
  updated_at
) VALUES (...)
```

### Encryption Details

Same pattern as Vercel integration:
- **Algorithm:** AES-256-GCM
- **IV Column:** `token_iv` (16 random bytes)
- **Encrypted Column:** `token_encrypted`
- **Auth Tag Column:** `token_auth_tag` (16 bytes)
- **Secret:** From `ENCRYPTION_SECRET` environment variable

## Testing

### Unit Tests

- **Manual Token Provider:** 24 test cases covering:
  - Token encryption/decryption
  - User isolation
  - Error handling
  - Database operations

- **Filesystem Discovery:** Component scanning tests
  - Glob pattern matching
  - Dependency resolution
  - Metadata extraction

### Integration Tests

- End-to-end export workflow
- oRPC procedure validation
- Database encryption verification

### Manual Testing

1. **Token Management:**
   - Save Webflow token
   - Verify token not exposed in network requests
   - Revoke token and verify removal

2. **Component Discovery:**
   - List components after token saved
   - Verify dependencies included
   - Check component metadata accuracy

3. **Export Workflow:**
   - Select components
   - Export with success
   - View build logs in real-time
   - Access deployment URL

4. **Error Handling:**
   - Invalid token format
   - Missing dependencies
   - Export with no components selected
   - Network failures

## Future Enhancements

### Phase 2: OAuth Integration
- Replace manual token input with OAuth flow
- `OAuthWebflowAuthProvider` implementation
- One-click workspace connection

### Phase 3: Async Builds
- AWS Lambda build provider for long-running builds
- Job queue and status tracking
- Email notifications on completion

### Phase 4: Component Registry
- `DatabaseDiscovery` for future component marketplace
- Component versioning
- Analytics and usage tracking

### Phase 5: Advanced Features
- Selective dependency bundling
- Component theming options
- Multi-workspace support
- Build optimization and caching

## Troubleshooting

### Issue: Token not saving

**Symptoms:** Save button shows loading indefinitely

**Causes:**
1. Invalid token format (must start with `wf_`)
2. Network connection issue
3. Encryption failure
4. Database connection error

**Solution:**
- Check browser console for error messages
- Verify `ENCRYPTION_SECRET` is set in environment
- Check database connection
- Retry with valid token

### Issue: Components not listing

**Symptoms:** Component list stays empty after token saved

**Causes:**
1. No `.webflow.tsx` files found in project
2. Discovery scan failed
3. Token not actually saved (check DB)

**Solution:**
- Verify `.webflow.tsx` files exist in `src/components/`
- Check server logs for discovery errors
- Verify token is in database

### Issue: Export fails with missing dependencies

**Symptoms:** Build logs show "Cannot find module" error

**Causes:**
1. Component imports external npm package not available at runtime
2. Circular dependency detected
3. Relative import path is incorrect

**Solution:**
- Verify imports use correct paths (`@/lib/...`)
- Remove external npm imports (use bundled alternatives)
- Check for circular dependencies

### Issue: Webflow deployment fails

**Symptoms:** Export succeeds but components don't appear in Webflow

**Causes:**
1. Webflow token invalid or revoked
2. Workspace access permissions changed
3. Webflow CLI version mismatch

**Solution:**
- Refresh token by saving new one
- Check Webflow workspace access settings
- Update `@webflow/webflow-cli` to latest version

## Security Considerations

### Token Security
- Tokens encrypted at rest with AES-256-GCM
- Decrypted only when needed (during export)
- Never logged or exposed in error messages
- User can revoke at any time

### User Isolation
- All operations filtered by authenticated `userId`
- No token disclosure between users
- API rate limiting on export procedures

### Build Sandbox
- Temporary directory isolated per build job
- No access to source code outside component dependencies
- Webpack runs in isolated process context

## References

- [Webflow API Docs](https://developers.webflow.com/reference)
- [Component Discovery Types](../lib/integrations/webflow/discovery/types.ts)
- [Auth Provider Types](../lib/integrations/webflow/auth/types.ts)
- [Build Provider Types](../lib/integrations/build-providers/types.ts)
- [oRPC Router](../lib/api/routers/webflow.ts)
- [Frontend UI](../app/integrations/webflow/page.tsx)
