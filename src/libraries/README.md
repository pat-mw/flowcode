# Webflow Code Libraries

A multi-library system for managing Webflow Code Components with independent bundling and deployment.

## Rationale

**Problem**: Single-bundle approach hits Webflow's 15MB limit when combining components with heavy dependencies (Three.js, recharts, lucide-react).

**Constraints**:
- Webflow enforces a ~15MB bundle size limit per library
- Components can't share code across bundles (each is isolated)
- All components in a bundle must be deployed together

**Solution**: Separate components into focused libraries, each staying under the size limit while enabling parallel builds and selective deployment.

## Solution

Components are organized into independent libraries by purpose:

| Library | Purpose | Key Components | Status |
|---------|---------|----------------|--------|
| **core** | Authentication, posts, navigation | LoginForm, RegistrationForm, PostEditor, Navigation, Dashboard | ✅ Deployed |
| **analytics** | Charts and metrics | ChartTest, PieChart, BarChart | ✅ Deployed |
| **interactive** | 3D models and experiences | Lanyard, RedSlider, BlueSlider | ✅ Deployed |
| **webcn** | Landing page components | Navbar, Hero, Features, Footer | ✅ Deployed |
| **waitlist** | Waitlist capture and admin | WaitlistCapture, WaitlistAdmin | ✅ Deployed |
| **registryDashboard** | Component registry viewer | LibraryViewer, ComponentGrid | ✅ Deployed |
| **blogDemo** | Blog demo components | PublicPostsList, ProfileEditor | ✅ Deployed |

Each library:
- Has its own bundle with independent size limit
- Can be built and deployed separately
- Groups related components with similar dependencies
- Automatically discovers components via folder structure

## Deployment Flow

```
┌─────────────────────────────────────────────────────────┐
│  Developer pushes code to PR                             │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  CI/CD detects changed libraries                         │
│  (via path filters in workflow)                          │
└────────┬─────────────┬─────────────┬────────────────────┘
         │             │             │
         ▼             ▼             ▼
    ┌────────┐    ┌──────────┐  ┌─────────────┐
    │  Core  │    │Analytics │  │ Interactive │
    │ Build  │    │  Build   │  │   Build     │
    └───┬────┘    └────┬─────┘  └──────┬──────┘
        │              │                │
        │ Parallel     │ Execution      │
        │              │                │
        ▼              ▼                ▼
    ┌────────┐    ┌──────────┐  ┌─────────────┐
    │ 12.0MB │    │  ~8.0MB  │  │   ~20.0MB   │
    │  ✅    │    │    ✅    │  │     ✅      │
    └───┬────┘    └────┬─────┘  └──────┬──────┘
        │              │                │
        └──────┬───────┴────────────────┘
               │
               ▼
    ┌─────────────────────────┐
    │  Size Check (per-lib)   │
    │  Limit: 15MB (env var)  │
    └────────┬────────────────┘
             │
             ▼
    ┌─────────────────────────┐
    │  Deploy to Webflow      │
    │  (only enabled libs)    │
    └─────────────────────────┘
```

## Folder Structure

```
src/libraries/
├── types.ts                    # Type definitions for LibraryConfig
├── registry.config.ts          # Central registry (imports all libraries)
├── index.ts                    # Exports registry + helper functions
│
├── core/
│   ├── index.ts               # exports coreLibrary: LibraryConfig
│   ├── components/
│   │   ├── LoginForm.webflow.tsx
│   │   ├── PostEditor.webflow.tsx
│   │   └── Navigation.webflow.tsx
│   └── webflow.json           # Auto-generated manifest
│
├── analytics/
│   ├── index.ts               # exports analyticsLibrary: LibraryConfig
│   ├── components/
│   │   └── ChartTest.webflow.tsx
│   └── webflow.json           # Auto-generated manifest
│
└── interactive/
    ├── index.ts               # exports interactiveLibrary: LibraryConfig
    ├── components/
    │   └── Lanyard.webflow.tsx
    └── webflow.json           # Auto-generated manifest
```

### Convention Over Configuration

Libraries follow automatic conventions:
- **Component Pattern**: `./src/libraries/{key}/**/*.webflow.@(ts|tsx)`
- **Bundle Config**: `./webpack.webflow.js` (shared)
- **Size Limit**: `WEBFLOW_BUNDLE_SIZE_LIMIT_MB` env var (default 15MB)

Override only when needed by adding explicit fields to library config.

## Usage

### Developer Workflow (Automated by Default)

**Normal workflow - everything happens automatically:**

1. **Add/modify components** in `src/libraries/{library}/components/*.webflow.tsx`
2. **Push to PR** - CI/CD automatically:
   - Generates manifests
   - Builds all libraries
   - Validates bundle sizes
   - Reports status in PR checks
3. **Merge to main** - CI/CD automatically:
   - Deploys all enabled libraries to Webflow
   - No manual intervention needed

**You don't need to run build commands manually.** CI/CD handles everything.

### Adding a New Library

