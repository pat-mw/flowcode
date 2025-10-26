# Advanced Patterns & Best Practices

## Shadow DOM State Management Patterns

### Pattern 1: Zustand with Event Broadcasting

When Zustand's localStorage sync isn't enough, broadcast changes via custom events:

```typescript
// stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        set({ user, token });
        // Broadcast to other components
        window.dispatchEvent(
          new CustomEvent('auth-changed', { 
            detail: { user, token } 
          })
        );
      },
      clearAuth: () => {
        set({ user: null, token: null });
        window.dispatchEvent(
          new CustomEvent('auth-changed', { 
            detail: { user: null, token: null } 
          })
        );
      },
    }),
    {
      name: 'auth-storage',
      // Sync across tabs
      onRehydrateStorage: () => (state) => {
        window.addEventListener('storage', (e) => {
          if (e.key === 'auth-storage' && e.newValue) {
            const newState = JSON.parse(e.newValue);
            if (state) {
              Object.assign(state, newState.state);
            }
          }
        });
      },
    }
  )
);

// In components that need to react to auth changes
useEffect(() => {
  const handleAuthChange = (e: CustomEvent) => {
    // React to auth changes from other components
    console.log('Auth changed:', e.detail);
  };
  
  window.addEventListener('auth-changed', handleAuthChange as any);
  return () => window.removeEventListener('auth-changed', handleAuthChange as any);
}, []);
```

### Pattern 2: Nano Stores for Reactive Cross-Component State

```typescript
// stores/posts.ts
import { atom, map } from 'nanostores';

export const $currentPostId = atom<number | null>(null);

export const $posts = map<Record<number, Post>>({});

// Actions
export function setCurrentPost(id: number) {
  $currentPostId.set(id);
}

export function updatePost(id: number, updates: Partial<Post>) {
  $posts.setKey(id, { ...$posts.get()[id], ...updates });
}

// In components
import { useStore } from '@nanostores/react';
import { $currentPostId, $posts } from '@/stores/posts';

function PostEditor() {
  const currentPostId = useStore($currentPostId);
  const posts = useStore($posts);
  const currentPost = currentPostId ? posts[currentPostId] : null;
  
  // ...
}
```

### Pattern 3: URL State for Shareable State

```typescript
// hooks/useUrlState.ts
import { useEffect, useState } from 'react';

export function useUrlState<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    const params = new URLSearchParams(window.location.search);
    const urlValue = params.get(key);
    return urlValue ? JSON.parse(urlValue) : defaultValue;
  });
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set(key, JSON.stringify(value));
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }, [key, value]);
  
  return [value, setValue] as const;
}

// Usage
function PostsList() {
  const [filter, setFilter] = useUrlState('filter', 'all');
  const [page, setPage] = useUrlState('page', 1);
  
  // State is now in URL and shareable
}
```

## Rich Text Editor Integration

### Tiptap with Auto-Save

```typescript
// components/PostEditor.webflow.tsx
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { useDebounce } from '@/hooks/useDebounce';

function PostEditor({ postId }: { postId?: number }) {
  const [title, setTitle] = useState('');
  const updateMutation = useUpdatePost();
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing...',
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg',
        },
      }),
    ],
    onUpdate: ({ editor }) => {
      debouncedSave(editor.getJSON());
    },
  });
  
  const debouncedSave = useDebounce((content: any) => {
    if (postId) {
      updateMutation.mutate({
        id: postId,
        title,
        content,
      });
    }
  }, 1000);
  
  return (
    <div className="post-editor">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => debouncedSave(editor?.getJSON())}
        placeholder="Post title..."
        className="text-3xl font-bold border-none outline-none"
      />
      
      <EditorContent editor={editor} className="prose max-w-none" />
      
      {updateMutation.isPending && (
        <div className="text-sm text-gray-500">Saving...</div>
      )}
    </div>
  );
}
```

### Image Upload Handler

```typescript
// lib/image-upload.ts
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
    headers: {
      Authorization: `Bearer ${localStorage.getItem('auth-token')}`,
    },
  });
  
  const { url } = await response.json();
  return url;
}

// In Tiptap editor
import { uploadImage } from '@/lib/image-upload';

const editor = useEditor({
  extensions: [
    // ...
    Image.configure({
      HTMLAttributes: {
        class: 'rounded-lg max-w-full',
      },
    }),
  ],
  editorProps: {
    handleDrop: (view, event, slice, moved) => {
      if (!moved && event.dataTransfer?.files.length) {
        const files = Array.from(event.dataTransfer.files);
        const images = files.filter(f => f.type.startsWith('image/'));
        
        images.forEach(async (image) => {
          const url = await uploadImage(image);
          const { schema } = view.state;
          const node = schema.nodes.image.create({ src: url });
          const transaction = view.state.tr.insert(
            view.state.selection.from,
            node
          );
          view.dispatch(transaction);
        });
        
        return true;
      }
      return false;
    },
  },
});
```

