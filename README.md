# Flowcode

A **multi-library Webflow Code Components system** with a **Next.js backend** for authenticated workflows, component registry management, and real-time CMS synchronization.

## Overview

Flowcode demonstrates a modern approach to building reusable, production-ready Webflow Code Components across multiple libraries. The project combines Webflow's visual design capabilities with a powerful server-side infrastructure for authentication, data management, and automated deployments.

### Key Features

- ✅ **Multi-Library Architecture** - Organized component libraries (Core, Analytics, BlogFlow Demo, Component Registry)
- ✅ **Automated CI/CD** - Parallel library deployments via GitHub Actions
- ✅ **User Authentication** - Secure login and registration with Better Auth
- ✅ **Type-Safe API** - End-to-end type safety with oRPC
- ✅ **Component Registry** - Browse, preview, and deploy components
- ✅ **Rich Text Editor** - Tiptap editor with full formatting support
- ✅ **CMS Synchronization** - Automatic publishing to Webflow CMS
- ✅ **Real-Time Updates** - React Query for optimistic UI updates
- ✅ **Responsive Design** - Works seamlessly across all devices

## Tech Stack

### Frontend (Webflow Code Components)
- **React 19** with TypeScript
- **Zustand** - State management across Shadow DOM boundaries
- **TanStack Query** - Data fetching and caching
- **Tiptap** - Rich text editing
- **Tailwind CSS v4** - Styling with shadcn/ui components
- **oRPC Client** - Type-safe API calls
- **React Three Fiber** - 3D graphics and animations

### Backend (Next.js)
- **Next.js 15** with App Router and Turbopack
- **oRPC** - Type-safe API layer with OpenAPI support
- **Better Auth** - Authentication with session management
- **Drizzle ORM** - Type-safe database queries
- **PostgreSQL** - Primary database (Neon/Vercel Postgres)
- **Webflow API SDK** - CMS synchronization
- **Zod** - Schema validation

### DevOps
- **Vercel** - Next.js backend deployment
- **Webflow CLI** - Code Components deployment
- **GitHub Actions** - Automated library deployments
- **pnpm** - Fast, disk-efficient package manager

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  WEBFLOW SITE                                │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Multi-Library Code Components (Shadow DOM)         │    │
│  │  - Flowcode Core (Auth, Navigation, etc.)          │    │
│  │  - Flowcode Analytics (Charts, Metrics)            │    │
│  │  - BlogFlow Demo (Posts, Editor)                   │    │
│  │  - Component Registry Dashboard                    │    │
│  │  - webcn Landing Page                              │    │
│  └─────────────────────┬──────────────────────────────┘    │
└────────────────────────┼─────────────────────────────────────┘
                         │ HTTPS (oRPC)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              NEXT.JS API (Vercel)                            │
│  ┌────────────────────────────────────────────────────┐    │
│  │  oRPC Router                                        │    │
│  │  - Auth procedures (login, register, session)      │    │
│  │  - Posts procedures (CRUD, publish)                │    │
│  │  - People procedures (profile management)          │    │
│  │  - Waitlist procedures (email collection)         │    │
│  └─────────────────────┬──────────────────────────────┘    │
│                        │                                     │
│  ┌─────────────────────▼──────────────────────────────┐    │
│  │  Better Auth + Drizzle ORM + PostgreSQL            │    │
│  │  Tables: users, sessions, posts, people, waitlist  │    │
│  └─────────────────────┬──────────────────────────────┘    │
└────────────────────────┼─────────────────────────────────────┘
                         │ Publish
                         ▼
                ┌─────────────────────┐
                │  Webflow CMS API    │
                │  Collections synced │
                └─────────────────────┘
```

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 8+
- PostgreSQL database (Neon or Vercel Postgres)
- Webflow account with Code Components access

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/flowcode.git
   cd flowcode
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
   ```env
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
   pnpm db:push
   ```

5. **Start development server**
   ```bash
   pnpm dev
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

# Webflow Libraries
pnpm library:list           # List all libraries and their deployment status
pnpm library:manifests      # Generate webflow.json manifests for all libraries
pnpm library:build <key>    # Build a specific library
pnpm library:build:all      # Build all deployable libraries

# Webflow CLI (Legacy - prefer GitHub Actions for deployment)
pnpm webflow:share          # Deploy components to Webflow
pnpm webflow:bundle         # Bundle components locally for testing

