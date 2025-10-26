# Webflow Code Components + Next.js Full-Stack Architecture

## Project Overview

A full-stack prototype demonstrating integration between **Webflow Code Components** (React components in Shadow DOM) and a **Next.js server-side application** for authenticated blog post management with real-time CMS synchronization.

### Core Concept
- **Frontend**: React components deployed to Webflow via DevLink (Code Components)
- **Backend**: Next.js app deployed to Vercel with API routes
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Better Auth (integrated with Drizzle)
- **CMS Sync**: Webflow CMS API integration for publishing blog posts

---

## Tech Stack

### Frontend (Webflow Code Components)
- **React** 18+ (TypeScript)
- **Zustand** - Global state management (Shadow DOM compatible)
- **TanStack Query (React Query)** - Data fetching & caching
- **Lexical** or **Tiptap** - Rich text editor for blog posts
- **Tailwind CSS** - Styling (with Shadow DOM provider)
- **@orpc/client** or tRPC client - Type-safe API calls

### Backend (Next.js)
- **Next.js 15** (App Router)
- **TypeScript**
- **Drizzle ORM** - Database ORM
- **Better Auth** - Authentication system
- **PostgreSQL** - Database (via Neon or Vercel Postgres)
- **@orpc/server** (primary) or tRPC v11 (fallback) - Type-safe API layer
- **Zod** - Schema validation
- **Webflow API SDK** - CMS synchronization

