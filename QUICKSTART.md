# Getting Started with Flowcode

This guide will help you set up Flowcode for local development and deploy your first Webflow Code Component library.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Setup](#local-setup)
3. [Understanding the Architecture](#understanding-the-architecture)
4. [Creating Your First Component](#creating-your-first-component)
5. [Testing Locally](#testing-locally)
6. [Deploying to Webflow](#deploying-to-webflow)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **pnpm** 8+ (Install: `npm install -g pnpm`)
- **Git** ([Download](https://git-scm.com/))

### Required Accounts

- **GitHub account** - For repository access
- **Webflow account** - With Code Components access
- **PostgreSQL database** - Neon (recommended) or Vercel Postgres
- **Vercel account** (optional) - For backend deployment

### Get Your Webflow API Token

1. Go to [Webflow Workspace Settings](https://webflow.com/dashboard/workspace)
2. Navigate to "Integrations" → "Developer API"
3. Create a new API token with workspace access
4. Copy the token (starts with `ws-`)

## Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/flowcode.git
cd flowcode
```

### 2. Install Dependencies

```bash
pnpm install
```

This will install all required packages including:
- Next.js 15
- React 19
- Webflow CLI
- Drizzle ORM
- And 1300+ other dependencies

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp env.example .env
```

Edit `.env` and fill in the required values:

```env
# Webflow API Token (required for deploying components)
WEBFLOW_WORKSPACE_API_TOKEN=ws-xxxxx...

# Database Connection (PostgreSQL)
DATABASE_URL=postgresql://user:password@host:port/database

# Better Auth Configuration
BETTER_AUTH_SECRET=your-secret-key-here-min-32-chars
BETTER_AUTH_URL=http://localhost:3000

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api/orpc
NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED=false

# Optional: Google OAuth (if enabled above)
# GOOGLE_CLIENT_ID=your-google-client-id
# GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**Generate a secure secret:**
```bash
openssl rand -base64 32
```

### 4. Set Up the Database

**Option A: Neon (Recommended)**

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Paste it as `DATABASE_URL` in `.env`

**Option B: Vercel Postgres**

1. Create a Vercel project
2. Add Postgres storage
3. Copy the connection string from environment variables

**Push the schema:**

```bash
pnpm db:push
```

This creates all required tables (users, sessions, posts, people, waitlist).

### 5. Start the Development Server

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) - you should see the Flowcode homepage.

## Understanding the Architecture

### Multi-Library System

Flowcode is organized into **multiple independent libraries** that deploy separately:

```
src/libraries/
├── core/         # Authentication, navigation, shared utilities
├── analytics/    # Charts, metrics, dashboards
├── blogDemo/     # Blog posts, rich text editor
├── registry/     # Component browsing and deployment
└── webcn/        # Landing page components
```

Each library is a self-contained package with:
- Its own components
- Its own `webflow.json` manifest (auto-generated)
- Independent deployment lifecycle
- Deployment toggle (`deploy.enabled` flag)

### Component Dual-File Pattern

Every Webflow component has **two files**:

**1. Implementation** (`Component.tsx`):
```typescript
'use client';
export default function MyComponent({ title }: { title: string }) {
  return <div className="p-4"><h1>{title}</h1></div>;
}
```

**2. Webflow Wrapper** (`Component.webflow.tsx`):
```typescript
import MyComponent from './MyComponent';
import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import '@/app/globals.css';  // Import global styles

export default declareComponent(MyComponent, {
  name: 'My Component',
  description: 'A simple component',
  group: 'Flowcode Core',
  props: {
    title: props.Text({
      name: 'Title',
      defaultValue: 'Hello World',
    }),
  },
});
```

### API Communication

Components use **oRPC** for type-safe API calls:

```typescript
import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc-client';

function MyComponent() {
  const { data: posts } = useQuery(
    orpc.posts.list.queryOptions({
      input: { status: 'published' },
    })
  );

  return <div>{posts?.map(post => ...)}</div>;
}
```

## Creating Your First Component

### 1. Choose a Library

Decide which library your component belongs to:
- **core** - Authentication, navigation, utilities
- **analytics** - Data visualization, metrics
- **blogDemo** - Content management
- **registry** - Component browsing
- **webcn** - Marketing/landing pages

Or create a new library (see README.md).

### 2. Create Component Files

```bash
# Create implementation
touch src/libraries/core/components/MyButton.tsx

# Create Webflow wrapper
touch src/libraries/core/components/MyButton.webflow.tsx
```

**MyButton.tsx:**
```typescript
'use client';

interface MyButtonProps {
  label: string;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
}

export default function MyButton({ label, variant = 'primary', onClick }: MyButtonProps) {
  const baseStyles = 'px-4 py-2 rounded font-medium';
  const variantStyles = variant === 'primary'
    ? 'bg-blue-600 text-white hover:bg-blue-700'
    : 'bg-gray-200 text-gray-800 hover:bg-gray-300';

  return (
    <button
      className={`${baseStyles} ${variantStyles}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
```

**MyButton.webflow.tsx:**
```typescript
import MyButton from './MyButton';
import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import '@/app/globals.css';

export default declareComponent(MyButton, {
  name: 'My Button',
  description: 'A customizable button component',
  group: 'Flowcode Core',
  props: {
    label: props.Text({
      name: 'Button Label',
      defaultValue: 'Click Me',
    }),
    variant: props.Variant({
      name: 'Variant',
      options: [
        { label: 'Primary', value: 'primary' },
        { label: 'Secondary', value: 'secondary' },
      ],
      defaultValue: 'primary',
    }),
  },
});
```

### 3. Register Component in Library

Edit `src/libraries/core/index.ts`:

```typescript
export const coreComponents = [
  // ... existing components
  {
    name: 'MyButton',
    path: './components/MyButton.webflow',
    previewImage: '/previews/my-button.png', // Optional
  },
];
```

## Testing Locally

### 1. Generate Manifests

```bash
pnpm library:manifests
```

This creates `webflow.json` files for all libraries.

### 2. Build the Library

```bash
pnpm library:build core
```

Check output in `dist/core/` directory.

### 3. Test in Next.js App

Create a test page in `app/test/page.tsx`:

```typescript
import MyButton from '@/src/libraries/core/components/MyButton';

export default function TestPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Component Test</h1>
      <MyButton label="Test Button" variant="primary" />
    </div>
  );
}
```

Visit [http://localhost:3000/test](http://localhost:3000/test)

## Deploying to Webflow

### Automatic Deployment (Recommended)

1. **Commit your changes:**
   ```bash
   git add .
   git commit -m "feat: add MyButton component"
   ```

2. **Push to main branch:**
   ```bash
   git push origin main
   ```

3. **GitHub Actions will:**
   - Detect changes in `src/libraries/`
   - Build affected libraries
   - Deploy to Webflow automatically
   - Report success/failure

4. **Monitor deployment:**
   - Go to GitHub → Actions tab
   - Watch "Deploy Webflow Libraries" workflow
   - Check logs for any errors

### Manual Deployment

**Deploy a single library:**

```bash
# Build the library
pnpm library:build core

# Deploy via Webflow CLI
cp src/libraries/core/webflow.json ./webflow.json
npx webflow library share --manifest ./webflow.json --no-input
rm ./webflow.json
```

**Deploy all libraries:**

```bash
pnpm library:build:all
# Then use GitHub Actions or deploy each library individually
```

### Using Components in Webflow

1. **Open Webflow Designer**
2. **Add elements panel** → "Components" tab
3. **Find your library** (e.g., "Flowcode Core")
4. **Drag component** onto the canvas
5. **Configure props** in the right panel
6. **Publish your site**

## Troubleshooting

### "Cannot find module 'webpack'" Error

**Symptom:** CI/CD fails with webpack module not found

**Solution:** Webpack is now included as a devDependency. If error persists:
```bash
pnpm add -D webpack
```

### "Person profile not found" Error

**Symptom:** New users get errors after registration

**Solution:** This is fixed via `getOrCreatePerson` helper. If you see this error:
1. Check `lib/api/helpers/getOrCreatePerson.ts` exists
2. Verify all procedures use `getOrCreatePerson(userId)` instead of direct queries

### Toast Notifications Not Working

**Symptom:** Sonner toasts don't appear in Webflow

**Solution:** Toasts don't work in Shadow DOM. Use alternative patterns:
- Save status indicators (Saving.../Saved)
- Browser-native alerts (`window.confirm`, `window.alert`)
- Silent error handling

### Database Connection Issues

**Symptom:** "Connection refused" or "Invalid credentials"

**Solution:**
1. Verify `DATABASE_URL` in `.env` is correct
2. Check database is accessible (not behind firewall)
3. For Neon: Enable "Pooler" connection string for serverless
4. Test connection: `pnpm db:push`

### Build Fails - Bundle Too Large

**Symptom:** "Bundle exceeds 15MB limit"

**Solution:**
1. Split components across multiple libraries
2. Remove unused dependencies
3. Use dynamic imports for large components
4. Check for duplicate dependencies in bundle

### Components Not Appearing in Webflow

**Symptom:** Library deployed but components missing

**Solution:**
1. Verify `deploy.enabled: true` in `src/libraries/index.ts`
2. Check `webflow.json` was generated correctly
3. Refresh Webflow Designer (Ctrl/Cmd + R)
4. Check library is enabled in Webflow workspace settings

### Environment Variables Not Working

**Symptom:** API calls fail with 404 or wrong URL

**Solution:**
1. Check `webpack.webflow.js` includes your env var in `DefinePlugin`
2. Prefix public vars with `NEXT_PUBLIC_`
3. Rebuild library after changing env vars
4. Verify bundle contains correct URLs: `grep -r "localhost" dist/`

## Next Steps

- **Explore existing components** - See `src/libraries/*/components/` for examples
- **Check the codebase** - Review component implementations to understand patterns
- **Join discussions** - Use GitHub Discussions for questions
- **Contribute** - Follow the Contributing guide in README.md

For architecture details and advanced patterns, more comprehensive documentation is coming soon.

## Getting Help

- **Code Examples:** Check existing components in `src/libraries/`
- **Issues:** [GitHub Issues](https://github.com/yourusername/flowcode/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourusername/flowcode/discussions)

---

Happy coding! 🚀
