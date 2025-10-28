# BlogFlow Development Checkpoints

This document tracks major milestones in the BlogFlow project development. Each checkpoint is marked with a git tag that can be used to review the codebase at that specific point in time.

## Quick Reference

| Tag | Date | Phase | Status | Description |
|-----|------|-------|--------|-------------|
| `v1-auth-working-in-webflow` | 2025-10-26 | Phase 5 | ✅ Complete | Authentication system working in Webflow |
| `v2-crud-working-cross-origin` | 2025-10-27 | Phase 6 | ✅ Complete | CRUD operations with bearer token auth |

## How to Use Checkpoints

### View a Checkpoint
```bash
# Check out a specific checkpoint
git checkout v2-crud-working-cross-origin

# Return to latest code
git checkout feat/blogflow-phase3-20251027
```

### View Checkpoint Details
```bash
# Show full tag message and commit details
git show v2-crud-working-cross-origin

# List all tags with messages
git tag -l -n9
```

### Compare Checkpoints
```bash
# See what changed between checkpoints
git diff v1-auth-working-in-webflow v2-crud-working-cross-origin

# List commits between checkpoints
git log v1-auth-working-in-webflow..v2-crud-working-cross-origin --oneline
```

---

## Checkpoint Details

### v1-auth-working-in-webflow

**Date**: 2025-10-26
**Phase**: Phase 5 (Authentication Integration)
**Branch**: `feat/blogflow-phase3-20251027`
**Progress Update**: See `progress/blog-init/update_01.md` - `update_10.md`

#### Summary
Major milestone marking the completion of a full authentication system working end-to-end in Webflow Code Components with Vercel backend.

#### Key Features
- **User Registration**: Email/password signup with form validation
- **User Login**: Secure authentication with Better Auth
- **Session Management**: Persistent sessions with cookie-based auth
- **User Profile Dashboard**: Display authenticated user information
- **Logout Functionality**: Complete session cleanup

#### Technical Implementation
- **Authentication**: Better Auth with Drizzle ORM
- **Database**: PostgreSQL (Supabase)
- **State Management**: Zustand with localStorage persistence
- **API Layer**: oRPC with TanStack Query
- **Forms**: React Hook Form with Zod validation
- **UI Components**: shadcn/ui with Tailwind CSS

#### Components Implemented
- `LoginForm.tsx` / `LoginForm.webflow.tsx`
- `RegistrationForm.tsx` / `RegistrationForm.webflow.tsx`
- `Dashboard.tsx` / `Dashboard.webflow.tsx`
- `lib/stores/authStore.ts` - Global auth state
- `lib/api/routers/auth.ts` - Auth API endpoints

#### Deployment Status
- ✅ Deployed to Vercel
- ✅ Webflow components synchronized
- ✅ Production testing completed

#### Known Limitations at This Checkpoint
- Same-origin authentication only (cookies work in Next.js)
- Cross-origin authentication not yet implemented
- PostEditor component not yet developed

#### Related Documentation
- Architecture: `docs/webflow-nextjs-architecture.md`
- Authentication: `docs/auth-forms-implementation.md`
- oRPC Integration: `docs/orpc-tanstack-query.md`

---

### v2-crud-working-cross-origin

**Date**: 2025-10-27
**Phase**: Phase 6 (Post Editor - Complete)
**Branch**: `feat/blogflow-phase3-20251027`
**Progress Update**: `progress/blog-init/update_12.md`
**Commits**: `e9836e3..441fb93` (9 commits)

#### Summary
Breakthrough milestone solving third-party cookie blocking to enable full CRUD operations from Webflow Shadow DOM components using Better Auth bearer tokens. PostEditorNew component now fully functional in cross-origin environment.

#### Key Features
- **Bearer Token Authentication**: Bypasses third-party cookie restrictions
- **Cross-Origin API Calls**: Webflow → Vercel authentication working
- **Full CRUD Operations**: Create, Read, Update, Delete, Publish posts
- **Session Persistence**: Bearer token stored in localStorage
- **Automatic Slug Deduplication**: Prevents duplicate slug errors
- **Rich Text Editor**: Tiptap integration with formatting toolbar
- **Real-time Feedback**: Loading states, error handling, success messages

#### Technical Breakthrough: Bearer Token Implementation

**Problem Solved**: Modern browsers block third-party cookies by default (Chrome 115+, Safari 16.4+, Firefox 120+). This prevented Webflow components (`webflow.io`) from authenticating with Vercel API (`vercel.app`).

**Solution Architecture**:

1. **Better Auth Bearer Plugin** (`lib/auth/config.ts`)
   ```typescript
   import { bearer } from 'better-auth/plugins';
   export const auth = betterAuth({
     plugins: [bearer()],
   });
   ```

