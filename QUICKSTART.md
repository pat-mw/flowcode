# BlogFlow Quick Start Guide

Get BlogFlow up and running in **under 10 minutes**.

## Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** installed ([download](https://nodejs.org/))
- **pnpm** installed (`npm install -g pnpm`)
- **PostgreSQL database** (we recommend [Neon](https://neon.tech) or [Vercel Postgres](https://vercel.com/storage/postgres))
- **Webflow account** (optional, only needed for deploying Webflow components)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/pat-mw/blogflow.git
cd blogflow
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

Copy the example environment file:

```bash
cp env.example .env
```

Now open `.env` and configure the required variables (see [Environment Variables Guide](#environment-variables-guide) below).

### 4. Set Up the Database

Generate and run migrations to create all required tables:

```bash
pnpm db:generate
pnpm db:migrate
```

**Quick Demo Alternative** (⚠️ Not recommended):

```bash
pnpm db:push
```

> **Warning**: `db:push` directly modifies your database schema without generating migration files. This makes it difficult to:
> - Track schema changes in version control
> - Roll back changes if needed
> - Migrate to proper migrations later (requires manual reconciliation)
>
> Use `db:push` only for quick prototyping or demos. Always use migrations for real projects.

### 5. Start the Development Server

```bash
pnpm dev
```

The app will be available at **http://localhost:3000**

### 6. (Optional) Test Webflow Components Bundle

Before deploying to Webflow, test the bundle locally to catch any webpack issues:

```bash
pnpm webflow:bundle
```

This will:
- Bundle all Webflow Code Components using webpack
- Output bundled files to `dist/` directory
- Verify that imports, styles, and environment variables work correctly
- Catch "process is not defined" and other browser compatibility issues

**When to use this:**
- ✅ Before deploying to Webflow (catch issues early)
- ✅ After modifying webpack configuration
- ✅ After adding new `NEXT_PUBLIC_*` environment variables
- ✅ When debugging component bundling issues

**Debug mode** (shows detailed webpack output):
```bash
pnpm webflow:bundle:debug
```

See `docs/webflow-local-development.md` for detailed debugging guide.

### 7. (Optional) Deploy Webflow Components

After testing the bundle locally, deploy components to Webflow:

```bash
pnpm webflow:share
```

**Requirements:**
- `WEBFLOW_WORKSPACE_API_TOKEN` set in `.env`
- Webflow account with Code Components access

---

## Environment Variables Guide

### Required Variables

These are **absolutely required** for the app to function:

#### 1. Database Configuration

```bash
# Primary database URL for Drizzle ORM (REQUIRED)
DRIZZLE_DATABASE_URL="postgresql://user:password@host.region.neon.tech:6543/blogflow?sslmode=require"
```

**Where to get this:**

Option A: **Neon (Recommended)**
1. Create free account at [https://neon.tech](https://neon.tech)
2. Create a new project (database will be created automatically)
3. Go to Dashboard → Connection Details
4. Copy the **Pooled connection** string (port 6543)
5. Paste as `DRIZZLE_DATABASE_URL`

Option B: **Vercel Postgres**
1. Create project on [Vercel](https://vercel.com)
2. Navigate to Storage tab → Create Database → Postgres
3. Go to `.env.local` tab in Vercel dashboard
4. Copy the `POSTGRES_URL` value (the pooled connection)
5. Paste as `DRIZZLE_DATABASE_URL`

Option C: **Supabase**
1. Create project at [https://supabase.com](https://supabase.com)
2. Go to Project Settings → Database
3. Find "Connection Pooling" section
4. Copy the connection string in **Transaction mode** (port 6543)
5. Paste as `DRIZZLE_DATABASE_URL`

**Note:** Use the **pooled connection** (port 6543) for serverless compatibility with Vercel/Next.js.

#### 2. Authentication (Better Auth)

```bash
# Secret key for JWT signing (REQUIRED)
BETTER_AUTH_SECRET="your-random-secret-key-here"

# Base URL for your application (REQUIRED)
BETTER_AUTH_URL="http://localhost:3000"
```

**How to generate `BETTER_AUTH_SECRET`:**

```bash
# Option 1: Using OpenSSL (Mac/Linux)
openssl rand -base64 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Online generator
# Visit: https://generate-secret.vercel.app/32
```

**`BETTER_AUTH_URL` values:**
- Development: `http://localhost:3000`
- Production: `https://yourdomain.vercel.app` (or your deployed URL)

#### 3. Public API URL

```bash
# API base URL for client-side requests (REQUIRED)
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

**Values:**
- Development: `http://localhost:3000`
- Production: `https://yourdomain.vercel.app`

#### 4. Webflow Workspace Token

```bash
# Workspace API token for deploying components (REQUIRED)
WEBFLOW_WORKSPACE_API_TOKEN="ws-xxxxx"
```

**How to get this:**

1. Go to [Webflow Dashboard](https://webflow.com/dashboard)
2. Navigate to Account Settings → Apps
3. Scroll to "Workspace API"
4. Click "Generate token"
5. Copy the `ws-xxxxx` token

This token is required to deploy Webflow Code Components using `pnpm webflow:share` or `pnpm webflow:bundle`.

---

### Optional Variables

These variables enable additional features but are **not required** to run the app:

#### 1. Supabase Configuration (Optional)

Only needed if using Supabase for authentication or storage or other features.
The default set up is already configured with drizzle for querying and mutating the db directly
so Supabase direct support is not strictly necessary

```bash
SUPABASE_URL="https://xxxxx.supabase.co"
SUPABASE_ANON_KEY="eyJhbGc..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGc..."
SUPABASE_JWT_SECRET="your-jwt-secret"
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGc..."
```

**Where to get these:**
1. Go to Supabase project settings
2. Navigate to API section
3. Copy URL and keys

#### 2. Google OAuth (Optional)

Enables "Sign in with Google" functionality:

```bash
GOOGLE_CLIENT_ID="xxxxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxxx"
NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED="true"
```

**How to set up Google OAuth:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Navigate to "APIs & Services" → "Credentials"
4. Click "Create Credentials" → "OAuth 2.0 Client ID"
5. Select "Web application"
6. Add authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
7. Copy Client ID and Client Secret
8. Set `NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED="true"` to show the Google sign-in button

#### 3. Webflow CMS Sync (Optional)

Only needed if you want to sync blog posts to Webflow CMS collections:

```bash
# Site-specific API token for CMS operations
WEBFLOW_API_TOKEN="xxxxx"

# CMS Collection IDs (get after creating collections in Webflow)
WEBFLOW_POSTS_COLLECTION_ID="xxxxx"
WEBFLOW_PEOPLE_COLLECTION_ID="xxxxx"
```

**How to get these:**

1. **Site API Token** (for CMS sync):
   - Open your Webflow site in the Designer
   - Go to Site Settings → Integrations → API Access
   - Generate new token with CMS permissions
   - Copy the token

2. **Collection IDs**:
   - In Webflow Designer, navigate to CMS Collections
   - Click on a collection (e.g., "Posts") → Settings
   - Copy Collection ID from the URL or settings panel
   - Repeat for each collection you need to sync

**Note:** These are only needed if you're implementing CMS synchronization to publish posts from BlogFlow to your Webflow site's CMS.

---

## Minimal `.env` for Development

Here's the **absolute minimum** to get started:

```bash
# Database (use Neon free tier - pooled connection on port 6543)
DRIZZLE_DATABASE_URL="postgresql://user:pass@host.neon.tech:6543/blogflow?sslmode=require"

# Authentication
BETTER_AUTH_SECRET="<generate with: openssl rand -base64 32>"
BETTER_AUTH_URL="http://localhost:3000"

# API
NEXT_PUBLIC_API_URL="http://localhost:3000"

# Webflow (get from https://webflow.com/dashboard/account/apps)
WEBFLOW_WORKSPACE_API_TOKEN="ws-xxxxx"
```

With just these **5 variables**, you can:
- Run the full Next.js app locally
- Create users and authenticate
- Create, edit, and manage blog posts
- Bundle and deploy Webflow Code Components
- Test all core functionality

---

## Database Setup Explained

### Option 1: Generate Migrations (Recommended)

```bash
# Generate migration files from your Drizzle schema
pnpm db:generate

# Apply migrations to your database
pnpm db:migrate
```

**Benefits:**
- ✅ Migration files are version controlled (`lib/db/migrations/`)
- ✅ Track all schema changes over time
- ✅ Easy to roll back changes if needed
- ✅ Safe for production deployments
- ✅ Team members can sync schema changes

**How it works:**
1. `pnpm db:generate` compares your Drizzle schema with the current database and generates SQL migration files
2. `pnpm db:migrate` executes those migrations against your database

### Option 2: Push Schema (Quick Demo Only)

```bash
pnpm db:push
```

**⚠️ Warning**: This directly modifies your database schema without generating migration files.

**Use cases:**
- Quick prototyping
- One-off demos
- Local experimentation

**Drawbacks:**
- ❌ No migration history
- ❌ Can't roll back changes
- ❌ Difficult to migrate to proper migrations later
- ❌ Not suitable for production or team development

### View Your Database

Open Drizzle Studio to browse your database:

```bash
pnpm db:studio
```

Opens a web UI at `https://local.drizzle.studio` where you can view and edit data.

---

## Common Issues

### "process is not defined" error in browser

This means environment variables aren't properly configured in `webpack.webflow.js`. Check that all `NEXT_PUBLIC_*` variables are included in the DefinePlugin.

### "Connection refused" database errors

- Verify `DRIZZLE_DATABASE_URL` is correct
- Check if database is running (for local PostgreSQL)
- Ensure SSL mode is set: `?sslmode=require` for hosted databases (Neon, Supabase, Vercel)
- Use the **pooled connection** (port 6543) for serverless compatibility
- Test connection with: `psql "<your-database-url>"`

### "JWT secret not configured" auth errors

Generate a proper `BETTER_AUTH_SECRET`:
```bash
openssl rand -base64 32
```

### Webflow components not appearing

1. Ensure `WEBFLOW_WORKSPACE_API_TOKEN` is set
2. Run `pnpm webflow:bundle` to test bundling locally
3. Deploy with `pnpm webflow:share`
4. Check Webflow dashboard for component status

---

## Next Steps

Once the app is running:

1. **Create an account** - Visit http://localhost:3000 and register
2. **Create a post** - Use the PostEditor component
3. **View your posts** - Check the Dashboard component
4. **Explore the code** - Check `CLAUDE.md` for project architecture
5. **Read the docs** - See `docs/` folder for detailed guides

## Available Commands

```bash
# Development
pnpm dev                    # Start dev server (with Turbopack)
pnpm build                  # Build for production
pnpm start                  # Start production server
pnpm lint                   # Run ESLint

# Database
pnpm db:generate            # Generate migration files (recommended)
pnpm db:migrate             # Run migrations (recommended)
pnpm db:push                # Push schema directly (⚠️ demos only, no migration history)
pnpm db:studio              # Open Drizzle Studio

# Webflow
pnpm webflow:share          # Deploy components to Webflow
pnpm webflow:bundle         # Bundle locally (test only)
pnpm webflow:bundle:debug   # Bundle with debug output
```

---

## Production Deployment

### Deploy Backend to Vercel

1. Push code to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Add environment variables (all from `.env` except local URLs)
4. Update URLs:
   - `BETTER_AUTH_URL="https://your-app.vercel.app"`
   - `NEXT_PUBLIC_API_URL="https://your-app.vercel.app"`
5. Deploy

### Deploy Components to Webflow

1. Update `.env` with production API URL
2. Run: `pnpm webflow:share`
3. Add components to Webflow pages
4. Publish site

---

## Need Help?

- Check `docs/` folder for detailed documentation
- See `CLAUDE.md` for development guidance
- Review `README.md` for architecture overview
- Open an issue on GitHub

Happy building!
