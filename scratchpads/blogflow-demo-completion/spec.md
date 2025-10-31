# Feature: BlogFlow Demo Completion

## Overview
Complete the BlogFlow blog platform demo by implementing the remaining 3 missing Webflow components. The infrastructure, backend, and test pages all exist - we just need to create the actual Webflow wrapper components for the missing functionality.

## Current State Analysis

### ✅ What's Already Implemented

**Backend (oRPC API):**
- `auth.getSession`, `auth.isAuthenticated` - Authentication endpoints
- `posts.list`, `posts.create`, `posts.update`, `posts.delete`, `posts.publish` - Post management
- Database: `users` (Better Auth), `people` (profiles), `posts` (blog content)

**Webflow Components (in core library):**
- LoginForm.webflow.tsx ✅
- RegistrationForm.webflow.tsx ✅
- PostEditor.webflow.tsx ✅ (wraps PostEditorNew implementation)
- Dashboard.webflow.tsx ✅
- Navigation.webflow.tsx ✅
- HelloUser.webflow.tsx ✅

**Implementation Components:**
- PostEditorNew.tsx ✅ - Full Tiptap editor with oRPC + TanStack Query
- ProtectedRoute.tsx ✅ - Auth guard for protected pages
- Navigation.tsx ✅ - Main navigation component

**Test Pages (placeholders ready):**
- app/(dev)/dashboard/page.tsx - Dashboard home
- app/(dev)/dashboard/posts/page.tsx - Posts list placeholder
- app/(dev)/dashboard/edit/page.tsx - PostEditor (working)
- app/(dev)/profile/page.tsx - Profile editor placeholder
- app/(dev)/blog/page.tsx - Public posts placeholder
- app/(dev)/auth/login/page.tsx - Login page
- app/(dev)/auth/register/page.tsx - Registration page

### ❌ What's Missing

**3 Webflow Components Need to be Created:**

1. **PostsList.webflow.tsx**
   - Location: `src/libraries/core/components/PostsList.webflow.tsx`
   - Purpose: Display user's posts (drafts + published) with filtering, search, and actions
   - Test page: `app/(dev)/dashboard/posts/page.tsx` (placeholder ready)
   - Backend: `posts.list` (already exists)

2. **ProfileEditor.webflow.tsx**
   - Location: `src/libraries/core/components/ProfileEditor.webflow.tsx`
   - Purpose: Edit user profile (displayName, bio, avatar, website)
   - Test page: `app/(dev)/profile/page.tsx` (placeholder ready)
   - Backend: `people.getByUserId`, `people.update` (need to verify existence)

3. **PublicPostsList.webflow.tsx**
   - Location: `src/libraries/core/components/PublicPostsList.webflow.tsx`
   - Purpose: Public blog index showing all published posts
   - Test page: `app/(dev)/blog/page.tsx` (placeholder ready)
   - Backend: `posts.publicList` or `posts.list` with status filter (need to verify)

## Technical Approach

### Library Assignment

**All 3 components → core library** ✅

**Rationale:**
- Core library already contains: LoginForm, RegistrationForm, PostEditor, Dashboard, Navigation
- All 3 missing components are core blog functionality (posts & profile management)
- Share same backend dependencies (posts.*, people.* endpoints)
- Similar component complexity and size to existing core components
- Core library current size: 12MB / 15MB limit (plenty of room)
- No heavy dependencies needed (just forms, lists, basic UI)

**No new library needed.**

### Implementation Strategy

Each component follows the established **two-file pattern:**

1. **Implementation Component** (optional, can be inline)
   - Location: `components/{ComponentName}.tsx` OR inline in wrapper
   - Contains: React logic, state, UI, oRPC queries/mutations

2. **Webflow Wrapper** (required)
   - Location: `src/libraries/core/components/{ComponentName}.webflow.tsx`
   - Pattern:
     ```tsx
     'use client';
     import { declareComponent } from '@webflow/react';
     import { WebflowProvidersWrapper } from '@/lib/webflow/providers';
     import '@/app/globals.css';

     export function {ComponentName}Wrapper() {
       return (
         <WebflowProvidersWrapper>
           <div className="container mx-auto px-4 py-8">
             {/* Implementation here or imported */}
           </div>
         </WebflowProvidersWrapper>
       );
     }

     export default declareComponent({ComponentName}Wrapper, {
       name: '{Component Name}',
       description: '{Description}',
       group: 'BlogFlow',
       props: {},
     });
     ```

