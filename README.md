# BlogFlow

A full-stack blog platform combining **Webflow Code Components** with a **Next.js backend** for authenticated blog post management and real-time CMS synchronization.

## Overview

BlogFlow demonstrates a modern approach to building interactive web applications using Webflow's visual design capabilities alongside a powerful server-side infrastructure. Authors can create and manage blog posts through a rich editing interface, while readers enjoy a beautifully designed, CMS-powered blog experience.

### Key Features

- ✅ **User Authentication** - Secure login and registration with Better Auth
- ✅ **Rich Text Editor** - Tiptap/Lexical editor with full formatting support
- ✅ **Blog Post Management** - Create, edit, delete, and publish posts
- ✅ **Draft System** - Save drafts and publish when ready
- ✅ **CMS Synchronization** - Automatic publishing to Webflow CMS
- ✅ **Interactive Map** - Global map showing post locations
- ✅ **Responsive Design** - Works seamlessly across all devices
- ✅ **Type-Safe API** - End-to-end type safety with oRPC
- ✅ **Real-Time Updates** - React Query for optimistic UI updates

## Tech Stack

### Frontend (Webflow Code Components)
- **React 19** with TypeScript
- **Zustand** - State management across Shadow DOM boundaries
- **TanStack Query** - Data fetching and caching
- **Tiptap** - Rich text editing
- **Tailwind CSS v4** - Styling with shadcn/ui components
- **oRPC Client** - Type-safe API calls

### Backend (Next.js)
- **Next.js 15** with App Router and Turbopack
- **oRPC** - Type-safe API layer with OpenAPI support
- **Better Auth** - Authentication with session management
- **Drizzle ORM** - Type-safe database queries
- **PostgreSQL** - Primary database
- **Webflow API SDK** - CMS synchronization
- **Zod** - Schema validation

### DevOps
- **Vercel** - Next.js backend deployment
- **Webflow CLI** - Code Components deployment
- **pnpm** - Fast, disk-efficient package manager

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    WEBFLOW SITE                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Code Components (Shadow DOM)                       │    │
│  │  - LoginForm, PostEditor, PostsList, Dashboard      │    │
│  │  - Zustand stores (cross-component state)           │    │
│  │  - TanStack Query (data fetching)                   │    │
│  └─────────────────────┬──────────────────────────────┘    │
└────────────────────────┼─────────────────────────────────────┘
                         │ HTTPS (oRPC)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  NEXT.JS API (Vercel)                        │
│  ┌────────────────────────────────────────────────────┐    │
│  │  oRPC Router                                        │    │
│  │  - Auth procedures (login, register, session)      │    │
│  │  - Posts procedures (CRUD, publish)                │    │
│  └─────────────────────┬──────────────────────────────┘    │
│                        │                                     │
│  ┌─────────────────────▼──────────────────────────────┐    │
│  │  Better Auth + Drizzle ORM + PostgreSQL            │    │
│  │  Tables: users, sessions, posts, people            │    │
│  └─────────────────────┬──────────────────────────────┘    │
└────────────────────────┼─────────────────────────────────────┘
                         │ Publish
                         ▼
                ┌─────────────────────┐
                │  Webflow CMS API    │
                │  Collections synced │
                └─────────────────────┘
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- PostgreSQL database (Neon or Vercel Postgres)
- Webflow account with Code Components access

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/blogflow.git
   cd blogflow
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   Create a `.env` file based on `env.example`:
   ```bash
   cp env.example .env
   ```

   Required variables:
   ```
   # Webflow
   WEBFLOW_WORKSPACE_API_TOKEN=ws-xxxxx...

   # Database
   DATABASE_URL=postgresql://user:password@host:port/database

   # Auth
   BETTER_AUTH_SECRET=your-secret-key
   BETTER_AUTH_URL=http://localhost:3000

   # API
   NEXT_PUBLIC_API_URL=http://localhost:3000/api/orpc
   ```

4. **Set up the database**
   ```bash
   pnpm drizzle-kit push
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```

6. **Deploy Webflow components** (optional)
   ```bash
   pnpm webflow:share
   ```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## Development Commands

```bash
# Development
pnpm dev              # Start Next.js dev server with Turbopack
pnpm build            # Build Next.js app for production
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint

# Webflow
pnpm webflow:share    # Deploy Code Components to Webflow

# Database
pnpm drizzle-kit push      # Push schema changes to database
pnpm drizzle-kit studio    # Open Drizzle Studio (database GUI)
```

