# oRPC React Query Integration - Correct Patterns

## Overview

oRPC provides first-class integration with TanStack Query through `@orpc/tanstack-query` and `@orpc/react-query` packages. You don't use React Query hooks directly - instead, oRPC generates type-safe query options that you pass to TanStack Query hooks.

## Key Concept

**You use TanStack Query hooks (useQuery, useMutation, etc.) but with oRPC-generated options:**

```typescript
// ❌ WRONG: Don't create your own queryFn
const { data } = useQuery({
  queryKey: ['posts'],
  queryFn: () => orpc.posts.list(),
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

### 1. Install Dependencies

```bash
pnpm add @orpc/tanstack-query @tanstack/react-query
```

### 2. Create oRPC Client with Query Utils

```typescript
// lib/orpc-client.ts
import { createORPCClient } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';
import { createTanstackQueryUtils } from '@orpc/tanstack-query';
import type { Router } from '@/server/router';

// Create the base client
const link = new RPCLink({
  url: process.env.NEXT_PUBLIC_API_URL + '/api/orpc',
  headers: () => {
    const token = localStorage.getItem('auth-token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
});

const client = createORPCClient<Router>(link);

// Create query utils - this adds .queryOptions(), .mutationOptions(), etc.
export const orpc = createTanstackQueryUtils(client);
```

### 3. Setup Query Client Provider

```typescript
// app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

---

## Query Patterns

### Basic Query

```typescript
import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc-client';

function PostsList() {
  // Use orpc.posts.list.queryOptions() to generate query config
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

### Query with Parameters from Props/State

```typescript
function PostEditor({ postId }: { postId: number }) {
  const { data: post } = useQuery(
    orpc.posts.getById.queryOptions({
      input: { id: postId },
    })
  );

  return <div>{post?.title}</div>;
}
```

### Conditional Query (enabled option)

```typescript
function PostEditor() {
  const postId = useQueryParam('post');
  const isEditMode = !!postId;

  const { data: post } = useQuery({
    ...orpc.posts.getById.queryOptions({
      input: { id: parseInt(postId!, 10) },
    }),
    enabled: isEditMode, // Only fetch when postId exists
  });

  if (!isEditMode) {
    return <CreateNewPost />;
  }

  return <EditPost post={post} />;
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

### Basic Mutation

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc-client';

function CreatePostButton() {
  const queryClient = useQueryClient();

  const createMutation = useMutation(
    orpc.posts.create.mutationOptions({
      onSuccess: () => {
        // Invalidate posts list to refetch
        queryClient.invalidateQueries({
          queryKey: orpc.posts.list.key(),
        });
      },
    })
  );

  const handleCreate = () => {
    createMutation.mutate({
      title: 'New Post',
      content: { type: 'doc', content: [] },
    });
  };

  return (
    <button onClick={handleCreate} disabled={createMutation.isPending}>
      {createMutation.isPending ? 'Creating...' : 'Create Post'}
    </button>
  );
}
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

## Query Key Management

oRPC generates query keys automatically with the `.key()` and `.queryKey()` methods:

```typescript
import { useQueryClient } from '@tanstack/react-query';

function PostActions() {
  const queryClient = useQueryClient();

  const handleInvalidate = () => {
    // Invalidate ALL posts queries
    queryClient.invalidateQueries({
      queryKey: orpc.posts.key(),
    });

    // Invalidate only regular queries (not infinite)
    queryClient.invalidateQueries({
      queryKey: orpc.posts.key({ type: 'query' }),
    });

    // Invalidate specific query
    queryClient.invalidateQueries({
      queryKey: orpc.posts.list.key({ input: { status: 'draft' } }),
    });

    // Invalidate single post
    queryClient.invalidateQueries({
      queryKey: orpc.posts.getById.key({ input: { id: 123 } }),
    });
  };

  const handleUpdateCache = () => {
    // Directly update query cache
    queryClient.setQueryData(
      orpc.posts.getById.queryKey({ input: { id: 123 } }),
      (old) => ({ ...old, title: 'Updated Title' })
    );
  };

  return (
    <div>
      <button onClick={handleInvalidate}>Invalidate Queries</button>
      <button onClick={handleUpdateCache}>Update Cache</button>
    </div>
  );
}
```

---

## Complete Component Examples

### PostEditor with Create/Update

```typescript
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { orpc } from '@/lib/orpc-client';
import { useQueryParam } from '@/hooks/useQueryParam';
import { useEffect, useState } from 'react';

export function PostEditor() {
  const queryClient = useQueryClient();
  const postId = useQueryParam('post');
  const isEditMode = !!postId;

  const [title, setTitle] = useState('');

  // Fetch post if editing
  const { data: post } = useQuery({
    ...orpc.posts.getById.queryOptions({
      input: { id: parseInt(postId!, 10) },
    }),
    enabled: isEditMode,
  });

  // Setup editor
  const editor = useEditor({
    extensions: [StarterKit],
    content: post?.content || '',
  });

  // Update local state when post loads
  useEffect(() => {
    if (post) {
      setTitle(post.title);
      editor?.commands.setContent(post.content);
    }
  }, [post, editor]);

  // Create mutation
  const createMutation = useMutation(
    orpc.posts.create.mutationOptions({
      onSuccess: (newPost) => {
        queryClient.invalidateQueries({ queryKey: orpc.posts.key() });
        // Navigate to edit mode
        window.location.href = `/dashboard/edit?post=${newPost.id}`;
      },
    })
  );

  // Update mutation
  const updateMutation = useMutation(
    orpc.posts.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.posts.key() });
      },
    })
  );

  const handleSave = () => {
    const content = editor?.getJSON();

    if (isEditMode) {
      updateMutation.mutate({
        id: parseInt(postId!, 10),
        title,
        content,
      });
    } else {
      createMutation.mutate({
        title,
        content,
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="post-editor">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Post title..."
      />

      <EditorContent editor={editor} />

      <button onClick={handleSave} disabled={isPending}>
        {isPending ? 'Saving...' : 'Save'}
      </button>

      {(createMutation.error || updateMutation.error) && (
        <div className="error">
          Error: {createMutation.error?.message || updateMutation.error?.message}
        </div>
      )}
    </div>
  );
}
```

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

### Mistake 1: Using .call() in useQuery

```typescript
// ❌ WRONG
const { data } = useQuery({
  queryKey: ['posts'],
  queryFn: () => orpc.posts.list.call(),
});

// ✅ CORRECT
const { data } = useQuery(
  orpc.posts.list.queryOptions()
);
```

### Mistake 2: Not Using Enabled Option

```typescript
// ❌ WRONG - Fetches even when postId is null
const { data } = useQuery(
  orpc.posts.getById.queryOptions({
    input: { id: parseInt(postId!, 10) },
  })
);

// ✅ CORRECT - Only fetches when postId exists
const { data } = useQuery({
  ...orpc.posts.getById.queryOptions({
    input: { id: parseInt(postId!, 10) },
  }),
  enabled: !!postId,
});
```

### Mistake 3: Forgetting to Invalidate Queries

```typescript
// ❌ WRONG - UI won't update
const createMutation = useMutation(
  orpc.posts.create.mutationOptions()
);

// ✅ CORRECT - Invalidate to trigger refetch
const createMutation = useMutation(
  orpc.posts.create.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orpc.posts.key() });
    },
  })
);
```

---

This is the correct way to use oRPC with TanStack Query! The key is that oRPC provides the query options, and you pass them to TanStack Query hooks.

