# Build Fixes - TypeScript and ESLint

## Issues Fixed

### 1. DemoSection.webflow.tsx - Invalid `defaultValue` for `props.Link`

**Error:**
```
src/libraries/webcn/components/DemoSection.webflow.tsx(79,7): error TS2353:
Object literal may only specify known properties, and 'defaultValue' does not exist in type 'BaseOptions'.
```

**Fix:**
Removed `defaultValue` from `props.Link` configuration since Link props don't support default values:

```typescript
// ❌ Before
ctaLink: props.Link({
  name: 'CTA Button Link',
  defaultValue: { href: '/demo', target: '_self' },  // Not supported
  tooltip: 'Link for the call-to-action button',
}),

// ✅ After
ctaLink: props.Link({
  name: 'CTA Button Link',
  tooltip: 'Link for the call-to-action button',
}),
```

### 2. getOrCreatePerson.ts - prefer-const ESLint Error

**Error:**
```
./lib/api/helpers/getOrCreatePerson.ts
19:7  Error: 'person' is never reassigned. Use 'const' instead.  prefer-const
```

**Fix:**
Changed `let` to `const` since the variable is never reassigned:

```typescript
// ❌ Before
let person = await db.query.people.findFirst({
  where: eq(people.userId, userId),
});

// ✅ After
const person = await db.query.people.findFirst({
  where: eq(people.userId, userId),
});
```

### 3. Unused Import Warnings

**Fixed in:**
- `lib/api/routers/posts.ts` - Removed unused `people` import (now using `getOrCreatePerson`)
- `lib/api/routers/waitlist.ts` - Removed unused `and` import

## Build Status

✅ **TypeScript compilation passes** (`pnpm exec tsc --noEmit`)
✅ **Next.js build passes** (`pnpm build`)
✅ **All pages compile successfully**
✅ **No TypeScript errors**
✅ **No ESLint errors blocking build**

## Remaining Warnings (Non-blocking)

The following warnings exist but don't block the build:
- Unused variables in component props (prefixed with `_` to indicate intentionally unused)
- `<img>` tags instead of Next.js `<Image />` (acceptable for Webflow components)
- React hook dependency warnings (acceptable in controlled scenarios)

These are typical in a mature codebase and don't affect functionality.

## Related Files

**Core Fix:**
- `lib/api/helpers/getOrCreatePerson.ts` - Shared "get or create person" helper

**Updated Routers:**
- `lib/api/routers/posts.ts` - Uses helper, removed unused import
- `lib/api/routers/people.ts` - Uses helper (including `getByUserId`)
- `lib/api/routers/auth.ts` - Uses helper in `getSession`
- `lib/api/routers/waitlist.ts` - Removed unused import

**Component Fix:**
- `src/libraries/webcn/components/DemoSection.webflow.tsx` - Fixed Link prop configuration

---

**Date:** 2025-01-03
**Status:** ✅ All builds passing
