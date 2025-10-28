# Next Steps: Parallelize Multi-Library CI/CD Builds

## Current State

### What's Working ✅
- **Multi-library system** fully implemented and tested
  - 3 libraries: `core` (12MB), `analytics`, `interactive`
  - Each library self-contained with `src/libraries/{key}/index.ts` config
  - Auto-inferred component patterns: `./src/libraries/{key}/**/*.webflow.@(ts|tsx)`
  - Type-safe registry with validation

- **Build scripts** operational
  - `pnpm library:manifests` - generates webflow.json per library
  - `pnpm library:build <key>` - builds single library with size validation
  - `pnpm library:build:all` - builds all libraries in parallel (local only)

- **PR workflow** validates builds
  - `.github/workflows/webflow-pr-check.yml`
  - Triggers on changes to `src/libraries/**/*.tsx`, `package.json`, `pnpm-lock.yaml`
  - **Problem**: Builds all libraries **sequentially** (~6min total)
  - Uses global `WEBFLOW_BUNDLE_SIZE_LIMIT_MB` secret (default 15MB)

### What's Missing 🚧
- **Parallel builds in CI/CD** - currently sequential, should use GitHub Actions matrix
- **Auto-deployment on merge to main** - no deployment workflow exists yet
- **Selective building** - currently builds all libraries even if only one changed

## Goal

Implement **parallel library builds** in GitHub Actions to reduce CI time from ~6min to ~2min.

## Architecture Overview

### Registry System
```typescript
// src/libraries/registry.config.ts
import { coreLibrary } from "./core";
import { analyticsLibrary } from "./analytics";
import { interactiveLibrary } from "./interactive";

export const libraries = defineLibraries({
  core: coreLibrary,
  analytics: analyticsLibrary,
  interactive: interactiveLibrary,
});

export type LibraryKey = keyof typeof libraries;
```

### Helper Functions (Already Exist)
```typescript
// src/libraries/index.ts
export function getLibraryKeys(): LibraryKey[];
export function getDeployableLibraries(): LibraryKey[];
export function generateManifest(key: LibraryKey): WebflowManifest;
```

### Library Config Example
```typescript
// src/libraries/core/index.ts
export const coreLibrary: LibraryConfig = {
  name: "BlogFlow Core",
  description: "Core authentication, posts, and navigation components",
  id: "blogflow-core",
  env: { NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL },
  deploy: { enabled: true, workspaceToken: process.env.WEBFLOW_WORKSPACE_API_TOKEN },
};
```

## Implementation Steps

### Phase 1: Create Library Detection Script

**File**: `scripts/list-libraries.ts`

**Purpose**: Output library metadata as JSON for GitHub Actions matrix

**Implementation**:
```typescript
#!/usr/bin/env tsx

import { getLibraryKeys, libraries } from "../src/libraries/index.js";

/**
 * Output library metadata for GitHub Actions matrix
 * Usage: tsx scripts/list-libraries.ts
 * Output: { "libraries": [{ "key": "core", "name": "BlogFlow Core" }, ...] }
 */
function listLibraries() {
  const keys = getLibraryKeys();

  const librariesMatrix = keys.map((key) => ({
    key,
    name: libraries[key].name,
    id: libraries[key].id,
  }));

  // Output as JSON for GitHub Actions
  console.log(JSON.stringify({ libraries: librariesMatrix }));
}

listLibraries();
```

**Add to package.json**:
```json
{
  "scripts": {
    "library:list": "tsx scripts/list-libraries.ts"
  }
}
```

**Test locally**:
```bash
pnpm library:list
# Expected output: {"libraries":[{"key":"core","name":"BlogFlow Core","id":"blogflow-core"},...]}
```

### Phase 2: Update PR Workflow for Parallel Builds

**File**: `.github/workflows/webflow-pr-check.yml`

**Current flow**:
```
Setup → Install → Build ALL libraries sequentially → Done
```

**Target flow**:
```
Setup → Install → Detect libraries
                      ↓
            ┌─────────┴─────────┬─────────┐
            ▼                   ▼         ▼
      Build core         Build analytics  Build interactive
      (parallel)         (parallel)       (parallel)
            └─────────┬─────────┴─────────┘
                      ▼
              Summary (all passed?)
```

