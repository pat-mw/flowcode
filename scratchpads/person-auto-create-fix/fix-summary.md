# Fix: "Person profile not found" Error for New Users

## Problem

New users were encountering "Person profile not found" errors when trying to use any feature that required a person profile (posts, profile editing, etc.). This happened because:

1. Better Auth creates a `user` record on registration
2. The `person` record (extended user profile) was only created lazily in `people.getMe`
3. All other endpoints (`posts.list`, `posts.create`, `posts.update`, etc.) threw errors if person didn't exist
4. A new user could register, then immediately try to create a post → error

## Root Cause

**8 different procedures** in the codebase all had this pattern:

```typescript
const person = await db.query.people.findFirst({
  where: eq(people.userId, ctx.userId!),
});

if (!person) {
  throw new Error('Person profile not found'); // ❌ Breaks for new users
}
```

Only `people.getMe` had "get or create" logic.

## Solution

### 1. Created Shared Helper: `getOrCreatePerson`

**File:** `lib/api/helpers/getOrCreatePerson.ts`

This helper implements the "get or create" pattern:
- First, tries to find existing person record
- If not found, auto-creates it from Better Auth user data
- Returns the person record (either existing or newly created)
- **Never throws "Person profile not found" error**

### 2. Updated ALL Routers to Use Helper

**Files Changed:**
- `lib/api/routers/posts.ts` - 6 procedures updated:
  - `posts.list`
  - `posts.getById`
  - `posts.create`
  - `posts.update`
  - `posts.delete`
  - `posts.publish`

- `lib/api/routers/people.ts` - 2 procedures updated:
  - `people.getMe`
  - `people.update`

- `lib/api/routers/auth.ts` - 1 procedure updated:
  - `auth.getSession`

**Total: 9 procedures now use `getOrCreatePerson`**

### 3. Pattern Applied

Every protected procedure that needs person data now uses:

```typescript
// ✅ Get or create person (handles new users gracefully)
const person = await getOrCreatePerson(ctx.userId!);
```

Instead of:

```typescript
// ❌ OLD: Throws error for new users
const person = await db.query.people.findFirst({
  where: eq(people.userId, ctx.userId!),
});

if (!person) {
  throw new Error('Person profile not found');
}
```

## Testing Recommendations

1. **Register a new user** via RegistrationForm
2. **Immediately try to:**
   - View dashboard → should work (calls `posts.list`)
   - Create a post → should work (calls `posts.create`)
   - Edit profile → should work (calls `people.update`)
   - View "Hello User" component → should work (calls `auth.getSession`)

All operations should now succeed without "Person profile not found" errors.

## Architecture Notes

### Why This Approach?

**Option A (rejected):** Create person during registration in Better Auth hooks
- **Problem:** Requires modifying Better Auth configuration, more complex

**Option B (chosen):** Lazy creation via `getOrCreatePerson` helper
- **Benefits:**
  - Simpler - just one shared helper
  - Works even if Better Auth hooks fail
  - Handles edge cases (manual DB inserts, migrations, etc.)
  - Single source of truth for person creation logic

### Database Relationships

```
Better Auth: users table
    ↓ (one-to-one)
Our App: people table (extended profile)
    ↓ (one-to-many)
Our App: posts table (user's blog posts)
```

The `getOrCreatePerson` helper ensures the middle layer (people) always exists when needed.

## Future Considerations

If we add more features that require person data:
1. Always use `getOrCreatePerson(userId)` in protected procedures
2. Never query `people` table directly without handling missing records
3. Consider adding this to the code review checklist

## Related Files

- Helper: `lib/api/helpers/getOrCreatePerson.ts`
- Routers: `lib/api/routers/{posts,people,auth}.ts`
- Database schema: `lib/db/schema/index.ts` (people table definition)
- Better Auth config: `lib/auth/auth.ts`

---

**Date:** 2025-01-03
**Author:** Claude (fixing critical user registration flow bug)
