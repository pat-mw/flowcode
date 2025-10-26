# BlogFlow Integration Specification

**Feature**: Complete Blog Platform Integration with Webflow Code Components
**Version**: 1.0.0
**Status**: Ready for Implementation
**Estimated Complexity**: High
**Estimated Duration**: 5-6 weeks

---

## Executive Summary

This specification defines the complete implementation of a full-stack blog platform that integrates Webflow Code Components (frontend) with a Next.js backend, enabling authenticated users to create, edit, and publish blog posts that sync to Webflow CMS for public display.

### Key Capabilities
- User authentication with Better Auth (email/password)
- Rich text blog post editor with Tiptap
- Draft and publish workflow
- Real-time sync to Webflow CMS
- Multi-component state management across Shadow DOM boundaries
- Type-safe API with oRPC + React Query
- Query parameter-based routing (Webflow-compatible)

### Success Criteria
- Users can register, login, and manage their profiles
- Users can create draft posts with rich text content
- Users can publish posts that appear in Webflow CMS
- All components work correctly in Webflow's Shadow DOM environment
- State persists correctly across components and page refreshes
- All implementations follow patterns established in CLAUDE.md

---

## Documentation References

This specification relies heavily on the existing documentation in `./docs`. Implementers should reference these documents throughout development:

### Core Architecture Documents
- **[docs/webflow-nextjs-architecture.md](../docs/webflow-nextjs-architecture.md)** - Complete system design, tech stack, database schemas (1300+ lines)
- **[docs/sitemap.md](../docs/sitemap.md)** - All pages, components, and API interactions (900+ lines)
- **[docs/quick-start-guide.md](../docs/quick-start-guide.md)** - Step-by-step implementation patterns (600+ lines)

### Implementation Guides
- **[docs/orpc-react-query-correct.md](../docs/orpc-react-query-correct.md)** - Correct oRPC + TanStack Query patterns (900+ lines)
- **[docs/webflow-routing-guide.md](../docs/webflow-routing-guide.md)** - Query parameter patterns and navigation (800+ lines)
- **[docs/advanced-patterns.md](../docs/advanced-patterns.md)** - Production best practices (800+ lines)
- **[docs/configuration-reference.md](../docs/configuration-reference.md)** - All config files and setup (800+ lines)

### Project Conventions
- **[CLAUDE.md](../CLAUDE.md)** - Project-specific patterns and conventions

**Important**: Before implementing any component or feature, read the relevant documentation sections to understand established patterns.

---

## Architecture Overview

