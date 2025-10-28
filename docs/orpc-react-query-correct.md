# oRPC + TanStack Query Integration - CORRECT Patterns

> **Last Updated**: Based on working PostEditorNew.tsx implementation (Phase 3 checkpoint v2)
>
> **See Working Example**: `/home/uzo/dev/blogflow/components/PostEditorNew.tsx` (lines 120-232)

## Overview

oRPC provides first-class integration with TanStack Query through `@orpc/tanstack-query`. You use TanStack Query hooks (`useQuery`, `useMutation`, etc.) **with oRPC-generated options** for full type safety and automatic cache management.

## Critical Distinction: oRPC vs Raw Fetch

The key difference between correct and incorrect patterns is **how you call the API**:

### ❌ INCORRECT: Manual fetch() calls (PostEditor.tsx - OLD)

```typescript
// DON'T DO THIS - Manual fetch with process.env
const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/api/orpc/posts/getById`,
  {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: postId }),
  }
);

if (!response.ok) {
  throw new Error('Failed to fetch post');
}

const post = await response.json();
```

**Problems with this approach**:
- ❌ No type safety (TypeScript can't infer response types)
- ❌ Manual error handling (must check response.ok)
- ❌ No automatic retries
- ❌ No caching or cache invalidation
- ❌ Verbose and repetitive
- ❌ Harder to maintain (URL construction, headers, etc.)

### ✅ CORRECT: oRPC with TanStack Query (PostEditorNew.tsx - CURRENT)

```typescript
// DO THIS - Use oRPC's queryOptions with useQuery
const { data: post, isLoading, error } = useQuery(
  orpc.posts.getById.queryOptions({
    input: { id: postId! },
    enabled: isEditMode && !!postId,
    staleTime: 30 * 1000, // 30 seconds
  })
);
```

**Benefits of this approach**:
- ✅ Full type safety (TypeScript infers all types automatically)
- ✅ Automatic error handling (error is properly typed)
- ✅ Automatic retries (configurable)
- ✅ Built-in caching and cache invalidation
- ✅ Concise and readable
- ✅ Easy to maintain (centralized client configuration)

## Key Concept

**You use TanStack Query hooks but with oRPC-generated options:**

```typescript
// ❌ WRONG: Don't create your own queryFn
const { data } = useQuery({
  queryKey: ['posts'],
  queryFn: () => fetch('/api/orpc/posts/list'),
});

// ✅ CORRECT: Use oRPC's queryOptions
const { data } = useQuery(
  orpc.posts.list.queryOptions({
    input: { status: 'draft' },
  })
);
```

---

## Setup

> **Reference Implementation**: See `/home/uzo/dev/blogflow/lib/orpc-client.ts` and `/home/uzo/dev/blogflow/lib/webflow/providers.tsx`

### 1. Install Dependencies

```bash
pnpm add @orpc/server @orpc/client @orpc/tanstack-query @tanstack/react-query
```

### 2. Create oRPC Client with Query Utils

**See**: `/home/uzo/dev/blogflow/lib/orpc-client.ts` (full implementation)

```typescript
// lib/orpc-client.ts
'use client';

import { appRouter, type AppRouter } from '@/lib/api';
import { createORPCClient } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';
import { createTanstackQueryUtils } from '@orpc/tanstack-query';
import type { RouterClient } from '@orpc/server';
import { getToken } from '@/lib/token-storage';

// Validate required environment variable
if (!process.env.NEXT_PUBLIC_API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL is required');
}

/**
 * RPCLink Configuration
 *
 * Handles HTTP transport with:
 * - Cookie-based auth (credentials: 'include')
 * - Bearer token auth (Authorization header)
 * - Automatic serialization/deserialization
 */
const link = new RPCLink({
  url: `${process.env.NEXT_PUBLIC_API_URL}/api/orpc`,

  // Custom fetch with credentials (for Better Auth cookies)
  fetch: (input, init) => {
    return fetch(input, {
      ...init,
      credentials: 'include', // Include cookies in cross-origin requests
    });
  },

  // Custom headers with bearer token (bypasses third-party cookie restrictions)
  headers: () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add bearer token if available (for Webflow cross-origin requests)
    const token = getToken(); // From localStorage
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  },
});

// Create type-safe client with full AppRouter inference
const client: RouterClient<typeof appRouter> = createORPCClient(link);

/**
 * TanStack Query Utilities
 *
 * Adds methods to client:
 * - .queryOptions() - For useQuery
 * - .mutationOptions() - For useMutation
 * - .infiniteOptions() - For useInfiniteQuery
 * - .key() - Generate cache keys
 * - .queryKey() - Full query key
 * - .call() - Direct API call
 */
export const orpc = createTanstackQueryUtils(client);

export type { AppRouter };
```

**Why this pattern?**
- **Dual auth support**: Cookies (for Next.js) + bearer tokens (for Webflow)
- **Cross-origin compatibility**: Works in Webflow Shadow DOM
- **Type safety**: Full AppRouter type inference
- **Centralized config**: All API setup in one place

### 3. Create Bearer Token Storage Utility

**See**: `/home/uzo/dev/blogflow/lib/token-storage.ts` (full implementation)

```typescript
// lib/token-storage.ts
'use client';

const TOKEN_KEY = 'better-auth.bearer-token';

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
}

export function hasToken(): boolean {
  return getToken() !== null;
}
```

**Why bearer tokens?**
- Webflow Shadow DOM blocks third-party cookies
- localStorage works across Shadow DOM boundaries
- Bearer tokens in Authorization header bypass cookie restrictions

### 4. Create QueryClient Factory

**See**: `/home/uzo/dev/blogflow/lib/query-client.ts`

```typescript
// lib/query-client.ts
import { QueryClient } from '@tanstack/react-query';

