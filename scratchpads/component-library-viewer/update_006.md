# Update 006 - Component Preview Slot Version

**Date:** 2025-11-03
**Status:** Completed

## Session Info
- Feature: Slot-based component preview card
- Library: registry-dashboard
- Status: Completed and tested

## Work Completed

### 1. Created New Slot-Based Component

Created `ComponentDetailPreviewSlot` as a NEW component (keeping original `ComponentDetailPreview` intact):

**Files Created:**
- `/components/registry-dashboard/ComponentDetailPreviewSlot.tsx` - Implementation
- `/src/libraries/registry-dashboard/components/ComponentDetailPreviewSlot.webflow.tsx` - Webflow wrapper
- `/app/(tests)/test-registry-preview/page.tsx` - Test page

### 2. Key Features Implemented

✅ **Webflow Slot Property**
- Added `children` prop using `props.Slot()`
- Allows designers to drop images/components from Webflow
- Slot replaces the preview area entirely

✅ **Button Moved to Footer**
- "View Live Preview" button now in card footer
- Full-width button for better UX
- Maintains external link functionality

✅ **Hover Overlay**
- Positioned OUTSIDE the slot (absolute positioning on container)
- Shows: "Live component previews are available on the nextjs site"
- Semi-transparent black background with backdrop blur
- Smooth opacity transition (200ms)
- Non-interactive (pointer-events-none)

### 3. Technical Implementation Details

**Slot Configuration:**
```tsx
children: props.Slot({
  name: 'Preview Image',
  tooltip: 'Slot for component preview image. Drop an image or any element here.',
})
```

**Overlay Structure:**
- Container div with `relative` positioning
- Slot content inside container
- Overlay div with `absolute inset-0` positioning (outside slot)
- Controlled by hover state via `onMouseEnter`/`onMouseLeave`
- CSS classes for smooth transitions

**Component Structure:**
```
Card
├── Header (Eye icon + title)
├── Preview Container (relative positioning)
│   ├── Slot Content (children)
│   └── Overlay (absolute, outside slot)
└── Footer
    ├── Button ("View Live Preview")
    └── Helper text
```

## Decisions Made

### Decision: Create New Component vs Modify Existing
- **Context**: User requested new version without destroying current one
- **Chosen**: Create separate `ComponentDetailPreviewSlot` component
- **Rationale**:
  - Preserves backward compatibility
  - Allows both versions to coexist in Webflow
  - Clear naming distinguishes functionality (Slot suffix)
  - Users can migrate at their own pace

### Decision: Overlay Positioning
- **Context**: Overlay must be outside slot but visually over it
- **Options Considered**:
  - A) Absolute positioning on container (CHOSEN)
  - B) Portal-based overlay
  - C) CSS pseudo-elements
- **Chosen**: Absolute positioning
- **Rationale**:
  - Simplest solution that works
  - No additional dependencies (no portal library)
  - CSS-only solution (performant)
  - Works correctly with slot replacement behavior

### Decision: Hover State Management
- **Context**: Need to show/hide overlay on hover
- **Options Considered**:
  - A) CSS-only (:hover) - wouldn't work across slot boundary
  - B) React state with container hover (CHOSEN)
  - C) Intersection observer
- **Chosen**: React state (useState + onMouseEnter/Leave)
- **Rationale**:
  - Container hover events fire correctly
  - State change triggers re-render with correct opacity
  - Clean, predictable behavior
  - Works with slot content inside

## Code Changes

**Files Created:**
1. `/components/registry-dashboard/ComponentDetailPreviewSlot.tsx`
   - Implementation component with slot support
   - Hover state management
   - Overlay rendering logic
   - Footer layout with button

2. `/src/libraries/registry-dashboard/components/ComponentDetailPreviewSlot.webflow.tsx`
   - Webflow wrapper following two-file pattern
   - Slot property definition
   - WebflowProvidersWrapper integration
   - Proper type definitions

3. `/app/(tests)/test-registry-preview/page.tsx`
   - Side-by-side comparison test page
   - Original vs Slot version
   - Feature comparison table
   - Webflow usage instructions

**Files NOT Modified:**
- Original `ComponentDetailPreview.tsx` - preserved intact
- Original `ComponentDetailPreview.webflow.tsx` - preserved intact

## Testing

**Local Testing:**
- ✅ TypeScript compilation passes (no errors)
- ✅ Test page created at `/app/(tests)/test-registry-preview`
- ✅ Side-by-side comparison working
- ✅ Hover overlay appears correctly
- ✅ Button positioned in footer
- ✅ Slot accepts children (simulated image content)

**Webflow Testing (Next Steps):**
- [ ] Deploy to Webflow via CI/CD
- [ ] Test dropping images into slot
- [ ] Verify overlay works in Webflow Designer
- [ ] Test on production site

## Usage in Webflow

**For Designers:**
1. Drag "Component Detail Preview (Slot)" onto page
2. Configure props:
   - `componentId`: e.g., "core-login-form"
   - `previewBaseUrl`: Your site URL
3. Click "Preview Image" slot in properties panel
4. Drop an image element into the highlighted slot area
5. Image appears in preview card
6. Hover to see overlay message
7. Button automatically in footer

**Differences from Original:**
- Original: Static placeholder text, button in preview area
- Slot: Custom image via slot, button in footer, hover overlay

## Next Steps

- [x] Create implementation component
- [x] Create Webflow wrapper with slot
- [x] Add hover overlay outside slot
- [x] Move button to footer
- [x] Create test page
- [x] Verify TypeScript compilation
- [ ] Deploy to Webflow (via CI/CD)
- [ ] Test with real Webflow images
- [ ] Update documentation if needed

## Notes for Next Session

**Component is production-ready:**
- All code complete and tested locally
- Follows two-file pattern correctly
- Uses WebflowProvidersWrapper
- No TypeScript errors
- Test page demonstrates functionality

**Deployment:**
- Component is in `registry-dashboard` library
- Will be deployed via existing CI/CD workflow
- No manifest regeneration needed (auto-discovers *.webflow.tsx)

**Key Technical Details:**
- Slot replaces target div entirely (per Webflow docs)
- Overlay MUST be outside slot (absolute positioning on container)
- Hover state managed via React (not CSS-only)
- Button in footer for better UX

## References

- Webflow Slot Docs: https://developers.webflow.com/code-components/reference/prop-types/slot
- Original Component: `/components/registry-dashboard/ComponentDetailPreview.tsx`
- Test Page: `/app/(tests)/test-registry-preview/page.tsx`
- Two-File Pattern: See CLAUDE.md, docs/quick-start-guide.md
