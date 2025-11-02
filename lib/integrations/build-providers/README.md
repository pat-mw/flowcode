# Build Providers Module

This directory contains pluggable build provider implementations for compiling and deploying Webflow components. The provider abstraction supports multiple serverless function platforms.

## Directory Structure

```
lib/integrations/build-providers/
├── README.md                      # This file
├── types.ts                       # BuildProvider interface definitions
├── vercel.ts                      # Vercel Functions implementation
└── aws-lambda.ts                  # (Future) AWS Lambda implementation
```

## Overview

Build providers handle the entire build and deployment pipeline:

```
Component Files
    ↓
Write to Temp Directory
    ↓
Webpack Bundling (webpack.webflow.js)
    ↓
Webflow CLI Deployment
    ↓
Return Logs + Deployment URL
```

## BuildProvider Interface

**File:** `types.ts`

```typescript
interface BuildProvider {
  /** Provider name identifier */
  name: 'vercel' | 'aws-lambda';

  /** Whether provider supports streaming logs to client */
  supportsStreaming: boolean;

  /**
   * Build and deploy components
   * @param config Build configuration with components and token
   * @returns Build result with logs, URL, and status
   */
  buildComponents(config: BuildConfig): Promise<BuildResult>;
}
```

### BuildConfig

Configuration passed to build provider:

```typescript
interface BuildConfig {
  /** Component IDs to build */
  componentIds: string[];

  /** Decrypted Webflow workspace API token */
  webflowToken: string;

  /** Temporary directory for build isolation */
  outputDir: string;

  /** Component files and dependencies */
  componentFiles: ComponentFile[];
}
```

**ComponentFile:**
```typescript
interface ComponentFile {
  /** Path relative to project root */
  path: string;

  /** File content */
  content: string;

  /** Whether file is a dependency (not main component) */
  isDependency?: boolean;
}
```

### BuildResult

Result returned after build completes:

```typescript
interface BuildResult {
  /** Whether build succeeded */
  success: boolean;

  /** Build and deployment logs */
  logs: string[];

  /** Webflow deployment URL (if successful) */
  deploymentUrl?: string;

  /** Error message (if failed) */
  error?: string;

  /** Build artifacts generated */
  artifacts?: string[];
}
```

## Vercel Implementation

**File:** `vercel.ts`

The primary implementation using Vercel Functions as the build executor.

### Features

- **Synchronous Execution:** Single job within 300s timeout
- **File Isolation:** Temporary directory per build (e.g., `/tmp/webflow-export-job-abc123/`)
- **Webpack Integration:** Uses project's existing `webpack.webflow.js` config
- **Real-time Logs:** Streams build progress to frontend
- **Webflow CLI:** Direct CLI execution for deployment

### How It Works

1. **Setup**
   ```typescript
   const jobId = generateJobId(); // "webflow-export-abc123"
   const buildDir = path.join(outputDir, `webflow-export-${jobId}`);
   ```

2. **Write Files**
   ```
   /tmp/webflow-export-abc123/
   ├── src/
   │   └── components/
   │       ├── Lanyard.webflow.tsx
   │       └── Lanyard.tsx
   ├── lib/
   │   └── stores/
   │       └── slider-store.ts
   ├── webpack.webflow.js (copied from project)
   └── package.json (minimal)
   ```

3. **Run Webpack**
   ```bash
   webpack --config webpack.webflow.js
   ```
   Outputs: `dist/components.js` (bundled, minified)

4. **Deploy to Webflow**
   ```bash
   webflow-cli deploy \
     --token "wf_..." \
     --component-bundle dist/components.js \
     --component-ids "lanyard-3d"
   ```

5. **Return Results**
   ```typescript
   {
     success: true,
     logs: [
       "✅ Files written",
       "✅ Webpack bundled: 247KB",
       "✅ Deployed to Webflow"
     ],
     deploymentUrl: "https://webflow.com/dashboard/workspace/..."
   }
   ```

### Build Logs

Logs are accumulated and streamed to the frontend in real-time:

```typescript
logs = [
  "📦 Component Discovery: Found 1 component, 3 dependencies",
  "📝 Writing files to /tmp/webflow-export-job-abc123/",
  "⚙️  Running webpack...",
  "✅ Build successful: 247KB",
  "📤 Uploading to Webflow API...",
  "✨ Deployment complete!"
];
```

Each log line typically includes:
- Emoji indicator for status/type
- Description of what's happening
- Details (sizes, paths, etc.)

### Error Handling

If build fails, logs show where it stopped:

```typescript
{
  success: false,
  logs: [
    "📦 Component Discovery: Found 1 component...",
    "📝 Writing files...",
    "⚙️  Running webpack...",
    "❌ Webpack failed: Cannot find module '@/lib/utils.ts'"
  ],
  error: "Unresolved import: @/lib/utils"
}
```

### Security

- **Isolation:** Temporary directory not accessible to other jobs
- **Token:** Never written to logs or filesystem
- **Input Validation:** Component files validated before writing
- **Output Sanitization:** Error messages don't expose filesystem paths

## Usage

### In oRPC Router

