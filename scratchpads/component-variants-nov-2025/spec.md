# Feature: Component Variants for Registry Dashboard & Webcn Libraries

## Overview

This feature addresses three component enhancement requests across two different libraries:
1. **registry-dashboard**: Create a centered variant of ComponentDetailHeader
2. **webcn**: Create an image-based variant of StylingControlSection
3. **registry-dashboard (Next.js only)**: Add screenshot functionality to ComponentDetailPreview

All enhancements involve creating new variants of existing components to provide additional styling/content options, with the screenshot feature being exclusive to the Next.js environment.

## Goals

- Create a centered version of ComponentDetailHeader that aligns text and content horizontally
- Create an image-based variant of StylingControlSection that replaces the live theme preview with a configurable GIF/image
- Add screenshot functionality to ComponentDetailPreview (Next.js environment only, not deployed to Webflow)
- Maintain backward compatibility with existing components
- Follow the established two-file pattern (implementation in `/components/`, wrapper in `src/libraries/{library}/components/`)
- Ensure all variants are testable via Next.js test pages

## Technical Approach

### Issue 1: ComponentDetailHeader - Centered Variant

**Current State:**
- Component located at: `components/registry-dashboard/ComponentDetailHeader.tsx`
- Webflow wrapper: `src/libraries/registry-dashboard/components/ComponentDetailHeader.webflow.tsx`
- Layout: Left-aligned with "Back to Library" button, title, library badge, description, and tags
- Container uses: `container mx-auto px-4 py-6`
- Content alignment: Left-aligned (default flex behavior)

**Proposed Solution:**

Create a new **centered variant** component:
- **Implementation**: `components/registry-dashboard/ComponentDetailHeaderCentered.tsx`
- **Wrapper**: `src/libraries/registry-dashboard/components/ComponentDetailHeaderCentered.webflow.tsx`
- **Changes from original**:
  - Center all text content: `text-center`
  - Center-align flex containers: `items-center justify-center`
  - Center the "Back to Library" button (or consider hiding it for centered layout)
  - Keep badge inline with title but centered
  - Center description and tags

**Layout Structure (Centered Variant):**
```tsx
<div className="border-b border-border bg-card/50 backdrop-blur">
  <div className="container mx-auto px-4 py-6">
    {/* Centered "Back to Library" button (optional - could hide) */}
    <div className="flex justify-center mb-4">
      <Button variant="ghost" size="sm" asChild>
        <a href={backToLibraryUrl}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Library
        </a>
      </Button>
    </div>

    {/* Centered title and badge */}
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-col items-center gap-3">
        <h1 className="text-4xl font-bold text-foreground text-center">
          {component.name}
        </h1>
        <Badge variant="secondary" className="text-sm">
          {component.libraryName}
        </Badge>
      </div>
      <p className="text-lg text-muted-foreground max-w-3xl text-center">
        {component.description}
      </p>
    </div>

    {/* Centered tags */}
    {component.tags && component.tags.length > 0 && (
      <div className="flex flex-wrap gap-2 mt-4 justify-center">
        {component.tags.map((tag) => (
          <span key={tag} className="text-xs bg-muted px-3 py-1 rounded-full">
            {tag}
          </span>
        ))}
      </div>
    )}
  </div>
</div>
```

### Issue 2: StylingControlSection - Image Variant

**Current State:**
- Component located at: `components/webcn/landing_page/webcn.webflow.io/StylingControlSection.tsx`
- Webflow wrapper: `src/libraries/webcn/components/StylingControlSection.webflow.tsx`
- Left side: Live theme preview with animated theme switching (Card with dynamic styling)
- Right side: Three feature descriptions with icons
- Depends on: `useState`, `useEffect` for theme cycling animation

**Proposed Solution:**

