# Webflow Integration Module

This directory contains the modular Webflow Component Export System, which enables secure, encrypted token management and automated component deployment to Webflow workspaces.

## Directory Structure

```
lib/integrations/webflow/
├── README.md                          # This file
├── auth/
│   ├── types.ts                      # WebflowAuthProvider interface
│   └── manual-token.ts               # AES-256-GCM encrypted token storage
├── discovery/
│   ├── types.ts                      # ComponentDiscovery interface
│   └── filesystem.ts                 # Glob-based component scanning
└── __tests__/
    ├── auth/
    │   └── manual-token-provider.test.ts    # 24 unit tests
    └── discovery/
        └── filesystem-discovery.test.ts     # Discovery tests
```

## Core Modules

### 1. Authentication (`auth/`)

**Purpose:** Manage Webflow workspace tokens with encryption.

**Key Files:**
- `types.ts` - `WebflowAuthProvider` interface and error classes
- `manual-token.ts` - `ManualTokenProvider` implementation

**Features:**
- AES-256-GCM encryption (same as Vercel integration)
- Secure database storage with separate IV/auth tag
- User isolation by userId
- Token never returned in API responses
- Decrypted only when needed for export

**Usage:**
```typescript
import { ManualTokenProvider } from '@/lib/integrations/webflow/auth/manual-token';

const authProvider = new ManualTokenProvider();

// Save token (encrypted)
await authProvider.saveToken(userId, "wf_user_token_123");

// Check if token exists
const hasToken = await authProvider.hasToken(userId);

// Get token (decrypted)
const token = await authProvider.getToken(userId);

// Revoke token
await authProvider.revokeToken(userId);
```

**Security Model:**
```
User Token (plaintext)
    ↓
AES-256-GCM Encryption
    ↓
IV (16 bytes) + Ciphertext + Auth Tag (16 bytes)
    ↓
Database Storage (3 columns)
```

### 2. Component Discovery (`discovery/`)

**Purpose:** Scan project for Webflow components and analyze dependencies.

**Key Files:**
- `types.ts` - `ComponentDiscovery` interface and types
- `filesystem.ts` - `FilesystemDiscovery` implementation

**Features:**
- Glob-based scanning of `./src/**/*.webflow.tsx` files
- Metadata extraction from component files
- Recursive dependency resolution
- Filters out Node.js builtins and Next.js-specific imports
- Returns component list with metadata

**Usage:**
```typescript
import { FilesystemDiscovery } from '@/lib/integrations/webflow/discovery/filesystem';

const discovery = new FilesystemDiscovery();

// List all components
const components = await discovery.listComponents();

// Get component details
const component = await discovery.getComponentDetails("lanyard-3d");

// Get component files with dependencies
const files = await discovery.getComponentFiles(["lanyard-3d", "slider-duo"]);

// Get all dependencies (transitive)
const deps = await discovery.getDependencies("lanyard-3d");
```

**Component Metadata:**
```typescript
{
  id: "lanyard-3d",                              // Unique ID
  name: "Lanyard 3D",                            // From declareComponent()
  path: "src/components/Lanyard.webflow.tsx",   // File path
  description: "Interactive 3D visualization",   // Purpose
  group: "3D",                                   // Category
  dependencies: [                                // Import paths
    "src/components/Lanyard.tsx",
    "lib/stores/slider-store.ts",
    "@react-three/fiber"
  ],
  fileSize: 2456,                                // Bytes
  lastModified: Date                             // Timestamp
}
```

**Dependency Resolution:**
1. Parse import statements from component file
2. Recursively resolve each import
3. Exclude:
   - Node.js builtins (`fs`, `path`, etc.)
   - Next.js-specific imports (`next/navigation`, `next/image`, etc.)
   - External npm packages (handled by webpack)
4. Include:
   - Project source files (`src/components`, `lib/`, etc.)
   - shadcn/ui components (`components/ui/`)
   - Zustand stores (`lib/stores/`)

### 3. Build Providers (`../build-providers/`)

**Purpose:** Execute webpack build and deploy to Webflow.

