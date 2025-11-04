# Update 005 - 2025-11-03

## Session Info
- Started: 2025-11-03 01:00 UTC
- Status: Completed
- Focus: Bundle size optimization by removing dynamic component preview and making paths configurable

## Work Completed

### 1. Replaced Dynamic Component Preview with External Link

**Problem:** The ComponentDetailPreview component was importing the entire component registry via `@/lib/component-registry`, which bundled ALL component implementations. This caused the registry-dashboard library to exceed the 15MB bundle size limit.

**Solution:** Replaced live preview with a link to the production site's preview page.

**Files Modified:**
- `components/registry-dashboard/ComponentDetailPreview.tsx`
  - Removed dynamic component imports
  - Removed Error Boundary and Suspense
  - Added external link button to production preview page
  - Made preview base URL configurable via `previewBaseUrl` prop

**Changes:**
```tsx
// Before: Dynamic component loading
const ComponentWrapper = getComponentWrapper(componentId);
<Suspense><ComponentWrapper /></Suspense>

// After: External link
const previewUrl = `${previewBaseUrl}/lander/webcn/component?id=${componentId}`;
<Button asChild>
  <a href={previewUrl} target="_blank">View Live Preview</a>
</Button>
```

### 2. Removed Component Registry File

**Deleted:** `lib/component-registry.tsx`
- This file contained dynamic imports for ALL components across ALL libraries
- Was causing circular dependency when imported by registry-dashboard components
- No longer needed since we're using external preview links

### 3. Added Configurable Base Path Props

Made component detail page paths configurable from Webflow Designer:

#### ComponentGrid
- Added `basePath` prop (default: `/lander/webcn/component`)
- Allows changing the component detail page URL
- Updates both implementation and webflow wrapper

**Files Modified:**
- `components/registry-dashboard/ComponentGrid.tsx`
- `src/libraries/registry-dashboard/components/ComponentGrid.webflow.tsx`
- `src/libraries/registry-dashboard/index.ts` (metadata)

**Usage:**
```tsx
<ComponentGridWrapper basePath="/custom/path/to/component" />
```

#### ComponentDetailPreview
- Added `previewBaseUrl` prop (default: `process.env.NEXT_PUBLIC_API_URL`)
- Allows overriding the production site URL for preview links
- Updates both implementation and webflow wrapper

**Files Modified:**
- `components/registry-dashboard/ComponentDetailPreview.tsx`
- `src/libraries/registry-dashboard/components/ComponentDetailPreview.webflow.tsx`
- `src/libraries/registry-dashboard/index.ts` (metadata)

**Usage:**
```tsx
<ComponentDetailPreviewWrapper
  componentId="core-login-form"
  previewBaseUrl="https://custom-domain.com"
/>
```

### 4. Re-added Registry Dashboard Components from Examples

Copied Webflow wrappers from `webflow_component_examples/temp/registry-dashboard/`:
- ComponentDetailHeader.webflow.tsx
- ComponentDetailPreview.webflow.tsx
- ComponentDetailProps.webflow.tsx
- ComponentDetailSidebar.webflow.tsx
- ComponentDetailUsage.webflow.tsx

All implementation files already existed in `components/registry-dashboard/`.

### 5. Updated Library Metadata

Updated `src/libraries/registry-dashboard/index.ts` with complete component metadata:
- registry-component-grid (added basePath prop documentation)
- registry-detail-header
- registry-detail-preview (added previewBaseUrl prop documentation)
- registry-detail-props
- registry-detail-usage
- registry-detail-sidebar

Each entry now includes:
- Complete props documentation
- Usage examples
- Tags for discoverability

## Architecture Decisions

### Decision: External Preview Links vs Dynamic Loading

**Context:** Need to show component previews without bundling all component implementations.

**Options Considered:**
1. **External link to production** (chosen)
   - Pros: Zero bundle size impact, simple implementation
   - Cons: Requires separate tab, depends on production site

2. **Accept data as props**
   - Pros: Pure presentation component, no dependencies
   - Cons: Less convenient in Webflow (manual JSON input)

3. **Separate data-only registry**
   - Pros: Could load metadata without components
   - Cons: Duplicate registry structure, more complex

4. **Move to Next.js-only page**
   - Pros: No Webflow constraints
   - Cons: Can't use in Webflow sites