# Database
pnpm db:generate      # Generate Drizzle migrations
pnpm db:migrate       # Run migrations
pnpm db:push          # Push schema changes to database
pnpm db:studio        # Open Drizzle Studio (database GUI)
```

## Project Structure

```
flowcode/
├── .github/
│   └── workflows/            # CI/CD pipelines
│       ├── webflow-deploy-all.yml      # ✅ Production: Deploy all libraries
│       ├── webflow-pr-check.yml        # 🚧 In Progress: PR validation
│       └── webflow-deploy.yml          # 🚧 Legacy: Single library deploy
├── app/                      # Next.js app router pages
│   ├── api/orpc/            # oRPC API routes
│   ├── globals.css          # Global styles (imported by Webflow components)
│   └── page.tsx             # Home page
├── src/libraries/           # Multi-library architecture (see below)
│   ├── core/               # Flowcode Core library
│   ├── analytics/          # Flowcode Analytics library
│   ├── blogDemo/           # BlogFlow Demo library
│   ├── registry/           # Component Registry Dashboard
│   ├── webcn/              # webcn Landing Page library
│   └── index.ts            # Library registry and deployment config
├── components/              # Shared React components
│   └── ui/                 # shadcn/ui component library
├── lib/
│   ├── api/                # oRPC backend
│   │   ├── routers/       # API routers (auth, posts, people, waitlist)
│   │   ├── procedures.ts  # Procedure definitions
│   │   └── context.ts     # Request context
│   ├── db/                # Database schema and migrations
│   ├── stores/            # Zustand state stores
│   ├── orpc-client.ts     # oRPC client setup
│   └── utils.ts           # Utility functions
├── scripts/               # Build and deployment scripts
│   ├── generate-manifests.ts   # Generate webflow.json files
│   ├── build-library.ts        # Build single library
│   └── build-all-libraries.ts  # Build all libraries
├── hooks/                # Custom React hooks
├── docs/                 # Architecture documentation
├── CLAUDE.md            # Project guidance for Claude Code
├── webflow.json         # Root Webflow CLI configuration (unused in multi-lib)
└── webpack.webflow.js   # Webpack config for Webflow bundling
```

### src/libraries/ Structure

Each library is a self-contained Code Components package:

```
src/libraries/<library-key>/
├── components/              # Library-specific components
│   ├── *.tsx               # Component implementations
│   └── *.webflow.tsx       # Webflow wrappers
├── index.ts                # Library exports and metadata
├── webflow.json            # Generated manifest (auto-created)
└── README.md              # Library documentation
```

**Library Registry** (`src/libraries/index.ts`):
- Central configuration for all libraries
- Controls deployment via `deploy.enabled` flag
- Defines library metadata (name, ID, description, icon, etc.)
- Used by CI/CD to detect deployable libraries

## CI/CD Pipeline

### Production Workflow: Deploy All Libraries

**File:** `.github/workflows/webflow-deploy-all.yml`

Automatically deploys all enabled libraries in parallel when changes are pushed to `main`:

**Triggers:**
- Push to `main` branch with changes to `src/libraries/**/*`, `components/**/*`, or `scripts/**/*`
- Manual trigger via `workflow_dispatch`

**Process:**
1. **Detect Deployable Libraries** - Scans `src/libraries/index.ts` for libraries with `deploy.enabled: true`
2. **Parallel Deployment** - Deploys up to 3 libraries concurrently to avoid rate limits
3. **Per-Library Steps:**
   - Generate `webflow.json` manifest
   - Build library with production environment variables
   - Verify bundle contains production API URLs (not localhost)
   - Deploy to Webflow via CLI
4. **Deployment Summary** - Reports overall success/failure

**Environment Variables:**
- `WEBFLOW_WORKSPACE_API_TOKEN` - Required for deployment (stored in GitHub secrets)
- `NEXT_PUBLIC_API_URL` - Production API endpoint (e.g., `https://flowcode-api.vercel.app`)
- `NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED` - OAuth configuration
- `WEBFLOW_BUNDLE_SIZE_LIMIT_MB` - Bundle size limit (default: 15MB)

**Example Output:**
```
✅ Detect Deployable Libraries (25s)
✅ Deploy Flowcode Core (1m23s)
✅ Deploy Flowcode Analytics (1m23s)
✅ Deploy BlogFlow Demo (2m8s)
✅ Deploy webcn Landing Page (1m38s)
✅ Deploy Component Registry Dashboard (4m13s)
✅ Deployment Summary
```

### Other Workflows (In Progress)

- **webflow-pr-check.yml** - 🚧 Validates PR changes, checks bundle sizes, runs tests
- **webflow-deploy.yml** - 🚧 Legacy single-library deployment (being phased out)

## Library Management

### Enable/Disable Library Deployment

Edit `src/libraries/index.ts`:

```typescript
export const libraries = {
  core: {
    name: 'Flowcode Core',
    id: 'flowcode-core',
    deploy: {
      enabled: true,  // ✅ Deploy this library
    },
    // ...
  },
  experimental: {
    name: 'Experimental Features',
    id: 'flowcode-experimental',
    deploy: {
      enabled: false,  // ❌ Skip this library
    },
    // ...
  },
};
```

### Create a New Library

1. **Create library directory:**
   ```bash
   mkdir -p src/libraries/mylib/components
   ```