/**
 * Create QueryClient with oRPC-compatible configuration
 *
 * Configuration optimized for:
 * - Webflow Shadow DOM environments
 * - Cross-origin requests
 * - Better Auth sessions
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Cache data for 1 minute before marking as stale
        staleTime: 60 * 1000,

        // Keep unused data in cache for 10 minutes
        gcTime: 10 * 60 * 1000,

        // Disable window focus refetch (better for Webflow)
        refetchOnWindowFocus: false,

        // Retry failed queries once
        retry: 1,
      },
    },
  });
}
```

### 5. Setup Providers for Webflow

**See**: `/home/uzo/dev/blogflow/lib/webflow/providers.tsx` (full implementation)

```typescript
// lib/webflow/providers.tsx
'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useAuthRevalidation } from '@/hooks/useAuthRevalidation';
import { ThemeProvider } from '@/lib/providers/theme-provider';
import { createQueryClient } from '@/lib/query-client';

/**
 * Singleton QueryClient for Webflow Code Components
 *
 * Ensures shared cache across all components in Shadow DOM
 */
export const webflowQueryClient = createQueryClient();

interface WebflowProvidersWrapperProps {
  children: ReactNode;
}

/**
 * WebflowProvidersWrapper
 *
 * Wraps Webflow Code Components with:
 * - QueryClient for React Query
 * - Theme provider for dark mode
 * - Auth revalidation on mount
 */
export function WebflowProvidersWrapper({ children }: WebflowProvidersWrapperProps) {
  // Revalidate session on mount (ensures login persists)
  useAuthRevalidation();

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <QueryClientProvider client={webflowQueryClient}>
        {children}
      </QueryClientProvider>
    </ThemeProvider>
  );
}
```

**Why singleton QueryClient?**
- Webflow components render in separate Shadow DOM roots
- Singleton ensures shared cache across all components
- Module-level singletons work across Shadow DOM boundaries

---

## Query Patterns

> **Working Examples**: See `/home/uzo/dev/blogflow/components/PostEditorNew.tsx` (lines 120-148)

### ❌ INCORRECT: Manual fetch in useEffect

**From PostEditor.tsx (OLD - lines 103-145)**:

```typescript
// DON'T DO THIS - Manual fetch in useEffect
const [isLoading, setIsLoading] = React.useState(false);
const [error, setError] = React.useState<string | null>(null);

React.useEffect(() => {
  if (!isEditMode || !postId) return;

  const fetchPost = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orpc/posts/getById`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: postId }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch post');
      }

      const post = await response.json();

      setTitle(post.title || '');
      setExcerpt(post.excerpt || '');
      setCoverImage(post.coverImage || '');

      if (editor && post.content) {
        editor.commands.setContent(post.content);
      }
      setContent(post.content);
    } catch (err) {
      console.error('Fetch post error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load post');
    } finally {
      setIsLoading(false);
    }
  };

  fetchPost();
}, [isEditMode, postId, editor]);
```

**Problems**:
- ❌ Manual loading/error state management
- ❌ No type safety on response
- ❌ No automatic retries
- ❌ No caching (refetches every render)
- ❌ Verbose error handling
- ❌ Must manually track dependencies in useEffect

### ✅ CORRECT: oRPC Query with Conditional Fetching

**From PostEditorNew.tsx (CURRENT - lines 120-148)**:

```typescript
// DO THIS - Use oRPC's queryOptions with conditional fetching
const {
  data: post,
  isLoading: isLoadingPost,
  error: fetchError
} = useQuery(
  orpc.posts.getById.queryOptions({
    input: { id: postId! },
    // Only fetch if we have a postId (edit mode)
    enabled: isEditMode && !!postId,
    // Show stale data while refetching
    staleTime: 30 * 1000, // 30 seconds
  })
);

// Populate form when post data loads
React.useEffect(() => {
  if (post) {
    setTitle(post.title || '');
    setExcerpt(post.excerpt || '');
    setCoverImage(post.coverImage || '');
    setContent(post.content as Record<string, unknown>);

    // Set editor content
    if (editor && post.content) {
      editor.commands.setContent(post.content);
    }
  }
}, [post, editor]);
```

**Benefits**:
- ✅ Automatic loading/error state (`isLoadingPost`, `fetchError`)
- ✅ Full type safety (`post` is typed automatically)
- ✅ Automatic retries (configured in QueryClient)
- ✅ Built-in caching (won't refetch if data is fresh)
- ✅ Clean error handling (no try/catch needed)
- ✅ Conditional fetching with `enabled` option
- ✅ Simpler code (data fetching separate from form population)

### Query with Parameters from Props/State

```typescript
import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc-client';

function PostEditor({ postId }: { postId: string }) {
  const { data: post, isLoading } = useQuery(
    orpc.posts.getById.queryOptions({
      input: { id: postId },
    })
  );

  if (isLoading) return <div>Loading...</div>;

  return <div>{post?.title}</div>;
}
```

### Basic List Query

```typescript
function PostsList() {
  const { data: posts, isLoading, error } = useQuery(
    orpc.posts.list.queryOptions({
      input: { status: 'published' },
    })
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {posts?.map(post => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  );
}
```

### Suspense Query

```typescript
import { useSuspenseQuery } from '@tanstack/react-query';

function PostsList() {
  // No loading state needed - Suspense handles it
  const { data: posts } = useSuspenseQuery(
    orpc.posts.list.queryOptions({
      input: { status: 'published' },
    })
  );

  return (
    <div>
      {posts.map(post => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  );
}

// Usage with Suspense boundary
function App() {
  return (
    <Suspense fallback={<div>Loading posts...</div>}>
      <PostsList />
    </Suspense>
  );
}
```

---

## Mutation Patterns

> **Working Examples**: See `/home/uzo/dev/blogflow/components/PostEditorNew.tsx` (lines 154-232)

### ❌ INCORRECT: Manual fetch with Manual State

**From PostEditor.tsx (OLD - lines 148-223)**:

```typescript
// DON'T DO THIS - Manual fetch with manual state management
const [isSaving, setIsSaving] = React.useState(false);

const handleSave = React.useCallback(async (isSilent = false) => {
  if (!title.trim()) {
    if (!isSilent) {
      setError('Title is required');
    }
    return;
  }

  try {
    if (!isSilent) {
      setIsSaving(true);
    }
    setSaveStatus('saving');
    setError(null);

    const endpoint = isEditMode
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/orpc/posts/update`
      : `${process.env.NEXT_PUBLIC_API_URL}/api/orpc/posts/create`;

    const body = isEditMode
      ? { id: postId, title, content, excerpt: excerpt || undefined, coverImage: coverImage || undefined }
      : { title, content, excerpt: excerpt || undefined, coverImage: coverImage || undefined };

    const response = await fetch(endpoint, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error('Failed to save post');
    }

    const savedPost = await response.json();

    // If creating new post, update to edit mode
    if (!isEditMode && savedPost.id) {
      setPostId(savedPost.id);
      setIsEditMode(true);
      if (typeof window !== 'undefined') {
        const newUrl = `${window.location.pathname}?post=${savedPost.id}`;
        window.history.replaceState({}, '', newUrl);
      }
    }

    setSaveStatus('saved');
    setTimeout(() => {
      setSaveStatus(null);
    }, 2000);
  } catch (err) {
    console.error('Save error:', err);
    setSaveStatus('error');
    if (!isSilent) {
      setError(err instanceof Error ? err.message : 'Failed to save post');
    }
  } finally {
    if (!isSilent) {
      setIsSaving(false);
    }
  }
}, [title, content, excerpt, coverImage, isEditMode, postId]);
```

**Problems**:
- ❌ Manual pending state (`isSaving`)
- ❌ Manual error handling with try/catch
- ❌ No type safety on request/response
- ❌ No automatic query invalidation
- ❌ Complex state management
- ❌ Must manually construct endpoint URLs
- ❌ Verbose and error-prone

### ✅ CORRECT: oRPC Mutations with Query Invalidation

**From PostEditorNew.tsx (CURRENT - lines 154-196)**:

```typescript
// DO THIS - Use oRPC's mutationOptions with automatic invalidation
const queryClient = useQueryClient();