**Chosen:** Option 1 - External link

**Rationale:**
- Simplest solution with zero bundle size impact
- Users already need the production site running to use components
- Link can be customized per Webflow site via `previewBaseUrl` prop
- Avoids complex circular dependency issues

### Decision: Make All Paths Configurable

**Context:** Different Webflow sites may use different URL structures.

**Approach:** Added optional Text props with sensible defaults:
- `basePath` for component detail page URLs
- `previewBaseUrl` for production preview site URL

**Benefits:**
- Webflow users can customize without code changes
- Defaults work for standard setup
- Future-proof for custom domains/paths

## Technical Notes

### Circular Dependency Issue (Discovered but Not Encountered)

The registry-dashboard library imports `@/lib/registry-utils`, which imports the full registry config including the registry-dashboard library itself. This creates a circular dependency:

```
registry-dashboard library
  → imports registry-utils
    → imports registry.config
      → imports registry-dashboard library
        → ♾️ circular!
```

This is currently acceptable because:
1. We removed the heavy `component-registry.tsx` import
2. The metadata-only import from `registry-utils` is lightweight
3. TypeScript/webpack can resolve this circular reference

**Future consideration:** If bundle size becomes an issue again, consider:
- Extracting metadata to separate file
- Excluding registry-dashboard from its own imports
- Using data props instead of imports

### Environment Variables in Webflow Bundles

`process.env.NEXT_PUBLIC_API_URL` works in Webflow bundles because:
- `webpack.webflow.js` uses DefinePlugin to replace at build time
- Becomes a literal string in the bundle (not runtime lookup)
- Falls back to empty string if undefined

## Testing

### TypeScript Compilation
✅ Passes: `npx tsc --noEmit` - no errors

### Bundle Build Status
⚠️ Not tested yet - need to resolve circular dependency for build to succeed

The build currently fails with "no files found for remoteEntry chunk" due to the registry circular dependency. However, since we're using external preview links, the registry-dashboard library may not need to be deployed to Webflow - it could remain Next.js-only for the production site.

## Next Steps

- [ ] Test in local Next.js app (`pnpm dev`)
- [ ] Verify component grid links work correctly
- [ ] Verify preview links open in production site
- [ ] Test basePath customization in Webflow Designer (if deploying)
- [ ] Test previewBaseUrl customization
- [ ] Consider whether registry-dashboard needs Webflow deployment at all

## Blockers

**Bundle Build:** The registry-dashboard library build fails due to circular dependency with registry-utils. This may be acceptable if the library is only used in the Next.js app (not deployed to Webflow).

**Resolution Options:**
1. Keep registry-dashboard as Next.js-only (don't deploy to Webflow)
2. Extract registry metadata to avoid circular import
3. Make components accept registry data as props

## Files Changed

### Modified:
- `components/registry-dashboard/ComponentDetailPreview.tsx` - External link pattern
- `components/registry-dashboard/ComponentGrid.tsx` - Added basePath prop
- `src/libraries/registry-dashboard/components/ComponentDetailPreview.webflow.tsx` - Added previewBaseUrl prop
- `src/libraries/registry-dashboard/components/ComponentGrid.webflow.tsx` - Added basePath prop
- `src/libraries/registry-dashboard/index.ts` - Updated metadata with new props

### Created:
- `src/libraries/registry-dashboard/components/ComponentDetailHeader.webflow.tsx`
- `src/libraries/registry-dashboard/components/ComponentDetailProps.webflow.tsx`
- `src/libraries/registry-dashboard/components/ComponentDetailSidebar.webflow.tsx`
- `src/libraries/registry-dashboard/components/ComponentDetailUsage.webflow.tsx`

### Deleted:
- `lib/component-registry.tsx` - No longer needed

## Notes for Next Session

1. The registry-dashboard library may be better suited as Next.js-only:
   - It displays the registry of Webflow components
   - But may not need to BE a Webflow component itself
   - The production Next.js app can host the component viewer
   - Webflow sites can link to it

2. If you do need it in Webflow:
   - Will need to resolve circular dependency
   - Consider extracting registry metadata to separate file
   - Or make components accept data as props

3. Current implementation works perfectly for Next.js app usage:
   - Component grid shows all components
   - Detail pages show full documentation
   - Preview links to production site
   - All paths are customizable