**Implementation**:

Replace current single-job workflow with multi-job matrix:

```yaml
name: Webflow Multi-Library PR Check

on:
  pull_request:
    branches: [main]
    paths:
      - 'src/libraries/**/*.tsx'
      - 'src/libraries/**/*.ts'
      - 'components/**/*.tsx'
      - 'package.json'
      - 'pnpm-lock.yaml'
      - 'webpack.webflow.js'

  push:
    branches-ignore: [main]
    paths:
      - 'src/libraries/**/*.tsx'
      - 'src/libraries/**/*.ts'
      - 'components/**/*.tsx'
      - 'package.json'
      - 'pnpm-lock.yaml'
      - 'webpack.webflow.js'

jobs:
  # Job 1: Detect which libraries exist
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
        run: pnpm install --frozen-lockfile

      - name: Detect libraries
        id: set-matrix
        run: |
          MATRIX=$(pnpm library:list)
          echo "matrix=$MATRIX" >> $GITHUB_OUTPUT
          echo "Detected libraries:"
          echo "$MATRIX" | jq '.'

  # Job 2: Build each library in parallel
  build-library:
    name: Build ${{ matrix.library.name }}
    runs-on: ubuntu-latest
    needs: detect-libraries

    strategy:
      matrix: ${{ fromJson(needs.detect-libraries.outputs.matrix) }}
      fail-fast: false  # Continue building other libs even if one fails

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

      - name: Setup pnpm cache
        uses: actions/cache@v4
        with:
          path: ~/.pnpm-store
          key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            ${{ runner.os }}-pnpm-

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Generate manifests
        run: pnpm library:manifests

      - name: Build library
        env:
          WEBFLOW_BUNDLE_SIZE_LIMIT_MB: ${{ secrets.WEBFLOW_BUNDLE_SIZE_LIMIT_MB || '15' }}
        run: |
          echo "Building ${{ matrix.library.name }} (${{ matrix.library.key }})"
          pnpm library:build ${{ matrix.library.key }}

      - name: Upload build artifact
        if: success()
        uses: actions/upload-artifact@v4
        with:
          name: dist-${{ matrix.library.key }}
          path: dist/${{ matrix.library.key }}/
          retention-days: 1

  # Job 3: Summary of all builds
  build-summary:
    name: Build Summary
    runs-on: ubuntu-latest
    needs: build-library
    if: always()

    steps:
      - name: Check build status
        run: |
          if [ "${{ needs.build-library.result }}" = "failure" ] || \
             [ "${{ needs.build-library.result }}" = "cancelled" ]; then
            echo "❌ One or more library builds failed"
            exit 1
          else
            echo "✅ All libraries built successfully!"
          fi
```

**Key improvements**:
1. **Matrix strategy**: Each library builds in parallel
2. **fail-fast: false**: Don't cancel other builds if one fails
3. **Artifacts**: Upload bundles for inspection
4. **Summary job**: Single pass/fail status for PR

### Phase 3: Create Deployment Workflow

**File**: `.github/workflows/webflow-deploy-all.yml`

**Purpose**: Auto-deploy libraries when merging to main

**Implementation**:

