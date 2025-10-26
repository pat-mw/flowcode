# Quick Start Guide: Webflow + Next.js Blog Platform

This guide will help you get started quickly with the implementation.

## Prerequisites

```bash
# Required tools
node >= 18
pnpm >= 8
git
```

## Step 1: Initialize Projects

### Backend (Next.js)

```bash
# Create Next.js app
pnpm create next-app@latest blog-backend --typescript --tailwind --app --no-src-dir

cd blog-backend

# Install dependencies
pnpm add @orpc/server @orpc/client @orpc/tanstack-query @orpc/react
pnpm add better-auth drizzle-orm drizzle-kit
pnpm add @tanstack/react-query zod
pnpm add pg dotenv
pnpm add -D @types/pg

# Initialize Drizzle
pnpm drizzle-kit init
```

### Frontend (Webflow Components)

```bash
# Create components project
mkdir blog-webflow-components && cd blog-webflow-components
pnpm init

# Install dependencies
pnpm add react react-dom
pnpm add @webflow/designer
pnpm add zustand @tanstack/react-query
pnpm add @tiptap/react @tiptap/starter-kit @tiptap/pm
pnpm add @orpc/client @orpc/tanstack-query
pnpm add -D webpack webpack-cli typescript ts-loader
pnpm add -D @types/react @types/react-dom
pnpm add -D tailwindcss postcss autoprefixer
```

## Step 2: Database Setup

### Create PostgreSQL Database

**Option A: Neon (Recommended)**
1. Go to [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string

**Option B: Vercel Postgres**
1. Go to your Vercel dashboard
2. Add Postgres storage
3. Copy connection string

### Configure Drizzle

**`drizzle.config.ts`**
```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './schema/index.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### Create Schema Files

**`schema/auth.ts`**
```typescript
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

**`schema/posts.ts`**
```typescript
import { pgTable, text, timestamp, jsonb, serial } from 'drizzle-orm/pg-core';
import { users } from './auth';

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
  webflowItemId: text('webflow_item_id').unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  content: jsonb('content').notNull(),
  excerpt: text('excerpt'),
  coverImage: text('cover_image'),
  authorId: text('author_id')
    .notNull()
    .references(() => people.id, { onDelete: 'cascade' }),
  status: text('status').notNull().default('draft'),
  publishedAt: timestamp('published_at'),
  webflowItemId: text('webflow_item_id').unique(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```

**`schema/index.ts`**
```typescript
export * from './auth';
export * from './posts';
```

### Run Migrations

```bash
# Generate migration
pnpm drizzle-kit generate

# Apply migration
pnpm drizzle-kit migrate
```

## Step 3: Configure Better Auth

**`lib/db.ts`**
```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '@/schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });
```

**`lib/auth.ts`**
```typescript
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
});

export type Session = typeof auth.$Infer.Session;
```

## Step 4: Create oRPC Router

**`server/context.ts`**
```typescript
import { auth } from '@/lib/auth';
import type { IncomingHttpHeaders } from 'http';

export async function createContext({ headers }: { headers: IncomingHttpHeaders }) {
  const session = await auth.api.getSession({ headers });
  
  return {
    headers,
    session,
    user: session?.user,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
```

**`server/procedures.ts`**
```typescript
import { os } from '@orpc/server';
import type { Context } from './context';

export const publicProcedure = os.$context<Context>();

export const protectedProcedure = publicProcedure.use(async ({ context, next }) => {
  if (!context.user) {
    throw new Error('UNAUTHORIZED');
  }
  
  return next({
    context: {
      ...context,
      user: context.user,
    },
  });
});
```

**`server/routers/auth.ts`**
```typescript
import { publicProcedure } from '../procedures';
import { auth } from '@/lib/auth';
import { z } from 'zod';

export const authRouter = {
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8),
        name: z.string().min(2),
      })
    )
    .handler(async ({ input }) => {
      const result = await auth.api.signUp.email({
        body: input,
      });
      
      return result;
    }),
    
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .handler(async ({ input }) => {
      const result = await auth.api.signIn.email({
        body: input,
      });
      
      return result;
    }),
    
  getSession: publicProcedure
    .handler(async ({ context }) => {
      return context.session;
    }),
    
  logout: protectedProcedure
    .handler(async ({ context }) => {
      await auth.api.signOut({
        headers: context.headers,
      });
      
      return { success: true };
    }),
};
```

**`server/routers/posts.ts`**
```typescript
import { protectedProcedure, publicProcedure } from '../procedures';
import { db } from '@/lib/db';
import { posts, people } from '@/schema/posts';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';

export const postsRouter = {
  list: protectedProcedure
    .input(
      z.object({
        status: z.enum(['draft', 'published']).optional(),
      })
    )
    .handler(async ({ input, context }) => {
      // Get user's person profile
      const person = await db.query.people.findFirst({
        where: eq(people.userId, context.user.id),
      });
      
      if (!person) return [];
      
      const userPosts = await db.query.posts.findMany({
        where: and(
          eq(posts.authorId, person.id),
          input.status ? eq(posts.status, input.status) : undefined
        ),
        orderBy: (posts, { desc }) => [desc(posts.updatedAt)],
      });
      
      return userPosts;
    }),
    
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        content: z.any(),
        excerpt: z.string().optional(),
      })
    )
    .handler(async ({ input, context }) => {
      // Get or create person profile
      let person = await db.query.people.findFirst({
        where: eq(people.userId, context.user.id),
      });
      
      if (!person) {
        const [newPerson] = await db.insert(people).values({
          id: crypto.randomUUID(),
          userId: context.user.id,
          displayName: context.user.name,
        }).returning();
        person = newPerson;
      }
      
      // Generate slug
      const slug = input.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      
      const [post] = await db.insert(posts).values({
        title: input.title,
        content: input.content,
        excerpt: input.excerpt,
        slug,
        authorId: person.id,
      }).returning();
      
      return post;
    }),
    
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        content: z.any().optional(),
        excerpt: z.string().optional(),
      })
    )
    .handler(async ({ input, context }) => {
      const { id, ...updates } = input;
      
      // Verify ownership
      const post = await db.query.posts.findFirst({
        where: eq(posts.id, id),
        with: { author: true },
      });
      
      if (!post || post.author.userId !== context.user.id) {
        throw new Error('FORBIDDEN');
      }
      
      const [updated] = await db.update(posts)
        .set(updates)
        .where(eq(posts.id, id))
        .returning();
        
      return updated;
    }),
    
  publish: protectedProcedure
    .input(z.object({ id: z.number() }))
    .handler(async ({ input, context }) => {
      // Get post
      const post = await db.query.posts.findFirst({
        where: eq(posts.id, input.id),
        with: { author: true },
      });
      
      if (!post || post.author.userId !== context.user.id) {
        throw new Error('FORBIDDEN');
      }
      
      // TODO: Sync to Webflow
      
      const [published] = await db.update(posts)
        .set({
          status: 'published',
          publishedAt: new Date(),
        })
        .where(eq(posts.id, input.id))
        .returning();
        
      return published;
    }),
    
  publicList: publicProcedure
    .handler(async () => {
      const publishedPosts = await db.query.posts.findMany({
        where: eq(posts.status, 'published'),
        with: { author: true },
        orderBy: (posts, { desc }) => [desc(posts.publishedAt)],
      });
      
      return publishedPosts;
    }),
};
```

**`server/router.ts`**
```typescript
import { authRouter } from './routers/auth';
import { postsRouter } from './routers/posts';

export const router = {
  auth: authRouter,
  posts: postsRouter,
};

export type Router = typeof router;
```

## Step 5: Create API Route

**`app/api/orpc/[...all]/route.ts`**
```typescript
import { router } from '@/server/router';
import { createContext } from '@/server/context';
import { createORPCHandler } from '@orpc/server/fetch';

const handler = createORPCHandler({
  router,
  context: async (request) => {
    const headers = Object.fromEntries(request.headers);
    return createContext({ headers });
  },
});

export const GET = handler;
export const POST = handler;
```

## Step 6: Create Webflow Components

**`webflow-components/src/lib/orpc-client.ts`**
```typescript
import { createORPCClient } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';
import type { Router } from '../../../blog-backend/server/router';

const link = new RPCLink({
  url: process.env.NEXT_PUBLIC_API_URL + '/api/orpc',
  headers: () => {
    const token = localStorage.getItem('auth-token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
});

export const orpc = createORPCClient<Router>(link);
```

**`webflow-components/src/stores/authStore.ts`**
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
}

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

