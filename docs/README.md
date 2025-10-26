# Documentation Summary & Key Corrections

## 📚 Complete Document Set

### Core Architecture (200+ pages)
1. **[Main Architecture](computer:///mnt/user-data/outputs/webflow-nextjs-architecture.md)** - Complete system design, tech stack, database schemas
2. **[Sitemap](computer:///mnt/user-data/outputs/sitemap.md)** - All pages, components, and API interactions
3. **[Quick Start Guide](computer:///mnt/user-data/outputs/quick-start-guide.md)** - Step-by-step implementation
4. **[Configuration Reference](computer:///mnt/user-data/outputs/configuration-reference.md)** - All config files and setup

### Specialized Guides
5. **[Advanced Patterns](computer:///mnt/user-data/outputs/advanced-patterns.md)** - Production best practices
6. **[Webflow Routing Guide](computer:///mnt/user-data/outputs/webflow-routing-guide.md)** - Query parameter patterns
7. **[oRPC React Query Guide](computer:///mnt/user-data/outputs/orpc-react-query-correct.md)** ⭐ **NEW** - Correct integration patterns

---

## ⚠️ Critical Corrections Made

### 1. Webflow Routing (Query Parameters vs Dynamic Routes)

**❌ INCORRECT (Initially documented):**
```
/dashboard/posts/new
/dashboard/posts/[id]/edit
```

**✅ CORRECT (Webflow-compatible):**
```
/dashboard/new
/dashboard/edit?post=[id]
```

**Why:** Webflow pages use query parameters, not dynamic path segments (unless using Webflow Cloud).

**Implementation:**
```typescript
// Read query parameter
const postId = useQueryParam('post'); // Returns "123" or null

// Navigate with query parameter
window.location.href = `/dashboard/edit?post=${postId}`;
```

---

### 2. oRPC + React Query Integration

**❌ INCORRECT (Initially documented):**
```typescript
// Don't use React Query hooks directly
import { useQuery } from '@tanstack/react-query';

const { data } = useQuery({
  queryKey: ['posts'],
  queryFn: () => orpc.posts.list(),
});
```

**✅ CORRECT (Use oRPC's query options):**
```typescript
import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc-client';

const { data } = useQuery(
  orpc.posts.list.queryOptions({
    input: { status: 'draft' },
  })
);
```

**Key Points:**
- oRPC provides `.queryOptions()`, `.mutationOptions()`, `.infiniteOptions()`
- Use TanStack Query hooks but with oRPC-generated options
- Query keys are auto-generated via `.key()` and `.queryKey()`

**Setup:**
```typescript
// lib/orpc-client.ts
import { createORPCClient } from '@orpc/client';
import { createTanstackQueryUtils } from '@orpc/tanstack-query';

const client = createORPCClient<Router>(link);
export const orpc = createTanstackQueryUtils(client);
```

---

## 📋 Quick Reference: Correct Patterns

### Query Pattern
```typescript
// List posts
const { data: posts } = useQuery(
  orpc.posts.list.queryOptions({
    input: { status: 'published' },
  })
);

// Get single post with conditional fetch
const { data: post } = useQuery({
  ...orpc.posts.getById.queryOptions({
    input: { id: postId },
  }),
  enabled: !!postId,
});
```

### Mutation Pattern
```typescript
const queryClient = useQueryClient();

const createMutation = useMutation(
  orpc.posts.create.mutationOptions({
    onSuccess: () => {
      // Invalidate using oRPC's key helper
      queryClient.invalidateQueries({
        queryKey: orpc.posts.key(),
      });
    },
  })
);

createMutation.mutate({
  title: 'New Post',
  content: { type: 'doc', content: [] },
});
```

### Infinite Query Pattern
```typescript
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery(
  orpc.posts.list.infiniteOptions({
    input: (pageParam: number | undefined) => ({
      limit: 20,
      offset: pageParam || 0,
    }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      return lastPage.length === 20 ? lastPage[19].id : undefined;
    },
  })
);
```

### Query Key Management
```typescript
// Invalidate all posts queries
queryClient.invalidateQueries({
  queryKey: orpc.posts.key(),
});

// Invalidate specific query
queryClient.invalidateQueries({
  queryKey: orpc.posts.list.key({ input: { status: 'draft' } }),
});

// Update cache directly
queryClient.setQueryData(
  orpc.posts.getById.queryKey({ input: { id: 123 } }),
  (old) => ({ ...old, title: 'Updated' })
);
```

---

## 🏗️ Architecture Overview

### Tech Stack (Final)

**Frontend (Webflow Code Components)**
- React 18+ with TypeScript
- Zustand (state management across Shadow DOM)
- TanStack Query (data fetching)
- oRPC client with `createTanstackQueryUtils`
- Tiptap (rich text editor)
- Tailwind CSS (with Shadow DOM provider)

**Backend (Next.js)**
- Next.js 15 (App Router)
- oRPC (type-safe API layer)
- Better Auth (authentication)
- Drizzle ORM + PostgreSQL
- Webflow API SDK (CMS sync)

### Key Constraints

1. **Shadow DOM Isolation**
   - Each Code Component has separate React root
   - React Context doesn't work across components
   - Solution: Zustand with localStorage

2. **Webflow Routing**
   - Query parameters only (no dynamic segments)
   - Pattern: `/page?param=value`
   - CMS templates are exception: `/blog/[slug]`

3. **oRPC Integration**
   - Don't use React Query directly
   - Use oRPC's `.queryOptions()` and `.mutationOptions()`
   - Provides full type safety and auto-generated keys

---

## 📦 Required Packages

### Backend
```json
{
  "@orpc/server": "^1.10.0",
  "@orpc/client": "^1.10.0",
  "@orpc/tanstack-query": "^1.10.0",
  "better-auth": "^0.9.0",
  "drizzle-orm": "^0.36.0",
  "next": "15.1.0",
  "zod": "^3.23.8"
}
```

### Frontend (Webflow Components)
```json
{
  "@orpc/client": "^1.10.0",
  "@orpc/tanstack-query": "^1.10.0",
  "@tanstack/react-query": "^5.59.0",
  "@tiptap/react": "^2.9.1",
  "@webflow/designer": "^1.0.0",
  "zustand": "^5.0.1"
}
```

---

## 🚀 Getting Started Checklist

### Backend Setup
- [ ] Initialize Next.js project
- [ ] Install oRPC packages (`@orpc/server`, `@orpc/client`)
- [ ] Set up PostgreSQL database
- [ ] Configure Drizzle ORM
- [ ] Set up Better Auth
- [ ] Create oRPC router with procedures
- [ ] Create API route handler
- [ ] Deploy to Vercel

### Frontend Setup
- [ ] Initialize Webflow Components project
- [ ] Install oRPC client packages
- [ ] Install TanStack Query
- [ ] Set up Webpack config
- [ ] Configure Tailwind for Shadow DOM
- [ ] Create oRPC client with `createTanstackQueryUtils`
- [ ] Build Code Components
- [ ] Deploy via Webflow CLI

### Webflow Configuration
- [ ] Create Webflow workspace
- [ ] Set up CMS collections (Posts, People)
- [ ] Configure API token
- [ ] Create pages (login, dashboard, blog)
- [ ] Install Code Components
- [ ] Publish site

---

## 🔑 Key Implementation Examples

### Complete PostEditor Component

See **[oRPC React Query Guide](computer:///mnt/user-data/outputs/orpc-react-query-correct.md)** for the complete implementation with:
- Query parameter handling
- Conditional data fetching
- Create/update mutations
- Auto-save with debouncing
- Error handling
- Optimistic updates

### Complete PostsList Component

Includes:
- Filtered queries with URL state
- Delete and publish mutations
- Cache invalidation
- Pagination
- Loading and error states

---

## 📖 Where to Find Information

| Topic | Document |
|-------|----------|
| Overall architecture | Main Architecture |
| Database schemas | Main Architecture |
| API routes & procedures | Main Architecture, Sitemap |
| Page structure | Sitemap |
| Component breakdown | Sitemap |
| Step-by-step setup | Quick Start Guide |
| All config files | Configuration Reference |
| Production patterns | Advanced Patterns |
| Query parameters | Webflow Routing Guide |
| **oRPC + React Query** | **oRPC React Query Guide** ⭐ |

---

## 🎯 Next Steps

1. **Read the oRPC React Query Guide** - Critical for correct implementation
2. **Review the Sitemap** - Understand all pages and components
3. **Follow Quick Start Guide** - Set up your environment
4. **Reference Webflow Routing Guide** - When implementing navigation
5. **Use Advanced Patterns** - For production-ready code

---

## ⚡ Common Pitfalls to Avoid

### 1. Using Dynamic Routes in Webflow
❌ `/dashboard/edit/123`  
✅ `/dashboard/edit?post=123`

### 2. Manual React Query Setup
❌ `useQuery({ queryKey: ['posts'], queryFn: ... })`  
✅ `useQuery(orpc.posts.list.queryOptions({}))`

### 3. Manual Query Key Management
❌ `queryClient.invalidateQueries({ queryKey: ['posts'] })`  
✅ `queryClient.invalidateQueries({ queryKey: orpc.posts.key() })`

### 4. Assuming React Context Works
❌ Creating Context providers across components  
✅ Using Zustand stores with localStorage

### 5. Forgetting Shadow DOM Styling
❌ Global CSS doesn't work  
✅ Import styles directly in components

---

## 💡 Pro Tips

1. **Use the `enabled` option** for conditional queries
2. **Leverage optimistic updates** for better UX
3. **Prefetch data on hover** for instant navigation
4. **Use Suspense queries** for cleaner loading states
5. **Implement auto-save** with debouncing for editors
6. **Always invalidate queries** after mutations
7. **Use oRPC's error handling** with `isDefinedError`

---

## 📞 Support Resources

- **oRPC Docs**: https://orpc.unnoq.com/
- **Webflow Code Components**: https://developers.webflow.com/code-components
- **TanStack Query**: https://tanstack.com/query/latest
- **Better Auth**: https://www.better-auth.com/
- **Drizzle ORM**: https://orm.drizzle.team/

---

This documentation set provides everything needed to build a production-ready blog platform integrating Webflow Code Components with a Next.js backend, using the correct oRPC patterns and Webflow-compatible routing!