## Optimistic Updates with React Query

```typescript
// hooks/usePosts.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useUpdatePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdatePostInput) => orpc.posts.update(data),
    
    // Optimistic update
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      
      // Snapshot previous value
      const previousPosts = queryClient.getQueryData(['posts']);
      
      // Optimistically update
      queryClient.setQueryData(['posts'], (old: Post[]) => {
        return old.map(post => 
          post.id === variables.id 
            ? { ...post, ...variables }
            : post
        );
      });
      
      // Return context with snapshot
      return { previousPosts };
    },
    
    // On error, rollback
    onError: (err, variables, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(['posts'], context.previousPosts);
      }
    },
    
    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}
```

## Error Handling Patterns

### Global Error Boundary

```typescript
// components/ErrorBoundary.tsx
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to error tracking service
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <h2 className="text-red-800 font-semibold">Something went wrong</h2>
          <p className="text-red-600">{this.state.error?.message}</p>
        </div>
      );
    }
    
    return this.props.children;
  }
}

// Usage in components
function PostEditor() {
  return (
    <ErrorBoundary fallback={<div>Failed to load editor</div>}>
      <EditorContent editor={editor} />
    </ErrorBoundary>
  );
}
```

### API Error Handling

```typescript
// lib/orpc-client.ts
import { createORPCClient } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';

const link = new RPCLink({
  url: process.env.NEXT_PUBLIC_API_URL + '/api/orpc',
  headers: () => {
    const token = localStorage.getItem('auth-token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
  onError: (error) => {
    // Global error handling
    if (error.code === 'UNAUTHORIZED') {
      localStorage.removeItem('auth-token');
      window.location.href = '/login';
    }
    
    // Log to error tracking
    console.error('API Error:', error);
  },
});

export const orpc = createORPCClient<Router>(link);
```

## Authentication Patterns

### Protected Component Wrapper

```typescript
// components/ProtectedComponent.tsx
import { useAuthStore } from '@/stores/authStore';
import { useEffect } from 'react';

export function ProtectedComponent({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  
  useEffect(() => {
    if (!user) {
      // Redirect to login
      window.location.href = '/login';
    }
  }, [user]);
  
  if (!user) {
    return <div>Redirecting to login...</div>;
  }
  
  return <>{children}</>;
}

// Usage
export default declareComponent(
  () => (
    <ProtectedComponent>
      <PostEditor />
    </ProtectedComponent>
  ),
  {
    displayName: 'Post Editor',
  }
);
```

### Session Refresh

```typescript
// hooks/useAuth.ts
import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc-client';
import { useAuthStore } from '@/stores/authStore';

export function useAuth() {
  const { setAuth, clearAuth } = useAuthStore();
  
  // Refresh session periodically
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: () => orpc.auth.getSession(),
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    onSuccess: (data) => {
      if (data?.user) {
        setAuth(data.user, data.token);
      } else {
        clearAuth();
      }
    },
    onError: () => {
      clearAuth();
    },
  });
  
  return session;
}
```

## Performance Optimization

### Lazy Loading Components

```typescript
// components/LazyPostEditor.tsx
import { lazy, Suspense } from 'react';

const PostEditor = lazy(() => import('./PostEditor'));

export function LazyPostEditor() {
  return (
    <Suspense fallback={<div>Loading editor...</div>}>
      <PostEditor />
    </Suspense>
  );
}
```

### Memoization

```typescript
import { useMemo, memo } from 'react';

const PostItem = memo(({ post }: { post: Post }) => {
  return (
    <div className="post-item">
      <h3>{post.title}</h3>
      <p>{post.excerpt}</p>
    </div>
  );
});

function PostsList({ posts }: { posts: Post[] }) {
  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => 
      b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  }, [posts]);
  
  return (
    <div>
      {sortedPosts.map(post => (
        <PostItem key={post.id} post={post} />
      ))}
    </div>
  );
}
```

### Virtual Scrolling for Large Lists

```typescript
// npm install @tanstack/react-virtual

import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

function PostsList({ posts }: { posts: Post[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: posts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 5,
  });
  
  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map(virtualItem => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <PostItem post={posts[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Testing Strategies

### Unit Testing Components

```typescript
// __tests__/LoginForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginForm from '@/components/LoginForm';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

