# BlogFlow - Progress Update 04

**Date**: 2025-10-27
**Phase**: Phase 2A - Critical Bug Fixes & Integration Debugging
**Status**: ✅ COMPLETED
**Git Commits**: c1e9c57, 97a5651, 5698d4f, 5eb8a4b (pushed to feat/blogflow)

## Executive Summary

All critical authentication and database tooling issues resolved. Fixed oRPC v1.10 integration, resolved SSL certificate errors for both production and development, fixed Drizzle Studio connectivity, and corrected Better Auth configuration. Authentication flow now works end-to-end locally and in production.

---

## Critical Issues Resolved

### 1. oRPC v1.10 Integration - 404 Endpoint Errors ✅

**Problem**:
- All oRPC endpoints returning 404 errors
- Login flow failing with `GET /api/orpc/auth/getSession 404`
- Users redirected back to login page after successful authentication

**Root Cause**:
- Route handler using outdated pattern from tRPC/older oRPC versions
- Used `result.matched` conditional instead of oRPC v1.10's destructured response
- Auth forms using GET method instead of POST for procedure calls

**Solution**:
```typescript
// Before (incorrect):
const result = await rpcHandler.handle(request, { context });
return result.matched ? result.response : new Response('Not Found', { status: 404 });

// After (correct for oRPC v1.10):
const { response } = await rpcHandler.handle(request, {
  prefix: '/api/orpc',
  context,
});
return response ?? new Response('Not Found', { status: 404 });
```

**Files Changed**:
- `app/api/orpc/[...path]/route.ts:14-29` - Updated to oRPC v1.10 API pattern
- `components/LoginForm.tsx:125-128` - Changed fetch to use `method: 'POST'`
- `components/RegistrationForm.tsx:156-159` - Changed fetch to use `method: 'POST'`

**Key Learning**: oRPC v1.10's RPCHandler is designed exclusively for RPCLink client, not raw fetch. POST method required for procedures.

---

### 2. Better Auth SSL Certificate Errors in Production ✅

**Problem**:
- Production registration failing with `SELF_SIGNED_CERT_IN_CHAIN` error
- Supabase database connections rejected due to SSL certificate verification

**Initial Attempted Fix** (incorrect):
```typescript
// This didn't work - incompatible with our schema
advanced: {
  generateId: false, // Intended for Supabase UUID compatibility
}
```

**Actual Problem**:
- `generateId: false` tells Better Auth to use database-level UUID defaults
- Our schema uses `text('id').primaryKey()` with no database defaults
- Caused new error: `null value in column "id" violates not-null constraint`

**Final Solution**:
- Removed `generateId` configuration entirely
- Better Auth's default ID generation (nanoid) works perfectly with text PKs
- Database-level SSL config in `lib/db/index.ts:27-29` already handled SSL correctly

**Files Changed**:
- `lib/auth/config.ts:41-47` - Removed deprecated `advanced.generateId` config

**Result**: Authentication now works in production without SSL errors

---

### 3. Drizzle Studio SSL Certificate Errors ✅

**Problem**:
- Running `pnpm db:studio` failed with `self-signed certificate in certificate chain`
- Could not inspect database during development

**Attempted Solutions That Failed**:
1. Adding `ssl: { rejectUnauthorized: false }` to `drizzle.config.ts` dbCredentials
2. Adding `?sslmode=no-verify` query parameter to connection string

**Working Solution**:
```json
// package.json
"db:studio": "NODE_TLS_REJECT_UNAUTHORIZED=0 drizzle-kit studio"
```

**Files Changed**:
- `package.json:14` - Added `NODE_TLS_REJECT_UNAUTHORIZED=0` to db:studio script
- `drizzle.config.ts:12-21` - Simplified back to basic configuration

**Result**: Drizzle Studio now works at https://local.drizzle.studio

---

### 4. Drizzle Package Version Incompatibility ✅

**Problem**:
- `pnpm db:studio` error: `Package subpath './singlestore-core' is not defined`
- Version mismatch between drizzle-kit and drizzle-orm

**Solution**:
- Updated drizzle-orm from 0.36.4 → 0.44.7
- Updated drizzle-kit to latest version

**Files Changed**:
- `package.json` - Updated drizzle dependencies
- `pnpm-lock.yaml` - Lock file updated with new versions

**Result**: Drizzle Studio and all drizzle-kit commands now work correctly

---

## Technical Deep Dives

### oRPC v1.10 Handler Pattern

**Discovery**: oRPC v1.10 uses a different API than tRPC or earlier versions:

```typescript
// OLD PATTERN (tRPC-style):
export async function GET(request: Request) {
  const result = await handler.handle(request);
  if (result.matched) {
    return result.response;
  }
  return new Response('Not Found', { status: 404 });
}

// NEW PATTERN (oRPC v1.10):
async function handleRequest(request: Request) {
  const { response } = await rpcHandler.handle(request, {
    prefix: '/api/orpc',
    context,
  });
  return response ?? new Response('Not Found', { status: 404 });
}

export const GET = handleRequest;
export const POST = handleRequest;
export const HEAD = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
```

**Why This Matters**:
- RPCHandler is designed exclusively for RPCLink client
- Procedures use POST by default, not GET
- The handler returns `{ response }`, not `{ matched, response }`
- Setting prefix in both handler constructor AND handle() call ensures proper routing

### Better Auth ID Generation Strategies

**Three Approaches**:

1. **Default (nanoid)** - ✅ Works with our text PKs:
```typescript
// No config needed - Better Auth generates IDs using nanoid
// Compatible with text('id').primaryKey()
```

2. **Database UUIDs** - ❌ Requires schema changes:
```typescript
// Requires: uuid('id').primaryKey().defaultRandom()
advanced: {
  database: {
    generateId: false
  }
}
```

3. **Custom Generator** - Could work but unnecessary:
```typescript
advanced: {
  database: {
    generateId: () => customIdGenerator()
  }
}
```

**Decision**: Use default nanoid generation - it's simpler and works perfectly.

### SSL Configuration Hierarchy

**For PostgreSQL connections in our stack**:

1. **Runtime Database Connections** (`lib/db/index.ts`):
```typescript
ssl: {
  rejectUnauthorized: false
}
```
Works for: Drizzle ORM queries, Better Auth database operations

2. **Migration Scripts**:
```bash
NODE_TLS_REJECT_UNAUTHORIZED=0 tsx lib/db/migrate.ts
```

3. **Development Server**:
```bash
NODE_TLS_REJECT_UNAUTHORIZED=0 next dev
```

4. **Drizzle Studio**:
```bash
NODE_TLS_REJECT_UNAUTHORIZED=0 drizzle-kit studio
```

**Why Different Approaches**:
- Runtime code can use Pool config
- CLI tools need environment variable override
- Drizzle Studio ignores dbCredentials.ssl config (known issue)

---

## Updated Architecture

### Authentication Flow (Now Working)

```
1. User submits login form
   ↓
2. LoginForm calls Better Auth signIn.email()
   POST /api/auth/sign-in/email
   ↓
3. Better Auth creates session with nanoid ID
   ✓ Inserts into sessions table successfully
   ↓
4. LoginForm fetches person profile
   POST /api/orpc/auth/getSession (was GET, now POST)
   ↓
5. oRPC handler processes request
   ✓ Routes correctly with { response } pattern
   ↓
6. Returns { user, person } data
   ↓
7. Updates Zustand store
   ↓
8. Redirects to /dashboard
```

### Database Tooling Workflow

```
Development:
- pnpm dev → Next.js with NODE_TLS_REJECT_UNAUTHORIZED=0
- pnpm db:studio → Drizzle Studio with SSL override
- pnpm db:migrate → Migrations with SSL override

Production (Vercel):
- Uses POSTGRES_URL from Supabase integration
- Pool-level SSL config in lib/db/index.ts handles certificates
- Better Auth uses default nanoid generation
```

---

## Testing Results

### Local Development ✅
- ✅ Registration flow working
- ✅ Login flow working
- ✅ Session creation successful
- ✅ Person profile creation via afterSignUp callback
- ✅ Auth state persistence in Zustand
- ✅ Protected route navigation
- ✅ Drizzle Studio database inspection

### Production Deployment ✅
- ✅ Vercel deployment successful
- ✅ Supabase SSL connections working
- ✅ Better Auth session creation
- ✅ No generateId warnings or errors

---

## Files Modified

### Critical Fixes
1. **app/api/orpc/[...path]/route.ts** - oRPC v1.10 handler pattern
2. **components/LoginForm.tsx** - POST method for oRPC calls
3. **components/RegistrationForm.tsx** - POST method for oRPC calls
4. **lib/auth/config.ts** - Removed deprecated generateId config
5. **package.json** - Added NODE_TLS_REJECT_UNAUTHORIZED to scripts
6. **drizzle.config.ts** - Simplified to basic configuration

### Dependency Updates
7. **package.json** - Updated drizzle-orm to 0.44.7
8. **pnpm-lock.yaml** - Updated dependencies

---

## Git Commits

```
5eb8a4b - fix: remove deprecated generateId config from Better Auth
5698d4f - fix: add NODE_TLS_REJECT_UNAUTHORIZED to Drizzle Studio script
97a5651 - fix: add SSL configuration to Drizzle Studio
c1e9c57 - fix: resolve authentication and oRPC integration issues
```