// Create post mutation
const createPostMutation = useMutation(
  orpc.posts.create.mutationOptions({
    onSuccess: (newPost) => {
      toast.success('Post created successfully!');

      // Switch to edit mode
      setPostId(newPost.id);
      setIsEditMode(true);

      // Update URL without reload
      if (typeof window !== 'undefined') {
        const newUrl = `${window.location.pathname}?post=${newPost.id}`;
        window.history.replaceState({}, '', newUrl);
      }

      // Invalidate posts list (triggers automatic refetch)
      queryClient.invalidateQueries({ queryKey: orpc.posts.list.key() });
    },
    onError: () => {
      toast.error('Failed to create post');
    },
  })
);

// Update post mutation
const updatePostMutation = useMutation(
  orpc.posts.update.mutationOptions({
    onSuccess: (updatedPost) => {
      // Update cached post data (optimistic update)
      queryClient.setQueryData(
        orpc.posts.getById.queryKey({ input: { id: postId! } }),
        updatedPost
      );

      // Invalidate posts list
      queryClient.invalidateQueries({ queryKey: orpc.posts.list.key() });
    },
    onError: () => {
      toast.error('Failed to save post');
      setSaveStatus('error');
    },
  })
);

// Using the mutations
const handleSave = React.useCallback(async () => {
  if (!title.trim()) {
    toast.error('Title is required');
    return;
  }

  setSaveStatus('saving');

  try {
    if (isEditMode && postId) {
      // Update existing post
      await updatePostMutation.mutateAsync({
        id: postId,
        title,
        content,
        excerpt: excerpt || undefined,
        coverImage: coverImage || undefined,
      });

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(null), 2000);
    } else {
      // Create new post
      await createPostMutation.mutateAsync({
        title,
        content,
        excerpt: excerpt || undefined,
        coverImage: coverImage || undefined,
      });

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(null), 2000);
    }
  } catch {
    // Error already handled by mutation onError
    setSaveStatus('error');
  }
}, [title, content, excerpt, coverImage, isEditMode, postId, updatePostMutation, createPostMutation]);
```

**Benefits**:
- ✅ Automatic pending state (`isPending` on mutation)
- ✅ Clean error handling with `onError` callback
- ✅ Full type safety (request and response types inferred)
- ✅ Automatic query invalidation with `orpc.posts.list.key()`
- ✅ Simple state management (mutation manages its own state)
- ✅ No manual URL construction
- ✅ Clean, readable code
- ✅ Built-in retry logic

### Delete Mutation

**From PostEditorNew.tsx (lines 217-232)**:

```typescript
// Delete post mutation
const deletePostMutation = useMutation(
  orpc.posts.delete.mutationOptions({
    onSuccess: () => {
      toast.success('Post deleted successfully!');

      // Invalidate posts list
      queryClient.invalidateQueries({ queryKey: orpc.posts.list.key() });

      // Navigate back to posts list
      window.location.href = '/dashboard/posts';
    },
    onError: () => {
      toast.error('Failed to delete post');
    },
  })
);