2. **Add library to registry** (`src/libraries/index.ts`):
   ```typescript
   export const libraries = {
     // ... existing libraries
     mylib: {
       name: 'My Library',
       id: 'my-library-unique-id',
       description: 'Description of my library',
       icon: '🚀',
       deploy: {
         enabled: true,
       },
       components: [],
     },
   };
   ```

3. **Create components:**
   - Implementation: `src/libraries/mylib/components/MyComponent.tsx`
   - Webflow wrapper: `src/libraries/mylib/components/MyComponent.webflow.tsx`

4. **Generate manifest:**
   ```bash
   pnpm library:manifests
   ```

5. **Build and deploy:**
   ```bash
   pnpm library:build mylib
   # Or push to main to trigger CI/CD
   ```

## Key Development Patterns

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

### Shadow DOM Compatibility

Webflow Code Components run in isolated Shadow DOM environments. **Avoid:**

- ❌ `next/navigation` hooks (`useRouter`, `usePathname`)
- ❌ `next/link` component (use `<a>` tags)
- ❌ `next/image` component (use `<img>`)
- ❌ React Context for cross-component state (use Zustand)
- ❌ Direct `process.env` access (use webpack DefinePlugin)

**Use:**

- ✅ Browser-native navigation: `window.location.href = '/path'`
- ✅ Standard HTML: `<a>`, `<img>`, `<button>`
- ✅ Zustand stores for state
- ✅ `fetch()` for API calls

## Contributing

### Fork and Pull Request Workflow

1. **Fork the repository** on GitHub

2. **Clone your fork:**
   ```bash
   git clone https://github.com/yourusername/flowcode.git
   cd flowcode
   ```

3. **Create a feature branch:**
   ```bash
   git checkout -b feature/my-feature
   ```

4. **Make your changes:**
   - Follow the `src/libraries/` structure for new components
   - Add components to the appropriate library or create a new one
   - Update library metadata in `src/libraries/index.ts`
   - Ensure all TypeScript types are correct
   - Test locally before committing

5. **Commit with descriptive messages:**
   ```bash
   git add .
   git commit -m "feat: add MyComponent to core library"
   ```

6. **Push to your fork:**
   ```bash
   git push origin feature/my-feature
   ```

7. **Open a Pull Request:**
   - Describe your changes clearly
   - Reference any related issues
   - Wait for CI/CD checks to pass
   - Request review

### Contribution Guidelines

#### Library Structure
- **Keep libraries focused** - Each library should have a clear purpose
- **Reuse components** - Share components via `components/` directory when appropriate
- **Document thoroughly** - Add JSDoc comments and update library README
- **Test in Webflow** - Verify components work in Webflow's Shadow DOM environment

#### Code Quality
- **TypeScript strict mode** - All code must pass type checking
- **ESLint compliance** - Fix all linting errors before committing
- **Consistent naming** - Follow existing naming conventions
- **Component props** - Use `@webflow/data-types` for Webflow props

#### Deployment
- **Set `deploy.enabled: false`** for experimental libraries
- **Test builds locally** - Run `pnpm library:build <key>` before pushing
- **Bundle size** - Keep bundles under 15MB per library
- **Environment variables** - Use production URLs in deployments

#### Git Workflow
- **One feature per PR** - Keep PRs focused and reviewable
- **Descriptive commits** - Use conventional commit format (`feat:`, `fix:`, `docs:`, etc.)
- **Clean history** - Squash commits before merging if needed
- **Up-to-date branches** - Rebase on main before submitting PR

### Code Review Process

PRs will be reviewed for:
- ✅ Functionality and correctness
- ✅ TypeScript type safety
- ✅ Shadow DOM compatibility
- ✅ Library structure adherence
- ✅ Documentation completeness
- ✅ CI/CD pipeline success

## Deployment

### Backend (Vercel)

1. Connect repository to Vercel
2. Configure environment variables (same as `.env`)
3. Deploy automatically on push to `main`

### Frontend (Webflow)

**Automatic (Recommended):**
- Push changes to `main` branch
- GitHub Actions will deploy all enabled libraries

**Manual:**
```bash
pnpm library:build <library-key>
# Then manually deploy via Webflow CLI or dashboard
```

## Documentation

Comprehensive documentation is available in the `./docs` folder:

- **[Architecture Guide](./docs/webflow-nextjs-architecture.md)** - Full system design
- **[Sitemap](./docs/sitemap.md)** - All pages, routes, and components
- **[oRPC React Query Guide](./docs/orpc-react-query-correct.md)** - API patterns
- **[Webflow Routing Guide](./docs/webflow-routing-guide.md)** - Navigation strategies
- **[Local Development](./docs/webflow-local-development.md)** - Bundling and debugging

## License

MIT

## Support

- **Documentation:** Check `./docs` for detailed guides
- **Issues:** Open an issue on GitHub
- **Discussions:** Use GitHub Discussions for questions

---

Built with [Webflow Code Components](https://webflow.com/code-components), [Next.js](https://nextjs.org/), and [oRPC](https://orpc.unnoq.com/)