```yaml
name: Deploy Webflow Libraries

on:
  push:
    branches: [main]
    paths:
      - 'src/libraries/**/*.tsx'
      - 'src/libraries/**/*.ts'
      - 'components/**/*.tsx'

  workflow_dispatch:  # Allow manual triggering

jobs:
  # Job 1: Detect deployable libraries (deploy.enabled: true)
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
        run: pnpm install --frozen-lockfile

      - name: Detect deployable libraries
        id: set-matrix
        run: |
          # Get only libraries with deploy.enabled: true
          MATRIX=$(tsx -e "
            import { getDeployableLibraries, libraries } from './src/libraries/index.js';
            const keys = getDeployableLibraries();
            const matrix = keys.map(key => ({
              key,
              name: libraries[key].name,
              id: libraries[key].id
            }));
            console.log(JSON.stringify({ libraries: matrix }));
          ")
          echo "matrix=$MATRIX" >> $GITHUB_OUTPUT
          echo "Deployable libraries:"
          echo "$MATRIX" | jq '.'

  # Job 2: Deploy each library in parallel
  deploy-library:
    name: Deploy ${{ matrix.library.name }}
    runs-on: ubuntu-latest
    needs: detect-libraries
    if: fromJson(needs.detect-libraries.outputs.matrix).libraries[0] != null

    strategy:
      matrix: ${{ fromJson(needs.detect-libraries.outputs.matrix) }}
      max-parallel: 3  # Limit concurrent deploys to avoid rate limits

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
        run: pnpm install --frozen-lockfile

      - name: Generate manifest
        run: pnpm library:manifests

      - name: Deploy to Webflow
        env:
          WEBFLOW_WORKSPACE_API_TOKEN: ${{ secrets.WEBFLOW_WORKSPACE_API_TOKEN }}
        run: |
          echo "Deploying ${{ matrix.library.name }} to Webflow..."
          npx webflow library share \
            --config src/libraries/${{ matrix.library.key }}/webflow.json \
            --no-input
          echo "✅ Deployed successfully!"

  # Job 3: Deployment summary
  deploy-summary:
    name: Deployment Summary
    runs-on: ubuntu-latest
    needs: deploy-library
    if: always()

    steps:
      - name: Check deployment status
        run: |
          if [ "${{ needs.deploy-library.result }}" = "failure" ]; then
            echo "❌ One or more deployments failed"
            exit 1
          elif [ "${{ needs.deploy-library.result }}" = "skipped" ]; then
            echo "⚠️  No deployable libraries found"
          else
            echo "✅ All libraries deployed successfully!"
          fi
```

**Key features**:
1. **Selective deployment**: Only libraries with `deploy.enabled: true`
2. **max-parallel: 3**: Avoid Webflow API rate limits
3. **Manual trigger**: Can deploy on-demand via workflow_dispatch

### Phase 4: Testing & Validation

**Test PR workflow**:
```bash
# 1. Create test branch
git checkout -b test/parallel-builds

# 2. Make a trivial change to trigger workflow
echo "// test" >> src/libraries/core/index.ts

# 3. Push and create PR
git add -A
git commit -m "test: trigger parallel builds"
git push -u origin test/parallel-builds

# 4. Create PR and observe:
#    - detect-libraries job completes first
#    - Multiple build-library jobs run simultaneously
#    - build-summary shows final status
```

**Verify parallel execution**:
- Check GitHub Actions → PR → workflow run
- Should see 3 jobs running simultaneously (core, analytics, interactive)
- Total time should be ~2min vs previous ~6min

**Test deployment workflow**:
```bash
# 1. Merge test PR to main
# 2. Observe workflow at: Actions → Deploy Webflow Libraries
# 3. Verify only enabled libraries deploy (core, analytics)
# 4. Verify interactive library is skipped (deploy.enabled: false)
```

## File Changes Summary

### New Files to Create
```
scripts/
└── list-libraries.ts          # NEW: Output libraries as JSON matrix

.github/workflows/
├── webflow-pr-check.yml       # REPLACE: Existing file with parallel version
└── webflow-deploy-all.yml     # NEW: Auto-deploy on merge to main
```

### Files to Modify
```
package.json                   # ADD: "library:list" script
```

### Files Already Exist (No Changes Needed)
```
src/libraries/
├── index.ts                   # Has getLibraryKeys(), getDeployableLibraries()
├── registry.config.ts         # Has library definitions
├── types.ts                   # Has LibraryConfig type
└── {core,analytics,interactive}/
    ├── index.ts              # Library configs
    └── components/           # Component files

scripts/
├── generate-manifests.ts     # Already works
├── build-library.ts          # Already has size validation
└── build-all-libraries.ts    # Parallel builds (local only)
```

## Expected Outcomes

### Before (Current)
```
PR Workflow:
- detect-libraries: N/A
- build-all: 6 minutes (sequential)
Total: ~6 minutes

Deployment:
- Manual via `pnpm webflow:share`
```