**Full architecture diagram and details**: See [docs/webflow-nextjs-architecture.md](../docs/webflow-nextjs-architecture.md#architecture-diagram)

### Key Architectural Decisions

1. **oRPC over tRPC**: Using oRPC for simpler setup, better OpenAPI support, and native TanStack Query integration
   - Details: [docs/webflow-nextjs-architecture.md](../docs/webflow-nextjs-architecture.md#key-design-decisions)

2. **Better Auth**: Provides session-based auth with JWT, Drizzle adapter
   - Details: [docs/webflow-nextjs-architecture.md](../docs/webflow-nextjs-architecture.md#authentication-flow)

3. **Tiptap for Rich Text**: Better DX and documentation
   - Details: [docs/webflow-nextjs-architecture.md](../docs/webflow-nextjs-architecture.md#rich-text-editor)

4. **Zustand with localStorage**: Handles Shadow DOM state isolation
   - Details: [docs/webflow-nextjs-architecture.md](../docs/webflow-nextjs-architecture.md#shadow-dom--state-management)

5. **Query Parameters for Routing**: Webflow-compatible routing pattern
   - Details: [docs/webflow-routing-guide.md](../docs/webflow-routing-guide.md)

6. **One-way CMS Sync**: PostgreSQL → Webflow
   - Details: [docs/webflow-nextjs-architecture.md](../docs/webflow-nextjs-architecture.md#webflow-cms-synchronization)

---

## Technology Stack

**Complete package lists**: See [docs/configuration-reference.md](../docs/configuration-reference.md)

### Backend Dependencies
```json
{
  "@orpc/server": "^1.10.0",
  "@orpc/client": "^1.10.0",
  "@orpc/tanstack-query": "^1.10.0",
  "better-auth": "^0.9.0",
  "drizzle-orm": "^0.36.0",
  "pg": "^8.13.1",
  "webflow-api": "^2.0.0",
  "zod": "^3.23.8"
}
```

### Frontend Dependencies
```json
{
  "@orpc/client": "^1.10.0",
  "@orpc/tanstack-query": "^1.10.0",
  "@tanstack/react-query": "^5.59.0",
  "@tiptap/react": "^2.9.1",
  "@tiptap/starter-kit": "^2.9.1",
  "zustand": "^5.0.1",
  "react": "^19.0.0"
}
```

**Full configuration files**: See [docs/configuration-reference.md](../docs/configuration-reference.md)

---

## Database Schema

**Complete schemas with all tables**: See [docs/webflow-nextjs-architecture.md](../docs/webflow-nextjs-architecture.md#database-schema)

### Required Tables Summary

**Auth Tables** (Better Auth managed):
- `users` - User accounts
- `sessions` - Active sessions
- `accounts` - OAuth and password data

**Application Tables**:
- `people` - User profiles (extends auth users)
- `posts` - Blog posts with Tiptap JSON content

**Drizzle configuration**: See [docs/configuration-reference.md](../docs/configuration-reference.md#drizzle-configuration)

---

## API Layer Specification

**Complete router implementation**: See [docs/webflow-nextjs-architecture.md](../docs/webflow-nextjs-architecture.md#api-structure-orpctRPC)

### Required Procedures

#### Auth Router (`auth.*`)
- `auth.register(email, password, name)` - Create new user
- `auth.login(email, password)` - Authenticate user
- `auth.getSession()` - Get current session
- `auth.logout()` - Invalidate session

#### Posts Router (`posts.*`)
- `posts.list({ status?, limit?, offset? })` - List user's posts
- `posts.getById(id)` - Get single post
- `posts.create({ title, content, excerpt, coverImage })` - Create draft
- `posts.update(id, updates)` - Update post
- `posts.delete(id)` - Delete post
- `posts.publish(id)` - Publish to Webflow CMS
- `posts.publicList({ limit?, offset?, search? })` - Public posts (no auth)

#### People Router (`people.*`)
- `people.getByUserId(userId)` - Get profile
- `people.update({ displayName, bio, avatar, website })` - Update profile

**Implementation examples**: See [docs/webflow-nextjs-architecture.md](../docs/webflow-nextjs-architecture.md#option-a-orpc-recommended) and [docs/orpc-react-query-correct.md](../docs/orpc-react-query-correct.md)

---

## Frontend Components

**Complete sitemap with all components**: See [docs/sitemap.md](../docs/sitemap.md)

### Components to Implement

| Component | Location | Purpose | Documentation Reference |
|-----------|----------|---------|------------------------|
| LoginForm | `src/components/LoginForm.webflow.tsx` | User authentication | [sitemap.md - Login Page](../docs/sitemap.md#-login-page) |
| RegistrationForm | `src/components/RegistrationForm.webflow.tsx` | New user signup | [sitemap.md - Register Page](../docs/sitemap.md#-register-page) |
| PostEditor | `src/components/PostEditor.webflow.tsx` | Create/edit posts | [sitemap.md - Edit Post Page](../docs/sitemap.md#-edit-post-page) |
| PostsList | `src/components/PostsList.webflow.tsx` | List user's posts | [sitemap.md - Posts List Page](../docs/sitemap.md#-posts-list-page) |
| Dashboard | `src/components/Dashboard.webflow.tsx` | Dashboard overview | [sitemap.md - Dashboard Home](../docs/sitemap.md#-dashboard-home) |
| ProfileEditor | `src/components/ProfileEditor.webflow.tsx` | Edit user profile | [sitemap.md - Profile Page](../docs/sitemap.md#-profile-page) |
| PublicPostsList | `src/components/PublicPostsList.webflow.tsx` | Public blog index | [sitemap.md - Blog Index](../docs/sitemap.md#-blog-index-page) |

**Component implementation patterns**: See [docs/quick-start-guide.md](../docs/quick-start-guide.md#common-component-patterns)

**Component architecture**: Follow dual-file pattern from [CLAUDE.md](../CLAUDE.md#webflow-code-components-pattern)

---

## State Management

**Complete state management guide**: See [docs/webflow-nextjs-architecture.md](../docs/webflow-nextjs-architecture.md#shadow-dom--state-management) and [docs/advanced-patterns.md](../docs/advanced-patterns.md#shadow-dom-state-management-patterns)

### Required Stores

1. **authStore** (`lib/stores/authStore.ts`)
   - Purpose: Global authentication state
   - Pattern: Zustand with localStorage persistence
   - Reference: [docs/webflow-nextjs-architecture.md - State Management](../docs/webflow-nextjs-architecture.md#shadow-dom--state-management)

2. **Query Client** (`lib/query-client.ts`)
   - Purpose: TanStack Query configuration
   - Pattern: Singleton instance
   - Reference: [docs/orpc-react-query-correct.md - Setup](../docs/orpc-react-query-correct.md#setup)

3. **oRPC Client** (`lib/orpc-client.ts`)
   - Purpose: Type-safe API client
   - Pattern: oRPC with TanStack Query utils
   - Reference: [docs/orpc-react-query-correct.md - Setup](../docs/orpc-react-query-correct.md#setup)

---

## Routing & Navigation

**Complete routing guide**: See [docs/webflow-routing-guide.md](../docs/webflow-routing-guide.md)

### Critical Constraints

**Webflow uses query parameters, NOT dynamic path segments**

✅ **Correct**: `/dashboard/edit?post=123`
❌ **Incorrect**: `/dashboard/edit/123`

### Required Hooks

**useQueryParam Hook** (`hooks/useQueryParam.ts`)
- Purpose: Read query parameters from URL
- Implementation: [docs/webflow-routing-guide.md - Custom Hooks](../docs/webflow-routing-guide.md#custom-hooks-for-query-parameters)
- Usage examples: [docs/sitemap.md - Query Parameter Handling](../docs/sitemap.md#-important-webflow-routing-constraints)

### Navigation Patterns

**All navigation patterns**: See [docs/webflow-routing-guide.md - Navigation Patterns](../docs/webflow-routing-guide.md#navigation-patterns)

---

## Webflow CMS Integration

**Complete sync implementation**: See [docs/webflow-nextjs-architecture.md](../docs/webflow-nextjs-architecture.md#webflow-cms-synchronization)

### Required Functions

**Location**: `lib/webflow-sync.ts`

1. **syncPersonToWebflow(person)**
   - Syncs user profile to Webflow People collection
   - Handles create and update
   - Stores Webflow item ID

2. **syncPostToWebflow(post)**
   - Syncs post to Webflow Posts collection
   - Converts Tiptap JSON to HTML
   - Links to author (person)
   - Stores Webflow item ID

3. **tiptapJsonToHtml(json)**
   - Converts Tiptap content to HTML
   - Use Tiptap's `generateHTML` utility

**Implementation details**: [docs/webflow-nextjs-architecture.md - Webflow CMS Synchronization](../docs/webflow-nextjs-architecture.md#webflow-cms-synchronization)

**CMS collections setup**: [docs/webflow-nextjs-architecture.md - Webflow CMS Collections](../docs/webflow-nextjs-architecture.md#webflow-cms-collections)

---

## Implementation Phases

### Phase 1: Backend Foundation (Week 1)
**Goal**: Set up backend infrastructure

**Tasks**:
1. Initialize Next.js project structure
2. Install and configure dependencies (see [docs/configuration-reference.md](../docs/configuration-reference.md))
3. Set up PostgreSQL database (Vercel Postgres or Neon)
4. Configure Drizzle ORM (see [docs/webflow-nextjs-architecture.md - Database Schema](../docs/webflow-nextjs-architecture.md#database-schema))
5. Create database schema files from specs
6. Set up Better Auth configuration (see [docs/webflow-nextjs-architecture.md - Authentication Flow](../docs/webflow-nextjs-architecture.md#authentication-flow))
7. Create and run initial migrations
8. Set up environment variables (see [docs/configuration-reference.md - Environment Variables](../docs/configuration-reference.md#environment-variables-templates))

**Deliverables**:
- [ ] Next.js project initialized
- [ ] Database connected and migrated
- [ ] Auth configured and working
- [ ] Environment properly configured

**Acceptance Criteria**:
- Database connection works
- Migrations run successfully
- Auth can create and authenticate users
- All dependencies installed correctly

---

### Phase 2: API Layer (Week 1-2)
**Goal**: Build type-safe API with oRPC

**Reference Documentation**:
- [docs/webflow-nextjs-architecture.md - API Structure](../docs/webflow-nextjs-architecture.md#api-structure-orpctRPC)
- [docs/orpc-react-query-correct.md](../docs/orpc-react-query-correct.md)

**Tasks**:
1. Set up oRPC server (see architecture docs)
2. Create base procedures (public, protected)
3. Implement auth router (register, login, getSession, logout)
4. Implement posts router (CRUD + publish)
5. Implement people router (get, update)
6. Create API route handler
7. Test all procedures with Postman/curl

**Deliverables**:
- [ ] oRPC router complete
- [ ] All procedures implemented
- [ ] Middleware working (auth protection)
- [ ] API route handler deployed

**Acceptance Criteria**:
- All auth procedures work
- CRUD operations work for posts
- Authorization checks work correctly
- Type safety end-to-end
- Error handling works

---

### Phase 3: Webflow CMS Setup (Week 2)
**Goal**: Configure Webflow CMS collections

**Reference Documentation**:
- [docs/webflow-nextjs-architecture.md - Webflow CMS Collections](../docs/webflow-nextjs-architecture.md#webflow-cms-collections)

**Tasks**:
1. Create Webflow workspace/site
2. Create Posts CMS collection (see schema in architecture docs)
3. Create People CMS collection (see schema in architecture docs)
4. Generate Webflow API token
5. Create CMS template pages (/blog/[slug])
6. Configure environment variables
7. Test CMS API access

**Deliverables**:
- [ ] CMS collections created with correct fields
- [ ] API access configured
- [ ] Template pages set up

**Acceptance Criteria**:
- Collections match specification in architecture docs
- API token works
- Template pages render correctly
- Can create/update items via API

---

### Phase 4: State Management & Utilities (Week 2-3)
**Goal**: Build shared state and utility libraries

**Reference Documentation**:
- [docs/webflow-nextjs-architecture.md - Shadow DOM & State Management](../docs/webflow-nextjs-architecture.md#shadow-dom--state-management)
- [docs/advanced-patterns.md - State Management Patterns](../docs/advanced-patterns.md#shadow-dom-state-management-patterns)
- [docs/orpc-react-query-correct.md - Setup](../docs/orpc-react-query-correct.md#setup)
- [docs/webflow-routing-guide.md - Custom Hooks](../docs/webflow-routing-guide.md#custom-hooks-for-query-parameters)

**Tasks**:
1. Create authStore (Zustand + localStorage) - use pattern from architecture docs
2. Create query client singleton - use pattern from oRPC docs
3. Set up oRPC client with TanStack Query utils - follow oRPC setup guide
4. Create useQueryParam hook - use implementation from routing guide
5. Create useDebounce hook - use pattern from advanced patterns
6. Create helper utilities (slug generation, etc.)
7. Test state persistence across Shadow DOM

**Deliverables**:
- [ ] Auth store working with localStorage persistence
- [ ] Query client configured correctly
- [ ] oRPC client set up with type safety
- [ ] Hooks created and tested

**Acceptance Criteria**:
- Auth state persists in localStorage
- Auth state syncs across components (test with custom events)
- Query client singleton works
- Hooks work in Webflow environment
- oRPC type safety works end-to-end

---

### Phase 5: Authentication Components (Week 3)
**Goal**: Build login and registration flows

**Reference Documentation**:
- [docs/sitemap.md - Login Page](../docs/sitemap.md#-login-page)
- [docs/sitemap.md - Register Page](../docs/sitemap.md#-register-page)
- [docs/orpc-react-query-correct.md - Mutation Patterns](../docs/orpc-react-query-correct.md#mutation-patterns)
- [docs/quick-start-guide.md - Pattern 2: Interactive Component](../docs/quick-start-guide.md#pattern-2-interactive-component-with-state)
- [CLAUDE.md - Webflow Code Components Pattern](../CLAUDE.md#webflow-code-components-pattern)

**Tasks**:
1. Create LoginForm implementation component
2. Create LoginForm Webflow wrapper (follow dual-file pattern)
3. Create RegistrationForm implementation component
4. Create RegistrationForm Webflow wrapper
5. Test in local Next.js app
6. Deploy to Webflow via CLI
7. Test in Webflow Designer

**Deliverables**:
- [ ] LoginForm component (implementation + wrapper)
- [ ] RegistrationForm component (implementation + wrapper)
- [ ] Both deployed to Webflow

**Acceptance Criteria**:
- Login flow works end-to-end (see sitemap acceptance criteria)
- Registration creates user and person profile
- Auth state updates correctly via authStore
- Redirects work (to /dashboard)
- Errors display correctly
- Components work in Shadow DOM environment
- Follow dual-file pattern from CLAUDE.md

---

### Phase 6: Post Editor Component (Week 3-4)
**Goal**: Build rich text editor with Tiptap

**Reference Documentation**:
- [docs/sitemap.md - Edit Post Page](../docs/sitemap.md#-edit-post-page) - Complete component spec
- [docs/webflow-routing-guide.md - Complete Example](../docs/webflow-routing-guide.md#complete-example-posteditor-component) - Full implementation
- [docs/orpc-react-query-correct.md - Complete Component Examples](../docs/orpc-react-query-correct.md#complete-component-examples)
- [docs/advanced-patterns.md - Rich Text Editor Integration](../docs/advanced-patterns.md#rich-text-editor-integration)
- [CLAUDE.md - Component Development Guidelines](../CLAUDE.md#component-development-guidelines)

**Tasks**:
1. Install Tiptap and extensions
2. Create PostEditor implementation (use examples from docs)
3. Add query parameter handling (`?post=123`)
4. Implement create/edit modes
5. Add auto-save with debouncing (30s)
6. Add manual save
7. Add publish functionality
8. Add delete functionality
9. Create Webflow wrapper with providers
10. Test thoroughly in both modes

**Deliverables**:
- [ ] PostEditor component complete
- [ ] All modes working (create/edit based on query param)
- [ ] Deployed to Webflow

**Acceptance Criteria** (see [docs/sitemap.md](../docs/sitemap.md#-edit-post-page) for complete list):
- Component reads `post` query parameter correctly
- Create mode works without query parameter
- Edit mode fetches and displays existing post
- All rich text formatting works (bold, italic, headings, lists, links, images)
- Auto-save triggers every 30 seconds
- Manual save works correctly
- Publish syncs to Webflow CMS
- Delete removes post from database
- Navigation works correctly after actions
- Error and loading states display correctly

---

### Phase 7: Posts List & Dashboard (Week 4)
**Goal**: Build post management UI

**Reference Documentation**:
- [docs/sitemap.md - Posts List Page](../docs/sitemap.md#-posts-list-page)
- [docs/sitemap.md - Dashboard Home](../docs/sitemap.md#-dashboard-home)
- [docs/orpc-react-query-correct.md - PostsList Component](../docs/orpc-react-query-correct.md#postslist-with-filters)
- [docs/webflow-routing-guide.md - URL State Synchronization](../docs/webflow-routing-guide.md#url-state-synchronization)

**Tasks**:
1. Create PostsList implementation
2. Add filtering (status, search) with URL state
3. Add actions (edit, delete, publish)
4. Create Dashboard implementation
5. Add stats display (parallel queries)
6. Add recent posts list
7. Add quick actions
8. Create Webflow wrappers
9. Deploy to Webflow
10. Test integration

**Deliverables**:
- [ ] PostsList component with filtering
- [ ] Dashboard component with stats
- [ ] Both deployed to Webflow

**Acceptance Criteria** (see [docs/sitemap.md](../docs/sitemap.md) for complete criteria):
- PostsList displays all posts correctly
- Filters work (status, search) and sync with URL
- Actions work (edit navigates with query param, delete confirms, publish syncs)
- Dashboard shows correct stats
- Recent posts display
- Quick actions navigate correctly
- Optimistic updates work for mutations

---

### Phase 8: Profile & Public Components (Week 4-5)
**Goal**: Complete remaining components

**Reference Documentation**:
- [docs/sitemap.md - Profile Page](../docs/sitemap.md#-profile-page)
- [docs/sitemap.md - Blog Index Page](../docs/sitemap.md#-blog-index-page)
- [docs/advanced-patterns.md - Image Upload Handler](../docs/advanced-patterns.md#image-upload-handler)

**Tasks**:
1. Create ProfileEditor implementation
2. Add avatar upload functionality
3. Create PublicPostsList implementation
4. Add pagination
5. Create Webflow wrappers
6. Deploy to Webflow
7. Test integration

**Deliverables**:
- [ ] ProfileEditor component with avatar upload
- [ ] PublicPostsList component with pagination
- [ ] Both deployed to Webflow

**Acceptance Criteria**:
- Profile updates save correctly
- Avatar upload works
- Public list shows only published posts
- Pagination works
- Search works

---

### Phase 9: Webflow Sync Implementation (Week 5)
**Goal**: Complete CMS synchronization

**Reference Documentation**:
- [docs/webflow-nextjs-architecture.md - Webflow CMS Synchronization](../docs/webflow-nextjs-architecture.md#webflow-cms-synchronization)

**Tasks**:
1. Implement syncPersonToWebflow function (see architecture docs for complete code)
2. Implement syncPostToWebflow function (see architecture docs for complete code)
3. Implement Tiptap JSON to HTML converter
4. Test sync end-to-end
5. Handle sync errors gracefully
6. Store Webflow item IDs in database
7. Test update scenarios

**Deliverables**:
- [ ] Sync functions complete and working
- [ ] HTML conversion preserves formatting
- [ ] Error handling complete

**Acceptance Criteria**:
- Person sync creates/updates correctly in Webflow
- Post sync creates/updates correctly in Webflow
- HTML conversion preserves all formatting
- References (author) link correctly
- Errors are caught, logged, and shown to user
- Webflow item IDs are stored in database

---

### Phase 10: Integration Testing & Polish (Week 5-6)
**Goal**: End-to-end testing and refinements

**Reference Documentation**:
- [docs/advanced-patterns.md - Testing Strategies](../docs/advanced-patterns.md#testing-strategies)
- [docs/advanced-patterns.md - Error Handling Patterns](../docs/advanced-patterns.md#error-handling-patterns)
- [docs/advanced-patterns.md - Performance Optimization](../docs/advanced-patterns.md#performance-optimization)

**Tasks**:
1. Test complete user flow (register → create → publish)
2. Test all edge cases
3. Verify error handling (follow patterns from advanced-patterns.md)
4. Performance testing
5. Security audit
6. Fix any bugs found
7. Add loading skeletons
8. Improve error messages
9. Add success notifications
10. Final deployment

**Deliverables**:
- [ ] All flows tested end-to-end
- [ ] All bugs fixed
- [ ] Polish complete (loading states, error messages, success feedback)
- [ ] Production deployment

**Acceptance Criteria**:
- Complete flow works without errors
- All edge cases handled (see Edge Cases section below)
- Performance meets requirements (< 500ms API, < 3s page load)
- Security requirements met (see Security section below)
- UX is polished (clear feedback, loading states, error messages)
- Documentation is complete

---

## Critical Edge Cases & Error Handling

**Complete edge case guide**: See [docs/sitemap.md - Component Specifications](../docs/sitemap.md) and [docs/advanced-patterns.md - Error Handling](../docs/advanced-patterns.md#error-handling-patterns)

### Must Handle

1. **Expired Session**
   - Pattern: [docs/advanced-patterns.md - Session Refresh](../docs/advanced-patterns.md#session-refresh)
   - Behavior: Clear auth state, redirect to login

2. **Unsaved Changes**
   - Pattern: [docs/webflow-routing-guide.md - Navigation with Confirmation](../docs/webflow-routing-guide.md#pattern-4-navigation-with-confirmation)
   - Behavior: Warn before navigation, implement beforeunload

3. **Webflow Sync Failures**
   - Pattern: [docs/advanced-patterns.md - Error Handling](../docs/advanced-patterns.md#api-error-handling)
   - Behavior: Don't mark as published locally, show error, allow retry

4. **Concurrent Edits**
   - Behavior: Last write wins (acceptable for MVP)
   - Future: Implement conflict resolution

5. **Network Offline**
   - Behavior: Detect offline, show indicator, queue mutations

**All edge cases**: See implementation phase documentation references

---

## Performance Requirements

**Complete performance guide**: See [docs/advanced-patterns.md - Performance Optimization](../docs/advanced-patterns.md#performance-optimization)

### Target Metrics
- **API Endpoints**: < 500ms (p95)
- **Page Load**: < 3 seconds (first contentful paint)
- **Auto-save**: < 200ms response time

### Required Optimizations
- Database indexes (see database schema)
- Connection pooling (see [docs/advanced-patterns.md - Database Connection Pooling](../docs/advanced-patterns.md#database-connection-pooling))
- Code splitting (lazy load editor)
- React Query caching (staleTime: 60s, cacheTime: 10min)
- Optimistic updates for mutations

---

## Security Requirements

**Complete security guide**: See [docs/webflow-nextjs-architecture.md - Security Considerations](../docs/webflow-nextjs-architecture.md#security-considerations) and [docs/advanced-patterns.md - Security Best Practices](../docs/advanced-patterns.md#security-best-practices)

### Required Security Measures

- [ ] Passwords hashed with bcrypt (Better Auth default)
- [ ] JWT tokens signed and verified
- [ ] All protected routes check authentication
- [ ] Row-level security (users can only access their own data)
- [ ] All inputs validated with Zod
- [ ] SQL injection prevented (Drizzle ORM)
- [ ] XSS prevented (sanitize HTML - see [docs/advanced-patterns.md](../docs/advanced-patterns.md#input-sanitization))
- [ ] CSRF protection enabled
- [ ] Rate limiting on API routes (see [docs/advanced-patterns.md](../docs/advanced-patterns.md#rate-limiting))
- [ ] HTTPS only in production
- [ ] No sensitive data in logs or client

---

## Testing Requirements

**Complete testing guide**: See [docs/advanced-patterns.md - Testing Strategies](../docs/advanced-patterns.md#testing-strategies)

### Required Tests

**Unit Tests**:
- Auth procedures (register, login, getSession)
- Posts procedures (CRUD + publish)
- Middleware (auth protection)
- Utility functions
- Webflow sync functions

**Integration Tests**:
- Complete auth flow
- Complete post flow (create → save → publish)
- Webflow sync end-to-end
- Cross-component state sync

**Manual Tests**:
- Test in Webflow Designer
- Test on published Webflow site
- Test on mobile devices
- Test all error scenarios

---

## Acceptance Criteria Summary

### Functional Requirements

**Authentication** (see [docs/sitemap.md - Login/Register](../docs/sitemap.md)):
- [ ] Users can register with email/password
- [ ] Users can login with email/password
- [ ] Users can logout
- [ ] Auth state persists across page refreshes
- [ ] Auth state syncs across Shadow DOM components
- [ ] Protected routes redirect to login

**Post Management** (see [docs/sitemap.md - Post Editor](../docs/sitemap.md#-edit-post-page)):
- [ ] Users can create new draft posts
- [ ] Users can edit existing posts
- [ ] Users can save posts manually
- [ ] Posts auto-save every 30 seconds
- [ ] Users can delete their posts
- [ ] Users can publish posts to Webflow CMS
- [ ] Users can only see/edit their own posts

**Rich Text Editing** (see [docs/sitemap.md - Post Editor](../docs/sitemap.md#-edit-post-page)):
- [ ] All text formatting works (bold, italic, underline)
- [ ] Headings work (H1-H3)
- [ ] Lists work (bullet, numbered)
- [ ] Links can be inserted
- [ ] Images can be uploaded and inserted
- [ ] Content persists correctly

**Webflow Integration** (see [docs/webflow-nextjs-architecture.md](../docs/webflow-nextjs-architecture.md#webflow-cms-synchronization)):
- [ ] Posts sync to Webflow CMS on publish
- [ ] People profiles sync to Webflow CMS
- [ ] Content formatting preserved in sync
- [ ] References (author) link correctly
- [ ] Webflow item IDs stored in database

### Non-Functional Requirements

**Performance** (see [docs/advanced-patterns.md - Performance](../docs/advanced-patterns.md#performance-optimization)):
- [ ] API responses < 500ms (p95)
- [ ] Page load < 3 seconds
- [ ] Database queries optimized

**Security** (see [docs/advanced-patterns.md - Security](../docs/advanced-patterns.md#security-best-practices)):
- [ ] All security requirements met (see Security section above)

**Code Quality**:
- [ ] TypeScript strict mode enabled
- [ ] Follows patterns from CLAUDE.md
- [ ] All components use dual-file pattern
- [ ] All API calls use oRPC pattern from docs

---

## Dependencies & Prerequisites

**Complete setup guide**: See [docs/quick-start-guide.md](../docs/quick-start-guide.md) and [docs/configuration-reference.md](../docs/configuration-reference.md)

### External Services Required

1. **Vercel** (or similar) - Hosting
2. **PostgreSQL Database** - Vercel Postgres or Neon
3. **Webflow** - Workspace, site, API token, CMS collections

### Environment Variables

**Complete list**: See [docs/configuration-reference.md - Environment Variables](../docs/configuration-reference.md#environment-variables-templates)

```bash
DATABASE_URL="postgresql://..."
BETTER_AUTH_SECRET="..."
BETTER_AUTH_URL="https://..."
WEBFLOW_API_TOKEN="..."
WEBFLOW_POSTS_COLLECTION_ID="..."
WEBFLOW_PEOPLE_COLLECTION_ID="..."
NEXT_PUBLIC_API_URL="https://..."
```

---

## Success Metrics

### Technical Metrics
- [ ] 99% uptime
- [ ] < 500ms API response time (p95)
- [ ] < 3 second page load time
- [ ] Zero security vulnerabilities
- [ ] < 5% error rate

### User Experience Metrics
- [ ] Users can create a post in < 5 minutes
- [ ] Users can publish a post in < 30 seconds
- [ ] < 3 clicks to any action
- [ ] Clear feedback for all actions

### Code Quality Metrics
- [ ] TypeScript strict mode enabled
- [ ] 100% type coverage
- [ ] Follows all CLAUDE.md patterns
- [ ] All tests passing

---

## Documentation Requirements

### Progress Documentation

Create in `./progress/blog-init/`:
- [ ] Progress update after each phase
- [ ] Decision log for architectural choices
- [ ] Known issues and solutions
- [ ] Deviations from spec (with justification)

**Format**: See feature-coordinator command for progress update template

### Code Documentation

- [ ] Inline comments for complex logic
- [ ] JSDoc comments for public functions
- [ ] README.md with setup instructions

### Updates to Existing Docs

If implementation reveals:
- Gaps in specifications → Update relevant doc in `./docs`
- New patterns → Update CLAUDE.md
- Incorrect information → Fix immediately
- New learnings → Document in progress updates

---

## Future Enhancements (Out of Scope for V1)

See [docs/webflow-nextjs-architecture.md - Future Enhancements](../docs/webflow-nextjs-architecture.md) for complete list:
- Collaboration features
- Advanced content (markdown, embeds)
- Analytics
- SEO enhancements
- Scheduled publishing
- Media management

---

## Conclusion

This specification provides a complete blueprint for implementing the BlogFlow platform by **referencing existing documentation** rather than duplicating it.

**Implementation Strategy**:
1. Read this specification to understand WHAT to build
2. Reference linked documentation for HOW to build it
3. Follow established patterns from CLAUDE.md
4. Create progress updates in `./progress/blog-init/`
5. Update docs when implementation reveals gaps

**Next Step**: Run `/feature-coordinator` command to begin coordinated implementation.

---

## Quick Reference: Key Documentation Links

- **Architecture**: [docs/webflow-nextjs-architecture.md](../docs/webflow-nextjs-architecture.md)
- **Component Specs**: [docs/sitemap.md](../docs/sitemap.md)
- **oRPC Patterns**: [docs/orpc-react-query-correct.md](../docs/orpc-react-query-correct.md)
- **Routing**: [docs/webflow-routing-guide.md](../docs/webflow-routing-guide.md)
- **Advanced Patterns**: [docs/advanced-patterns.md](../docs/advanced-patterns.md)
- **Configuration**: [docs/configuration-reference.md](../docs/configuration-reference.md)
- **Quick Start**: [docs/quick-start-guide.md](../docs/quick-start-guide.md)
- **Conventions**: [CLAUDE.md](../CLAUDE.md)