Create a new **image-based variant** component:
- **Implementation**: `components/webcn/landing_page/webcn.webflow.io/StylingControlSectionImage.tsx`
- **Wrapper**: `src/libraries/webcn/components/StylingControlSectionImage.webflow.tsx`
- **Changes from original**:
  - Remove theme preview logic (`useState`, `useEffect`, themes array)
  - Replace Card with dynamic theme preview with a simple image container
  - Add `imageUrl` prop (Webflow `props.Image()`)
  - Keep all text props (badge, title, subtitle, features) unchanged
  - Maintain grid layout structure

**New Props:**
```typescript
export interface StylingControlSectionImageProps {
  // Image prop
  imageUrl?: string; // Webflow props.Image() - URL to GIF or static image

  // Existing text props (unchanged)
  badgeText?: string;
  sectionTitle?: string;
  sectionSubtitle?: string;
  feature1Title?: string;
  feature1Description?: string;
  feature2Title?: string;
  feature2Description?: string;
  feature3Title?: string;
  feature3Description?: string;
  showBadge?: boolean;
}
```

**Layout Structure (Image Variant):**
```tsx
<section id="styling" className="py-24 px-4 relative overflow-hidden">
  {/* ... background decoration unchanged ... */}

  <div className="container mx-auto relative z-10">
    <div className="max-w-6xl mx-auto">
      {/* Header - unchanged */}
      <div className="text-center mb-16 space-y-4">
        {/* ... badge, title, subtitle ... */}
      </div>

      <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
        {/* Left: Image Display (CHANGED) */}
        <div className="order-2 lg:order-1">
          <Card className="relative overflow-hidden bg-gradient-card border-border/50 shadow-card p-8">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Styling demo"
                className="w-full h-auto rounded-lg"
              />
            ) : (
              <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">No image provided</p>
              </div>
            )}
          </Card>
        </div>

        {/* Right: Features (UNCHANGED) */}
        <div className="order-1 lg:order-2 space-y-6">
          {/* ... feature list unchanged ... */}
        </div>
      </div>

      {/* Bottom Note - unchanged */}
    </div>
  </div>
</section>
```

### Issue 3: ComponentDetailPreview - Screenshot Functionality (Next.js Only)

**Current State:**
- Component located at: `components/registry-dashboard/ComponentDetailPreview.tsx`
- Webflow wrapper: `src/libraries/registry-dashboard/components/ComponentDetailPreview.webflow.tsx`
- Used in Next.js at: `app/(demos)/lander/webcn/component/page.tsx`
- Current functionality: Shows placeholder with "View Live Preview" button linking to external preview URL
- No actual component rendering or screenshot capability

**Proposed Solution:**

Create a new **screenshot-enabled variant** component for Next.js environment only:
- **Implementation**: `components/registry-dashboard/ComponentDetailPreviewScreenshot.tsx`
- **No Webflow wrapper needed** (Next.js only)
- **Changes from original**:
  - Add "Screenshot" button in the header area
  - Wrap preview content in a ref-based div for capture
  - Use `html2canvas` library to capture the preview area
  - Download screenshot as PNG with filename: `{componentName}_{libraryName}.png`
  - Only available in Next.js environment, NOT deployed to Webflow

**IMPORTANT**:
- **DO NOT** edit the existing Webflow wrapper file
- **DO NOT** deploy this variant to Webflow
- This is a Next.js-exclusive component for internal use only

**New Dependency:**
```bash
pnpm add html2canvas
pnpm add -D @types/html2canvas
```