**Key Files:**
- `types.ts` - `BuildProvider` interface and types
- `vercel.ts` - `VercelBuildProvider` implementation

**Features:**
- Webpack bundling with project's existing config
- Webflow CLI deployment
- Real-time log streaming
- Isolated temporary directory per build
- Synchronous job execution (fits 300s Vercel Function timeout)

**Usage:**
```typescript
import { VercelBuildProvider } from '@/lib/integrations/build-providers/vercel';

const buildProvider = new VercelBuildProvider();

const result = await buildProvider.buildComponents({
  componentIds: ["lanyard-3d"],
  webflowToken: "wf_...",
  outputDir: "/tmp/webflow-export-job-123",
  componentFiles: [
    { path: "src/components/Lanyard.webflow.tsx", content: "..." },
    { path: "src/components/Lanyard.tsx", content: "..." },
  ]
});

// Returns:
{
  success: true,
  logs: ["📦 Component Discovery...", "⚙️ Webpack bundling..."],
  deploymentUrl: "https://webflow.com/dashboard/...",
}
```

## API Integration

### oRPC Router (`lib/api/routers/webflow.ts`)

All procedures require authentication via `protectedProcedure`.

**Procedures:**

1. `saveWebflowToken` - Save encrypted token
   ```typescript
   Input: { token: string }
   Output: { success: boolean, message: string }
   ```

2. `getWebflowToken` - Check if token exists
   ```typescript
   Input: (none)
   Output: { hasToken: boolean }
   ```

3. `revokeWebflowToken` - Delete token
   ```typescript
   Input: (none)
   Output: { success: boolean, message: string }
   ```

4. `listWebflowComponents` - List available components
   ```typescript
   Input: (none)
   Output: WebflowComponent[]
   ```

5. `exportComponents` - Build and deploy components
   ```typescript
   Input: { componentIds: string[] }
   Output: { success: boolean, logs: string[], deploymentUrl?: string, error?: string }
   ```

See `/docs/webflow-export-guide.md` for detailed API documentation.

## Testing

### Unit Tests

**Manual Token Provider** (`auth/manual-token-provider.test.ts`)
- 24 test cases covering:
  - Token encryption/decryption lifecycle
  - User isolation verification
  - Database operations
  - Error handling and edge cases
  - Missing token scenarios
  - Encryption failures

**Run Tests:**
```bash
pnpm test __tests__/lib/integrations/webflow/auth/manual-token-provider.test.ts
```

**Filesystem Discovery** (`discovery/filesystem-discovery.test.ts`)
- Component scanning tests
- Dependency resolution tests
- Glob pattern matching tests

**Run Tests:**
```bash
pnpm test __tests__/lib/integrations/webflow/discovery/filesystem-discovery.test.ts
```

### Integration Testing

Test the complete workflow:

1. Start dev server: `pnpm dev`
2. Navigate to `/integrations/webflow`
3. Save Webflow token
4. View component list
5. Select components and export
6. Verify build logs and deployment URL

## Configuration

### Environment Variables

Uses existing `ENCRYPTION_SECRET` from root `.env`:

```env
# Generate with: openssl rand -hex 32
ENCRYPTION_SECRET=your-256-bit-hex-secret
```

### Database Schema

Webflow tokens stored in `integrations` table:

```sql
CREATE TABLE integrations (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  provider TEXT NOT NULL, -- 'webflow' for this module
  token_iv BYTEA,
  token_encrypted BYTEA,
  token_auth_tag BYTEA,
  metadata JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, provider)
);
```

## Component Discovery Pattern

### How Components Are Identified

1. **File Pattern:** Must match `./src/**/*.webflow.@(ts|tsx|js|jsx)`
2. **Export:** Must use `declareComponent()` from `@webflow/react`
3. **Metadata:** Extracted from JSDoc comments and `declareComponent` options