### After (With Parallel Builds)
```
PR Workflow:
- detect-libraries: 30 seconds
- build-library (core): 2 minutes     ┐
- build-library (analytics): 2 minutes├─ Parallel
- build-library (interactive): 2 minutes┘
Total: ~2.5 minutes (60% faster)

Deployment:
- Auto-deploy on merge to main
- Only enabled libraries
- Parallel (max 3 concurrent)
Total: ~1 minute
```

## Potential Issues & Solutions

### Issue 1: Matrix is Empty
**Symptom**: `detect-libraries` outputs `{"libraries":[]}`

**Solution**:
```bash
# Test locally first
pnpm library:list
# Should output: {"libraries":[{"key":"core",...},...]}

# If empty, check:
tsx -e "import { getLibraryKeys } from './src/libraries/index.js'; console.log(getLibraryKeys());"
```

### Issue 2: Build Fails with "Cannot find module"
**Symptom**: TypeScript import errors in workflow

**Solution**:
- Ensure `pnpm install --frozen-lockfile` completes successfully
- Check that manifest generation runs before build
- Verify .js extensions in imports (required for ESM)

### Issue 3: Deployment Rate Limited
**Symptom**: Some deployments fail with 429 errors

**Solution**:
- Already mitigated with `max-parallel: 3`
- If still issues, reduce to `max-parallel: 2`
- Add retry logic:
  ```yaml
  - uses: nick-fields/retry@v2
    with:
      timeout_minutes: 5
      max_attempts: 3
      command: npx webflow library share --config src/libraries/${{ matrix.library.key }}/webflow.json --no-input
  ```

### Issue 4: Build Artifacts Too Large
**Symptom**: Artifact upload fails or takes too long

**Solution**:
- Current retention: 1 day (already minimal)
- If needed, skip artifacts or only upload on failure:
  ```yaml
  - name: Upload build artifact
    if: failure()  # Only upload if build failed
  ```

## Success Criteria

✅ PR workflow completes in ~2.5 minutes (down from ~6 minutes)
✅ All 3 libraries build in parallel
✅ Bundle size validation enforces global limit per library
✅ Build failures don't cancel other builds (fail-fast: false)
✅ Deployment workflow auto-runs on merge to main
✅ Only enabled libraries deploy (core, analytics)
✅ Interactive library skipped (deploy.enabled: false)
✅ All workflows use existing scripts (no duplication)

## Additional Notes

### Why Not Detect Changed Libraries?
**Could optimize further**: Only build libraries that changed in PR

**Implementation**: Use GitHub Actions `paths-filter` to detect which libraries changed, then dynamically build matrix with only those libraries.

**Trade-off**:
- **Benefit**: Even faster CI (only build what changed)
- **Cost**: More complexity, harder to debug
- **Recommendation**: Implement parallel builds first, then optimize for changed libraries if needed

### Why max-parallel: 3 for Deployments?
Webflow API has rate limits. Deploying 3 libraries simultaneously is safe. More than that may trigger 429 errors.

### Why Upload Artifacts?
- Allows inspecting built bundles without running locally
- Useful for debugging size issues
- Can be downloaded from workflow run

## Reference Documentation

- **Multi-library spec**: `scratchpads/specs/multi-library-registry-system.md`
- **Library README**: `src/libraries/README.md`
- **Current workflow**: `.github/workflows/webflow-pr-check.yml`
- **Build scripts**: `scripts/build-library.ts`, `scripts/build-all-libraries.ts`

## Timeline Estimate

- **Phase 1** (list-libraries script): 15 minutes
- **Phase 2** (parallel PR workflow): 30 minutes
- **Phase 3** (deployment workflow): 30 minutes
- **Phase 4** (testing & debugging): 30 minutes

**Total**: ~2 hours for complete implementation

## Next Agent Instructions

1. **Start with Phase 1**: Create `scripts/list-libraries.ts` and test locally
2. **Then Phase 2**: Replace PR workflow with parallel version
3. **Test thoroughly**: Create test PR and verify parallel execution
4. **Then Phase 3**: Create deployment workflow
5. **Final test**: Merge to main and verify auto-deployment

**Key principle**: Test each phase before moving to the next. Don't implement all at once.