**Implementation Pattern:**
```tsx
'use client';

import { Eye, ExternalLink, Camera } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import html2canvas from "html2canvas";
import { getComponentById } from "@/lib/registry-utils";

export interface ComponentDetailPreviewScreenshotProps {
  componentId?: string;
  previewBaseUrl?: string;
}

const ComponentDetailPreviewScreenshot = ({
  componentId: propComponentId,
  previewBaseUrl = process.env.NEXT_PUBLIC_API_URL,
}: ComponentDetailPreviewScreenshotProps) => {
  const previewRef = useRef<HTMLDivElement>(null);

  // Read component ID from URL if not provided as prop
  const componentId = propComponentId || (typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('id')
    : null);

  // Get component metadata for filename
  const component = componentId ? getComponentById(componentId) : null;

  const handleScreenshot = async () => {
    if (!previewRef.current || !component) return;

    try {
      // Capture the preview div
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher quality
        logging: false,
      });

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');

          // Filename format: componentName_libraryName.png
          const filename = `${component.name.toLowerCase().replace(/\s+/g, '-')}_${component.libraryKey}.png`;

          link.href = url;
          link.download = filename;
          link.click();

          // Cleanup
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    } catch (error) {
      console.error('Screenshot failed:', error);
    }
  };

  if (!componentId) {
    return (
      <Card className="p-6 bg-muted/30">
        {/* ... error state ... */}
      </Card>
    );
  }

  const previewUrl = `${previewBaseUrl}/lander/webcn/component?id=${componentId}`;

  return (
    <Card className="p-6">
      {/* Header with Screenshot Button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-semibold text-foreground">
            Component Preview
          </h2>
        </div>

        {/* Screenshot Button (Next.js only) */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleScreenshot}
          className="flex items-center gap-2"
        >
          <Camera className="w-4 h-4" />
          Screenshot
        </Button>
      </div>

      {/* Preview Area - Wrapped in ref for screenshot capture */}
      <div
        ref={previewRef}
        className="border border-border rounded-lg bg-muted/20 p-8 min-h-[200px] flex flex-col items-center justify-center gap-4"
      >
        <p className="text-muted-foreground text-center">
          Live component previews available on the hosted site
        </p>
        <Button asChild variant="default">
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <span>View Live Preview</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </Button>
      </div>

      <p className="text-xs text-muted-foreground mt-4">
        Component previews are available on the production site to avoid bundle size limitations.
        Click the button above to view the live preview with default props.
      </p>
    </Card>
  );
};

export default ComponentDetailPreviewScreenshot;
```

**Usage in Next.js:**
Update `app/(demos)/lander/webcn/component/page.tsx` to use the new screenshot variant:

```tsx
// Before:
import ComponentDetailPreview from "@/components/registry-dashboard/ComponentDetailPreview";

// After:
import ComponentDetailPreviewScreenshot from "@/components/registry-dashboard/ComponentDetailPreviewScreenshot";

// In component:
<ComponentDetailPreviewScreenshot componentId={id} />
```

## Libraries Affected

### registry-dashboard
- **New Files**:
  - `components/registry-dashboard/ComponentDetailHeaderCentered.tsx` (implementation)
  - `src/libraries/registry-dashboard/components/ComponentDetailHeaderCentered.webflow.tsx` (wrapper)
  - `components/registry-dashboard/ComponentDetailPreviewScreenshot.tsx` (Next.js only - NO wrapper)
- **Modified Files**:
  - `app/(demos)/lander/webcn/component/page.tsx` (use screenshot variant)
- **Changes**: Additive only for Webflow components; Next.js enhancement for preview component

### webcn
- **New Files**:
  - `components/webcn/landing_page/webcn.webflow.io/StylingControlSectionImage.tsx` (implementation)
  - `src/libraries/webcn/components/StylingControlSectionImage.webflow.tsx` (wrapper)
- **Changes**: None to existing files (additive only)

## Backend Requirements

**None** - All components are purely presentational with no backend dependencies.

## Dependencies

### New npm Packages Required

For the screenshot functionality (Next.js only):
```bash
pnpm add html2canvas
pnpm add -D @types/html2canvas
```

**Bundle Impact:**
- `html2canvas` (~500KB) - Only included in Next.js bundle, NOT in Webflow libraries
- No impact on Webflow bundle sizes (Next.js exclusive dependency)

### Existing Dependencies Used
- `lucide-react` (icons) - already in project
- `@/components/ui/*` (shadcn/ui) - already in project
- `@webflow/react`, `@webflow/data-types` - already in project

## Components to Create