**Example Component:**
```typescript
// src/components/Lanyard.webflow.tsx
/**
 * 3D lanyard visualization component
 * Group: 3D
 */

import Lanyard from './Lanyard';
import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';

export default declareComponent(Lanyard, {
  name: 'Lanyard 3D',
  description: 'Interactive 3D lanyard visualization',
  group: '3D',
  props: {
    gravity: props.Number({ defaultValue: 1 }),
    // ...
  }
});
```

**Parsed Metadata:**
```typescript
{
  id: "lanyard-3d",                          // Derived from filename
  name: "Lanyard 3D",                        // From declareComponent
  path: "src/components/Lanyard.webflow.tsx",
  description: "Interactive 3D lanyard visualization",
  group: "3D",
  dependencies: [
    "src/components/Lanyard.tsx",
    "lib/stores/slider-store.ts",
    "@react-three/fiber",
    "@react-three/drei"
  ]
}
```

## Dependency Filtering

### Included in Dependencies
- Project source files: `src/**`, `lib/**`, `components/**`, `hooks/**`
- Zustand stores: `lib/stores/**`
- Utilities: `lib/utils/**`
- Local components: `components/**`

### Excluded from Dependencies
- **Node.js builtins:** `fs`, `path`, `crypto`, etc.
- **Next.js specific:** `next/navigation`, `next/image`, `next/link`, etc.
- **Server-only:** `server-only`, modules marked server-side
- **External npm:** `@react-three/*`, `zustand`, etc. (webpack handles these)

**Example Filtering:**
```typescript
// In Component:
import { useRouter } from 'next/navigation';  // ❌ Excluded
import Lanyard from './Lanyard';              // ✅ Included
import { useSliderStore } from '@/lib/stores/slider-store'; // ✅ Included
import '@react-three/fiber';                   // ❌ Excluded (npm)
```

## Security Model

### Token Security Layers

1. **In Transit:**
   - HTTPS only (Vercel deployment)
   - oRPC encrypted request/response

2. **At Rest:**
   - AES-256-GCM encryption with:
     - Random 16-byte IV
     - 16-byte auth tag for integrity
     - User-specific secret from `ENCRYPTION_SECRET`

3. **In Memory:**
   - Decrypted only when needed (during export)
   - Not cached
   - Cleared after use

4. **In Logs:**
   - Never logged
   - Error messages don't expose token
   - Build logs sanitized

### User Isolation

- All operations filtered by authenticated `userId`
- Database queries: `WHERE user_id = $1 AND provider = 'webflow'`
- No cross-user token access possible

## Error Handling

### Custom Error Classes

**AuthProviderError**
```typescript
throw new AuthProviderError(
  "Token decryption failed",
  "manual-token",
  "DECRYPTION_FAILED",
  { details: "..." }
);
```

**DiscoveryError**
```typescript
throw new DiscoveryError(
  "Component not found",
  "filesystem",
  "COMPONENT_NOT_FOUND",
  { details: "..." }
);
```

**BuildProviderError**
```typescript
throw new BuildProviderError(
  "Webpack build failed",
  "vercel",
  "BUILD_FAILED",
  { details: "..." }
);
```

## Future Extensibility

### Adding OAuth Provider

Create `oauth-token.ts`:
```typescript
export class OAuthTokenProvider implements WebflowAuthProvider {
  name = 'oauth' as const;
  // Implement OAuth flow
}
```

### Adding Database Discovery

Create `database.ts`:
```typescript
export class DatabaseDiscovery implements ComponentDiscovery {
  name = 'database' as const;
  // Query component registry from database
}
```

### Adding AWS Lambda Build

Create `aws-lambda.ts`:
```typescript
export class AWSLambdaBuildProvider implements BuildProvider {
  name = 'aws-lambda' as const;
  supportsStreaming = true;
  // Async build execution
}
```

## Related Documentation

- [Webflow Export Guide](../../docs/webflow-export-guide.md) - Complete user guide
- [Component Discovery Types](./discovery/types.ts) - Interface definitions
- [Auth Provider Types](./auth/types.ts) - Authentication interface
- [Build Provider Types](../build-providers/types.ts) - Build execution interface
- [oRPC Router](../api/routers/webflow.ts) - API procedures