### Component Specifications

#### 1. PostsList Component

**Purpose:** Display and manage user's posts (both drafts and published)

**Features:**
- Fetch posts using `posts.list` oRPC endpoint
- Display posts in a list/grid with title, excerpt, status, dates
- Filter by status (all, published, draft)
- Search by title
- Actions: Edit (navigate to /dashboard/edit?post={id}), Delete, Publish
- Show loading and error states
- Empty state when no posts

**Technical Details:**
- Uses: `useQuery` for fetching posts
- Uses: `useMutation` for delete/publish actions
- Uses: `useQueryClient` for cache invalidation
- State: Filter state (all/published/draft), search query
- Navigation: Browser-native `window.location.href` for edit action

**Props:** None (reads from auth context)

#### 2. ProfileEditor Component

**Purpose:** Edit user profile information

**Features:**
- Fetch current profile using `people.getByUserId` oRPC endpoint
- Form fields: displayName, bio, website, avatar URL
- Save button triggers `people.update` mutation
- Show current values from auth store
- Validation (required fields, valid URLs)
- Success/error feedback with toast notifications
- Auto-save on blur OR manual save button

**Technical Details:**
- Uses: `useQuery` for fetching profile
- Uses: `useMutation` for updating profile
- Uses: `useAuthStore` to read current user/person
- Form: Controlled inputs with React state
- Validation: Client-side validation before submit

**Props:** None (reads from auth context)

#### 3. PublicPostsList Component

**Purpose:** Public blog index showing all published posts

**Features:**
- Fetch published posts using `posts.list({ status: 'published' })` or `posts.publicList`
- Display posts with: title, excerpt, author info, published date, cover image
- Pagination (limit/offset)
- Search functionality
- Click post → navigate to full post page (future)
- No authentication required (public access)

**Technical Details:**
- Uses: `useQuery` for fetching posts
- State: Page number, search query
- Pagination: Load more button OR page numbers
- No auth required (public procedure)

**Props:**
- `initialLimit` (number, default: 10) - Posts per page
- `enableSearch` (boolean, default: true) - Show search box

### Backend Requirements

**Need to verify these endpoints exist:**
1. `posts.list({ status, limit, offset, search })` - List posts with filters
2. `posts.publicList({ limit, offset, search })` - Public posts (no auth)
3. `people.getByUserId(userId)` - Get user profile
4. `people.update({ displayName, bio, avatar, website })` - Update profile

**If endpoints are missing:**
- Check: `app/api/[[...route]]/route.ts` for oRPC router
- Check: `server/` directory for backend procedures
- May need to implement missing endpoints before components

### Test Pages Integration

**Replace placeholders in existing test pages:**

1. `app/(dev)/dashboard/posts/page.tsx`
   ```tsx
   import { PostsListWrapper } from '@/src/libraries/core/components/PostsList.webflow';
   // Replace placeholder div with <PostsListWrapper />
   ```

2. `app/(dev)/profile/page.tsx`
   ```tsx
   import { ProfileEditorWrapper } from '@/src/libraries/core/components/ProfileEditor.webflow';
   // Replace placeholder div with <ProfileEditorWrapper />
   ```

3. `app/(dev)/blog/page.tsx`
   ```tsx
   import { PublicPostsListWrapper } from '@/src/libraries/core/components/PublicPostsList.webflow';
   // Replace placeholder div with <PublicPostsListWrapper />
   ```

### Shared Utilities

**Already exist:**
- `@/lib/orpc-client` - oRPC client singleton
- `@/lib/webflow/providers` - WebflowProvidersWrapper for QueryClient + auth
- `@/lib/stores/authStore` - Zustand auth store
- `@/components/ui/*` - shadcn/ui components (Button, Input, Card, etc.)
- `toast` from 'sonner' - Toast notifications

