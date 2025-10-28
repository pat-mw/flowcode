# Multi-Library Registry System for Webflow Code Components

## Executive Summary

This specification defines a system for managing multiple Webflow component libraries within a single repository, each with independent bundling, size limits, and deployment processes. The system enables:

- **Separation of Concerns**: Group related components into dedicated libraries
- **Size Management**: Each library has independent bundle size limits
- **Parallel Processing**: CI/CD builds and validates all libraries concurrently
- **Type Safety**: Compile-time validation of library configurations
- **Developer Experience**: Simple, declarative API for defining and managing libraries

## Problem Statement

Current limitations:
1. **Single Bundle Limit**: All components share a 15MB Webflow bundle limit
2. **Tight Coupling**: Adding heavy dependencies (recharts, Three.js) affects all components
3. **All-or-Nothing Deployment**: Cannot deploy component subsets independently
4. **No Grouping**: Components lack logical organization beyond folder structure

## Goals

1. **Multiple Independent Libraries**: Each with its own bundle, size limit, and deployment
2. **Type-Safe Configuration**: Library definitions validated at compile time
3. **Automatic Discovery**: Auto-detect libraries from file structure
4. **Parallel CI/CD**: Build and validate all libraries concurrently
5. **Backward Compatibility**: Existing components continue working
6. **Zero Configuration**: Sensible defaults with optional overrides

## Architecture

### Directory Structure

```
blogflow/
├── src/
│   └── libraries/
│       ├── index.ts                    # Registry exports and type definitions
│       ├── registry.config.ts          # Library configurations
│       │
│       ├── core/                       # Core library (auth, posts, navigation)
│       │   ├── components/
│       │   │   ├── LoginForm.tsx
│       │   │   ├── LoginForm.webflow.tsx
│       │   │   ├── PostEditor.tsx
│       │   │   ├── PostEditor.webflow.tsx
│       │   │   └── Navigation.webflow.tsx
│       │   └── config.ts               # Optional per-library config overrides
│       │
│       ├── analytics/                  # Analytics library (charts, metrics)
│       │   ├── components/
│       │   │   ├── ChartTest.tsx
│       │   │   ├── ChartTest.webflow.tsx
│       │   │   ├── MetricsPanel.webflow.tsx
│       │   │   └── dashboard/         # Nested folders supported
│       │   │       └── ActivityGraph.webflow.tsx
│       │   └── config.ts
│       │
│       └── interactive/                # Interactive 3D library (Three.js)
│           ├── components/
│           │   ├── Lanyard.webflow.tsx
│           │   └── 3d-models/
│           │       └── ProductViewer.webflow.tsx
│           └── config.ts
│
├── .github/
│   └── workflows/
│       ├── webflow-build-all.yml       # Build all libraries in parallel
│       ├── webflow-deploy-all.yml      # Deploy all libraries
│       └── webflow-pr-check.yml        # Modified to check all libraries
│
├── scripts/
│   ├── generate-manifests.ts           # Auto-generate webflow.json per library
│   ├── build-library.ts                # Build a single library
│   └── build-all-libraries.ts          # Orchestrate parallel builds
│
└── dist/                               # Build output
    ├── core/                           # Each library gets own dist folder
    │   └── Client/
    ├── analytics/
    │   └── Client/
    └── interactive/
        └── Client/
```

### Type-Safe Library Configuration

#### `src/libraries/registry.config.ts`