## Project Structure

```
blogflow/
├── app/                    # Next.js app router pages
│   ├── api/orpc/          # oRPC API routes
│   ├── globals.css        # Global styles (imported by Webflow components)
│   └── page.tsx           # Home page
├── src/
│   └── components/        # Webflow Code Components
│       ├── *.tsx          # Component implementations
│       └── *.webflow.tsx  # Webflow wrappers
├── components/            # Shared React components
│   └── ui/               # shadcn/ui component library
├── lib/
│   ├── stores/           # Zustand state stores
│   ├── orpc-client.ts    # oRPC client setup
│   └── utils.ts          # Utility functions
├── hooks/                # Custom React hooks
├── docs/                 # Architecture documentation
├── progress/             # Feature implementation progress
├── .claude/
│   └── agents/           # Custom Claude Code agents
├── CLAUDE.md            # Project guidance for Claude Code
├── webflow.json         # Webflow CLI configuration
└── webpack.webflow.js   # Webpack config for Webflow bundling
```

## Webflow Components

### Authentication
- **LoginForm** - User login with email/password
- **RegisterForm** - New user registration

### Blog Management
- **PostEditor** - Rich text editor for creating/editing posts
- **PostsList** - Filterable list of user's posts (drafts + published)
- **Dashboard** - User dashboard overview

### Public Display
- **FeaturedPosts** - Homepage featured posts grid
- **GlobalMap** - Interactive map showing post locations

## Key Patterns

### Webflow Component Structure

Each Webflow component follows a dual-file pattern:

```typescript
// Component.tsx - Implementation
'use client';
export default function Component({ prop1 }: Props) {
  return <div>{/* implementation */}</div>;
}

// Component.webflow.tsx - Webflow wrapper
import Component from './Component';
import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import '@/app/globals.css';

export default declareComponent(Component, {
  name: 'ComponentName',
  description: 'Component description',
  group: 'Category',
  props: {
    prop1: props.Text({ name: "Prop 1", defaultValue: "default" })
  }
});
```

### State Management (Zustand)

Cross-component state uses Zustand (React Context doesn't work across Shadow DOM):

```typescript
// lib/stores/auth-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      clearAuth: () => set({ user: null, token: null }),
    }),
    { name: 'auth-storage' }
  )
);
```

### Type-Safe API Calls (oRPC)

```typescript
// Client usage in component
import { useQuery, useMutation } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc-client';

function PostsList() {
  const { data: posts } = useQuery(
    orpc.posts.list.queryOptions({
      input: { status: 'published' },
    })
  );

  const deleteMutation = useMutation(
    orpc.posts.delete.mutationOptions()
  );

  return (/* UI */);
}
```

## Deployment

### Backend (Vercel)

1. Connect repository to Vercel
2. Configure environment variables
3. Deploy:
   ```bash
   vercel --prod
   ```

### Frontend (Webflow)

1. Build components locally
2. Deploy with Webflow CLI:
   ```bash
   pnpm webflow:share
   ```
3. Add components to Webflow pages
4. Publish Webflow site

## Documentation

Comprehensive documentation is available in the `./docs` folder:

- **[Architecture Guide](./docs/webflow-nextjs-architecture.md)** - Full system design and technical decisions
- **[Sitemap](./docs/sitemap.md)** - All pages, routes, and components
- **[Quick Start Guide](./docs/quick-start-guide.md)** - Step-by-step setup instructions
- **[oRPC React Query Guide](./docs/orpc-react-query-correct.md)** - API integration patterns
- **[Webflow Routing Guide](./docs/webflow-routing-guide.md)** - Query parameter navigation
- **[Advanced Patterns](./docs/advanced-patterns.md)** - Production best practices
- **[Configuration Reference](./docs/configuration-reference.md)** - All config files explained

## Contributing

We use specialized Claude Code agents for feature development:

- **feature-delivery-coordinator** - Plans and orchestrates feature delivery
- **feature-implementer** - Implements specific features/phases
- **documentation-agent** - Maintains documentation and progress tracking

See `.claude/agents/` for agent definitions.

## License

MIT

## Support

For questions or issues, please check the documentation in `./docs` or open an issue on GitHub.

---

Built with [Webflow Code Components](https://webflow.com/code-components), [Next.js](https://nextjs.org/), and [oRPC](https://orpc.unnoq.com/)
