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

| Library | Purpose | Components | Status |
|---------|---------|------------|--------|
| **core** | Authentication, posts, navigation | LoginForm, PostEditor, Navigation, Dashboard | ✅ 12MB / 15MB |
| **analytics** | Charts and metrics | ChartTest (~2.2MB with recharts) | 🟡 Enabled |
| **interactive** | 3D models and experiences | Lanyard (~13MB with Three.js) | ⚪ Optional |

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
    enabled: true,
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

### Building Libraries

```bash
# Generate manifests for all libraries
pnpm library:manifests

# Build a specific library
pnpm library:build core

# Build all libraries in parallel
pnpm library:build:all

# Build with custom size limit
WEBFLOW_BUNDLE_SIZE_LIMIT_MB=20 pnpm library:build core
```

### Deployment

```bash
# Deploy single library (requires WEBFLOW_WORKSPACE_API_TOKEN)
npx webflow library share --config src/libraries/core/webflow.json

# Deploy all enabled libraries (via CI/CD)
# Automatically handled by GitHub Actions on main branch
```

## Automation (CI/CD)

### Current Implementation

**PR Checks** (`.github/workflows/webflow-pr-check.yml`):
- Triggers on changes to `src/libraries/**/*.tsx`, `package.json`, `pnpm-lock.yaml`
- Builds **all libraries** sequentially (not parallel yet)
- Validates bundle size against `WEBFLOW_BUNDLE_SIZE_LIMIT_MB` secret (default 15MB)
- Fails PR if any library exceeds limit

### Future Enhancement (TODO)

**Parallel Multi-Library Builds**:
```yaml
# .github/workflows/webflow-build-all.yml
jobs:
  detect-libraries:
    # Auto-detect libraries from registry via tsx script
    # Output matrix: [{ key: "core", name: "BlogFlow Core" }, ...]

  build-library:
    strategy:
      matrix: ${{ fromJson(needs.detect-libraries.outputs.matrix) }}
      fail-fast: false  # Continue building other libs if one fails

    steps:
      - run: pnpm library:build ${{ matrix.library.key }}
      # Size check happens in build script
```

**Selective Deployment**:
```yaml
# .github/workflows/webflow-deploy-all.yml
jobs:
  deploy-library:
    # Only deploy libraries with deploy.enabled: true
    # Run in parallel (max 3 concurrent)
```

### Size Limit Configuration

Set `WEBFLOW_BUNDLE_SIZE_LIMIT_MB` secret in GitHub:
- Repository Settings → Secrets and variables → Actions
- Name: `WEBFLOW_BUNDLE_SIZE_LIMIT_MB`
- Value: `15` (or custom limit)

Both local builds and CI/CD use this single source of truth.

## Benefits

✅ **Stay Under Limits**: Each library independently manages its bundle size
✅ **Parallel Builds**: Build multiple libraries concurrently in CI/CD
✅ **Selective Deployment**: Deploy only changed libraries
✅ **Better Organization**: Group related components by purpose
✅ **Type Safety**: Compile-time validation of library configs
✅ **Convention Over Configuration**: Minimal boilerplate, auto-inferred patterns
✅ **Easy to Scale**: Adding new libraries is self-contained