```typescript
import { defineLibraries } from './types';

export const libraries = defineLibraries({
  core: {
    name: 'BlogFlow Core',
    description: 'Core authentication, posts, and navigation components',
    id: 'blogflow-core',

    // Component discovery pattern
    components: './src/libraries/core/**/*.webflow.@(ts|tsx)',

    // Bundle configuration
    bundleConfig: './webpack.webflow.js', // Can specify per-library webpack config

    // Size limits
    bundleSizeLimit: 15, // MB

    // Dependencies that should be external/shared
    externals: [
      '@webflow/react',
      '@webflow/data-types',
    ],

    // Environment variables exposed to this library
    env: {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    },

    // Optional: deployment configuration
    deploy: {
      enabled: true,
      workspaceToken: process.env.WEBFLOW_WORKSPACE_API_TOKEN,
    },
  },

  analytics: {
    name: 'BlogFlow Analytics',
    description: 'Charts, metrics, and data visualization components',
    id: 'blogflow-analytics',
    components: './src/libraries/analytics/**/*.webflow.@(ts|tsx)',
    bundleConfig: './webpack.webflow.js',
    bundleSizeLimit: 10, // Smaller limit for focused library

    // This library has heavy dependencies
    dependencies: ['recharts'],

    deploy: {
      enabled: true,
      workspaceToken: process.env.WEBFLOW_WORKSPACE_API_TOKEN,
    },
  },

  interactive: {
    name: 'BlogFlow Interactive 3D',
    description: '3D models and interactive experiences',
    id: 'blogflow-interactive',
    components: './src/libraries/interactive/**/*.webflow.@(ts|tsx)',
    bundleConfig: './webpack.webflow.js',
    bundleSizeLimit: 25, // Larger limit for Three.js

    dependencies: [
      '@react-three/fiber',
      '@react-three/drei',
      '@react-three/rapier',
      'three',
    ],

    deploy: {
      enabled: false, // Optional library, not auto-deployed
    },
  },
});

// Export type for use in scripts
export type LibraryRegistry = typeof libraries;
export type LibraryKey = keyof LibraryRegistry;
```

#### `src/libraries/types.ts`

```typescript
export interface LibraryConfig {
  /** Human-readable library name */
  name: string;

  /** Description shown in Webflow */
  description: string;

  /** Unique identifier for the library */
  id: string;

  /** Glob pattern(s) for component discovery */
  components: string | string[];

  /** Path to webpack bundle configuration */
  bundleConfig?: string;

  /** Bundle size limit in MB */
  bundleSizeLimit?: number;

  /** External dependencies (not bundled) */
  externals?: string[];

  /** Main dependencies that affect bundle size */
  dependencies?: string[];

  /** Environment variables exposed to components */
  env?: Record<string, string | undefined>;

  /** Deployment configuration */
  deploy?: {
    enabled: boolean;
    workspaceToken?: string;
  };
}

export type LibraryRegistry = Record<string, LibraryConfig>;

/**
 * Type-safe library definition helper
 * Provides autocomplete and validation
 */
export function defineLibraries<T extends LibraryRegistry>(
  config: T
): T {
  return config;
}

/**
 * Validate library configuration
 * Called at build time to ensure correctness
 */
export function validateLibraryConfig(
  config: LibraryConfig
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.name) errors.push('Library name is required');
  if (!config.id) errors.push('Library ID is required');
  if (!config.components) errors.push('Component patterns are required');

  if (config.bundleSizeLimit && config.bundleSizeLimit <= 0) {
    errors.push('Bundle size limit must be positive');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
```

#### `src/libraries/index.ts`

```typescript
import { libraries, type LibraryRegistry, type LibraryKey } from './registry.config';

export { libraries };
export type { LibraryRegistry, LibraryKey };

/**
 * Get library configuration by key
 */
export function getLibrary(key: LibraryKey) {
  return libraries[key];
}

/**
 * Get all library keys
 */
export function getLibraryKeys(): LibraryKey[] {
  return Object.keys(libraries) as LibraryKey[];
}

/**
 * Get all enabled libraries for deployment
 */
export function getDeployableLibraries() {
  return getLibraryKeys().filter(
    (key) => libraries[key].deploy?.enabled !== false
  );
}

/**
 * Generate webflow.json manifest for a library
 */
export function generateManifest(key: LibraryKey) {
  const lib = libraries[key];

  return {
    library: {
      name: lib.id,
      components: Array.isArray(lib.components)
        ? lib.components
        : [lib.components],
      bundleConfig: lib.bundleConfig || './webpack.webflow.js',
      description: lib.description,
      id: lib.id,
    },
    telemetry: {
      global: {
        allowTelemetry: true,
      },
    },
  };
}
```