describe('LoginForm', () => {
  it('renders login form', () => {
    render(<LoginForm />, { wrapper: Wrapper });
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });
  
  it('submits form with valid data', async () => {
    render(<LoginForm />, { wrapper: Wrapper });
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    
    await waitFor(() => {
      // Assert success behavior
    });
  });
});
```

### Integration Testing API Routes

```typescript
// __tests__/api/posts.test.ts
import { POST } from '@/app/api/orpc/[...all]/route';

describe('Posts API', () => {
  it('creates a post', async () => {
    const request = new Request('http://localhost:3000/api/orpc/posts.create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      },
      body: JSON.stringify({
        title: 'Test Post',
        content: { type: 'doc', content: [] },
      }),
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('id');
    expect(data.title).toBe('Test Post');
  });
});
```

## Monitoring and Logging

### Sentry Integration

```typescript
// lib/sentry.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});

// In error boundaries and API errors
Sentry.captureException(error);
```

### Performance Monitoring

```typescript
// lib/analytics.ts
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, properties);
  }
}

// Usage
trackEvent('post_created', { postId: post.id, userId: user.id });
trackEvent('post_published', { postId: post.id });
```

## Deployment Best Practices

### Environment-Specific Configuration

```typescript
// config/index.ts
const config = {
  development: {
    apiUrl: 'http://localhost:3000',
    webflowUrl: 'http://localhost:3001',
  },
  staging: {
    apiUrl: 'https://staging-api.example.com',
    webflowUrl: 'https://staging.example.com',
  },
  production: {
    apiUrl: 'https://api.example.com',
    webflowUrl: 'https://example.com',
  },
};

const env = process.env.NODE_ENV || 'development';
export default config[env as keyof typeof config];
```

### Database Connection Pooling

```typescript
// lib/db.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

// Singleton pattern for connection pool
let pool: Pool | null = null;

export function getDb() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  
  return drizzle(pool);
}
```

### Health Check Endpoint

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Check database connection
    await db.execute('SELECT 1');
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'up',
        auth: 'up',
      },
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      error: error.message,
    }, { status: 503 });
  }
}
```

## Security Best Practices

### Rate Limiting

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function middleware(request: NextRequest) {
  const ip = request.ip ?? 'unknown';
  const now = Date.now();
  
  const limit = rateLimitMap.get(ip);
  
  if (limit && limit.resetTime > now) {
    if (limit.count >= 100) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }
    limit.count++;
  } else {
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + 60000, // 1 minute
    });
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

### Input Sanitization

```typescript
// lib/sanitize.ts
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
  });
}

// Use before saving to database
const sanitized = sanitizeHtml(userInput);
```

### CSRF Protection

```typescript
// lib/csrf.ts
import { randomBytes } from 'crypto';

export function generateCsrfToken(): string {
  return randomBytes(32).toString('hex');
}

export function validateCsrfToken(token: string, sessionToken: string): boolean {
  return token === sessionToken;
}

// In API routes
const csrfToken = request.headers.get('x-csrf-token');
const sessionToken = session.csrfToken;

if (!validateCsrfToken(csrfToken, sessionToken)) {
  return new Response('Invalid CSRF token', { status: 403 });
}
```

## Documentation

### API Documentation with OpenAPI (oRPC)

```typescript
// lib/openapi.ts
import { OpenAPIGenerator } from '@orpc/openapi';
import { ZodToJsonSchemaConverter } from '@orpc/zod';
import { router } from '@/server/router';

const generator = new OpenAPIGenerator({
  schemaConverters: [new ZodToJsonSchemaConverter()],
});

export const openApiSpec = await generator.generate(router, {
  info: {
    title: 'Blog Platform API',
    version: '1.0.0',
    description: 'API for managing blog posts',
  },
  servers: [
    { url: 'https://api.example.com', description: 'Production' },
    { url: 'http://localhost:3000', description: 'Development' },
  ],
});

// Serve at /api/openapi.json
```

### Component Documentation

```typescript
// components/PostEditor.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import PostEditor from './PostEditor';

const meta: Meta<typeof PostEditor> = {
  title: 'Components/PostEditor',
  component: PostEditor,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof PostEditor>;

export const Default: Story = {
  args: {},
};

export const WithExistingPost: Story = {
  args: {
    postId: 1,
    initialTitle: 'My Post',
    initialContent: { type: 'doc', content: [] },
  },
};
```