**May need to create:**
- `@/lib/utils/format-date.ts` - Date formatting utility
- `@/lib/utils/truncate-text.ts` - Text truncation for excerpts

## Dependencies

**No new npm packages needed:**
- oRPC client ✅ Already installed
- TanStack Query ✅ Already installed
- Zustand ✅ Already installed
- shadcn/ui components ✅ Already installed
- Sonner (toast) ✅ Already installed

**Bundle size impact:**
- All components are lightweight (forms, lists, basic UI)
- Estimated total size: ~2-3MB additional
- Core library current: 12MB → Final: ~14-15MB (within 15MB limit)

## Success Criteria

**Component Implementation:**
- [ ] PostsList.webflow.tsx created and working
- [ ] ProfileEditor.webflow.tsx created and working
- [ ] PublicPostsList.webflow.tsx created and working
- [ ] All components follow two-file pattern
- [ ] All components use WebflowProvidersWrapper
- [ ] All components use oRPC + TanStack Query pattern

**Functionality:**
- [ ] PostsList displays user's posts correctly
- [ ] PostsList filters work (all/published/draft)
- [ ] PostsList actions work (edit, delete, publish)
- [ ] ProfileEditor loads current profile
- [ ] ProfileEditor saves changes successfully
- [ ] PublicPostsList shows only published posts
- [ ] PublicPostsList pagination works

**Testing:**
- [ ] All test pages in app/(dev)/ render components correctly
- [ ] No console errors in browser
- [ ] Components work in Shadow DOM environment (Webflow-ready)
- [ ] Auth state syncs correctly across components
- [ ] Navigation works with browser-native methods

**Documentation:**
- [ ] Update warm.md if any new patterns discovered
- [ ] Create update_001.md documenting implementation
- [ ] Update features/blog-init/SPECIFICATION.md with completion status

## Implementation Timeline

**Phase 1: Backend Verification (30 min)**
- Check if all required oRPC endpoints exist
- Implement any missing endpoints
- Test endpoints with curl/Postman

**Phase 2: PostsList Component (2-3 hours)**
- Create implementation component or inline
- Create PostsList.webflow.tsx wrapper
- Integrate into test page
- Test filtering, search, actions

**Phase 3: ProfileEditor Component (2-3 hours)**
- Create implementation component or inline
- Create ProfileEditor.webflow.tsx wrapper
- Integrate into test page
- Test form validation, save functionality

**Phase 4: PublicPostsList Component (1-2 hours)**
- Create implementation component or inline
- Create PublicPostsList.webflow.tsx wrapper
- Integrate into test page
- Test pagination, search

**Phase 5: Testing & Polish (1-2 hours)**
- Test all components in browser
- Fix any bugs
- Test cross-component state sync
- Verify Shadow DOM compatibility
- Polish UI/UX

**Total Estimated Time: 6-10 hours**

## Open Questions

1. **Backend Endpoints:**
   - Do `posts.publicList` and `people.*` endpoints exist?
   - Need to check `app/api/[[...route]]/route.ts`

2. **Profile Avatar Upload:**
   - SPECIFICATION.md mentions avatar upload
   - Do we implement file upload or just URL input for MVP?
   - Decision: **URL input for MVP** (simpler, no file storage needed)

3. **Post Deletion:**
   - Soft delete or hard delete?
   - Decision: **Hard delete for MVP** (simpler)

4. **Pagination Strategy:**
   - Infinite scroll or page numbers?
   - Decision: **"Load More" button for MVP** (simpler than full pagination)

## Next Steps

After planning is approved:

1. Verify backend endpoints exist
2. Create PostsList component
3. Create ProfileEditor component
4. Create PublicPostsList component
5. Test all components in app/(dev)/
6. Update documentation
7. Create progress update files

## References

- **Main Spec:** @features/blog-init/SPECIFICATION.md
- **Architecture:** @docs/webflow-nextjs-architecture.md
- **Component Patterns:** @docs/sitemap.md
- **oRPC Patterns:** @docs/orpc-react-query-correct.md
- **Project Conventions:** @CLAUDE.md
- **Library Docs:** @src/libraries/README.md