### Build Scripts

#### `scripts/generate-manifests.ts`

```typescript
#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';
import { libraries, getLibraryKeys, generateManifest } from '../src/libraries';

/**
 * Generate webflow.json manifest files for all libraries
 * Each library gets its own manifest in its directory
 */
function generateManifests() {
  const libraryKeys = getLibraryKeys();

  console.log(`📦 Generating manifests for ${libraryKeys.length} libraries...\n`);

  for (const key of libraryKeys) {
    const lib = libraries[key];
    const manifest = generateManifest(key);

    // Write manifest to library directory
    const manifestPath = path.join(
      process.cwd(),
      'src',
      'libraries',
      key,
      'webflow.json'
    );

    fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
    fs.writeFileSync(
      manifestPath,
      JSON.stringify(manifest, null, 2),
      'utf-8'
    );

    console.log(`✅ ${key}: ${manifestPath}`);
  }

  console.log('\n✨ Manifest generation complete!');
}

generateManifests();
```

#### `scripts/build-library.ts`

```typescript
#!/usr/bin/env tsx

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { libraries, type LibraryKey } from '../src/libraries';

interface BuildOptions {
  library: LibraryKey;
  dev?: boolean;
  publicPath?: string;
}

/**
 * Build a single library using Webflow CLI
 */
function buildLibrary({ library, dev = false, publicPath }: BuildOptions) {
  const lib = libraries[library];
  const manifestPath = path.join(
    process.cwd(),
    'src',
    'libraries',
    library,
    'webflow.json'
  );

  // Ensure manifest exists
  if (!fs.existsSync(manifestPath)) {
    throw new Error(
      `Manifest not found for library "${library}". Run generate-manifests first.`
    );
  }

  console.log(`📦 Building library: ${lib.name} (${library})`);

  // Set environment variables for this library
  const envVars = Object.entries(lib.env || {})
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ');

  // Build command
  const devFlag = dev ? '--dev' : '';
  const publicPathFlag = publicPath ? `--public-path ${publicPath}` : '';

  const command = [
    envVars,
    'npx webflow library bundle',
    `--config ${manifestPath}`,
    `--output dist/${library}`,
    devFlag,
    publicPathFlag,
  ]
    .filter(Boolean)
    .join(' ');

  try {
    execSync(command, {
      stdio: 'inherit',
      cwd: process.cwd(),
    });

    console.log(`✅ Built: ${lib.name}`);

    // Check bundle size
    checkBundleSize(library);

  } catch (error) {
    console.error(`❌ Failed to build ${lib.name}`);
    throw error;
  }
}

/**
 * Check if bundle size is within limit
 */
function checkBundleSize(library: LibraryKey) {
  const lib = libraries[library];
  const distPath = path.join(process.cwd(), 'dist', library);

  if (!fs.existsSync(distPath)) {
    console.warn(`⚠️  No dist folder found for ${library}`);
    return;
  }

  // Calculate size
  const sizeKB = execSync(`du -sk ${distPath} | cut -f1`, {
    encoding: 'utf-8',
  }).trim();

  const sizeMB = parseFloat(sizeKB) / 1024;
  const limit = lib.bundleSizeLimit || 15;

  console.log(`\n📊 Bundle Size Check: ${lib.name}`);
  console.log(`   Size: ${sizeMB.toFixed(2)}MB`);
  console.log(`   Limit: ${limit}MB`);

  if (sizeMB > limit) {
    const overBy = sizeMB - limit;
    console.error(`\n❌ BUNDLE SIZE EXCEEDED by ${overBy.toFixed(2)}MB!`);
    process.exit(1);
  } else {
    const remaining = limit - sizeMB;
    console.log(`   ✅ Within limit (${remaining.toFixed(2)}MB remaining)\n`);
  }
}

// CLI usage
const libraryArg = process.argv[2] as LibraryKey;
if (!libraryArg || !libraries[libraryArg]) {
  console.error(`Usage: tsx scripts/build-library.ts <library-key>`);
  console.error(`Available libraries: ${Object.keys(libraries).join(', ')}`);
  process.exit(1);
}

buildLibrary({ library: libraryArg });
```

