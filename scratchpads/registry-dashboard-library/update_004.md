# Registry Dashboard Library - Update 004: Bundle Size Optimization

**Date:** November 3, 2025
**Status:** ✅ Completed
**Branch:** `feat/component-registry-preview`

---

## Problem Statement

The `registry-dashboard` library bundle was too large for Webflow deployment, primarily due to including multiple ComponentDetail* components that each had significant dependencies and dynamic import logic. The library was registering 6 components total:

1. ComponentGrid
2. ComponentDetailHeader
3. ComponentDetailPreview
4. ComponentDetailProps
5. ComponentDetailUsage
6. ComponentDetailSidebar

The ComponentDetail* components were designed for use in a component detail page, but bundling them all together resulted in:
- Large bundle size (concerns about exceeding Webflow's limits)
- Unnecessary complexity for a single-purpose library
- Dynamic imports in ComponentDetailPreview that don't work well with Webflow's bundler

## Solution

**Reduce the library to only ComponentGrid** and move the other components to a temporary archive folder for potential future use.

### Why ComponentGrid Only?

1. **Single Purpose**: ComponentGrid is the main showcase component for displaying all available components
2. **Self-Contained**: Doesn't rely on dynamic imports or complex routing logic
3. **Production Ready**: Works well in both Next.js and Webflow environments
4. **Smaller Bundle**: Significantly reduces the bundle size for deployment

## Changes Made

### 1. Moved Webflow Wrappers to Archive

Created `webflow_component_examples/temp/registry-dashboard/` and moved:
- `ComponentDetailHeader.webflow.tsx`
- `ComponentDetailPreview.webflow.tsx`
- `ComponentDetailProps.webflow.tsx`
- `ComponentDetailUsage.webflow.tsx`
- `ComponentDetailSidebar.webflow.tsx`

These files are preserved for future reference but excluded from bundling.

### 2. Updated Library Configuration

**File:** `src/libraries/registry-dashboard/index.ts`

Removed all ComponentDetail* metadata, keeping only:
```typescript
componentMetadata: [
  {
    id: "registry-component-grid",
    name: "Component Grid",
    description: "Grid view of all components organized by library",
    category: "Registry",
    dependencies: [],
    props: [],
    usageExample: `<ComponentGridWrapper />`,
    tags: ["registry", "grid", "components", "library", "viewer"],
    filePath: "src/libraries/registry-dashboard/components/ComponentGrid.webflow.tsx",
  },
],
```

### 3. Updated Component Registry

**File:** `lib/component-registry.tsx`

Removed dynamic imports and registry entries for ComponentDetail* components:
```typescript
// BEFORE: 6 dynamic imports
const ComponentGrid = dynamic(...);
const ComponentDetailHeader = dynamic(...);
const ComponentDetailPreview = dynamic(...);
const ComponentDetailProps = dynamic(...);
const ComponentDetailUsage = dynamic(...);
const ComponentDetailSidebar = dynamic(...);

// AFTER: 1 dynamic import
const ComponentGrid = dynamic(
  () => import("@/components/registry-dashboard/ComponentGrid"),
  { ssr: false }
);
```

Registry entries reduced from 6 to 1:
```typescript
export const componentRegistry: Record<string, ComponentType<Record<string, unknown>>> = {
  // ... other libraries

  // Registry Dashboard
  "registry-component-grid": ComponentGrid,
};
```

### 4. Updated Test Page

**File:** `app/(tests)/test-webflow-wrappers/page.tsx`

Removed ComponentDetail* wrapper imports and test sections, keeping only ComponentGrid test.

### 5. Additional Fixes

**File:** `package.json`

Removed automatic serving from bundle commands to prevent auto-starting server:
```json
// BEFORE
"webflow:bundle": "... && npx serve dist -p 4000"

// AFTER
"webflow:bundle": "... "
```

**Deleted:** `src/libraries/interactive/components/LaserFlow.webflow.tsx`

This empty file was causing bundle errors. The proper wrapper is `LaserFlowHero.webflow.tsx`.

## Build Verification

### Next.js Build
✅ Build passes successfully with no errors (only warnings)

### Webflow Bundle
✅ Registry-dashboard library bundles successfully using:
```bash
pnpm library:manifests
pnpm library:build registry-dashboard
```

The build script:
1. Copies library manifest to root temporarily
2. Bundles using Webflow CLI
3. Outputs to `dist/registry-dashboard/`
4. Restores original webflow.json

## Architecture Notes

### Library Bundling Strategy

The project uses a multi-library architecture where each library can be bundled independently:

1. **Root `webflow.json`**: Default library (interactive) for `pnpm webflow:bundle`
2. **Library-specific manifests**: Each library has `src/libraries/{key}/webflow.json`
3. **Build script**: `pnpm library:build {key}` builds a specific library
4. **CI/CD**: GitHub Actions deploy all enabled libraries in parallel

### Component Detail Pages in Next.js

The ComponentDetail* components are still available as raw React components in:
- `components/registry-dashboard/ComponentDetailHeader.tsx`
- `components/registry-dashboard/ComponentDetailPreview.tsx`
- `components/registry-dashboard/ComponentDetailProps.tsx`
- `components/registry-dashboard/ComponentDetailUsage.tsx`
- `components/registry-dashboard/ComponentDetailSidebar.tsx`

These are used in the Next.js app at `/lander/webcn/component` and work perfectly with the component registry's dynamic imports.

### Future Considerations

If we need to deploy ComponentDetail* components to Webflow in the future:

1. **Option 1**: Create separate libraries for each component type
2. **Option 2**: Optimize bundle size and re-enable all components
3. **Option 3**: Keep them Next.js-only and use Webflow just for ComponentGrid

The archived wrappers in `webflow_component_examples/temp/registry-dashboard/` can be restored if needed.

## Files Modified

```
Modified:
- src/libraries/registry-dashboard/index.ts
- lib/component-registry.tsx
- app/(tests)/test-webflow-wrappers/page.tsx
- package.json

Deleted:
- src/libraries/registry-dashboard/components/ComponentDetailHeader.webflow.tsx
- src/libraries/registry-dashboard/components/ComponentDetailPreview.webflow.tsx
- src/libraries/registry-dashboard/components/ComponentDetailProps.webflow.tsx
- src/libraries/registry-dashboard/components/ComponentDetailUsage.webflow.tsx
- src/libraries/registry-dashboard/components/ComponentDetailSidebar.webflow.tsx
- src/libraries/interactive/components/LaserFlow.webflow.tsx

Created:
- webflow_component_examples/temp/registry-dashboard/ (archive folder)
  - ComponentDetailHeader.webflow.tsx
  - ComponentDetailPreview.webflow.tsx
  - ComponentDetailProps.webflow.tsx
  - ComponentDetailUsage.webflow.tsx
  - ComponentDetailSidebar.webflow.tsx
```

## Commits

1. `a8f77d3` - component grid only for registry library
2. `444e0f3` - FIX_Webflow_bundle: Remove auto-serve and fix empty LaserFlow wrapper

## Outcome

✅ **Registry-dashboard library successfully optimized for deployment**
- Only 1 component (ComponentGrid) in the Webflow library
- Significantly reduced bundle size
- Clean separation between Webflow deployment and Next.js usage
- ComponentDetail* components preserved as Next.js-only features
- Build and bundle processes verified working

The library is now streamlined for its primary purpose: showcasing the component grid in Webflow sites, while maintaining full functionality in the Next.js app for component detail pages.

---

**Next Steps:**
- Monitor bundle size when deploying to Webflow
- Consider optimizing ComponentGrid's dependencies if needed
- Document the multi-library deployment strategy