### DevOps
- **Vercel** - Deployment platform
- **Webflow CLI** - Component deployment
- **pnpm** - Package manager

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         WEBFLOW SITE                             │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Code Component (Shadow DOM #1)                    │  │
│  │  - LoginForm Component                                     │  │
│  │  - Zustand: authStore (localStorage sync)                 │  │
│  │  - React Query: useLogin mutation                         │  │
│  └────────────────┬─────────────────────────────────────────┘  │
│                   │                                              │
│  ┌────────────────▼─────────────────────────────────────────┐  │
│  │         Code Component (Shadow DOM #2)                    │  │
│  │  - PostEditor Component                                    │  │
│  │  - Lexical/Tiptap Editor                                  │  │
│  │  - Zustand: authStore (reads), postsStore                 │  │
│  │  - React Query: useCreatePost, useUpdatePost              │  │
│  └────────────────┬─────────────────────────────────────────┘  │
│                   │                                              │
│  ┌────────────────▼─────────────────────────────────────────┐  │
│  │         Code Component (Shadow DOM #3)                    │  │
│  │  - PostsList Component                                     │  │
│  │  - Zustand: authStore (reads), postsStore                 │  │
│  │  - React Query: usePosts query                            │  │
│  └────────────────┬─────────────────────────────────────────┘  │
│                   │                                              │
│  ┌────────────────▼─────────────────────────────────────────┐  │
│  │         Code Component (Shadow DOM #4)                    │  │
│  │  - GlobalMap Component                                     │  │
│  │  - Map library (e.g., Leaflet)                            │  │
│  │  - React Query: usePublishedPosts query                   │  │
│  └────────────────┬─────────────────────────────────────────┘  │
│                   │                                              │
└───────────────────┼──────────────────────────────────────────────┘
                    │
                    │ HTTPS API Calls
                    │ (oRPC/tRPC over fetch)
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NEXT.JS API (Vercel)                          │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  oRPC/tRPC Router                                         │  │
│  │  - Type-safe procedures                                    │  │
│  │  - Better Auth middleware                                  │  │
│  │  - Input validation (Zod)                                  │  │
│  └───────┬────────────────────────────────────────┬──────────┘  │
│          │                                         │              │
│          ▼                                         ▼              │
│  ┌──────────────────┐                    ┌───────────────────┐  │
│  │  Auth Procedures │                    │  Posts Procedures │  │
│  │  - login         │                    │  - create         │  │
│  │  - register      │                    │  - update         │  │
│  │  - logout        │                    │  - delete         │  │
│  │  - getSession    │                    │  - list           │  │
│  └────────┬─────────┘                    │  - publish        │  │
│           │                               └─────────┬─────────┘  │
│           │                                         │             │
│           ▼                                         ▼             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   Better Auth                             │  │
│  │  - Session management                                     │  │
│  │  - JWT tokens                                             │  │
│  │  - Drizzle adapter                                        │  │
│  └───────────────────────────┬──────────────────────────────┘  │
│                               │                                  │
│                               ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Drizzle ORM + PostgreSQL                     │  │
│  │  Tables:                                                   │  │
│  │  - users                                                   │  │
│  │  - sessions                                                │  │
│  │  - accounts                                                │  │
│  │  - posts                                                   │  │
│  │  - people (user profiles)                                 │  │
│  └───────────────────────────┬──────────────────────────────┘  │
│                               │                                  │
└───────────────────────────────┼──────────────────────────────────┘
                                │
                                │ Publish Action
                                ▼
                ┌─────────────────────────────────┐
                │       Webflow CMS API           │
                │                                 │
                │  Collections:                   │
                │  - Posts (synced)               │
                │  - People (synced)              │
                └─────────────────────────────────┘
```

---

## Key Design Decisions

### 1. Shadow DOM & State Management

**Challenge**: Each Webflow Code Component renders in its own isolated Shadow DOM with separate React roots, preventing React Context sharing.

**Solution**: 
- **Zustand stores** for cross-component state
- **localStorage** for persistence
- **Custom events** for inter-component communication (fallback)

```typescript
// stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      clearAuth: () => set({ user: null, token: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

### 2. Type-Safe API Layer

**Primary Choice: oRPC**
- ✅ Built-in Server Actions support
- ✅ First-class OpenAPI support
- ✅ Native TanStack Query integration
- ✅ Better file/Blob handling
- ✅ Simpler setup than tRPC
- ✅ Works with React 19 Server Actions

**Fallback: tRPC v11**
- ✅ More mature ecosystem
- ✅ Excellent React Query integration
- ✅ Server Actions support in v11
- ⚠️ Slightly more complex setup

### 3. Rich Text Editor

**Primary Choice: Lexical**
- ✅ Built by Meta (battle-tested)
- ✅ Framework-agnostic
- ✅ Excellent performance
- ✅ Strong TypeScript support
- ✅ Modern plugin architecture
- ⚠️ Documentation could be better

**Alternative: Tiptap**
- ✅ More polished DX
- ✅ Better documentation
- ✅ Large plugin ecosystem
- ⚠️ Some features require subscription

**Recommendation**: Start with **Tiptap** for faster development, migrate to Lexical if needed for performance.

### 4. Authentication Flow

**Better Auth** provides:
- Session-based auth with JWT
- Built-in Drizzle adapter
- Email/password + OAuth
- Type-safe auth hooks
- Middleware for protected routes

```typescript
// lib/auth.ts
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
  },
});
```

---

## Database Schema

### Core Auth Tables (Better Auth)

```typescript
// schema/auth.ts
import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
});

export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```

### Application Tables

```typescript
// schema/posts.ts
import { pgTable, text, timestamp, jsonb, serial, boolean } from 'drizzle-orm/pg-core';

export const people = pgTable('people', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
  displayName: text('display_name').notNull(),
  bio: text('bio'),
  avatar: text('avatar'),
  website: text('website'),
  webflowItemId: text('webflow_item_id').unique(), // Webflow CMS ID
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  content: jsonb('content').notNull(), // Lexical/Tiptap JSON
  excerpt: text('excerpt'),
  coverImage: text('cover_image'),
  authorId: text('author_id')
    .notNull()
    .references(() => people.id, { onDelete: 'cascade' }),
  status: text('status').notNull().default('draft'), // draft, published
  publishedAt: timestamp('published_at'),
  webflowItemId: text('webflow_item_id').unique(), // Webflow CMS ID
  metadata: jsonb('metadata'), // SEO, tags, etc.
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```

### Webflow CMS Collections

#### Posts Collection
```javascript
{
  "name": "Posts",
  "singularName": "Post",
  "fields": [
    { "slug": "title", "name": "Title", "type": "PlainText", "required": true },
    { "slug": "slug", "name": "Slug", "type": "PlainText", "required": true, "unique": true },
    { "slug": "excerpt", "name": "Excerpt", "type": "PlainText" },
    { "slug": "content", "name": "Content", "type": "RichText", "required": true },
    { "slug": "cover-image", "name": "Cover Image", "type": "ImageRef" },
    { "slug": "author", "name": "Author", "type": "ItemRef", "required": true },
    { "slug": "published-date", "name": "Published Date", "type": "DateTime" },
    { "slug": "external-id", "name": "External ID", "type": "PlainText" }
  ]
}
```

#### People Collection
```javascript
{
  "name": "People",
  "singularName": "Person",
  "fields": [
    { "slug": "display-name", "name": "Display Name", "type": "PlainText", "required": true },
    { "slug": "bio", "name": "Bio", "type": "PlainText" },
    { "slug": "avatar", "name": "Avatar", "type": "ImageRef" },
    { "slug": "website", "name": "Website", "type": "Link" },
    { "slug": "external-id", "name": "External ID", "type": "PlainText", "unique": true }
  ]
}
```

---

## API Structure (oRPC/tRPC)

### Option A: oRPC (Recommended)

```typescript
// server/router.ts
import { os } from '@orpc/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// Base procedure
const publicProcedure = os;

// Protected procedure with auth middleware
const protectedProcedure = os
  .use(async ({ context, next }) => {
    const session = await auth.api.getSession({
      headers: context.headers,
    });
    
    if (!session?.user) {
      throw new Error('UNAUTHORIZED');
    }
    
    return next({
      context: {
        ...context,
        user: session.user,
      },
    });
  });

// Auth routes
export const authRouter = {
  register: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(8),
      name: z.string(),
    }))
    .handler(async ({ input }) => {
      // Registration logic with Better Auth
      const result = await auth.api.signUp.email({
        body: input,
      });
      return result;
    }),
    
  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string(),
    }))
    .handler(async ({ input }) => {
      const result = await auth.api.signIn.email({
        body: input,
      });
      return result;
    }),
    
  getSession: publicProcedure
    .handler(async ({ context }) => {
      const session = await auth.api.getSession({
        headers: context.headers,
      });
      return session;
    }),
};

// Posts routes
export const postsRouter = {
  list: protectedProcedure
    .input(z.object({
      status: z.enum(['draft', 'published']).optional(),
      limit: z.number().optional(),
      offset: z.number().optional(),
    }))
    .handler(async ({ input, context }) => {
      const posts = await db.query.posts.findMany({
        where: input.status 
          ? eq(posts.status, input.status) 
          : undefined,
        with: {
          author: true,
        },
        limit: input.limit || 50,
        offset: input.offset || 0,
      });
      return posts;
    }),
    
  create: protectedProcedure
    .input(z.object({
      title: z.string(),
      content: z.any(), // JSON from editor
      excerpt: z.string().optional(),
      coverImage: z.string().optional(),
    }))
    .handler(async ({ input, context }) => {
      // Get or create person profile for user
      const person = await getOrCreatePerson(context.user.id);
      
      const newPost = await db.insert(posts).values({
        ...input,
        authorId: person.id,
        slug: generateSlug(input.title),
      }).returning();
      
      return newPost[0];
    }),
    
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      content: z.any().optional(),
      excerpt: z.string().optional(),
      coverImage: z.string().optional(),
    }))
    .handler(async ({ input, context }) => {
      // Verify ownership
      const post = await db.query.posts.findFirst({
        where: eq(posts.id, input.id),
        with: { author: true },
      });
      
      if (post?.author.userId !== context.user.id) {
        throw new Error('FORBIDDEN');
      }
      
      const { id, ...updateData } = input;
      const updated = await db.update(posts)
        .set(updateData)
        .where(eq(posts.id, id))
        .returning();
        
      return updated[0];
    }),
    
  publish: protectedProcedure
    .input(z.object({ id: z.number() }))
    .handler(async ({ input, context }) => {
      // Get post
      const post = await db.query.posts.findFirst({
        where: eq(posts.id, input.id),
        with: { author: true },
      });
      
      if (!post) throw new Error('NOT_FOUND');
      if (post.author.userId !== context.user.id) {
        throw new Error('FORBIDDEN');
      }
      
      // Sync to Webflow CMS
      const webflowItemId = await syncToWebflow(post);
      
      // Update local post
      const published = await db.update(posts)
        .set({
          status: 'published',
          publishedAt: new Date(),
          webflowItemId,
        })
        .where(eq(posts.id, input.id))
        .returning();
        
      return published[0];
    }),
};

// Root router
export const router = {
  auth: authRouter,
  posts: postsRouter,
};

export type Router = typeof router;
```

### Option B: tRPC (Fallback)

```typescript
// server/trpc.ts
import { initTRPC } from '@trpc/server';
import { auth } from '@/lib/auth';

interface Context {
  headers: Headers;
  user?: any;
}

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(
  async ({ ctx, next }) => {
    const session = await auth.api.getSession({
      headers: ctx.headers,
    });
    
    if (!session?.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    
    return next({
      ctx: {
        ...ctx,
        user: session.user,
      },
    });
  }
);

// Similar router structure as oRPC example
```

---

## Client-Side Integration

### React Query + oRPC Setup

```typescript
// lib/orpc-client.ts
import { createORPCClient } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';
import { createTanstackQueryUtils } from '@orpc/tanstack-query';
import type { Router } from '@/server/router';

const link = new RPCLink({
  url: process.env.NEXT_PUBLIC_API_URL + '/api/orpc',
  headers: () => {
    const token = localStorage.getItem('auth-token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
});

const client = createORPCClient<Router>(link);

// Create query utils - adds .queryOptions(), .mutationOptions(), etc.
export const orpc = createTanstackQueryUtils(client);
```

### TanStack Query Hooks

```typescript
// hooks/usePosts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc-client';

// ✅ CORRECT: Use oRPC's queryOptions
export const usePosts = (status?: 'draft' | 'published') => {
  return useQuery(
    orpc.posts.list.queryOptions({
      input: { status },
    })
  );
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    orpc.posts.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.posts.key() });
      },
    })
  );
};

export const usePublishPost = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    orpc.posts.publish.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.posts.key() });
      },
    })
  );
};
```

---

## Webflow Code Components

### Component Structure

```
webflow-components/
├── package.json
├── tsconfig.json
├── webpack.config.js
├── src/
│   ├── index.ts                    # Entry point
│   ├── components/
│   │   ├── LoginForm.webflow.tsx
│   │   ├── PostEditor.webflow.tsx
│   │   ├── PostsList.webflow.tsx
│   │   ├── GlobalMap.webflow.tsx
│   │   └── Dashboard.webflow.tsx
│   ├── stores/
│   │   ├── authStore.ts
│   │   └── postsStore.ts
│   ├── lib/
│   │   ├── orpc-client.ts
│   │   └── query-client.ts
│   └── styles/
│       └── global.css
└── webflow.config.json
```

### Example Component

```typescript
// components/PostEditor.webflow.tsx
import { declareComponent } from '@webflow/designer';
import { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useAuthStore } from '@/stores/authStore';
import { useCreatePost, useUpdatePost } from '@/hooks/usePosts';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';

interface PostEditorProps {
  postId?: number;
  initialTitle?: string;
  initialContent?: any;
}

const PostEditorComponent = (props: PostEditorProps) => {
  const { user } = useAuthStore();
  const [title, setTitle] = useState(props.initialTitle || '');
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();
  
  const editor = useEditor({
    extensions: [StarterKit],
    content: props.initialContent,
  });
  
  const handleSave = async () => {
    const content = editor?.getJSON();
    
    if (props.postId) {
      await updatePost.mutateAsync({
        id: props.postId,
        title,
        content,
      });
    } else {
      await createPost.mutateAsync({
        title,
        content,
      });
    }
  };
  
  if (!user) {
    return <div>Please log in to create posts</div>;
  }
  
  return (
    <div className="post-editor">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Post title..."
        className="title-input"
      />
      
      <EditorContent editor={editor} className="editor-content" />
      
      <button onClick={handleSave} disabled={createPost.isPending}>
        {createPost.isPending ? 'Saving...' : 'Save Draft'}
      </button>
    </div>
  );
};

// Wrap with providers
const PostEditor = (props: PostEditorProps) => (
  <QueryClientProvider client={queryClient}>
    <PostEditorComponent {...props} />
  </QueryClientProvider>
);

export default declareComponent(PostEditor, {
  displayName: 'Post Editor',
  description: 'Rich text editor for creating blog posts',
  props: {
    postId: {
      type: 'number',
      displayName: 'Post ID',
      description: 'ID of existing post to edit',
    },
    initialTitle: {
      type: 'string',
      displayName: 'Initial Title',
    },
    initialContent: {
      type: 'json',
      displayName: 'Initial Content',
    },
  },
});
```

---

## Webflow CMS Synchronization

```typescript
// lib/webflow-sync.ts
import { WebflowClient } from 'webflow-api';
import { db } from './db';
import { posts, people } from '@/schema/posts';
import { eq } from 'drizzle-orm';

const webflow = new WebflowClient({
  accessToken: process.env.WEBFLOW_API_TOKEN!,
});

const COLLECTION_IDS = {
  posts: process.env.WEBFLOW_POSTS_COLLECTION_ID!,
  people: process.env.WEBFLOW_PEOPLE_COLLECTION_ID!,
};

export async function syncPersonToWebflow(person: typeof people.$inferSelect) {
  try {
    // Check if already synced
    if (person.webflowItemId) {
      // Update existing
      await webflow.collections.items.updateItem(
        COLLECTION_IDS.people,
        person.webflowItemId,
        {
          fieldData: {
            'display-name': person.displayName,
            'bio': person.bio || '',
            'avatar': person.avatar,
            'website': person.website,
            'external-id': person.id,
          },
        }
      );
      return person.webflowItemId;
    } else {
      // Create new
      const result = await webflow.collections.items.createItem(
        COLLECTION_IDS.people,
        {
          fieldData: {
            'display-name': person.displayName,
            'bio': person.bio || '',
            'avatar': person.avatar,
            'website': person.website,
            'external-id': person.id,
          },
        }
      );
      
      // Update local record
      await db.update(people)
        .set({ webflowItemId: result.id })
        .where(eq(people.id, person.id));
        
      return result.id;
    }
  } catch (error) {
    console.error('Webflow sync error:', error);
    throw error;
  }
}

export async function syncPostToWebflow(post: typeof posts.$inferSelect) {
  const person = await db.query.people.findFirst({
    where: eq(people.id, post.authorId),
  });
  
  if (!person) throw new Error('Author not found');
  
  // Ensure author is synced first
  const authorWebflowId = await syncPersonToWebflow(person);
  
  // Convert editor JSON to HTML for Webflow
  const htmlContent = editorJsonToHtml(post.content);
  
  try {
    if (post.webflowItemId) {
      // Update
      await webflow.collections.items.updateItem(
        COLLECTION_IDS.posts,
        post.webflowItemId,
        {
          fieldData: {
            'title': post.title,
            'slug': post.slug,
            'excerpt': post.excerpt || '',
            'content': htmlContent,
            'cover-image': post.coverImage,
            'author': authorWebflowId,
            'published-date': post.publishedAt?.toISOString(),
            'external-id': post.id.toString(),
          },
        }
      );
      return post.webflowItemId;
    } else {
      // Create
      const result = await webflow.collections.items.createItem(
        COLLECTION_IDS.posts,
        {
          fieldData: {
            'title': post.title,
            'slug': post.slug,
            'excerpt': post.excerpt || '',
            'content': htmlContent,
            'cover-image': post.coverImage,
            'author': authorWebflowId,
            'published-date': post.publishedAt?.toISOString(),
            'external-id': post.id.toString(),
          },
        }
      );
      
      return result.id;
    }
  } catch (error) {
    console.error('Post sync error:', error);
    throw error;
  }
}

function editorJsonToHtml(json: any): string {
  // Convert Lexical/Tiptap JSON to HTML
  // This will depend on which editor you choose
  // Both provide utilities for this
  return ''; // Implementation needed
}
```

---

## Project Structure

```
project-root/
├── next-app/                       # Next.js backend
│   ├── app/
│   │   ├── api/
│   │   │   └── orpc/
│   │   │       └── [...all]/
│   │   │           └── route.ts    # oRPC handler
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── server/
│   │   ├── router.ts               # oRPC/tRPC router
│   │   ├── procedures/
│   │   │   ├── auth.ts
│   │   │   └── posts.ts
│   │   └── middleware/
│   │       └── auth.ts
│   ├── lib/
│   │   ├── auth.ts                 # Better Auth config
│   │   ├── db.ts                   # Drizzle instance
│   │   └── webflow-sync.ts
│   ├── schema/
│   │   ├── auth.ts                 # Auth tables
│   │   └── posts.ts                # App tables
│   ├── drizzle/                    # Migrations
│   ├── drizzle.config.ts
│   ├── package.json
│   └── tsconfig.json
│
└── webflow-components/             # Code Components
    ├── src/
    │   ├── components/
    │   │   ├── LoginForm.webflow.tsx
    │   │   ├── PostEditor.webflow.tsx
    │   │   ├── PostsList.webflow.tsx
    │   │   ├── Dashboard.webflow.tsx
    │   │   └── GlobalMap.webflow.tsx
    │   ├── stores/
    │   │   ├── authStore.ts
    │   │   └── postsStore.ts
    │   ├── hooks/
    │   │   ├── useAuth.ts
    │   │   └── usePosts.ts
    │   ├── lib/
    │   │   ├── orpc-client.ts
    │   │   └── query-client.ts
    │   └── styles/
    │       └── global.css
    ├── webpack.config.js
    ├── package.json
    └── webflow.config.json
```

---

## Site Map & User Flows

### Pages in Webflow Site

1. **Home** (`/`)
   - Hero section
   - Featured posts (pulled from published posts)
   - Global map showing all posts

2. **Login** (`/login`)
   - LoginForm Code Component
   - Redirect to dashboard on success

3. **Register** (`/register`)
   - RegistrationForm Code Component

4. **Dashboard** (`/dashboard`) - Protected
   - Dashboard Code Component
   - Shows user's draft and published posts
   - Quick stats

5. **New Post** (`/dashboard/new`)
   - PostEditor Code Component (empty state)

6. **Edit Post** (`/dashboard/edit/[id]`)
   - PostEditor Code Component (populated with post data)

7. **Blog Index** (`/blog`)
   - PostsList Code Component (public posts only)
   - Integrated with Webflow CMS collection items

8. **Blog Post** (`/blog/[slug]`)
   - Native Webflow CMS template page
   - Uses Webflow's built-in dynamic content

### User Flow: Creating & Publishing a Post

```
1. User logs in
   ↓
2. Navigates to /dashboard/new
   ↓
3. PostEditor component loads
   - Reads auth from Zustand store
   - Initializes rich text editor
   ↓
4. User writes content
   ↓
5. Clicks "Save Draft"
   - API call: orpc.posts.create()
   - Saves to PostgreSQL
   - Status: 'draft'
   ↓
6. User continues editing
   - Auto-save every 30s
   - API call: orpc.posts.update()
   ↓
7. User clicks "Publish"
   - API call: orpc.posts.publish()
   - Server syncs to Webflow CMS
   - Updates status to 'published'
   - Sets publishedAt timestamp
   ↓
8. Post now appears:
   - In user's dashboard (as published)
   - On global map
   - On /blog index (via Webflow CMS)
   - As individual post page (Webflow CMS template)
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Set up Next.js project with TypeScript
- [ ] Configure PostgreSQL database (Neon/Vercel)
- [ ] Set up Drizzle ORM with auth schema
- [ ] Implement Better Auth configuration
- [ ] Create basic auth API routes
- [ ] Test auth flow with Postman

### Phase 2: API Layer (Week 1-2)
- [ ] Choose oRPC vs tRPC (recommend starting with oRPC)
- [ ] Set up router structure
- [ ] Implement auth procedures
- [ ] Implement posts CRUD procedures
- [ ] Add input validation with Zod
- [ ] Set up protected procedure middleware

### Phase 3: Webflow Setup (Week 2)
- [ ] Create Webflow workspace & site
- [ ] Set up CMS collections (Posts, People)
- [ ] Configure Webflow API access token
- [ ] Create pages (login, dashboard, editor, blog index)
- [ ] Test CMS API integration

### Phase 4: Code Components - Auth (Week 2-3)
- [ ] Set up webflow-components project
- [ ] Configure Webpack for Shadow DOM + Tailwind
- [ ] Implement Zustand stores (auth, posts)
- [ ] Create LoginForm component
- [ ] Create RegistrationForm component
- [ ] Test auth flow end-to-end
- [ ] Deploy components to Webflow via CLI

### Phase 5: Code Components - Editor (Week 3-4)
- [ ] Choose rich text editor (Tiptap recommended)
- [ ] Set up TanStack Query client
- [ ] Create PostEditor component
- [ ] Implement auto-save functionality
- [ ] Add image upload support
- [ ] Test editor integration

### Phase 6: Code Components - Dashboard (Week 4)
- [ ] Create PostsList component
- [ ] Create Dashboard component
- [ ] Implement post management UI (edit, delete, publish)
- [ ] Add loading states and error handling
- [ ] Test full CRUD flow

### Phase 7: Webflow CMS Sync (Week 4-5)
- [ ] Implement syncPersonToWebflow function
- [ ] Implement syncPostToWebflow function
- [ ] Create editor JSON to HTML converter
- [ ] Test publishing flow end-to-end
- [ ] Handle sync errors gracefully

### Phase 8: Global Map (Week 5)
- [ ] Choose map library (Leaflet recommended)
- [ ] Create GlobalMap component
- [ ] Fetch published posts with locations
- [ ] Add markers for each post
- [ ] Implement post preview on marker click

### Phase 9: Polish & Testing (Week 5-6)
- [ ] Add comprehensive error handling
- [ ] Implement loading skeletons
- [ ] Add optimistic updates
- [ ] Test cross-component state sync
- [ ] Performance optimization
- [ ] Security audit
- [ ] Deploy to production (Vercel)

---

## Environment Variables

### Next.js App

```bash
# .env.local

# Database
DATABASE_URL="postgresql://user:pass@host/db"

# Better Auth
BETTER_AUTH_SECRET="generate-strong-secret-key"
BETTER_AUTH_URL="http://localhost:3000"

# Webflow
WEBFLOW_API_TOKEN="your-webflow-api-token"
WEBFLOW_POSTS_COLLECTION_ID="collection-id"
WEBFLOW_PEOPLE_COLLECTION_ID="collection-id"

# App
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

### Webflow Components

```bash
# .env

NEXT_PUBLIC_API_URL="https://your-api.vercel.app"
```

---

## Security Considerations

1. **Authentication**
   - JWT tokens stored in httpOnly cookies (Better Auth default)
   - CSRF protection enabled
   - Session expiration after 7 days
   - Refresh token rotation

2. **Authorization**
   - Middleware checks on all protected procedures
   - Row-level security (users can only edit their own posts)
   - Webflow CMS access restricted to server

3. **Input Validation**
   - All inputs validated with Zod schemas
   - XSS protection in rich text content
   - SQL injection prevention via Drizzle ORM

4. **CORS**
   - Whitelist only Webflow domains
   - Credentials included in requests

5. **Rate Limiting**
   - Implement rate limiting on API routes
   - Prevent abuse of publish endpoint

---

## Deployment Checklist

### Backend (Vercel)
- [ ] Set up PostgreSQL database
- [ ] Configure environment variables
- [ ] Run database migrations
- [ ] Deploy Next.js app to Vercel
- [ ] Test API endpoints
- [ ] Set up monitoring and logging

### Webflow
- [ ] Create CMS collections
- [ ] Set up API token with proper permissions
- [ ] Build pages with placeholder components
- [ ] Deploy Code Components via CLI
- [ ] Test components in Webflow Designer
- [ ] Publish site

### Post-Deployment
- [ ] Test full user flow (register → create → publish)
- [ ] Verify CMS sync works correctly
- [ ] Check all components render properly
- [ ] Test on mobile devices
- [ ] Set up error tracking (Sentry)
- [ ] Configure analytics

---

## Resources & Documentation

### Webflow
- [Code Components Docs](https://developers.webflow.com/code-components/introduction)
- [Component Architecture](https://developers.webflow.com/code-components/component-architecture)
- [Webflow API](https://developers.webflow.com/reference/rest-introduction)

### Better Auth
- [Installation](https://www.better-auth.com/docs/installation)
- [Drizzle Adapter](https://www.better-auth.com/docs/integrations/drizzle)

### oRPC
- [Documentation](https://orpc.unnoq.com/)
- [GitHub](https://github.com/unnoq/orpc)
- [TanStack Query Integration](https://orpc.unnoq.com/docs/integrations/tanstack-query)

### tRPC (Alternative)
- [Documentation](https://trpc.io/)
- [Server Actions](https://trpc.io/blog/trpc-actions)

### Rich Text Editors
- [Tiptap](https://tiptap.dev/)
- [Lexical](https://lexical.dev/)

### State Management
- [Zustand](https://zustand-demo.pmnd.rs/)
- [Nano Stores](https://github.com/nanostores/nanostores)

---

## Potential Challenges & Solutions

### Challenge 1: Shadow DOM Styling
**Problem**: Global styles don't penetrate Shadow DOM

**Solution**: 
- Import styles directly in each component
- Use Tailwind with Shadow DOM provider
- Use CSS variables for theming

### Challenge 2: Cross-Component Communication
**Problem**: React Context doesn't work across Shadow DOMs

**Solution**:
- Use Zustand with localStorage persistence
- Custom events as fallback
- Nano Stores for reactive state

### Challenge 3: Editor Content Sync
**Problem**: Webflow CMS needs HTML, editor uses JSON

**Solution**:
- Convert editor JSON to HTML before syncing
- Store both JSON (for editing) and HTML (for Webflow)
- Use editor's built-in serializers

### Challenge 4: Authentication in Code Components
**Problem**: Auth state needs to persist across components

**Solution**:
- Store JWT in localStorage (read by Zustand)
- Check token expiration on each request
- Refresh tokens automatically
- Better Auth handles most of this

### Challenge 5: Image Uploads
**Problem**: Need to handle image uploads for posts

**Solution**:
- Create dedicated upload endpoint
- Use presigned URLs for direct S3 upload
- Or use Webflow Assets API
- Store image URLs in post metadata

---

## Cost Estimates

### Monthly Costs (USD)

- **Vercel** (Hobby): $0 (or Pro at $20/mo for better limits)
- **PostgreSQL** (Neon Free Tier): $0 (or $19/mo for Pro)
- **Webflow** (Basic Site Plan): $14/mo
- **Total**: ~$14-53/mo depending on scale

### One-Time Costs
- Domain registration (optional): ~$10-15/year

---

## Next Steps

1. **Review this architecture** with your team
2. **Choose between oRPC and tRPC** based on your preferences
3. **Set up development environment** (PostgreSQL, Webflow workspace)
4. **Start with Phase 1** (Foundation)
5. **Build incrementally** following the phases outlined
6. **Deploy early and often** to catch integration issues

---

## Questions to Consider

Before starting implementation:

1. **Editor Choice**: Tiptap (better DX) or Lexical (better performance)?
2. **API Layer**: oRPC (newer, simpler) or tRPC (more mature)?
3. **Deployment**: Vercel only, or also test other platforms?
4. **Features**: Do you need markdown support? Code snippets? Collaboration?
5. **Scale**: Expected number of users and posts?

---

This architecture provides a solid foundation for a production-ready application demonstrating the power of Webflow Code Components integrated with a full-stack Next.js backend. The Shadow DOM isolation is handled elegantly with Zustand stores, and the type-safe API layer ensures excellent developer experience and reliability.