### Component 1: ComponentDetailHeaderCentered
- **Path**: `components/registry-dashboard/ComponentDetailHeaderCentered.tsx`
- **Props**: Same as original (ComponentDetailHeaderProps)
- **Styling Changes**:
  - Add `text-center` to text elements
  - Use `flex-col items-center` for vertical stacking
  - Center-align badge and title
  - Optionally hide or center the "Back to Library" button

### Component 2: ComponentDetailHeaderCentered.webflow
- **Path**: `src/libraries/registry-dashboard/components/ComponentDetailHeaderCentered.webflow.tsx`
- **Props**: Identical to original wrapper (supports CMS injection)
- **Name**: "Component Detail Header (Centered)"
- **Group**: "Registry Dashboard"

### Component 3: StylingControlSectionImage
- **Path**: `components/webcn/landing_page/webcn.webflow.io/StylingControlSectionImage.tsx`
- **Props**: Add `imageUrl` prop, keep all text props
- **Changes**:
  - Remove theme animation logic
  - Replace Card content with `<img>` element
  - Add fallback for missing image

### Component 4: StylingControlSectionImage.webflow
- **Path**: `src/libraries/webcn/components/StylingControlSectionImage.webflow.tsx`
- **Props**: Add `props.Image()` for imageUrl, keep all existing props
- **Name**: "webcn Styling Control (Image)"
- **Group**: "webcn Landing"

### Component 5: ComponentDetailPreviewScreenshot (Next.js Only)
- **Path**: `components/registry-dashboard/ComponentDetailPreviewScreenshot.tsx`
- **Props**: Same as ComponentDetailPreviewProps (componentId, previewBaseUrl)
- **New Features**:
  - Add "Screenshot" button in header (Camera icon from lucide-react)
  - Capture preview div with html2canvas
  - Download as PNG with filename: `{componentName}_{libraryKey}.png`
- **No Webflow Wrapper**: This component is NOT deployed to Webflow
- **Usage**: Replace ComponentDetailPreview in `app/(demos)/lander/webcn/component/page.tsx`

## Test Pages

### Test 1: Registry Dashboard Centered Header
- **Path**: `app/(tests)/test-registry-dashboard/page.tsx` (update existing if present, or create new)
- **Tests**:
  - Original ComponentDetailHeader (left-aligned)
  - New ComponentDetailHeaderCentered (centered)
  - Side-by-side comparison
  - Test with/without CMS data
  - Test with/without tags

### Test 2: Webcn Styling Control Image Variant
- **Path**: `app/(tests)/test-webcn-variants/page.tsx` (or add to existing webcn test page)
- **Tests**:
  - Original StylingControlSection (live theme preview)
  - New StylingControlSectionImage (with sample GIF URL)
  - Test with no image (fallback state)
  - Test all text props

### Test 3: ComponentDetailPreviewScreenshot (Already in Production Use)
- **Path**: `app/(demos)/lander/webcn/component/page.tsx` (existing, will be updated)
- **Tests**:
  - Screenshot button renders correctly
  - Screenshot button captures preview area
  - Downloaded file has correct filename format: `{componentName}_{libraryKey}.png`
  - Test with different component IDs
  - Verify screenshot quality (scale: 2)

## Success Criteria

### Webflow Components (Deployed)
- [ ] ComponentDetailHeaderCentered created and displays centered layout
- [ ] ComponentDetailHeaderCentered wrapper deployed to Webflow
- [ ] StylingControlSectionImage created with image prop
- [ ] StylingControlSectionImage wrapper deployed to Webflow
- [ ] Both components deploy successfully to Webflow (no bundle errors)
- [ ] Both components render correctly in Next.js dev server
- [ ] Original components remain unchanged and functional

