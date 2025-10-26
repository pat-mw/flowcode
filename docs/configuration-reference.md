# Complete Configuration Reference

## Backend (Next.js) Package.json

```json
{
  "name": "blog-backend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@orpc/server": "^1.10.0",
    "@orpc/client": "^1.10.0",
    "@orpc/react": "^1.10.0",
    "@orpc/tanstack-query": "^1.10.0",
    "@orpc/openapi": "^1.10.0",
    "@orpc/zod": "^1.10.0",
    "@tanstack/react-query": "^5.59.0",
    "better-auth": "^0.9.0",
    "drizzle-orm": "^0.36.0",
    "next": "15.1.0",
    "pg": "^8.13.1",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "webflow-api": "^2.0.0",
    "zod": "^3.23.8",
    "dotenv": "^16.4.5"
  },
  "devDependencies": {
    "@types/node": "^22.10.1",
    "@types/pg": "^8.11.10",
    "@types/react": "^19.0.1",
    "@types/react-dom": "^19.0.1",
    "drizzle-kit": "^0.28.0",
    "eslint": "^9.15.0",
    "eslint-config-next": "15.1.0",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.15",
    "typescript": "^5.7.2"
  }
}
```

## Frontend (Webflow Components) Package.json

```json
{
  "name": "blog-webflow-components",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "webpack serve --mode development",
    "build": "webpack --mode production",
    "type-check": "tsc --noEmit",
    "webflow:init": "webflow init",
    "webflow:dev": "webflow dev",
    "webflow:publish": "webflow publish"
  },
  "dependencies": {
    "@orpc/client": "^1.10.0",
    "@orpc/tanstack-query": "^1.10.0",
    "@tanstack/react-query": "^5.59.0",
    "@tiptap/react": "^2.9.1",
    "@tiptap/starter-kit": "^2.9.1",
    "@tiptap/extension-placeholder": "^2.9.1",
    "@tiptap/extension-image": "^2.9.1",
    "@webflow/designer": "^1.0.0",
    "nanostores": "^0.11.3",
    "@nanostores/react": "^0.8.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "zustand": "^5.0.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@webflow/cli": "^1.0.0",
    "@webflow/emotion-utils": "^1.0.0",
    "autoprefixer": "^10.4.20",
    "css-loader": "^7.1.2",
    "html-webpack-plugin": "^5.6.3",
    "postcss": "^8.4.49",
    "postcss-loader": "^8.1.1",
    "style-loader": "^4.0.0",
    "tailwindcss": "^3.4.15",
    "ts-loader": "^9.5.1",
    "typescript": "^5.7.2",
    "webpack": "^5.96.1",
    "webpack-cli": "^5.1.4",
    "webpack-dev-server": "^5.1.0"
  }
}
```

## TypeScript Configuration

### Backend tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "checkJs": false,
    "noEmit": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true,
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Frontend tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "allowSyntheticDefaultImports": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## Webpack Configuration (Webflow Components)

```javascript
// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => {
  const isDevelopment = argv.mode === 'development';

  return {
    entry: './src/index.ts',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'components.js',
      library: {
        name: 'WebflowComponents',
        type: 'umd',
      },
      clean: true,
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: [
            'style-loader',
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [
                    require('tailwindcss'),
                    require('autoprefixer'),
                  ],
                },
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html',
      }),
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, 'public'),
      },
      compress: true,
      port: 3001,
      hot: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },
    externals: isDevelopment ? {} : {
      react: 'React',
      'react-dom': 'ReactDOM',
    },
  };
};
```

## Tailwind Configuration

### Backend tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
};
```

### Frontend tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
    },
  },
  plugins: [],
};
```

## PostCSS Configuration

```javascript
// postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

## ESLint Configuration

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
};
```

## Drizzle Configuration

```typescript
// drizzle.config.ts
import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './schema/index.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
```

## Webflow Configuration

```json
// webflow.config.json
{
  "name": "blog-components",
  "version": "1.0.0",
  "components": {
    "LoginForm": {
      "path": "./dist/components/LoginForm.js",
      "displayName": "Login Form",
      "category": "Authentication"
    },
    "PostEditor": {
      "path": "./dist/components/PostEditor.js",
      "displayName": "Post Editor",
      "category": "Content"
    },
    "PostsList": {
      "path": "./dist/components/PostsList.js",
      "displayName": "Posts List",
      "category": "Content"
    },
    "Dashboard": {
      "path": "./dist/components/Dashboard.js",
      "displayName": "Dashboard",
      "category": "Content"
    },
    "GlobalMap": {
      "path": "./dist/components/GlobalMap.js",
      "displayName": "Global Map",
      "category": "Visualization"
    }
  }
}
```

## Environment Variables Templates

