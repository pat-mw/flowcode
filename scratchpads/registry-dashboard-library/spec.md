# Feature: Registry Dashboard Library

## Overview
Create a new standalone library `registry-dashboard` to host the component library viewer interface. This library enables the component grid and detail pages to be embedded directly in Webflow sites, making the component registry browsable without requiring the Next.js app.

## Goals
- Create `registry-dashboard` library separate from `webcn`
- Move `ComponentGrid` from `webcn` to `registry-dashboard`
- Create Webflow components for component detail page sections
- Enable full component library browsing within Webflow sites
- Keep bundle size minimal (no heavy dependencies)

## Technical Approach

### 1. New Library Structure

```
src/libraries/registry-dashboard/
├── index.ts                    # Library config
├── components/
│   ├── ComponentGrid.webflow.tsx       # Moved from webcn
│   ├── ComponentDetailHeader.webflow.tsx   # NEW: Header section
│   ├── ComponentDetailPreview.webflow.tsx  # NEW: Preview section
│   ├── ComponentDetailProps.webflow.tsx    # NEW: Props documentation
│   ├── ComponentDetailUsage.webflow.tsx    # NEW: Usage example
│   └── ComponentDetailSidebar.webflow.tsx  # NEW: Sidebar metadata
└── webflow.json               # Auto-generated
```

### 2. Component Breakdown

Current `/component` page structure needs to be split into Webflow-embeddable components:

**ComponentDetailHeader** - Top section
- Component name and library badge
- Description
- Tags
- Back button (browser navigation)

**ComponentDetailPreview** - Live component preview
- Uses component registry to load preview
- Shows loading/error states
- Suspense boundary

**ComponentDetailProps** - Props documentation table
- Prop name, type, required/optional badge
- Description and default value
- Options (for Variant type)

**ComponentDetailUsage** - Code example
- Usage example code block
- Copy button

**ComponentDetailSidebar** - Metadata sidebar
- Category badge
- Library information
- Dependencies list
- Backend dependencies
- File path

### 3. Library Configuration

```typescript
// src/libraries/registry-dashboard/index.ts
export const registryDashboardLibrary: LibraryConfig = {
  name: "Component Registry Dashboard",
  description: "Component library viewer and documentation interface",
  id: "blogflow-registry-dashboard",

  componentMetadata: [
    {
      id: "registry-component-grid",
      name: "Component Grid",
      description: "Grid view of all components organized by library",
      category: "Registry",
      tags: ["registry", "grid", "components", "library"],
      // ... metadata
    },
    {
      id: "registry-detail-header",
      name: "Component Detail Header",
      description: "Header section for component detail page",
      category: "Registry",
      tags: ["registry", "detail", "header"],
      // ... metadata
    },
    // ... more components
  ],

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  deploy: {
    enabled: true,
    workspaceToken: process.env.WEBFLOW_WORKSPACE_API_TOKEN,
  },
};
```

### 4. Move ComponentGrid

**From:** `src/libraries/webcn/components/ComponentGrid.webflow.tsx`
**To:** `src/libraries/registry-dashboard/components/ComponentGrid.webflow.tsx`

**Updates needed:**
- Update webcn library metadata (remove ComponentGrid)
- Add to registry-dashboard library metadata
- Update component registry imports
- Update any test pages that use ComponentGrid

### 5. URL State for Detail Page

Since Webflow components can't use Next.js router, use URL query parameters:
```typescript
// In Webflow components, read component ID from URL
const params = new URLSearchParams(window.location.search);
const componentId = params.get('id');
```

### 6. Props for Detail Components

Each detail component accepts:
```typescript
interface ComponentDetailProps {
  componentId?: string;  // Optional - read from URL if not provided
}
```

This allows:
- Manual prop in Webflow Designer: `componentId="core-login-form"`
- Auto-read from URL: `?id=core-login-form`

## Libraries Affected

- **NEW**: `registry-dashboard` - New library
- **webcn**: Remove ComponentGrid, update metadata
- **ALL libraries**: ComponentGrid will display all of them

## Backend Requirements

- **oRPC Endpoints**: None (client-side only, uses registry data)
- **Database Schema**: None
- **Environment Variables**: NEXT_PUBLIC_API_URL (standard)

## Components to Create

### Implementations (in /components)
1. **Create**: `components/registry-dashboard/ComponentGrid.tsx` (move from existing)
2. **Create**: `components/registry-dashboard/ComponentDetailHeader.tsx`
3. **Create**: `components/registry-dashboard/ComponentDetailPreview.tsx`
4. **Create**: `components/registry-dashboard/ComponentDetailProps.tsx`
5. **Create**: `components/registry-dashboard/ComponentDetailUsage.tsx`
6. **Create**: `components/registry-dashboard/ComponentDetailSidebar.tsx`

### Webflow Wrappers
1. **Move**: `ComponentGrid.webflow.tsx` from webcn to registry-dashboard
2. **Create**: `ComponentDetailHeader.webflow.tsx`
3. **Create**: `ComponentDetailPreview.webflow.tsx`
4. **Create**: `ComponentDetailProps.webflow.tsx`
5. **Create**: `ComponentDetailUsage.webflow.tsx`
6. **Create**: `ComponentDetailSidebar.webflow.tsx`

## Test Pages

- **Update existing**: `app/(demos)/lander/webcn/page.tsx` - Update ComponentGrid import
- **Update existing**: `app/(demos)/lander/webcn/component/page.tsx` - Use new detail components
- **Create new**: `app/(tests)/test-registry-dashboard/page.tsx` - Test all new components

## Dependencies

- None (uses existing lib/registry-utils.ts and lib/component-registry.tsx)
- Lucide icons (already in project)
- shadcn/ui components (already in project)

## Bundle Size Impact

Expected bundle size: ~50-100KB
- No heavy dependencies (recharts, three.js, etc.)
- Just React, registry utils, and UI components
- Well under 15MB limit

## Success Criteria

- [ ] New `registry-dashboard` library created and registered
- [ ] ComponentGrid moved from webcn to registry-dashboard
- [ ] All 6 detail components created with implementations + wrappers
- [ ] Components can read componentId from URL query params
- [ ] Components can accept componentId as prop
- [ ] Test page renders all components correctly
- [ ] Library builds successfully with `pnpm library:build registry-dashboard`
- [ ] Bundle size under 15MB
- [ ] webcn library updated (ComponentGrid removed from metadata)
- [ ] Component registry updated with new imports
- [ ] All existing tests still pass

## Webflow Usage Pattern

In Webflow Designer, users can build component detail pages like:

```
[registry-detail-header componentId="core-login-form"]
[registry-detail-preview componentId="core-login-form"]
[registry-detail-props componentId="core-login-form"]
[registry-detail-usage componentId="core-login-form"]
[registry-detail-sidebar componentId="core-login-form"]
```

Or use dynamic URL reading (no props needed):
```
URL: /component?id=core-login-form

[registry-detail-header]  ← Auto-reads from URL
[registry-detail-preview] ← Auto-reads from URL
...
```

## Open Questions

- Should components gracefully handle missing componentId? → Yes, show "Component not found" message
- Should we add search/filter to ComponentGrid? → Future enhancement, not in v1
- Should detail components be individually embeddable or one composite? → Individual for max flexibility

## Timeline Estimate

~3-4 hours:
- 30 min: Create library structure and config
- 30 min: Move ComponentGrid and update registries
- 2 hours: Create 5 new detail components (implementation + wrappers)
- 30 min: Update test pages and test all components
- 30 min: Documentation and final testing