2. **Token Storage** (`lib/token-storage.ts`)
   - Store bearer tokens in domain-specific localStorage
   - Automatic token lifecycle management
   - Cleared on logout

3. **Authorization Headers** (`lib/orpc-client.ts`)
   - All API requests include `Authorization: Bearer <token>`
   - Automatic token retrieval from localStorage
   - Seamless integration with oRPC client

4. **Direct API Calls** (Auth Forms)
   - Call Better Auth API directly to get token in login response
   - Token extracted and stored immediately
   - No separate cross-origin call needed

5. **Session Revalidation** (`lib/stores/authStore.ts`)
   - Include bearer token in session checks
   - Prevents logout on page load
   - Maintains auth state across navigation

#### Components Implemented
- `components/PostEditorNew.tsx` - Full-featured post editor
- `components/PostEditorNew.webflow.tsx` - Webflow wrapper
- `lib/token-storage.ts` - NEW: Token management
- `app/api/auth/get-bearer-token/route.ts` - NEW: Token endpoint

#### API Endpoints
- **Posts Router** (`lib/api/routers/posts.ts`)
  - `posts.list` - List user's posts with filtering
  - `posts.getById` - Fetch single post
  - `posts.create` - Create draft post (with slug deduplication)
  - `posts.update` - Update post content
  - `posts.publish` - Publish post
  - `posts.delete` - Delete post

#### Bug Fixes
1. **Duplicate Slug Constraint**: Automatic `-1`, `-2` suffix generation
2. **Session Revalidation**: Include bearer token in auth checks
3. **Relative API Paths**: Changed to absolute URLs for cross-origin
4. **Token Acquisition**: Direct API calls instead of client wrapper

#### Testing Verified
- ✅ **Same-Origin** (Vercel → Vercel): Cookie-based auth
- ✅ **Cross-Origin** (Webflow → Vercel): Bearer token auth
- ✅ **Create Post**: With auto-incrementing slugs
- ✅ **Update Post**: Real-time saving with feedback
- ✅ **Publish Post**: Status change and timestamp
- ✅ **Delete Post**: With confirmation dialog
- ✅ **Session Persistence**: Token survives page reload
- ✅ **Logout**: Both token and auth state cleared

#### Server Logs Evidence
```
[oRPC] Context created: { hasSession: true, userId: 'ImZJ6...' }
[protectedProcedure] Auth successful, proceeding...
[posts.create] Person lookup: { found: true, personId: 'xPI1...' }
[posts.create] Post created successfully: { id: 'Ai9fW...' }
[oRPC] Handler response: { status: 200, ok: true }
```

#### Request Headers (Verified)
```http
POST /api/orpc/posts/create
Authorization: Bearer tPHxbusrg76OuILwAZ0iLWQGrJJp1A1R
Origin: https://blogflow-three.webflow.io
```

#### Performance Metrics
- **Development Time**: ~4 hours (investigation + implementation)
- **Commits**: 9 commits (iterative with testing)
- **Files Changed**: 11 files
- **Lines Added**: ~400 lines
- **Lines Removed**: ~100 lines (Storage Access API approach)
- **Test Cases**: 14 scenarios verified

#### Security Considerations
- **Token Storage**: localStorage (domain-specific, persists across sessions)
- **Token Expiration**: 7 days (matches session expiration)
- **Transport Security**: HTTPS only (enforced by Better Auth)
- **CORS Configuration**: Limited to trusted origins
- **Server Validation**: Token validated on every request

#### Deployment Status
- ✅ Deployed to Vercel
- ✅ Bearer token authentication working
- ✅ Cross-origin CRUD operations verified
- ⚠️ Webflow components pending CLI availability

#### Known Limitations at This Checkpoint
- **Token Refresh**: No automatic token rotation (7-day expiration)
- **Multi-Tab Sync**: Token updates not broadcast across tabs
- **Token Revocation**: No server-side blacklist (relies on expiration)
- **Mobile Apps**: Web-only solution (native apps need different approach)

#### Future Enhancements
1. Sliding window token refresh mechanism
2. BroadcastChannel API for multi-tab sync
3. Server-side token revocation list
4. Session management UI in dashboard
5. Bearer token success rate analytics

#### Related Documentation
- **Progress Update**: `progress/blog-init/update_12.md` (comprehensive)
- **Better Auth Bearer**: https://www.better-auth.com/docs/plugins/bearer
- **Better Auth Cookies**: https://www.better-auth.com/docs/concepts/cookies
- **GitHub Issue**: better-auth/better-auth#3938

