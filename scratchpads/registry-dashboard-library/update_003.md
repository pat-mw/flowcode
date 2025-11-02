# Update 003 - 2025-11-02

## Session Info
- Started: 2025-11-02 (current session)
- Status: In Progress

## Problem Identified

### Dynamic Imports Break Webflow Bundling

**Issue:** The component preview uses dynamic imports to load components from the registry:

```typescript
// lib/component-registry.tsx
export const componentRegistry: Record<string, ComponentRegistryEntry> = {
  "registry-component-grid": {
    wrapper: dynamic(() =>
      import("@/src/libraries/registry-dashboard/components/ComponentGrid.webflow").then(
        (m) => m.ComponentGridWrapper
      )
    ),
  },
  // ... more components
};
```

**Problem:** Webflow's webpack bundling process cannot handle dynamic imports:
1. Dynamic imports are runtime operations
2. Webpack needs to know all modules at build time
3. Bundler cannot statically analyze `import()` expressions
4. Results in broken component preview when using Webflow wrappers

**Impact:**
- `ComponentDetailPreview` component fails to render in Webflow
- Landing page at `app/(demos)/lander/webcn/page.tsx` breaks when using wrappers
- Component detail page at `app/(demos)/lander/webcn/component/page.tsx` also affected

### Root Cause

The architectural decision to use Webflow wrappers everywhere was premature:

**Update 002 Changed:**
```tsx
// Before: Using raw components (WORKS)
import ComponentGrid from "@/components/webcn/landing_page/ComponentGrid";

// After: Using Webflow wrappers (BREAKS dynamic imports)
import { ComponentGridWrapper } from "@/src/libraries/registry-dashboard/components/ComponentGrid.webflow";
```

**Why this breaks:**
1. ComponentGrid wrapper is in Webflow library
2. Component preview dynamically imports Webflow wrappers
3. Webflow bundler can't resolve dynamic imports
4. Preview fails to load

## Decision: Revert to Raw Components for Next.js Pages

### Context
We need component preview to work in the Next.js app for development and testing. Using Webflow wrappers everywhere seemed like a good idea but breaks dynamic imports.

### Options Considered

**Option A: Revert landing page to raw components**
- ✅ Keeps dynamic imports working
- ✅ Preview functionality works
- ✅ Development experience preserved
- ⚠️ Need separate test page for Webflow wrappers
- ⚠️ Two versions of components (raw + wrapper)

**Option B: Remove dynamic imports from preview**
- ❌ Would require importing all components statically
- ❌ Massive bundle size (all components loaded upfront)
- ❌ No lazy loading benefits
- ❌ Not scalable as library grows

**Option C: Use raw components in registry, wrappers only for Webflow**
- ✅ Keeps preview working
- ✅ Registry uses raw components (smaller, faster)
- ✅ Wrappers only for Webflow deployment
- ✅ Matches original architecture intent

### Chosen: Option C (Raw components for Next.js, wrappers for Webflow)

**Rationale:**
1. **Architecture alignment**: This is the original intent
   - Raw components = Next.js app implementation
   - Webflow wrappers = Deployment artifacts for Webflow

2. **Development workflow**:
   - Develop and test in Next.js with raw components
   - Wrappers are thin deployment layer
   - Preview works because it uses raw components

3. **Bundle optimization**:
   - Next.js app only loads raw components (no wrapper overhead)
   - Webflow gets pre-bundled wrappers
   - Dynamic imports work in Next.js context

4. **Testing strategy**:
   - Landing page uses raw components (tests implementation)
   - Separate wrapper test page (tests Webflow integration)
   - Clear separation of concerns

## Work Completed

### 1. Identified the Issue
- Traced dynamic import failure to Webflow wrappers
- Documented root cause and impact
- Evaluated options

### 2. Decided on Solution
- Revert landing page to raw components
- Keep component detail page using raw components
- Create separate test page for Webflow wrappers
- Update component registry to use raw components

## Code Changes (This Session)

### Files to Modify

**1. app/(demos)/lander/webcn/page.tsx**
- Revert all imports from Webflow wrappers to raw components
- Example:
  ```tsx
  // REVERT FROM:
  import { ComponentGridWrapper } from "@/src/libraries/registry-dashboard/components/ComponentGrid.webflow";

  // BACK TO:
  import ComponentGrid from "@/components/registry-dashboard/ComponentGrid";
  ```

**2. lib/component-registry.tsx**
- Update all dynamic imports to use raw components
- Example:
  ```tsx
  // CHANGE FROM:
  wrapper: dynamic(() => import("@/src/libraries/X/components/Y.webflow").then(m => m.YWrapper))

  // CHANGE TO:
  wrapper: dynamic(() => import("@/components/X/Y"))
  ```

### Files to Create

**3. app/(tests)/test-webflow-wrappers/page.tsx** (NEW)
- Dedicated test page for Webflow wrapper integration
- Uses all Webflow wrappers explicitly
- Does NOT use dynamic imports
- Purpose: Verify wrappers work before deploying to Webflow