---

## Known Issues & Resolutions

### Issue 1: Login Shows GET 405 Method Not Allowed
**Cause**: Browser cached old JavaScript bundle from before POST fix
**Resolution**: Hard refresh (Ctrl+Shift+R) or cleared .next build directory

### Issue 2: Drizzle Studio SSL Config Ignored
**Cause**: drizzle-kit doesn't respect dbCredentials.ssl configuration
**Resolution**: Use NODE_TLS_REJECT_UNAUTHORIZED environment variable

### Issue 3: Better Auth Deprecation Warning
**Cause**: Used `advanced.generateId` instead of `advanced.database.generateId`
**Resolution**: Removed config entirely - default behavior works perfectly

---

## Environment Variables Summary

**Required for Local Development**:
```bash
# Database
POSTGRES_URL=postgresql://...  # From Supabase

# Better Auth
BETTER_AUTH_SECRET=...  # Generated with openssl rand -base64 32
BETTER_AUTH_URL=http://localhost:3000

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED=true

# Public
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**Required for Production (Vercel)**:
```bash
# Automatically set by Supabase integration
POSTGRES_URL=...

# Must manually configure
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://yourdomain.com

# Google OAuth (if using)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED=true
```

---

## Next Steps - Phase 2B Components

Now that authentication is fully working, we can proceed with Phase 2B:

### Components to Implement

1. **Dashboard Component**
   - User stats (total posts, drafts, published)
   - Recent posts list
   - Quick actions (New Post, View Blog)
   - Welcome message with user name

2. **PostsList Component**
   - Filterable post table (All, Published, Drafts)
   - Search functionality
   - CRUD operations (Edit, Delete, Publish/Unpublish)
   - Uses oRPC with TanStack Query

3. **PostEditor Component**
   - Tiptap rich text editor
   - Title and slug fields
   - Publish toggle
   - Auto-save drafts
   - Image upload placeholder

4. **ProfileEditor Component**
   - Edit display name, bio, avatar, website
   - Person profile updates
   - Preview card

5. **PublicPostsList Component**
   - Public blog index
   - Shows only published posts
   - Search and filter
   - Pagination

### Technical Tasks

1. **Implement oRPC Client**
   - Create client with RPCLink
   - Set up TanStack Query utils
   - Configure serialization for native types

2. **Add oRPC Procedures**
   - Posts CRUD endpoints
   - Person profile endpoints
   - Proper authentication middleware

3. **Create Webflow Wrappers** (Phase 2C)
   - .webflow.tsx files for each component
   - Webflow prop definitions
   - Test in Webflow Designer

---

## Lessons Learned

1. **Always check framework version when debugging**: oRPC v1.10 has different patterns than older versions

2. **Environment variables vs config for SSL**: Some tools (like drizzle-kit) ignore config and need env vars

3. **Default behavior often works best**: Better Auth's default ID generation is simpler than trying to use database UUIDs

4. **Browser caching can hide fixes**: Always hard refresh or use incognito when testing authentication changes

5. **Read deprecation warnings carefully**: `generateId` vs `database.generateId` - small difference, big impact

---

## Production Readiness Status

### ✅ Ready for Production
- Authentication (login, registration, sessions)
- Database connections (Supabase with SSL)
- Protected routes and navigation
- Error handling and user feedback
- Build and deployment process

### 🚧 Pending (Phase 2B)
- Dashboard and analytics
- Posts management CRUD
- Rich text editor
- Profile management
- Public blog display

### 📋 Future Phases
- **Phase 2C**: Webflow Code Components
- **Phase 3**: Webflow CMS Integration
- **Phase 4**: Advanced Features (SEO, Analytics, Email)

---

## Developer Notes

### Running Locally
```bash
# Start dev server
pnpm dev

# Open Drizzle Studio
pnpm db:studio

# Run migrations
pnpm db:migrate

# Build for production
pnpm build
```

### Common Issues

**Authentication Loop**:
- Clear browser cache
- Check oRPC endpoint returns POST, not GET
- Verify Better Auth callbacks not throwing errors

**SSL Errors**:
- Ensure NODE_TLS_REJECT_UNAUTHORIZED=0 in all dev scripts
- Check Pool config has ssl.rejectUnauthorized: false

**Drizzle Studio Won't Connect**:
- Use NODE_TLS_REJECT_UNAUTHORIZED=0 in db:studio script
- Don't rely on drizzle.config.ts ssl settings

---

**Update Prepared By**: Claude Code Agent
**Date**: 2025-10-27
**Session Duration**: ~2 hours of debugging and fixes
**Total Commits**: 4
**Lines Changed**: ~100
**Issues Resolved**: 4 critical, 2 minor