#### `scripts/build-all-libraries.ts`

```typescript
#!/usr/bin/env tsx

import { spawn } from 'child_process';
import { getLibraryKeys, libraries } from '../src/libraries';

/**
 * Build all libraries in parallel
 */
async function buildAllLibraries() {
  const libraryKeys = getLibraryKeys();

  console.log(`🚀 Building ${libraryKeys.length} libraries in parallel...\n`);

  // Create promises for parallel builds
  const buildPromises = libraryKeys.map((key) => {
    return new Promise<{ key: string; success: boolean }>((resolve) => {
      const lib = libraries[key];
      console.log(`📦 Starting build: ${lib.name} (${key})`);

      const child = spawn('tsx', ['scripts/build-library.ts', key], {
        stdio: 'inherit',
      });

      child.on('close', (code) => {
        if (code === 0) {
          console.log(`✅ ${lib.name} build complete\n`);
          resolve({ key, success: true });
        } else {
          console.error(`❌ ${lib.name} build failed\n`);
          resolve({ key, success: false });
        }
      });
    });
  });

  // Wait for all builds
  const results = await Promise.all(buildPromises);

  // Summary
  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log('\n' + '='.repeat(50));
  console.log(`📊 Build Summary`);
  console.log('='.repeat(50));
  console.log(`✅ Successful: ${successful.length}/${results.length}`);

  if (failed.length > 0) {
    console.log(`❌ Failed: ${failed.length}`);
    failed.forEach((f) => console.log(`   - ${libraries[f.key as any].name}`));
    process.exit(1);
  } else {
    console.log('\n✨ All libraries built successfully!');
  }
}

buildAllLibraries();
```

### CI/CD Workflows

#### `.github/workflows/webflow-build-all.yml`

```yaml
name: Build All Webflow Libraries

on:
  pull_request:
    branches:
      - main
    paths:
      - 'src/libraries/**/*.tsx'
      - 'src/libraries/**/*.ts'
      - 'components/**/*.tsx'
      - 'package.json'
      - 'pnpm-lock.yaml'
      - 'webpack.webflow.js'
      - 'scripts/**/*.ts'

  push:
    branches-ignore:
      - main
    paths:
      - 'src/libraries/**/*.tsx'
      - 'src/libraries/**/*.ts'
      - 'components/**/*.tsx'
      - 'package.json'
      - 'pnpm-lock.yaml'
      - 'webpack.webflow.js'
      - 'scripts/**/*.ts'

jobs:
  # Generate library manifests
  generate-manifests:
    name: Generate Library Manifests
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: latest

      - name: Install dependencies
        run: pnpm install

      - name: Generate manifests
        run: tsx scripts/generate-manifests.ts

      - name: Upload manifests artifact
        uses: actions/upload-artifact@v4
        with:
          name: library-manifests
          path: src/libraries/**/webflow.json

  # Detect which libraries exist
  detect-libraries:
    name: Detect Libraries
    runs-on: ubuntu-latest
    outputs:
      matrix: ${{ steps.set-matrix.outputs.matrix }}

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: latest

      - name: Install dependencies
        run: pnpm install

      - name: Detect libraries
        id: set-matrix
        run: |
          # Use TypeScript to read registry and output JSON
          LIBRARIES=$(tsx -e "
            import { getLibraryKeys, libraries } from './src/libraries/index.js';
            const keys = getLibraryKeys();
            const matrix = keys.map(key => ({
              key,
              name: libraries[key].name,
              sizeLimit: libraries[key].bundleSizeLimit || 15
            }));
            console.log(JSON.stringify({ library: matrix }));
          ")
          echo "matrix=$LIBRARIES" >> $GITHUB_OUTPUT

  # Build each library in parallel
  build-library:
    name: Build ${{ matrix.library.name }}
    runs-on: ubuntu-latest
    needs: [generate-manifests, detect-libraries]

    strategy:
      matrix: ${{ fromJson(needs.detect-libraries.outputs.matrix) }}
      fail-fast: false # Continue building other libraries even if one fails

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: latest

      - name: Install dependencies
        run: pnpm install

      - name: Download manifests
        uses: actions/download-artifact@v4
        with:
          name: library-manifests
          path: src/libraries/

      - name: Build library
        run: tsx scripts/build-library.ts ${{ matrix.library.key }}

      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: dist-${{ matrix.library.key }}
          path: dist/${{ matrix.library.key }}/

  # Summary job
  build-summary:
    name: Build Summary
    runs-on: ubuntu-latest
    needs: build-library
    if: always()

    steps:
      - name: Check build status
        run: |
          if [ "${{ needs.build-library.result }}" = "failure" ]; then
            echo "❌ Some library builds failed"
            exit 1
          else
            echo "✅ All libraries built successfully!"
          fi
```