// Usage
const handleDelete = async () => {
  if (!postId) return;

  try {
    await deletePostMutation.mutateAsync({ id: postId });
  } catch {
    // Error already handled by mutation onError
  }
};
```

### Publish Mutation

**From PostEditorNew.tsx (lines 198-214)**:

```typescript
// Publish post mutation
const publishPostMutation = useMutation(
  orpc.posts.publish.mutationOptions({
    onSuccess: () => {
      toast.success('Post published successfully!');

      // Invalidate all post queries
      queryClient.invalidateQueries({ queryKey: orpc.posts.key() });

      // Navigate back to posts list
      window.location.href = '/dashboard/posts';
    },
    onError: () => {
      toast.error('Failed to publish post');
    },
  })
);
```

### Mutation with Optimistic Updates

```typescript
function UpdatePostButton({ post }: { post: Post }) {
  const queryClient = useQueryClient();

  const updateMutation = useMutation(
    orpc.posts.update.mutationOptions({
      onMutate: async (variables) => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries({
          queryKey: orpc.posts.getById.key({ input: { id: post.id } }),
        });

        // Snapshot previous value
        const previousPost = queryClient.getQueryData(
          orpc.posts.getById.queryKey({ input: { id: post.id } })
        );

        // Optimistically update
        queryClient.setQueryData(
          orpc.posts.getById.queryKey({ input: { id: post.id } }),
          { ...post, ...variables }
        );

        return { previousPost };
      },
      onError: (err, variables, context) => {
        // Rollback on error
        if (context?.previousPost) {
          queryClient.setQueryData(
            orpc.posts.getById.queryKey({ input: { id: post.id } }),
            context.previousPost
          );
        }
      },
      onSettled: () => {
        // Always refetch after error or success
        queryClient.invalidateQueries({
          queryKey: orpc.posts.getById.key({ input: { id: post.id } }),
        });
      },
    })
  );

  return (
    <button onClick={() => updateMutation.mutate({ id: post.id, title: 'Updated' })}>
      Update
    </button>
  );
}
```

### Mutation with Error Handling

```typescript
import { isDefinedError } from '@orpc/client';

function PublishPostButton({ postId }: { postId: number }) {
  const publishMutation = useMutation(
    orpc.posts.publish.mutationOptions({
      onError: (error) => {
        // Type-safe error handling
        if (isDefinedError(error)) {
          console.error('Known error:', error.data);
        } else {
          console.error('Unknown error:', error);
        }
      },
      onSuccess: (data) => {
        console.log('Published post:', data);
        window.location.href = `/blog/${data.slug}`;
      },
    })
  );

  return (
    <button onClick={() => publishMutation.mutate({ id: postId })}>
      Publish
    </button>
  );
}
```

---

## Infinite Query Pattern

For pagination with infinite scrolling, use `.infiniteOptions()` with `useInfiniteQuery`:

```typescript
import { useInfiniteQuery } from '@tanstack/react-query';

function InfinitePostsList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(
    orpc.posts.list.infiniteOptions({
      input: (pageParam: number | undefined) => ({
        limit: 20,
        offset: pageParam || 0,
      }),
      initialPageParam: 0,
      getNextPageParam: (lastPage, allPages) => {
        // Return next offset or undefined if no more pages
        return lastPage.length === 20 
          ? allPages.length * 20 
          : undefined;
      },
    })
  );

  return (
    <div>
      {data?.pages.map((page, i) => (
        <div key={i}>
          {page.map(post => (
            <div key={post.id}>{post.title}</div>
          ))}
        </div>
      ))}
      
      {hasNextPage && (
        <button 
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? 'Loading more...' : 'Load More'}
        </button>
      )}
    </div>
  );
}
```

---

## Loading States and Error Handling

> **Working Example**: See `/home/uzo/dev/blogflow/components/PostEditorNew.tsx` (lines 396-427, 432-436)

### ❌ INCORRECT: Manual State Management

**From PostEditor.tsx (OLD)**:

```typescript
// DON'T DO THIS - Manual loading/error state
const [isLoading, setIsLoading] = React.useState(false);
const [isSaving, setIsSaving] = React.useState(false);
const [error, setError] = React.useState<string | null>(null);

// Loading state
if (isLoading) {
  return (
    <Card>
      <CardContent>
        <div>Loading post...</div>
      </CardContent>
    </Card>
  );
}

// Error display
{error && (
  <div className="error">
    {error}
  </div>
)}
```

**Problems**:
- ❌ Must manually manage loading state
- ❌ Must manually manage error state
- ❌ No separation between query loading and mutation pending
- ❌ Error state persists even after retry

### ✅ CORRECT: Automatic State from oRPC

**From PostEditorNew.tsx (CURRENT - lines 396-427)**:

```typescript
// DO THIS - Use automatic state from queries/mutations
const {
  data: post,
  isLoading: isLoadingPost,
  error: fetchError
} = useQuery(
  orpc.posts.getById.queryOptions({
    input: { id: postId! },
    enabled: isEditMode && !!postId,
  })
);

// Separate mutation states
const createPostMutation = useMutation(...);
const updatePostMutation = useMutation(...);
const publishPostMutation = useMutation(...);
const deletePostMutation = useMutation(...);

// Combined saving state (lines 432-436)
const isSaving =
  createPostMutation.isPending ||
  updatePostMutation.isPending ||
  publishPostMutation.isPending ||
  deletePostMutation.isPending;