1. **Create library folder and config**:
```bash
mkdir -p src/libraries/my-library/components
```

2. **Define library config** in `src/libraries/my-library/index.ts`:
```typescript
import type { LibraryConfig } from "../types";

export const myLibrary: LibraryConfig = {
  name: "My Library",
  description: "What it does",
  id: "blogflow-my-library",

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  deploy: {
    enabled: true,  // Auto-deploy on merge to main
    workspaceToken: process.env.WEBFLOW_WORKSPACE_API_TOKEN,
  },
};
```

3. **Import in registry** (`src/libraries/registry.config.ts`):
```typescript
import { myLibrary } from "./my-library";

export const libraries = defineLibraries({
  core: coreLibrary,
  analytics: analyticsLibrary,
  interactive: interactiveLibrary,
  myLibrary: myLibrary, // Add here
});
```

4. **Add components** to `src/libraries/my-library/components/*.webflow.tsx`
5. **Push to PR** - CI/CD takes over from here

### Manual Commands (Local Testing Only)

Use these **only for local development/debugging**. CI/CD runs them automatically.

```bash
# Test manifest generation locally
pnpm library:manifests

# Test building a specific library locally
pnpm library:build core

# Test building all libraries locally
pnpm library:build:all

# Test with custom size limit locally
WEBFLOW_BUNDLE_SIZE_LIMIT_MB=20 pnpm library:build core

# Manual deployment (emergency only - prefer CI/CD)
npx webflow library share --config src/libraries/core/webflow.json
```

**When to use manual commands:**
- Testing new library setup before pushing
- Debugging build issues locally
- Verifying bundle size before creating PR
- Emergency hotfixes (rare)

## Automation (CI/CD)

All building and deployment happens automatically via GitHub Actions. **You don't need to run commands manually.**

### What Happens Automatically

**On every PR commit:**
1. **Workflow triggers** when you change:
   - `src/libraries/**/*.tsx` (any library component)
   - `package.json` or `pnpm-lock.yaml` (dependencies)

2. **Build & Validation** (`.github/workflows/webflow-pr-check.yml`):
   - Installs dependencies
   - Generates manifests for all libraries
   - Builds all libraries (currently sequential, parallel coming soon)
   - Validates each bundle against `WEBFLOW_BUNDLE_SIZE_LIMIT_MB` (default 15MB)
   - ✅ **PR check passes** if all libraries build successfully and stay under limit
   - ❌ **PR check fails** if any library exceeds size limit

**On merge to main:**
- **Auto-Deployment** (`.github/workflows/webflow-deploy-all.yml`):
  - Detects which libraries have `deploy.enabled: true`
  - Deploys all enabled libraries to Webflow
  - Runs in parallel (up to 3 concurrent deployments) for faster delivery

### Current Status

✅ **Working Now:**
- Automatic PR validation
- Bundle size enforcement
- Build error detection
- Automatic deployment on merge to main
- Parallel library deployments (up to 3 concurrent)

🚧 **Future Improvements:**
- Per-library change detection (build only what changed)
- Smarter deployment (only deploy changed libraries)

### Configuration

**Set bundle size limit** (one-time setup):

1. Go to Repository Settings → Secrets and variables → Actions
2. Add new repository secret:
   - **Name**: `WEBFLOW_BUNDLE_SIZE_LIMIT_MB`
   - **Value**: `15` (or your preferred limit in MB)
3. Save

Both local testing and CI/CD use this single source of truth.

**Set Webflow deployment token** (for auto-deploy):

Add secret: `WEBFLOW_WORKSPACE_API_TOKEN` with your workspace token from Webflow.

### Future: Parallel Multi-Library Builds

When implemented, this workflow will:

```yaml
# .github/workflows/webflow-build-all.yml
jobs:
  detect-libraries:
    # Auto-detect all libraries from registry
    # Outputs: [{ key: "core" }, { key: "analytics" }, ...]

  build-library:
    needs: detect-libraries
    strategy:
      matrix: ${{ fromJson(needs.detect-libraries.outputs.libraries) }}
      fail-fast: false  # Continue even if one fails

    steps:
      - run: pnpm library:build ${{ matrix.library.key }}
      # Each library builds in parallel
      # Size validation included in build script
```

This reduces build time from ~6min (sequential) to ~2min (parallel) for 3 libraries.

## Benefits

✅ **Fully Automated**: CI/CD handles builds, validation, and deployment - zero manual steps
✅ **Stay Under Limits**: Each library independently manages its bundle size
✅ **Parallel Builds**: Build multiple libraries concurrently for faster CI (coming soon)
✅ **Selective Deployment**: Deploy only changed libraries automatically
✅ **Better Organization**: Group related components by purpose
✅ **Type Safety**: Compile-time validation of library configs
✅ **Convention Over Configuration**: Minimal boilerplate, auto-inferred patterns
✅ **Easy to Scale**: Adding new libraries is self-contained
✅ **Developer Friendly**: Write components → push → everything else happens automatically