**Structure:**
```tsx
'use client';

// Import ALL wrappers statically (no dynamic imports)
import { ComponentGridWrapper } from "@/src/libraries/registry-dashboard/components/ComponentGrid.webflow";
import { NavbarWrapper } from "@/src/libraries/webcn/components/Navbar.webflow";
// ... all other wrappers

export default function TestWebflowWrappersPage() {
  return (
    <div>
      <h1>Webflow Wrappers Test Page</h1>
      <p>This page tests Webflow wrappers in isolation.</p>

      {/* Test each wrapper */}
      <section>
        <h2>Navbar Wrapper</h2>
        <NavbarWrapper />
      </section>

      {/* ... more wrapper tests */}
    </div>
  );
}
```

## Architecture Clarity

### Next.js App Router Pages (Use Raw Components)
```
app/(demos)/lander/webcn/
├── page.tsx                 # Uses raw components
└── component/
    └── page.tsx             # Uses raw components

app/(tests)/
├── test-components/         # Uses raw components
└── test-webflow-wrappers/   # NEW: Uses Webflow wrappers (static imports only)
```

### Component Registry (Uses Raw Components)
```typescript
// lib/component-registry.tsx
export const componentRegistry: Record<string, ComponentRegistryEntry> = {
  "registry-component-grid": {
    wrapper: dynamic(() => import("@/components/registry-dashboard/ComponentGrid")),
    //                                          ^^^^^^^^ Raw component, no .webflow
  },
};
```

### Webflow Libraries (Export Wrappers)
```
src/libraries/registry-dashboard/components/
├── ComponentGrid.webflow.tsx    # Wrapper for Webflow deployment
└── ...                          # Other wrappers

components/registry-dashboard/
├── ComponentGrid.tsx            # Raw implementation (used in Next.js)
└── ...                          # Other implementations
```

## Benefits of This Approach

### 1. Clear Separation of Concerns
- **Next.js pages** = Use raw components (development/testing)
- **Webflow wrappers** = Deployment artifacts only
- **Component registry** = Uses raw components (works everywhere)

### 2. Dynamic Imports Work
- Registry uses raw components (no Webflow bundler issues)
- Preview loads correctly
- Lazy loading preserved

### 3. Better Development Experience
- Faster iteration (no wrapper overhead in dev)
- Clearer error messages (no wrapper indirection)
- Easier debugging (direct component access)

### 4. Testable Wrappers
- Dedicated test page for Webflow wrappers
- Can verify wrapper behavior before deployment
- No confusion with development pages

## Next Steps

- [x] Document issue and decision
- [ ] Revert landing page imports to raw components
- [ ] Create test-webflow-wrappers page
- [ ] Update component registry to use raw components
- [ ] Verify preview works again
- [ ] Test both pages (landing + wrapper test)
- [ ] Update spec.md if needed

## Lessons Learned

### Mistake: Using Wrappers Everywhere
- **What we did**: Changed Next.js pages to use Webflow wrappers
- **Why it seemed right**: "Use the same components everywhere"
- **Why it was wrong**: Dynamic imports + Webflow bundler = incompatible

### Correct Pattern: Raw for Next.js, Wrappers for Webflow
- **Raw components**: Implementation layer (Next.js app)
- **Webflow wrappers**: Deployment layer (Webflow sites)
- **Component registry**: Uses raw components (works in both contexts)

### Architectural Principle
**"Wrappers are deployment artifacts, not development artifacts"**

- Wrappers exist to bridge React → Webflow
- They are NOT meant for use in Next.js app
- Next.js app should always use raw components
- Only test wrappers when explicitly verifying Webflow integration

## Impact on Spec

### Spec.md Updates Needed

Update spec.md to clarify:
1. Raw components for Next.js app router pages
2. Wrappers only for Webflow deployment
3. Component registry uses raw components
4. Separate test page for wrapper verification

**Section to add:**
```markdown
## Architecture Clarification

### Raw Components vs Webflow Wrappers

**Raw Components** (`components/registry-dashboard/X.tsx`):
- Used in Next.js app router pages
- Used in component registry (for preview)
- Development and testing environment
- Full Next.js features available

**Webflow Wrappers** (`src/libraries/registry-dashboard/components/X.webflow.tsx`):
- Deployment artifacts for Webflow
- NOT used in Next.js app (except dedicated test page)
- Shadow DOM compatible only
- Tested via app/(tests)/test-webflow-wrappers/

**Component Registry**:
- Uses raw components (dynamic imports work)
- Provides preview functionality
- No Webflow wrapper dependencies
```

## Summary

Identified that using Webflow wrappers in Next.js app router pages breaks dynamic imports in the component registry. The correct architecture is:

- **Next.js pages** → Use raw components
- **Webflow deployment** → Use wrappers
- **Component registry** → Use raw components (dynamic imports)
- **Wrapper testing** → Dedicated test page with static imports

Reverting landing page to raw components and creating separate wrapper test page to maintain clear architectural boundaries.