// Loading state
if (isLoadingPost) {
  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardContent className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading post...</p>
        </div>
      </CardContent>
    </Card>
  );
}

// Error state
if (fetchError) {
  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardContent className="flex items-center justify-center py-16">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to load post</p>
          <Button onClick={() => window.location.href = '/dashboard/posts'}>
            Back to Posts
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Use isSaving to disable buttons
<Button onClick={handleSave} disabled={isSaving || !title.trim()}>
  {isSaving ? 'Saving...' : 'Save Draft'}
</Button>
```

**Benefits**:
- ✅ Automatic loading state from `isLoading` (query-specific)
- ✅ Automatic error state from `error` (typed!)
- ✅ Separate pending states for each mutation (`isPending`)
- ✅ Easy to combine multiple mutation states
- ✅ Error state automatically clears on retry

## Query Key Management

> **Working Example**: See `/home/uzo/dev/blogflow/components/PostEditorNew.tsx` (lines 169-189)

oRPC generates query keys automatically with `.key()` and `.queryKey()` methods.

### ❌ INCORRECT: Manual Query Keys

```typescript
// DON'T DO THIS - Manual query keys
queryClient.invalidateQueries({
  queryKey: ['posts', 'list'],
});

queryClient.setQueryData(
  ['posts', 'getById', postId],
  updatedPost
);
```

**Problems**:
- ❌ Easy to get key structure wrong
- ❌ No type safety
- ❌ Hard to maintain (keys scattered throughout code)

### ✅ CORRECT: oRPC Key Helpers

**From PostEditorNew.tsx (CURRENT)**:

```typescript
import { useQueryClient } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc-client';

function PostEditor() {
  const queryClient = useQueryClient();

  // Invalidate ALL posts queries (lines 170, 189, 205, 223)
  queryClient.invalidateQueries({ queryKey: orpc.posts.key() });

  // Invalidate specific list query
  queryClient.invalidateQueries({
    queryKey: orpc.posts.list.key()
  });

  // Invalidate specific post by ID
  queryClient.invalidateQueries({
    queryKey: orpc.posts.getById.key({ input: { id: postId! } }),
  });

  // Update cached post data (lines 183-186)
  queryClient.setQueryData(
    orpc.posts.getById.queryKey({ input: { id: postId! } }),
    updatedPost
  );

  // Invalidate only regular queries (not infinite)
  queryClient.invalidateQueries({
    queryKey: orpc.posts.key({ type: 'query' }),
  });
}
```

**Benefits**:
- ✅ Automatic key generation (never get it wrong)
- ✅ Full type safety (TypeScript validates inputs)
- ✅ Easy to maintain (centralized in oRPC client)
- ✅ Consistent across codebase

### Key Generation Methods

```typescript
// orpc.posts.key() - Matches ALL posts queries
// Useful for invalidating everything posts-related
queryClient.invalidateQueries({ queryKey: orpc.posts.key() });

// orpc.posts.list.key() - Matches all "list" queries
// Useful for invalidating all list queries regardless of input
queryClient.invalidateQueries({ queryKey: orpc.posts.list.key() });

// orpc.posts.list.key({ input: { status: 'draft' } }) - Specific list query
// Matches only list queries with this exact input
queryClient.invalidateQueries({
  queryKey: orpc.posts.list.key({ input: { status: 'draft' } })
});

// orpc.posts.getById.queryKey({ input: { id: '123' } }) - Full key for setQueryData
// Use for directly setting cache data
queryClient.setQueryData(
  orpc.posts.getById.queryKey({ input: { id: '123' } }),
  updatedPost
);
```

---

## Complete Component Examples

### PostEditor with Create/Update (FULL WORKING EXAMPLE)

> **See Complete Implementation**: `/home/uzo/dev/blogflow/components/PostEditorNew.tsx` (697 lines)
>
> This is a simplified version. The full implementation includes:
> - Tiptap rich text editor with toolbar
> - Auto-save with 30-second debounce
> - Publish/delete functionality
> - Loading/error states
> - shadcn/ui components

**Simplified version showing core oRPC patterns**:

```typescript
'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { orpc } from '@/lib/orpc-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function PostEditorNew() {
  const queryClient = useQueryClient();

  // Read post ID from URL
  const [postId, setPostId] = React.useState<string | null>(null);
  const [isEditMode, setIsEditMode] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('post');
      setPostId(id);
      setIsEditMode(!!id);
    }
  }, []);

  // Form state
  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState<Record<string, unknown>>({
    type: 'doc',
    content: [],
  });

  // Setup Tiptap editor
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit],
    content: '',
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      setContent(json);
    },
  });

  // ============================================================================
  // oRPC QUERY: Fetch post data in edit mode
  // ============================================================================
  const { data: post, isLoading: isLoadingPost, error: fetchError } = useQuery(
    orpc.posts.getById.queryOptions({
      input: { id: postId! },
      enabled: isEditMode && !!postId,
      staleTime: 30 * 1000,
    })
  );

  // Populate form when post loads
  React.useEffect(() => {
    if (post) {
      setTitle(post.title || '');
      setContent(post.content as Record<string, unknown>);
      if (editor && post.content) {
        editor.commands.setContent(post.content);
      }
    }
  }, [post, editor]);

  // ============================================================================
  // oRPC MUTATIONS
  // ============================================================================

  // Create mutation
  const createPostMutation = useMutation(
    orpc.posts.create.mutationOptions({
      onSuccess: (newPost) => {
        toast.success('Post created successfully!');
        setPostId(newPost.id);
        setIsEditMode(true);

        // Update URL
        if (typeof window !== 'undefined') {
          const newUrl = `${window.location.pathname}?post=${newPost.id}`;
          window.history.replaceState({}, '', newUrl);
        }

        // Invalidate posts list
        queryClient.invalidateQueries({ queryKey: orpc.posts.list.key() });
      },
      onError: () => {
        toast.error('Failed to create post');
      },
    })
  );

  // Update mutation
  const updatePostMutation = useMutation(
    orpc.posts.update.mutationOptions({
      onSuccess: (updatedPost) => {
        // Update cache
        queryClient.setQueryData(
          orpc.posts.getById.queryKey({ input: { id: postId! } }),
          updatedPost
        );

        // Invalidate list
        queryClient.invalidateQueries({ queryKey: orpc.posts.list.key() });
      },
      onError: () => {
        toast.error('Failed to save post');
      },
    })
  );

  // ============================================================================
  // SAVE HANDLER
  // ============================================================================
  const handleSave = React.useCallback(async () => {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    try {
      if (isEditMode && postId) {
        await updatePostMutation.mutateAsync({
          id: postId,
          title,
          content,
        });
      } else {
        await createPostMutation.mutateAsync({
          title,
          content,
        });
      }
    } catch {
      // Error already handled by mutation onError
    }
  }, [title, content, isEditMode, postId, updatePostMutation, createPostMutation]);

  // ============================================================================
  // RENDER
  // ============================================================================
  const isPending = createPostMutation.isPending || updatePostMutation.isPending;

  // Loading state
  if (isLoadingPost) {
    return <div>Loading post...</div>;
  }

  // Error state
  if (fetchError) {
    return (
      <div>
        <p>Failed to load post</p>
        <Button onClick={() => window.location.href = '/dashboard/posts'}>
          Back to Posts
        </Button>
      </div>
    );
  }

  // Main editor
  return (
    <div className="post-editor">
      <Input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Post title..."
      />

      <EditorContent editor={editor} />

      <Button onClick={handleSave} disabled={isPending || !title.trim()}>
        {isPending ? 'Saving...' : 'Save Draft'}
      </Button>
    </div>
  );
}
```

**Key Patterns Demonstrated**:
1. ✅ Conditional query fetching with `enabled` option
2. ✅ Separate mutations for create/update with type safety
3. ✅ Query invalidation after mutations
4. ✅ Cache updates with `setQueryData`
5. ✅ Loading and error state handling
6. ✅ Combined pending state from multiple mutations
7. ✅ Toast notifications in mutation callbacks
8. ✅ URL state management after creation

### PostsList with Filters

```typescript
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc-client';
import { useQueryParams } from '@/hooks/useQueryParams';