### Next.js Component (Not Deployed)
- [ ] html2canvas dependency installed
- [ ] ComponentDetailPreviewScreenshot created with screenshot button
- [ ] Screenshot button captures entire preview div
- [ ] Downloaded files have correct filename format: `{componentName}_{libraryKey}.png`
- [ ] Screenshot quality is acceptable (scale: 2)
- [ ] Component used in `app/(demos)/lander/webcn/component/page.tsx`
- [ ] Original ComponentDetailPreview.webflow.tsx remains untouched

### Testing & Documentation
- [ ] Test pages created demonstrating all variants
- [ ] All tests pass locally with `pnpm dev`
- [ ] Documentation updated in scratchpads (update_001.md)

## Open Questions

1. **ComponentDetailHeader Back Button**: Should the "Back to Library" button be:
   - Hidden in centered variant?
   - Centered above the title?
   - Kept in original position?
   - **Decision**: Center it above the title for consistency

2. **StylingControlSection Image Aspect Ratio**: Should the image:
   - Fill container width with auto height?
   - Have a fixed aspect ratio?
   - Use object-fit CSS?
   - **Decision**: Full width with auto height, let Webflow user control aspect ratio via image upload

3. **Component Naming Convention**: Should variants be named:
   - `ComponentNameVariant` (e.g., `ComponentDetailHeaderCentered`)?
   - `ComponentName_Variant` (underscore)?
   - `ComponentNameV2`?
   - **Decision**: Use descriptive suffix (e.g., `Centered`, `Image`) for clarity

## Timeline Estimate

- **Phase 1**: Install Dependencies (5 min)
  - Install html2canvas for screenshot functionality

- **Phase 2**: Create ComponentDetailHeaderCentered (30 min)
  - Implementation component
  - Webflow wrapper
  - Test page

- **Phase 3**: Create StylingControlSectionImage (45 min)
  - Implementation component
  - Webflow wrapper
  - Test page

- **Phase 4**: Create ComponentDetailPreviewScreenshot (30 min)
  - Implementation component (Next.js only, no wrapper)
  - Update app/(demos)/lander/webcn/component/page.tsx
  - Test screenshot functionality

- **Phase 5**: Testing & Deployment (15 min)
  - Local testing in Next.js
  - Build libraries (registry-dashboard, webcn only)
  - Deploy to Webflow
  - Verify in Webflow Designer

**Total**: ~2 hours

## Implementation Order

1. **Install Dependencies**: `pnpm add html2canvas` and `pnpm add -D @types/html2canvas`
2. **Create ComponentDetailHeaderCentered** (simpler - just styling changes)
3. **Create StylingControlSectionImage** (requires logic changes)
4. **Create ComponentDetailPreviewScreenshot** (Next.js only, no deployment)
5. **Update Next.js page** to use screenshot variant
6. **Create comprehensive test pages** for all variants
7. **Test locally** with `pnpm dev`
8. **Build Webflow libraries** with `pnpm library:build registry-dashboard webcn`
9. **Deploy to Webflow** (screenshot component will NOT be included)
10. **Document in update_001.md**

## Notes

### Webflow Components
- Both Webflow variants are **additive** - no changes to existing components
- Maintains backward compatibility
- Users can choose between variants in Webflow Designer
- No breaking changes to existing Webflow sites using original components
- Future enhancements could add more variants (e.g., right-aligned header, video-based styling section)

### Next.js Screenshot Component
- **NOT deployed to Webflow** - exclusively for Next.js environment
- Original `ComponentDetailPreview.webflow.tsx` remains completely untouched
- No impact on Webflow bundle sizes (html2canvas not included in Webflow builds)
- Screenshot functionality only available in Next.js app at `/lander/webcn/component?id=...`
- Downloads screenshots with consistent naming: `{componentName}_{libraryKey}.png`

### Important Distinctions
- **ComponentDetailHeaderCentered** → Deployed to Webflow (has .webflow.tsx wrapper)
- **StylingControlSectionImage** → Deployed to Webflow (has .webflow.tsx wrapper)
- **ComponentDetailPreviewScreenshot** → Next.js ONLY (no .webflow.tsx wrapper)
