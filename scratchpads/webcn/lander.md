# webcn Landing Page Components - Summary & Best Practices

## Overview

This document summarizes the work completed on the webcn landing page components, best practices discovered, and patterns for future development.

## Components Completed (9 Total)

All webcn landing page components have been made dynamic and properly configured as Webflow Code Components:

1. **Navbar** (`Navbar.tsx` / `Navbar.webflow.tsx`)
2. **Hero** (`Hero.tsx` / `Hero.webflow.tsx`)
3. **Features** (`Features.tsx` / `Features.webflow.tsx`)
4. **ComponentGrid** (`ComponentGrid.tsx` / `ComponentGrid.webflow.tsx`)
5. **DemoSection** (`DemoSection.tsx` / `DemoSection.webflow.tsx`)
6. **VideoSection** (`VideoSection.tsx` / `VideoSection.webflow.tsx`) - **YouTube embed**
7. **StorySection** (`StorySection.tsx` / `StorySection.webflow.tsx`)
8. **BlogCTA** (`BlogCTA.tsx` / `BlogCTA.webflow.tsx`)
9. **Footer** (`Footer.tsx` / `Footer.webflow.tsx`)

## File Structure

```
components/webcn/landing_page/webcn.webflow.io/
├── Hero.tsx                    # Implementation component
├── Features.tsx                # Implementation component
├── ... (other components)
└── webcn-landing.css          # Custom utilities for gradients/animations

src/libraries/webcn/components/
├── Hero.webflow.tsx           # Webflow wrapper
├── Features.webflow.tsx       # Webflow wrapper
└── ... (other wrappers)
```

## Key Architectural Patterns

### 1. Dual-File Pattern

Every component follows this pattern:

**Implementation Component** (`components/webcn/landing_page/webcn.webflow.io/ComponentName.tsx`):
```typescript
'use client'; // Only if using hooks/state

import { ComponentProps } from "...";

export interface ComponentNameProps {
  propName?: string;
  // All props optional with defaults
}

const ComponentName = ({
  propName = "default value",
}: ComponentNameProps) => {
  return (
    <section>
      {/* Implementation */}
    </section>
  );
};

export default ComponentName;
```

**Webflow Wrapper** (`src/libraries/webcn/components/ComponentName.webflow.tsx`):
```typescript
'use client';

import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import ComponentName, { type ComponentNameProps } from '@/components/webcn/landing_page/webcn.webflow.io/ComponentName';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';
import '@/lib/styles/globals.css';
import '@/components/webcn/landing_page/webcn.webflow.io/webcn-landing.css';

export function ComponentNameWrapper({
  propName,
}: ComponentNameProps) {
  return (
    <WebflowProvidersWrapper>
      <ComponentName propName={propName} />
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(ComponentNameWrapper, {
  name: 'webcn Component Name',
  description: 'Clear description for Webflow Designer',
  group: 'webcn Landing',
  props: {
    propName: props.Text({
      name: 'Prop Name',
      defaultValue: 'default value',
      tooltip: 'Help text for Webflow users',
    }),
  },
});
```

### 2. Props Configuration

**Webflow Prop Types:**
- `props.Text()` - String values (titles, descriptions, URLs)
- `props.Boolean()` - Toggle switches (visibility flags)
- `props.Number()` - Numeric values (counts, sizes)
- `props.Variant()` - Dropdown selections (predefined options)

**Best Practices:**
- Always provide `defaultValue` for every prop
- Add helpful `tooltip` text for Webflow users
- Make all props optional (`?:`) in TypeScript interface
- Use sensible defaults that make component work out-of-the-box
- Keep prop names clear and descriptive in Webflow UI

### 3. Provider Wrapping

**CRITICAL:** All Webflow components MUST be wrapped with `WebflowProvidersWrapper`:

```typescript
return (
  <WebflowProvidersWrapper>
    <YourComponent {...props} />
  </WebflowProvidersWrapper>
);
```

**Why:**
- Provides theme context for light/dark mode
- Ensures consistent styling across Shadow DOM boundaries
- Webflow components render in isolated Shadow DOM roots
- React Context doesn't cross Shadow DOM boundaries (use Zustand for cross-component state)

## Theming System

### Custom CSS Utilities (`webcn-landing.css`)

Created custom utilities that use theme CSS variables:

```css
/* Gradients using theme colors */
.bg-gradient-hero { ... }
.bg-gradient-primary { ... }
.bg-gradient-card { ... }

/* Shadows using theme colors */
.shadow-glow { ... }
.shadow-card { ... }

/* Animations */
.animate-glow-pulse { ... }
.animate-fade-up { ... }
.animate-fade-in { ... }
.animate-scale-in { ... }
```

### Color System Rules

**✅ DO:**
- Use semantic theme colors: `bg-background`, `text-foreground`, `border-border`
- Use theme color utilities: `bg-primary`, `text-muted-foreground`, `border-primary/50`
- Use opacity modifiers: `bg-primary/20`, `text-foreground/80`
- Use custom gradients from `webcn-landing.css`

**❌ DON'T:**
- Use hardcoded hex colors: `bg-[#ff0000]`
- Use hardcoded Tailwind colors: `bg-blue-500`, `text-red-600`
- Use hardcoded HSL/RGB: `bg-[hsl(200,50%,50%)]`

**Exception:** Mock UI elements (browser window dots) can use semantic equivalents:
- Red dot: `bg-destructive/50`
- Yellow dot: `bg-accent/50`
- Green dot: `bg-primary/50`

### Theme Color Reference

All components use these semantic colors that adapt to light/dark mode:

```
background, foreground
card, card-foreground
primary, primary-foreground
secondary, secondary-foreground
muted, muted-foreground
accent, accent-foreground
destructive, destructive-foreground
border, input, ring
```

Defined in: `lib/styles/variables/default.css`

## Component-Specific Patterns

### VideoSection - YouTube Embed

Special implementation with click-to-play functionality:

**Features:**
- Pre-loads YouTube thumbnail (no iframe until click)
- Custom play button overlay
- Supports multiple URL formats: `youtube.com/watch?v=`, `youtu.be/`, `embed/`, or video ID
- Loads iframe with autoplay on click
- Gracefully handles missing/invalid URLs

**URL Parsing:**
```typescript
const getYouTubeVideoId = (url: string): string | null => {
  // Handles: youtube.com/watch?v=ID, youtu.be/ID, embed/ID, or just ID
};
```

**Thumbnail API:**
```typescript
const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
```

### State Management

**For Interactive Components:**
- Use `'use client'` directive
- Use React `useState`, `useEffect` hooks normally
- Example: VideoSection uses `useState` for play/pause state

**For Cross-Component State:**
- Use Zustand stores (singleton pattern works across Shadow DOM)
- DON'T use React Context (doesn't cross Shadow DOM boundaries)

## Shadow DOM Compatibility

Webflow Code Components run in isolated Shadow DOM environments:

**❌ DON'T USE:**
- `next/navigation` hooks (`useRouter`, `usePathname`, etc.)
- `next/link` component
- `next/image` component (use `<img>`)
- React Context for cross-component state

**✅ USE:**
- Browser-native navigation: `window.location.href = '/path'`
- Standard HTML: `<a>`, `<img>`, `<button>`
- Zustand for cross-component state
- `fetch()` for API calls

## Import Pattern

Every Webflow wrapper must import these in order:

```typescript
import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import ComponentName, { type ComponentNameProps } from '@/components/...';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';
import '@/lib/styles/globals.css';
import '@/components/webcn/landing_page/webcn.webflow.io/webcn-landing.css';
```

**Note:** `webcn-landing.css` is imported per-component (not in globals) to keep utilities scoped to webcn library.

## Development Workflow

### Adding a New Landing Page Component

1. **Create Implementation Component:**
   ```bash
   components/webcn/landing_page/webcn.webflow.io/NewComponent.tsx
   ```
   - Add `'use client'` if using hooks/state
   - Export interface with optional props
   - Provide default values for all props
   - Use semantic theme colors only

2. **Create Webflow Wrapper:**
   ```bash
   src/libraries/webcn/components/NewComponent.webflow.tsx
   ```
   - Follow the wrapper pattern above
   - Wrap with `WebflowProvidersWrapper`
   - Import both CSS files
   - Define props with `@webflow/data-types`
   - Add to `'webcn Landing'` group

3. **Test Locally:**
   ```bash
   # Test in Next.js app first
   pnpm dev

   # Test Webflow bundle
   pnpm webflow:bundle
   ```