#### Key Lessons Learned
1. **Third-party cookies are unreliable** - Modern browsers block them by default
2. **Bearer tokens are the industry standard** - Better Auth documentation was correct
3. **localStorage is domain-specific** - Token must be stored where it's used
4. **Direct API calls provide more control** - Better than client wrappers for custom flows
5. **Every API call needs auth** - Even session checks require proper credentials
6. **Comprehensive logging is critical** - Identified exact failure points

---

## Development Phases

### Phase 1-4 (Not Tagged)
- Project setup and architecture
- Database schema design
- Component library integration
- Initial Webflow configuration

### Phase 5: Authentication Integration ✅
**Checkpoint**: `v1-auth-working-in-webflow`
- Same-origin authentication working
- User registration and login
- Session management
- Dashboard components

### Phase 6: Post Editor (CRUD) ✅
**Checkpoint**: `v2-crud-working-cross-origin`
- Cross-origin authentication solved
- Bearer token implementation
- Full CRUD operations
- Rich text editor

### Phase 7: Dashboard Components (Upcoming)
**Status**: Not started
- Posts list view
- Post filtering and search
- Bulk operations
- Analytics dashboard

### Phase 8: Publishing Integration (Planned)
**Status**: Not started
- Webflow CMS sync
- Content publishing workflow
- SEO optimization
- Media management

---

## Commit History Between Checkpoints

### v1 → v2 (9 commits)

```
e9836e3 - Cross-origin cookie configuration (sameSite: 'none')
fc53ce4 - Storage Access API implementation (later improved)
a0ba012 - Bearer token generation endpoint
c82270a - Bearer token plugin and client integration
cc05c2f - Direct API calls for token acquisition
193133a - Automatic slug deduplication
026b80b - Absolute URLs for cross-origin requests
5328491 - Bearer token in session revalidation
441fb93 - Progress update 12 documentation
```

**Full Diff**: `git diff v1-auth-working-in-webflow v2-crud-working-cross-origin`

---

## Repository Structure at Each Checkpoint

### v1-auth-working-in-webflow
```
├── components/
│   ├── LoginForm.tsx
│   ├── RegistrationForm.tsx
│   └── Dashboard.tsx
├── src/components/
│   ├── LoginForm.webflow.tsx
│   ├── RegistrationForm.webflow.tsx
│   └── Dashboard.webflow.tsx
├── lib/
│   ├── auth/
│   │   ├── config.ts (cookie-based auth)
│   │   └── client.ts
│   ├── stores/
│   │   └── authStore.ts
│   └── api/
│       └── routers/
│           └── auth.ts
└── docs/
    └── auth-forms-implementation.md
```

### v2-crud-working-cross-origin (Additional)
```
├── components/
│   └── PostEditorNew.tsx              (NEW)
├── src/components/
│   └── PostEditorNew.webflow.tsx      (NEW)
├── lib/
│   ├── auth/
│   │   └── config.ts (+ bearer plugin)
│   ├── token-storage.ts                (NEW)
│   ├── orpc-client.ts (+ bearer headers)
│   └── api/
│       └── routers/
│           └── posts.ts                (NEW)
├── app/api/auth/
│   └── get-bearer-token/
│       └── route.ts                    (NEW)
└── progress/
    └── blog-init/
        └── update_12.md                (NEW)
```

---

## Testing at Each Checkpoint

### v1: Authentication Testing
```bash
# Test authentication flow
1. Navigate to /auth/register
2. Create account
3. Verify redirect to dashboard
4. Check session persistence
5. Test logout
```

### v2: CRUD Testing
```bash
# Test cross-origin operations
1. Log in from Webflow component
2. Verify bearer token in localStorage
3. Create post (check Authorization header)
4. Update post content
5. Publish post
6. Delete post
7. Verify session persists on reload
```

---

## Rollback Instructions

### To Previous Checkpoint
```bash
# Rollback to v1 (authentication only)
git checkout v1-auth-working-in-webflow

# Or create a branch from v1
git checkout -b rollback-to-v1 v1-auth-working-in-webflow
```

### To Latest Development
```bash
# Return to current development branch
git checkout feat/blogflow-phase3-20251027

# Or pull latest changes
git pull origin feat/blogflow-phase3-20251027
```

---

## Notes

- **Checkpoint Naming Convention**: `v{number}-{brief-description}`
- **Tagging Strategy**: Annotated tags with detailed messages
- **Progress Updates**: Each checkpoint has corresponding update in `progress/blog-init/`
- **Branch Strategy**: Features developed in `feat/` branches, checkpoints tagged on merge
- **Tag Stability**: Tags are immutable - do not move or delete after pushing

---

**Last Updated**: 2025-10-27
**Current Checkpoint**: v2-crud-working-cross-origin
**Next Milestone**: Phase 7 - Dashboard Components