#### `.github/workflows/webflow-deploy-all.yml`

```yaml
name: Deploy All Webflow Libraries

on:
  push:
    branches:
      - main
    paths:
      - 'src/libraries/**/*.tsx'
      - 'src/libraries/**/*.ts'

  workflow_dispatch: # Manual trigger

jobs:
  detect-libraries:
    name: Detect Deployable Libraries
    runs-on: ubuntu-latest
    outputs:
      matrix: ${{ steps.set-matrix.outputs.matrix }}

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: latest

      - name: Install dependencies
        run: pnpm install

      - name: Detect deployable libraries
        id: set-matrix
        run: |
          LIBRARIES=$(tsx -e "
            import { getDeployableLibraries, libraries } from './src/libraries/index.js';
            const keys = getDeployableLibraries();
            const matrix = keys.map(key => ({
              key,
              name: libraries[key].name
            }));
            console.log(JSON.stringify({ library: matrix }));
          ")
          echo "matrix=$LIBRARIES" >> $GITHUB_OUTPUT

  deploy-library:
    name: Deploy ${{ matrix.library.name }}
    runs-on: ubuntu-latest
    needs: detect-libraries

    strategy:
      matrix: ${{ fromJson(needs.detect-libraries.outputs.matrix) }}
      max-parallel: 3 # Limit concurrent deployments

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: latest

      - name: Install dependencies
        run: pnpm install

      - name: Generate manifest
        run: tsx scripts/generate-manifests.ts

      - name: Deploy to Webflow
        env:
          WEBFLOW_WORKSPACE_API_TOKEN: ${{ secrets.WEBFLOW_WORKSPACE_API_TOKEN }}
        run: |
          npx webflow library share \
            --config src/libraries/${{ matrix.library.key }}/webflow.json \
            --no-input

      - name: Deployment complete
        run: echo "✅ Deployed ${{ matrix.library.name }} to Webflow"
```

## Migration Path

### Phase 1: Setup (Week 1)

1. **Create directory structure**
   ```bash
   mkdir -p src/libraries/{core,analytics,interactive}/components
   ```

2. **Move existing components to `core` library**
   ```bash
   mv src/components/*.webflow.tsx src/libraries/core/components/
   ```

3. **Create registry configuration**
   - Define `src/libraries/registry.config.ts`
   - Define `src/libraries/types.ts`
   - Define `src/libraries/index.ts`

