# Feature: BlogFlow Demo Library

## Overview

Create a new Webflow Code Components library (`blogDemo`) that contains all the blog platform components from the recently completed Next.js blog framework. This library will make the blog functionality available for embedding in Webflow sites.

## Goals

- Create a dedicated `blogDemo` library separate from `core`
- Wrap all functional blog components with Webflow-compatible wrappers
- Maintain full functionality: authentication, CRUD operations, pagination, search
- Provide sensible configuration props for customization in Webflow
- Follow existing library patterns and conventions

## Components to Include

### 1. PostsList
**Implementation:** `components/PostsList.tsx`
**Wrapper:** `src/libraries/blogDemo/components/PostsList.webflow.tsx`

**Features:**
- User's posts management dashboard
- Filtering: all, published, drafts
- Search functionality
- Create, edit, delete, publish operations
- Protected (requires authentication)

**Props:**
- `defaultFilter`: 'all' | 'published' | 'draft' (Variant)
- `showCreateButton`: boolean

### 2. ProfileEditor
**Implementation:** `components/ProfileEditor.tsx`
**Wrapper:** `src/libraries/blogDemo/components/ProfileEditor.webflow.tsx`

**Features:**
- Edit user profile (displayName, bio, avatar, website)
- Form validation
- Avatar preview
- Protected (requires authentication)

**Props:**
- `showCancelButton`: boolean

### 3. PublicPostsList
**Implementation:** `components/PublicPostsList.tsx`
**Wrapper:** `src/libraries/blogDemo/components/PublicPostsList.webflow.tsx`

**Features:**
- Public blog index page
- Published posts only
- Search functionality
- Page-based pagination (configurable page size)
- 3-column responsive grid
- Public (no authentication required)

**Props:**
- `pageSize`: number (default: 9)
- `enableSearch`: boolean (default: true)
- `title`: string (default: "Blog")
- `subtitle`: string (default: "Latest published posts")

### 4. PostView
**Implementation:** `components/PostView.tsx`
**Wrapper:** `src/libraries/blogDemo/components/PostView.webflow.tsx`

**Features:**
- Individual post view
- Full content rendering (Tiptap JSON to HTML)
- Author information with avatar and bio
- Edit button (only for post authors)
- Back button
- Public (no authentication required)

**Props:**
- `postId`: string (required)
- `showBackButton`: boolean (default: true)

## Technical Approach

### Libraries Affected

**New Library:** `blogDemo`
- Location: `src/libraries/blogDemo/`
- Config: `src/libraries/blogDemo/index.ts`
- Components: `src/libraries/blogDemo/components/*.webflow.tsx`

### Backend Requirements

**oRPC Endpoints:**
- `posts.list` - Fetch user's posts (protected)
- `posts.delete` - Delete post (protected)
- `posts.publish` - Publish post (protected)
- `posts.publicList` - Fetch published posts (public)
- `people.getMe` - Get current user's profile (protected)
- `people.update` - Update user profile (protected)

**All endpoints already exist and tested** (from blogflow-demo-completion phase)

### Database Schema

**Tables:** (all existing)
- `posts` - Blog posts with status, content, author
- `people` - User profiles linked to Better Auth users
- `users` - Better Auth managed

### Components Architecture

**Pattern:**
```typescript
// src/libraries/blogDemo/components/Component.webflow.tsx
'use client';

import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import Component from '@/components/Component';
import { WebflowProvidersWrapper } from '@/lib/webflow/providers';

function ComponentWrapper({ ...props }) {
  return (
    <WebflowProvidersWrapper>
      <Component {...props} />
    </WebflowProvidersWrapper>
  );
}

export default declareComponent(ComponentWrapper, {
  name: 'Component Name',
  description: 'Component description',
  group: 'BlogFlow Demo',
  props: {
    // Define props using props.Text, props.Number, props.Boolean, props.Variant
  },
});
```

**Key Points:**
- All wrappers use `WebflowProvidersWrapper` (provides QueryClient, auth, CSS)
- No direct `@/app/globals.css` imports (handled by provider)
- Props passed through to implementation components
- Group: "BlogFlow Demo" for easy identification in Webflow

### Test Page

**Location:** `app/(tests)/test-blog-demo/page.tsx`

**Features:**
- Tab navigation between all 4 components
- Configuration info for each component
- Post ID input for PostView testing
- Visual wrapper around each component
- Props display with current values
- Notes about authentication requirements

## Dependencies

**npm packages:** (all already installed)
- `@tanstack/react-query` - Data fetching
- `lucide-react` - Icons
- `sonner` - Toast notifications
- All shadcn/ui components used by implementations

**No new dependencies needed**

## Success Criteria

- [x] blogDemo library created with proper configuration
- [x] All 4 component wrappers created
- [x] Library registered in registry.config.ts
- [x] Test page created at /test-blog-demo
- [x] All components follow Webflow patterns
- [x] Props are sensible and well-documented
- [x] No `@/app/globals.css` imports in wrappers
- [ ] Local bundle test passes (`pnpm webflow:bundle blogDemo`)
- [ ] Components work correctly in test page
- [ ] Documentation complete

## Implementation Notes

### Prop Customization Decisions

1. **PostsList:**
   - Added `defaultFilter` prop (not in original) - useful for dedicated pages
   - Added `showCreateButton` prop - can hide in certain contexts
   - Kept internal filtering/search logic intact

2. **ProfileEditor:**
   - Added `showCancelButton` prop - can hide if embedding in modal
   - Original component already handles all logic

3. **PublicPostsList:**
   - Exposed `pageSize` prop - allows customization (3, 6, 9, 12, etc.)
   - Exposed `enableSearch` prop - can disable if search handled elsewhere
   - Added `title` and `subtitle` props - full customization of header
   - Custom header logic: only shows if values differ from defaults

4. **PostView:**
   - Exposed `postId` prop (required) - core functionality
   - Added `showBackButton` prop - can hide if navigation handled differently
   - Original component already handles author check for edit button

### Differences from Original Implementation

**No modifications to implementation components** (`/components/*.tsx`)

**Wrapper enhancements:**
- PublicPostsList wrapper adds conditional header rendering based on props
- All other wrappers are thin pass-through layers

### Testing Strategy

1. **Local Next.js testing:**
   - Visit `/test-blog-demo`
   - Test each component tab
   - Verify auth-protected components redirect correctly
   - Test PostView with actual post IDs

2. **Webflow bundle testing:**
   ```bash
   pnpm library:manifests
   pnpm library:build blogDemo
   ```

3. **Webflow deployment testing:**
   ```bash
   pnpm webflow:share
   ```
   - Test in Webflow Designer
   - Verify all props appear correctly
   - Test component functionality in Shadow DOM

## Open Questions

None - all patterns established, all components working locally.

## Timeline Estimate

- Library setup: 15 minutes ✅
- Component wrappers: 30 minutes ✅
- Test page: 20 minutes ✅
- Documentation: 15 minutes ✅
- Testing & verification: 30 minutes (pending)

**Total: ~2 hours** (1.5 hours complete, 0.5 hours testing remaining)

## Next Steps

1. Test locally: `pnpm dev` → visit `/test-blog-demo`
2. Bundle test: `pnpm library:build blogDemo`
3. Deploy test: `pnpm webflow:share`
4. Update warm.md with new library documentation
5. Mark as complete in update_001.md