**`webflow-components/src/components/LoginForm.webflow.tsx`**
```typescript
import { declareComponent } from '@webflow/designer';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { orpc } from '../lib/orpc-client';
import { useAuthStore } from '../stores/authStore';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setAuth } = useAuthStore();
  
  const loginMutation = useMutation({
    mutationFn: (data: { email: string; password: string }) => 
      orpc.auth.login(data),
    onSuccess: (data) => {
      if (data.user && data.token) {
        setAuth(data.user, data.token);
        window.location.href = '/dashboard';
      }
    },
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded"
        />
      </div>
      
      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded"
        />
      </div>
      
      <button
        type="submit"
        disabled={loginMutation.isPending}
        className="w-full bg-blue-600 text-white py-2 rounded"
      >
        {loginMutation.isPending ? 'Logging in...' : 'Log In'}
      </button>
      
      {loginMutation.isError && (
        <p className="text-red-600">Login failed. Please try again.</p>
      )}
    </form>
  );
};

export default declareComponent(LoginForm, {
  displayName: 'Login Form',
  description: 'User login form',
});
```

## Step 7: Environment Variables

**Backend `.env.local`**
```bash
DATABASE_URL="postgresql://user:pass@host/db"
BETTER_AUTH_SECRET="your-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

**Frontend `.env`**
```bash
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

## Step 8: Test Locally

```bash
# Backend
cd blog-backend
pnpm dev

# Frontend (separate terminal)
cd blog-webflow-components
pnpm dev
```

## Step 9: Deploy to Webflow

```bash
cd blog-webflow-components

# Build components
pnpm build

# Install Webflow CLI
npm install -g @webflow/cli

# Initialize Webflow project
webflow init

# Publish components
webflow publish
```

## Step 10: Deploy Backend

```bash
cd blog-backend

# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

## Troubleshooting

### Database Connection Issues
```bash
# Test connection
psql $DATABASE_URL

# Verify migrations
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

### Auth Not Working
- Check BETTER_AUTH_SECRET is set
- Verify DATABASE_URL is correct
- Ensure sessions table exists

### Components Not Loading
- Check NEXT_PUBLIC_API_URL is correct
- Verify CORS settings
- Check browser console for errors

## Next Steps

1. Add image upload functionality
2. Implement Webflow CMS sync
3. Create remaining components (PostEditor, Dashboard, etc.)
4. Add error boundaries and loading states
5. Implement optimistic updates

## Useful Commands

```bash
# Database
pnpm drizzle-kit generate    # Generate migrations
pnpm drizzle-kit migrate     # Run migrations
pnpm drizzle-kit studio      # Open database UI

# Development
pnpm dev                     # Start dev server
pnpm build                   # Build for production
pnpm start                   # Start production server

# Webflow
webflow init                 # Initialize project
webflow dev                  # Start dev mode
webflow publish              # Publish components
```