4. **Create build scripts**
   - `scripts/generate-manifests.ts`
   - `scripts/build-library.ts`
   - `scripts/build-all-libraries.ts`

### Phase 2: Testing (Week 2)

1. **Test manifest generation**
   ```bash
   tsx scripts/generate-manifests.ts
   ```

2. **Test single library build**
   ```bash
   tsx scripts/build-library.ts core
   ```

3. **Test parallel builds**
   ```bash
   tsx scripts/build-all-libraries.ts
   ```

4. **Verify bundle sizes**

### Phase 3: CI/CD Integration (Week 2)

1. **Update PR workflow** to use new build system
2. **Create deployment workflow** for all libraries
3. **Test in PR** to ensure everything works

### Phase 4: Component Migration (Week 3)

1. **Move Chart components** to `analytics` library
2. **Move Lanyard** to `interactive` library
3. **Update test pages** to reference new locations
4. **Deploy all libraries** to Webflow

## Advanced Features (Future)

### Shared Dependencies Optimization

```typescript
// webpack.webflow.shared.js
module.exports = {
  // Shared externals across all libraries
  externals: {
    'react': 'React',
    'react-dom': 'ReactDOM',
    '@webflow/react': 'WebflowReact',
  },

  // Cache groups for common chunks
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
};
```

### Cross-Library Dependencies

```typescript
// src/libraries/analytics/config.ts
export default {
  // This library depends on core utilities
  dependencies: {
    internal: ['core'], // References @libraries/core
    external: ['recharts'],
  },
};
```

### Dynamic Library Loading

```typescript
// Future: Load libraries on-demand
const analyticsLib = await import('@libraries/analytics');
```

### Library Versioning

```typescript
export const libraries = defineLibraries({
  core: {
    name: 'BlogFlow Core',
    version: '1.0.0', // Semantic versioning
    // ...
  },
});
```

## Benefits

1. **Bundle Size Management**: Each library stays under its limit
2. **Faster Builds**: Parallel processing reduces CI time
3. **Selective Deployment**: Deploy only what changed
4. **Better Organization**: Components grouped by purpose
5. **Type Safety**: Configuration errors caught at compile time
6. **Scalability**: Easy to add new libraries as project grows
7. **Team Collaboration**: Different teams can own different libraries

## Trade-offs

1. **Complexity**: More moving parts to maintain
2. **Build Time**: Multiple bundles take longer than one (but parallelized)
3. **Duplication**: Some code may be duplicated across libraries
4. **Learning Curve**: Developers need to understand library system

## Success Metrics

1. **Bundle Sizes**: All libraries stay under their limits
2. **Build Time**: Total CI time reduces with parallelization
3. **Deployment Frequency**: Can deploy libraries independently
4. **Developer Experience**: Time to add new component reduces
5. **Code Organization**: Components logically grouped

## Appendix: Example Commands

```bash
# Generate all manifests
pnpm tsx scripts/generate-manifests.ts

# Build single library
pnpm tsx scripts/build-library.ts core

# Build all libraries in parallel
pnpm tsx scripts/build-all-libraries.ts

# Deploy single library
WEBFLOW_WORKSPACE_API_TOKEN=xxx npx webflow library share \
  --config src/libraries/core/webflow.json

# Check library sizes
du -sh dist/*/
```

## Appendix: Type Definitions

```typescript
// Complete type system for library registry

export interface WebflowManifest {
  library: {
    name: string;
    components: string[];
    bundleConfig: string;
    description: string;
    id: string;
  };
  telemetry?: {
    global: {
      allowTelemetry: boolean;
      lastPrompted?: number;
      version?: string;
    };
  };
}

export interface BuildResult {
  library: string;
  success: boolean;
  bundleSize: number; // in MB
  buildTime: number; // in seconds
  errors?: string[];
}

export interface DeployResult {
  library: string;
  success: boolean;
  url?: string;
  errors?: string[];
}
```