4. **Deploy to Webflow:**
   ```bash
   # Set WEBFLOW_WORKSPACE_API_TOKEN in .env
   pnpm webflow:share
   ```

### Testing Commands

```bash
# Local Next.js development
pnpm dev

# Bundle locally (test webpack compilation)
pnpm webflow:bundle

# Bundle with debug output
pnpm webflow:bundle:debug

# Deploy to Webflow
pnpm webflow:share
```

## Current Color Audit Results

All components audited - **100% semantic colors used**:

```
✅ All gradients: bg-gradient-hero, bg-gradient-primary, bg-gradient-card
✅ All backgrounds: bg-background, bg-primary, bg-secondary, bg-muted
✅ All text: text-foreground, text-primary, text-muted-foreground
✅ All borders: border-border, border-primary
✅ All with opacity modifiers: /10, /20, /30, /50, /80, /90
✅ No hardcoded hex, RGB, or HSL colors
```

Fixed issues:
- DemoSection: `bg-yellow-500/50` → `bg-accent/50`

## Best Practices Summary

### Component Design
1. Make everything configurable via props (text, URLs, visibility)
2. Provide sensible defaults that work out-of-the-box
3. Keep components focused and single-purpose
4. Use semantic HTML elements
5. Add `'use client'` only when necessary (state/effects/handlers)

### Theming
1. Always use semantic theme colors
2. Use custom utilities from `webcn-landing.css` for gradients/shadows
3. Test in both light and dark modes
4. Use opacity modifiers for subtle variations (`/20`, `/50`)
5. Keep custom CSS scoped to specific library (don't pollute globals)

### Webflow Integration
1. Always wrap with `WebflowProvidersWrapper`
2. Import CSS files in every wrapper
3. Use clear, descriptive names for props in Webflow UI
4. Add helpful tooltips for all props
5. Test bundle compilation before deploying

### Performance
1. Pre-load images (YouTube thumbnails)
2. Lazy load heavy content (iframes on click)
3. Use lazy loading for images: `loading="lazy"`
4. Minimize bundle size - keep dependencies lean

## Known Limitations

1. **Shadow DOM Isolation:**
   - React Context doesn't work across components
   - Use Zustand for cross-component state
   - Each component renders in own Shadow DOM root

2. **No Next.js Features:**
   - Can't use Next.js router/navigation
   - Can't use Next.js Image component
   - Can't use Next.js Link component

3. **Environment Variables:**
   - Must use webpack DefinePlugin
   - Only `NEXT_PUBLIC_*` vars work
   - See `webpack.webflow.js`

## Git Commit History

```
112a177 feat: Add functional YouTube embed to VideoSection component
ebdf75e feat: Add proper theming and color system to webcn landing components
9c0af9d feat: Add dynamic props and theming to webcn landing page components
```

## Next Steps / Future Enhancements

### Potential Improvements
1. **Add more video providers:**
   - Vimeo support
   - Wistia support
   - Self-hosted video

2. **Enhanced customization:**
   - Make feature items configurable (currently hardcoded)
   - Make component grid items configurable
   - Add color scheme variants

3. **Performance optimizations:**
   - Add image optimization
   - Implement proper skeleton loading states
   - Add error boundaries

4. **Accessibility:**
   - Audit ARIA labels
   - Test keyboard navigation
   - Add focus indicators

### Component Ideas
- Testimonials section
- Pricing table
- FAQ accordion
- Stats/metrics display
- Newsletter signup
- Social proof section

## Resources

- **Webflow Docs:** https://docs.developers.webflow.com/
- **Theme Variables:** `lib/styles/variables/default.css`
- **Custom Utilities:** `components/webcn/landing_page/webcn.webflow.io/webcn-landing.css`
- **Provider Wrapper:** `lib/webflow/providers.tsx`
- **Local Dev Guide:** `docs/webflow-local-development.md`

## Contact & Support

For questions or issues with webcn components:
1. Check this document first
2. Review example components in `src/libraries/core/components/`
3. Test bundle locally: `pnpm webflow:bundle`
4. Check browser console for errors in Webflow Designer

---

**Last Updated:** 2025-10-30
**Components:** 9/9 completed and tested
**Bundle Status:** ✅ Compiling successfully
**Theme Status:** ✅ All components use semantic colors