interface Filters {
  status: string;
  page: number;
}

export function PostsList() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useQueryParams<Filters>({
    status: 'all',
    page: 1,
  });

  // Fetch posts with filters
  const { data: posts, isLoading } = useQuery(
    orpc.posts.list.queryOptions({
      input: {
        status: filters.status !== 'all' ? filters.status : undefined,
        limit: 20,
        offset: (filters.page - 1) * 20,
      },
    })
  );

  // Delete mutation
  const deleteMutation = useMutation(
    orpc.posts.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.posts.key() });
      },
    })
  );

  // Publish mutation
  const publishMutation = useMutation(
    orpc.posts.publish.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.posts.key() });
      },
    })
  );

  const handleDelete = (postId: number) => {
    if (confirm('Are you sure you want to delete this post?')) {
      deleteMutation.mutate({ id: postId });
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div className="filters">
        <select
          value={filters.status}
          onChange={(e) => setFilters({ status: e.target.value, page: 1 })}
        >
          <option value="all">All</option>
          <option value="draft">Drafts</option>
          <option value="published">Published</option>
        </select>
      </div>

      <div className="posts-list">
        {posts?.map(post => (
          <div key={post.id} className="post-item">
            <h3>{post.title}</h3>
            <span className="status">{post.status}</span>
            
            <div className="actions">
              <a href={`/dashboard/edit?post=${post.id}`}>Edit</a>
              
              {post.status === 'draft' && (
                <button
                  onClick={() => publishMutation.mutate({ id: post.id })}
                  disabled={publishMutation.isPending}
                >
                  Publish
                </button>
              )}
              
              <button
                onClick={() => handleDelete(post.id)}
                disabled={deleteMutation.isPending}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="pagination">
        <button
          onClick={() => setFilters({ page: filters.page - 1 })}
          disabled={filters.page === 1}
        >
          Previous
        </button>
        <span>Page {filters.page}</span>
        <button onClick={() => setFilters({ page: filters.page + 1 })}>
          Next
        </button>
      </div>
    </div>
  );
}
```

### LoginForm

```typescript
'use client';

import { useMutation } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc-client';
import { useAuthStore } from '@/stores/authStore';
import { useState } from 'react';

export function LoginForm() {
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loginMutation = useMutation(
    orpc.auth.login.mutationOptions({
      onSuccess: (data) => {
        if (data.user && data.token) {
          setAuth(data.user, data.token);
          window.location.href = '/dashboard';
        }
      },
    })
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />

      <button type="submit" disabled={loginMutation.isPending}>
        {loginMutation.isPending ? 'Logging in...' : 'Log In'}
      </button>

      {loginMutation.error && (
        <div className="error">
          Login failed: {loginMutation.error.message}
        </div>
      )}
    </form>
  );
}
```

---

## Direct API Calls (Without React Query)

Sometimes you need to call the API directly without using React Query (e.g., in event handlers):

```typescript
import { orpc } from '@/lib/orpc-client';

async function handleQuickAction() {
  try {
    // Use .call() for direct API calls
    const result = await orpc.posts.publish.call({ id: 123 });
    console.log('Published:', result);
  } catch (error) {
    console.error('Failed to publish:', error);
  }
}
```

---

## Advanced Patterns

### Prefetching Data

```typescript
import { useQueryClient } from '@tanstack/react-query';

function PostListItem({ post }: { post: Post }) {
  const queryClient = useQueryClient();

  const handleMouseEnter = () => {
    // Prefetch post data on hover
    queryClient.prefetchQuery(
      orpc.posts.getById.queryOptions({
        input: { id: post.id },
      })
    );
  };

  return (
    <a
      href={`/dashboard/edit?post=${post.id}`}
      onMouseEnter={handleMouseEnter}
    >
      {post.title}
    </a>
  );
}
```

### Dependent Queries

```typescript
function PostWithAuthor({ postId }: { postId: number }) {
  // First query: fetch post
  const { data: post } = useQuery(
    orpc.posts.getById.queryOptions({
      input: { id: postId },
    })
  );

  // Second query: fetch author (only when post is loaded)
  const { data: author } = useQuery({
    ...orpc.people.getById.queryOptions({
      input: { id: post?.authorId! },
    }),
    enabled: !!post?.authorId,
  });

  return (
    <div>
      <h1>{post?.title}</h1>
      <p>By {author?.displayName}</p>
    </div>
  );
}
```

### Parallel Queries

```typescript
function Dashboard() {
  const { data: draftPosts } = useQuery(
    orpc.posts.list.queryOptions({
      input: { status: 'draft' },
    })
  );

  const { data: publishedPosts } = useQuery(
    orpc.posts.list.queryOptions({
      input: { status: 'published' },
    })
  );

  return (
    <div>
      <div>Drafts: {draftPosts?.length}</div>
      <div>Published: {publishedPosts?.length}</div>
    </div>
  );
}
```

---

## Best Practices

### 1. Always Use oRPC's Query Options

```typescript
// ✅ CORRECT
const { data } = useQuery(
  orpc.posts.list.queryOptions({ input: { status: 'draft' } })
);

// ❌ WRONG
const { data } = useQuery({
  queryKey: ['posts', 'draft'],
  queryFn: () => orpc.posts.list.call({ status: 'draft' }),
});
```

### 2. Use Key Helpers for Invalidation

```typescript
// ✅ CORRECT - Uses oRPC's key helper
queryClient.invalidateQueries({
  queryKey: orpc.posts.list.key({ input: { status: 'draft' } }),
});

// ❌ WRONG - Manual key
queryClient.invalidateQueries({
  queryKey: ['posts', 'list', { status: 'draft' }],
});
```

### 3. Colocate Query Options with Components

```typescript
// ✅ CORRECT - Readable and maintainable
function PostEditor({ postId }: { postId: number }) {
  const { data: post } = useQuery(
    orpc.posts.getById.queryOptions({
      input: { id: postId },
    })
  );
  // ...
}
```

### 4. Handle Loading and Error States

```typescript
function PostsList() {
  const { data, isLoading, error } = useQuery(
    orpc.posts.list.queryOptions({})
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <List posts={data} />;
}
```

---

## Comparison: oRPC vs Manual React Query

| Aspect | oRPC Way | Manual React Query |
|--------|----------|-------------------|
| Type Safety | ✅ Full type inference | ⚠️ Manual typing |
| Query Keys | ✅ Auto-generated | ❌ Manual management |
| DX | ✅ Simple, clean | ⚠️ Verbose |
| Errors | ✅ Type-safe errors | ⚠️ Generic errors |
| Maintenance | ✅ Centralized | ⚠️ Scattered |

---

## Common Mistakes to Avoid

### Mistake 1: Using Manual fetch() Instead of oRPC

```typescript
// ❌ WRONG - Manual fetch (PostEditor.tsx OLD approach)
React.useEffect(() => {
  const fetchPost = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/orpc/posts/getById`,
      {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: postId }),
      }
    );
    const post = await response.json();
    // ... use post
  };
  fetchPost();
}, [postId]);

// ✅ CORRECT - Use oRPC with useQuery
const { data: post } = useQuery(
  orpc.posts.getById.queryOptions({
    input: { id: postId },
  })
);
```

**Why this is wrong**:
- No type safety, no caching, no automatic retries
- Manual error/loading state management
- Verbose and error-prone

### Mistake 2: Not Using Enabled Option for Conditional Queries

```typescript
// ❌ WRONG - Fetches even when postId is null
const { data } = useQuery(
  orpc.posts.getById.queryOptions({
    input: { id: postId! }, // Runtime error if postId is null!
  })
);

// ✅ CORRECT - Only fetches when postId exists (PostEditorNew.tsx pattern)
const { data } = useQuery(
  orpc.posts.getById.queryOptions({
    input: { id: postId! },
    enabled: isEditMode && !!postId, // Prevents query when postId is null
    staleTime: 30 * 1000,
  })
);
```

**Why this matters**:
- Prevents unnecessary API calls
- Avoids runtime errors with undefined/null inputs
- Clean conditional data fetching

### Mistake 3: Forgetting to Invalidate Queries After Mutations

```typescript
// ❌ WRONG - UI won't update after mutation
const createMutation = useMutation(
  orpc.posts.create.mutationOptions()
);

// ✅ CORRECT - Invalidate to trigger refetch (PostEditorNew.tsx pattern)
const createMutation = useMutation(
  orpc.posts.create.mutationOptions({
    onSuccess: () => {
      // Invalidate posts list to refetch fresh data
      queryClient.invalidateQueries({ queryKey: orpc.posts.list.key() });
    },
  })
);
```

**Why this matters**:
- Ensures UI shows latest data after changes
- Automatic refetch of affected queries
- No manual state synchronization needed

### Mistake 4: Manual State Management for Mutations

```typescript
// ❌ WRONG - Manual state (PostEditor.tsx OLD approach)
const [isSaving, setIsSaving] = React.useState(false);
const [error, setError] = React.useState<string | null>(null);

const handleSave = async () => {
  setIsSaving(true);
  setError(null);
  try {
    await fetch(...);
    setIsSaving(false);
  } catch (err) {
    setError(err.message);
    setIsSaving(false);
  }
};

// ✅ CORRECT - Use mutation state (PostEditorNew.tsx pattern)
const createMutation = useMutation(
  orpc.posts.create.mutationOptions({
    onError: () => toast.error('Failed to create post'),
  })
);

// Use built-in state
const isPending = createMutation.isPending;
const error = createMutation.error;
```

**Why this is better**:
- No manual state management
- Built-in pending/error/success states
- Cleaner code, fewer bugs

### Mistake 5: Using Wrong Key Method for Cache Operations

```typescript
// ❌ WRONG - Manual query keys
queryClient.invalidateQueries({
  queryKey: ['posts', 'list'],
});

queryClient.setQueryData(
  ['posts', 'getById', postId],
  updatedPost
);

// ✅ CORRECT - Use oRPC key helpers
queryClient.invalidateQueries({
  queryKey: orpc.posts.list.key(), // Auto-generated, type-safe
});

queryClient.setQueryData(
  orpc.posts.getById.queryKey({ input: { id: postId } }), // Exact key with input
  updatedPost
);
```

**Why this matters**:
- `.key()` for invalidation (matches multiple queries)
- `.queryKey()` for setQueryData (exact match with input)
- Type-safe, auto-generated, never wrong

### Mistake 6: Not Handling Errors in Mutation Callbacks

```typescript
// ❌ WRONG - Silent failures
const createMutation = useMutation(
  orpc.posts.create.mutationOptions()
);

// ✅ CORRECT - Handle errors (PostEditorNew.tsx pattern)
const createMutation = useMutation(
  orpc.posts.create.mutationOptions({
    onSuccess: (newPost) => {
      toast.success('Post created successfully!');
      // ... handle success
    },
    onError: () => {
      toast.error('Failed to create post');
      // ... handle error
    },
  })
);
```

**Why this matters**:
- User feedback for all operations
- Better UX with clear error messages
- Easier debugging

---

## Summary: oRPC + TanStack Query Best Practices

This is the correct way to use oRPC with TanStack Query! The key is that **oRPC provides the query/mutation options**, and you **pass them to TanStack Query hooks**.

### Quick Reference Checklist

**Setup**:
- ✅ Use `createTanstackQueryUtils()` to create oRPC client
- ✅ Configure `RPCLink` with credentials and bearer token support
- ✅ Create singleton `QueryClient` for Webflow components
- ✅ Wrap components in `QueryClientProvider`

**Queries**:
- ✅ Use `useQuery(orpc.procedure.queryOptions({ input }))`
- ✅ Add `enabled` option for conditional fetching
- ✅ Use automatic `isLoading` and `error` states
- ✅ Configure `staleTime` for caching behavior

**Mutations**:
- ✅ Use `useMutation(orpc.procedure.mutationOptions({...}))`
- ✅ Add `onSuccess` callback for query invalidation
- ✅ Add `onError` callback for user feedback
- ✅ Use automatic `isPending` state
- ✅ Use `mutateAsync` for sequential operations

**Cache Management**:
- ✅ Use `orpc.procedure.key()` for invalidation
- ✅ Use `orpc.procedure.queryKey({ input })` for `setQueryData`
- ✅ Invalidate related queries after mutations
- ✅ Update cache optimistically when appropriate

**Error Handling**:
- ✅ Use automatic error states from queries/mutations
- ✅ Add user feedback with toast notifications
- ✅ Handle errors in mutation callbacks
- ✅ Provide fallback UI for error states

### References

**Working Implementation**:
- `/home/uzo/dev/blogflow/components/PostEditorNew.tsx` - Full working example (697 lines)
- `/home/uzo/dev/blogflow/lib/orpc-client.ts` - oRPC client setup
- `/home/uzo/dev/blogflow/lib/webflow/providers.tsx` - Provider wrapper
- `/home/uzo/dev/blogflow/lib/token-storage.ts` - Bearer token utility

**Server-Side**:
- `/home/uzo/dev/blogflow/lib/api/routers/posts.ts` - Posts router implementation

**Incorrect Approach (for comparison)**:
- `/home/uzo/dev/blogflow/components/PostEditor.tsx` - OLD manual fetch approach

### Key Takeaways

1. **Never use manual `fetch()`** - Always use oRPC with TanStack Query
2. **Type safety everywhere** - Full TypeScript inference from server to client
3. **Automatic state management** - No manual loading/error/pending states
4. **Smart caching** - Automatic deduplication and background refetching
5. **Query invalidation** - Keep UI in sync after mutations
6. **Bearer tokens for Webflow** - Bypass third-party cookie restrictions
7. **Singleton QueryClient** - Share cache across Shadow DOM components

**The oRPC + TanStack Query pattern eliminates hundreds of lines of boilerplate code while providing better type safety, caching, and developer experience.**