```typescript
import { VercelBuildProvider } from '@/lib/integrations/build-providers/vercel';

const buildProvider = new VercelBuildProvider();

const result = await buildProvider.buildComponents({
  componentIds: ["lanyard-3d"],
  webflowToken: decryptedToken,
  outputDir: "/tmp",
  componentFiles: [
    {
      path: "src/components/Lanyard.webflow.tsx",
      content: "..."
    },
    {
      path: "src/components/Lanyard.tsx",
      content: "...",
      isDependency: true
    }
  ]
});

return result;
```

## Timeout Considerations

### Vercel Functions (300s Hard Limit)

Current `VercelBuildProvider` runs synchronously within this limit:

**Typical Build Times:**
- Small component (1 file): 5-10 seconds
- Medium component (5 files): 15-25 seconds
- Large component (20+ files): 40-60 seconds

**Build Breakdown:**
- File I/O: 1-2 seconds
- Webpack compilation: 5-20 seconds
- Webflow API call: 5-10 seconds
- Overhead: 1-5 seconds

**Optimization:**
- Cache webpack builds (future)
- Parallel builds for multiple components (future)
- Incremental bundling (future)

### AWS Lambda (Future)

Async provider can handle builds beyond timeout:

```typescript
// Queue build job
const jobId = await buildProvider.queueBuild(config);

// Poll for status
const status = await buildProvider.getStatus(jobId);

// Return when complete
const result = await buildProvider.getResult(jobId);
```

## Configuration Files

### webpack.webflow.js

The build provider uses the project's existing Webpack configuration:

```javascript
// webpack.webflow.js (project root)
module.exports = {
  mode: 'production',
  entry: './src/components/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'components.js'
  },
  module: {
    rules: [
      // TypeScript loader
      // CSS loader for Tailwind
      // Asset loaders
    ]
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      '@/components': path.resolve(__dirname, 'components'),
      '@/lib': path.resolve(__dirname, 'lib'),
      // ... other aliases
    }
  },
  // ... other config
};
```

The build provider copies this config to the temp directory and runs webpack with it.

## Testing

### Unit Tests

Test build provider interface compliance and error handling.

### Integration Tests

1. Create component files
2. Run webpack build
3. Verify output bundle
4. Deploy to Webflow (if token available)
5. Check deployment URL

### Manual Testing

```bash
# Start dev server
pnpm dev

# Navigate to /integrations/webflow
# 1. Save Webflow token
# 2. Select components
# 3. Click Export
# 4. Monitor build logs
# 5. Verify deployment
```

## Extending the System

### Adding AWS Lambda Provider

Create `aws-lambda.ts`:

```typescript
import { BuildProvider, BuildConfig, BuildResult } from './types';

export class AWSLambdaBuildProvider implements BuildProvider {
  name = 'aws-lambda' as const;
  supportsStreaming = true;

  async buildComponents(config: BuildConfig): Promise<BuildResult> {
    const jobId = generateJobId();

    // Queue build job in SQS
    await this.queueBuild(jobId, config);

    // Poll for completion (with timeout)
    const result = await this.waitForCompletion(jobId);

    return result;
  }

  private async queueBuild(jobId: string, config: BuildConfig) {
    // Send to SQS queue
  }

  private async waitForCompletion(jobId: string): Promise<BuildResult> {
    // Poll DynamoDB for job status
  }
}
```

### Adding CDN Provider

```typescript
export class CDNBuildProvider implements BuildProvider {
  name = 'cdn' as const;
  supportsStreaming = false;

  async buildComponents(config: BuildConfig): Promise<BuildResult> {
    // Build locally then upload to CDN
    // Return CDN URL instead of Webflow deployment
  }
}
```

## Performance Optimization

### Current (Synchronous Vercel)
- Single job per request
- 300s timeout limit
- Best for small-to-medium components

### Planned Improvements

1. **Webpack Caching**
   - Cache between builds
   - Incremental builds for unchanged components

2. **Parallel Builds**
   - Multiple components compiled together
   - Shared dependency bundling

3. **Async Execution**
   - AWS Lambda for large builds
   - Job queue for scalability
   - Background deployment

## Dependencies

### Vercel Runtime
- Node.js runtime on Vercel Functions
- Access to filesystem (`/tmp`)
- npm/node_modules available

### Build Tools
- `webpack` and loaders (dev dependencies)
- `@webflow/webflow-cli` (npm package)
- TypeScript compiler (via tsconfig)

## Troubleshooting

### Build Takes Too Long

**Issue:** Build timeout approaching or exceeds limit

**Solutions:**
1. Reduce component selection (build fewer at once)
2. Remove unused dependencies
3. Optimize webpack configuration
4. Switch to AWS Lambda provider (future)

### Webflow CLI Not Found

**Issue:** "webflow-cli not found" error

**Solution:**
- Verify `@webflow/webflow-cli` is in `package.json`
- Ensure npm dependencies installed in build environment
- Check Vercel build logs

### Token Invalid at Deploy Time

**Issue:** Token decryption succeeds but Webflow API rejects it

**Solutions:**
1. Token may be revoked - have user save new token
2. Token may lack required permissions
3. Webflow workspace may be archived
4. Check Webflow API status

## Related Files

- [BuildProvider Types](./types.ts)
- [Webflow Export Guide](../../docs/webflow-export-guide.md)
- [oRPC Router](../api/routers/webflow.ts)
- [Webpack Config](../../../webpack.webflow.js)
- [Vercel Implementation](./vercel.ts)