### Backend .env.example

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# Better Auth
BETTER_AUTH_SECRET="generate-with-openssl-rand-base64-32"
BETTER_AUTH_URL="http://localhost:3000"

# Webflow
WEBFLOW_API_TOKEN="your-webflow-api-token"
WEBFLOW_POSTS_COLLECTION_ID="collection-id-here"
WEBFLOW_PEOPLE_COLLECTION_ID="collection-id-here"

# App Configuration
NEXT_PUBLIC_API_URL="http://localhost:3000"
NODE_ENV="development"

# Optional: Error Tracking
SENTRY_DSN="your-sentry-dsn"

# Optional: Analytics
NEXT_PUBLIC_GA_TRACKING_ID="GA-TRACKING-ID"
```

### Frontend .env.example

```bash
# API Configuration
NEXT_PUBLIC_API_URL="http://localhost:3000"

# Webflow
WEBFLOW_WORKSPACE_ID="your-workspace-id"

# Optional: Feature Flags
ENABLE_AUTOSAVE="true"
AUTOSAVE_INTERVAL="30000"
```

## Docker Configuration (Optional)

### Dockerfile

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy dependency files
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set production environment
ENV NODE_ENV production

# Build
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: blog
      POSTGRES_PASSWORD: blogpass
      POSTGRES_DB: blog_db
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U blog']
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    build: .
    ports:
      - '3000:3000'
    environment:
      DATABASE_URL: postgresql://blog:blogpass@postgres:5432/blog_db
      BETTER_AUTH_SECRET: ${BETTER_AUTH_SECRET}
      BETTER_AUTH_URL: http://localhost:3000
      NEXT_PUBLIC_API_URL: http://localhost:3000
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./.env:/app/.env

volumes:
  postgres_data:
```

## GitHub Actions CI/CD

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 8
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Run type check
        run: pnpm type-check
        
      - name: Run migrations
        run: pnpm db:push
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
          
      - name: Run tests
        run: pnpm test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Vercel Configuration

```json
// vercel.json
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "DATABASE_URL": "@database_url",
    "BETTER_AUTH_SECRET": "@better_auth_secret",
    "WEBFLOW_API_TOKEN": "@webflow_api_token"
  },
  "build": {
    "env": {
      "NEXT_PUBLIC_API_URL": "https://your-domain.vercel.app"
    }
  }
}
```

## Database Migration Script

```typescript
// scripts/migrate.ts
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  
  const db = drizzle(pool);
  
  console.log('Running migrations...');
  
  await migrate(db, { migrationsFolder: './drizzle' });
  
  console.log('Migrations complete!');
  
  await pool.end();
}

main().catch((err) => {
  console.error('Migration failed!');
  console.error(err);
  process.exit(1);
});
```

## Database Seed Script

```typescript
// scripts/seed.ts
import 'dotenv/config';
import { db } from '../lib/db';
import { users, people, posts } from '../schema';
import { auth } from '../lib/auth';

async function seed() {
  console.log('Seeding database...');
  
  // Create test user
  const testUser = await auth.api.signUp.email({
    body: {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    },
  });
  
  if (!testUser.user) {
    throw new Error('Failed to create test user');
  }
  
  // Create person profile
  const [person] = await db.insert(people).values({
    id: crypto.randomUUID(),
    userId: testUser.user.id,
    displayName: 'Test User',
    bio: 'A test user account',
  }).returning();
  
  // Create sample posts
  await db.insert(posts).values([
    {
      title: 'First Blog Post',
      slug: 'first-blog-post',
      content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'This is my first blog post!' }] }] },
      excerpt: 'My first blog post',
      authorId: person.id,
      status: 'published',
      publishedAt: new Date(),
    },
    {
      title: 'Second Blog Post',
      slug: 'second-blog-post',
      content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'This is my second blog post!' }] }] },
      excerpt: 'My second blog post',
      authorId: person.id,
      status: 'draft',
    },
  ]);
  
  console.log('Database seeded successfully!');
}

seed().catch((err) => {
  console.error('Seed failed!');
  console.error(err);
  process.exit(1);
});
```

## VS Code Configuration

```json
// .vscode/settings.json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

```json
// .vscode/extensions.json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "Prisma.prisma"
  ]
}
```

## Prettier Configuration

```javascript
// .prettierrc.js
module.exports = {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  arrowParens: 'always',
  endOfLine: 'lf',
};
```

```
// .prettierignore
node_modules
.next
dist
build
coverage
.vercel
*.min.js
```

## Git Configuration

```
# .gitignore
# dependencies
node_modules
.pnp
.pnp.js

# testing
coverage

# next.js
.next/
out/
build
dist/

# production
build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# drizzle
drizzle/
```

