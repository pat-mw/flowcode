# Environment Variable Injection Issue - Root Cause Analysis

## Problem Statement

After redeploying all Webflow libraries via GitHub Actions, the **blogflow-core** library components (LoginForm, RegistrationForm, etc.) are attempting to make API calls to `http://localhost:3000` instead of the production environment `https://blogflow-three.vercel.app`.

Despite multiple redeployments, the issue persists, indicating that environment variables are not being injected correctly during the build/deploy process.

---

## Architecture Overview

### Environment Variable Flow

The system uses a multi-stage environment variable injection pipeline:

```
GitHub Secrets
    ↓
GitHub Workflow (webflow-deploy-all.yml)
    ↓
Node.js Process Environment (process.env)
    ↓
Library Config (src/libraries/core/index.ts)
    ↓
Build Script (scripts/build-library.ts)
    ↓
Webpack DefinePlugin (webpack.webflow.js)
    ↓
Bundled Component Code (HARDCODED at build time)
    ↓
Deployed to Webflow (static bundles)
```

**Critical Understanding:** Environment variables are **NOT** runtime values in Webflow Code Components. They are **compile-time constants** that get hardcoded into the webpack bundle via `DefinePlugin`.

---

## Configuration Files Analysis

### 1. Webpack Configuration (`webpack.webflow.js`)

**Location:** `/webpack.webflow.js`

```javascript
plugins: [
  new webpack.DefinePlugin({
    'process.env.NEXT_PUBLIC_API_URL': JSON.stringify(
      process.env.NEXT_PUBLIC_API_URL || ''
    ),
    'process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED': JSON.stringify(
      process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED || ''
    ),
  }),
]
```

**Purpose:**
- Replaces all occurrences of `process.env.NEXT_PUBLIC_API_URL` in the code with a **string literal** at build time
- Example: `process.env.NEXT_PUBLIC_API_URL` → `"https://blogflow-three.vercel.app"`

**Status:** ✅ Configuration is correct

---

### 2. Library Configuration (`src/libraries/core/index.ts`)

**Location:** `/src/libraries/core/index.ts`

```typescript
export const coreLibrary: LibraryConfig = {
  name: "BlogFlow Core",
  description: "Core authentication, posts, and navigation components",
  id: "blogflow-core",

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED: process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED,
  },

  deploy: {
    enabled: true,
    workspaceToken: process.env.WEBFLOW_WORKSPACE_API_TOKEN,
  },
};
```

**Purpose:**
- Defines which environment variables should be passed to the library's webpack build
- Read at runtime by `scripts/build-library.ts`

**Status:** ✅ Configuration is correct

---

### 3. Build Script (`scripts/build-library.ts`)

**Location:** `/scripts/build-library.ts:50-71`

```typescript
// Set environment variables for this library
const envVars = Object.entries(lib.env || {})
  .filter(([_, value]) => value !== undefined)
  .map(([key, value]) => `${key}="${value}"`)
  .join(" ");

const command = [
  envVars,
  "npx webflow library bundle",
  outputPathFlag,
  devFlag,
  publicPathFlag,
]
  .filter(Boolean)
  .join(" ");

// Example: NEXT_PUBLIC_API_URL="https://blogflow-three.vercel.app" npx webflow library bundle ...
```

**Purpose:**
- Reads environment variables from the library config
- Prepends them to the webpack bundle command
- Passes them to the webpack process

**Status:** ✅ Logic is correct

---

### 4. Webflow Manifests (`webflow.json`)

**All libraries correctly reference the root webpack config:**

- `src/libraries/core/webflow.json` → `"bundleConfig": "./webpack.webflow.js"` ✅
- `src/libraries/webcn/webflow.json` → `"bundleConfig": "./webpack.webflow.js"` ✅
- `src/libraries/waitlist/webflow.json` → `"webpack": "./webpack.webflow.js"` ✅

**Status:** ✅ All manifests correctly point to the webpack config

---

## GitHub Workflow Analysis

### Deployment Workflow (`webflow-deploy-all.yml`)

#### Job 1: Detect Libraries (Lines 16-58)

```yaml
- name: Detect deployable libraries
  id: set-matrix
  env:
    NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL || 'http://localhost:3000' }}
  run: |
    MATRIX=$(npx --silent tsx -e "...")
```

**Issue:** Environment variable is set here but only used for the detection script (minimal impact).

---

#### Job 2: Deploy Library (Lines 60-125)

##### Step 2a: Build Library (Lines 104-110)

```yaml
- name: Build library
  env:
    WEBFLOW_BUNDLE_SIZE_LIMIT_MB: ${{ secrets.WEBFLOW_BUNDLE_SIZE_LIMIT_MB || '15' }}
    NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL || 'http://localhost:3000' }}
  run: |
    echo "Building ${{ matrix.library.name }} before deployment..."
    pnpm library:build ${{ matrix.library.key }}
```

**⚠️ CRITICAL ISSUE FOUND:**

```yaml
NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL || 'http://localhost:3000' }}
```

**Problem:**
- If the GitHub secret `NEXT_PUBLIC_API_URL` is **NOT SET** in the repository settings, the fallback value `'http://localhost:3000'` is used
- This fallback gets passed to the build script
- Webpack then **hardcodes** `"http://localhost:3000"` into the bundle
- The deployed Webflow components will forever use localhost until rebuilt with the correct value

---

##### Step 2b: Deploy to Webflow (Lines 112-125)

```yaml
- name: Deploy to Webflow
  env:
    WEBFLOW_WORKSPACE_API_TOKEN: ${{ secrets.WEBFLOW_WORKSPACE_API_TOKEN }}
  run: |
    cp src/libraries/${{ matrix.library.key }}/webflow.json ./webflow.json
    npx webflow library share \
      --manifest ./webflow.json \
      --no-input
```

**Note:** Environment variables are **NOT** needed in the deploy step because:
- The deploy step only uploads pre-built bundles to Webflow
- Environment variables were already baked into the bundles during the build step
- Webflow components are static JavaScript bundles with hardcoded values

---

## Component Usage Analysis

### Components Using `process.env.NEXT_PUBLIC_API_URL`

All core library components rely on this environment variable:

1. **Auth Client** (`lib/auth/client.ts:15`):
   ```typescript
   export const authClient = createAuthClient({
     baseURL: process.env.NEXT_PUBLIC_API_URL,
   });
   ```

2. **oRPC Client** (`lib/orpc-client.ts:82`):
   ```typescript
   const link = new RPCLink({
     url: `${process.env.NEXT_PUBLIC_API_URL}/api/orpc`,
   });
   ```

3. **LoginForm** (`components/LoginForm.tsx`):
   - Uses `authClient` which depends on `NEXT_PUBLIC_API_URL`

4. **RegistrationForm** (`components/RegistrationForm.tsx`):
   - Direct fetch: `${process.env.NEXT_PUBLIC_API_URL}/api/auth/sign-in/email`
   - Direct fetch: `${process.env.NEXT_PUBLIC_API_URL}/api/orpc/auth/getSession`

5. **PostEditor** (`components/PostEditor.tsx`):
   - Multiple direct fetches to `/api/orpc/posts/*` endpoints

**Impact:** All authentication and API calls will fail if pointing to localhost:3000 in production.

---

## Root Cause Identification

### Primary Issue: Missing GitHub Secret

**Root Cause:**
```yaml
NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL || 'http://localhost:3000' }}
```

The GitHub Actions workflow has a **fallback value** of `'http://localhost:3000'` when the secret is not set.

**Evidence:**
- User reports that deployed components are trying to call `localhost:3000`
- This is the exact fallback value in the workflow
- The secret `NEXT_PUBLIC_API_URL` was likely never configured in GitHub repository settings

**Verification Command:**
```bash
# Check if the secret is configured in GitHub
gh secret list
```

---

### Why Multiple Redeployments Didn't Fix It

1. User deployed multiple times via GitHub Actions
2. Each deployment used the fallback value `'http://localhost:3000'`
3. Webpack hardcoded this value into the bundles
4. Webflow received bundles with localhost hardcoded
5. Redeploying the same incorrect bundle doesn't fix the hardcoded value

**Analogy:** It's like making photocopies of a document with a typo. Making more copies doesn't fix the typo - you need to fix the original first.

---

## Comparison: Local vs CI Environment

### Local Development (Working)

**package.json scripts:**
```json
"webflow:share": "NEXT_PUBLIC_API_URL=https://blogflow-three.vercel.app NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED=false npx webflow library share --no-input"
```

**Why it works:**
- Environment variable is explicitly set in the command
- No reliance on `.env` file or GitHub secrets
- Direct inline assignment ensures correct value

---

### GitHub Actions (Broken)

**Workflow:**
```yaml
env:
  NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL || 'http://localhost:3000' }}
```

**Why it fails:**
- Depends on GitHub secret being configured
- If secret is missing, uses fallback value
- No explicit production value like the package.json script

---

## Solution

### Option 1: Configure GitHub Secret (Recommended)

**Steps:**

1. Navigate to GitHub repository settings:
   ```
   GitHub Repo → Settings → Secrets and variables → Actions → New repository secret
   ```

2. Add the following secret:
   ```
   Name: NEXT_PUBLIC_API_URL
   Value: https://blogflow-three.vercel.app
   ```

3. Optionally add for multi-environment support:
   ```
   Name: NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED
   Value: false
   ```

4. Trigger a new deployment:
   ```bash
   git commit --allow-empty -m "Trigger redeploy with correct env vars"
   git push origin main
   ```

**Verification:**
- Check the GitHub Actions logs to see `NEXT_PUBLIC_API_URL=https://blogflow-three.vercel.app` in the build step
- Test the deployed components in Webflow to confirm they call the production API

---

### Option 2: Hardcode Production URL in Workflow (Quick Fix)

**Modify `.github/workflows/webflow-deploy-all.yml`:**

```yaml
# Line 42 (detect-libraries job)
env:
  NEXT_PUBLIC_API_URL: https://blogflow-three.vercel.app

# Line 107 (deploy-library job)
- name: Build library
  env:
    WEBFLOW_BUNDLE_SIZE_LIMIT_MB: ${{ secrets.WEBFLOW_BUNDLE_SIZE_LIMIT_MB || '15' }}
    NEXT_PUBLIC_API_URL: https://blogflow-three.vercel.app  # Changed from secret with fallback
    NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED: false
  run: |
    echo "Building ${{ matrix.library.name }} before deployment..."
    pnpm library:build ${{ matrix.library.key }}
```

**Pros:**
- No need to configure GitHub secrets
- Matches the local `package.json` pattern
- Simple and explicit

**Cons:**
- Hardcoded URL in the workflow file
- Less flexible for staging/production environments
- Requires workflow file changes to update URL

---

### Option 3: Remove Fallback Value (Fail-Fast)

**Modify `.github/workflows/webflow-deploy-all.yml`:**

```yaml
- name: Build library
  env:
    WEBFLOW_BUNDLE_SIZE_LIMIT_MB: ${{ secrets.WEBFLOW_BUNDLE_SIZE_LIMIT_MB || '15' }}
    NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL }}  # Remove fallback
    NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED: ${{ secrets.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED || 'false' }}
  run: |
    # Fail early if secret is not set
    if [ -z "$NEXT_PUBLIC_API_URL" ]; then
      echo "❌ ERROR: NEXT_PUBLIC_API_URL secret is not configured"
      echo "Please configure it in GitHub Settings → Secrets → Actions"
      exit 1
    fi
    echo "Building ${{ matrix.library.name }} before deployment..."
    pnpm library:build ${{ matrix.library.key }}
```

**Pros:**
- Prevents silent failures with incorrect values
- Forces proper secret configuration
- More robust CI/CD practice

**Cons:**
- Requires configuring the secret (can't skip it)
- Builds will fail until secret is set

---

## Additional Workflow Issues

### Issue: webflow-deploy.yml (Old Single-Library Workflow)

**Location:** `.github/workflows/webflow-deploy.yml`

**Status:** This appears to be an older workflow for deploying the root `webflow.json` (blogflow-interactive library).

**Lines 61-65:**
```yaml
- name: Deploy to Webflow
  env:
    WEBFLOW_WORKSPACE_API_TOKEN: ${{ secrets.WEBFLOW_WORKSPACE_API_TOKEN }}
    NEXT_PUBLIC_API_URL: https://blogflow-three.vercel.app  # Hardcoded correctly ✅
    NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED: false
  run: pnpm webflow:share
```

**Note:** This workflow **correctly hardcodes** the production URL without fallback.

**Recommendation:** Consider deprecating this workflow in favor of `webflow-deploy-all.yml` for consistency.

---

## Verification Checklist

After implementing the solution, verify:

- [ ] GitHub secret `NEXT_PUBLIC_API_URL` is configured (Option 1)
- [ ] OR workflow file has hardcoded production URL (Option 2)
- [ ] Trigger a fresh deployment (empty commit or manual workflow trigger)
- [ ] Check GitHub Actions logs to confirm correct URL in build step
- [ ] Inspect bundled code in `dist/` directory locally to verify URL replacement:
  ```bash
  pnpm library:build core
  grep -r "localhost:3000" dist/core/
  # Should return no results
  grep -r "blogflow-three.vercel.app" dist/core/
  # Should find multiple matches
  ```
- [ ] Test deployed components in Webflow to confirm API calls work
- [ ] Check browser DevTools Network tab to verify API requests go to production URL

---

## Preventive Measures

### 1. Add Build-Time Validation

**Update `webpack.webflow.js`:**

```javascript
const requiredEnvVars = ['NEXT_PUBLIC_API_URL'];

for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    throw new Error(
      `❌ BUILD FAILED: Required environment variable ${varName} is not set.\n` +
      `Please set it in your environment or .env file.\n` +
      `Example: ${varName}=https://yourdomain.vercel.app`
    );
  }
}

module.exports = {
  // ... rest of config
```

This ensures builds fail early with clear error messages instead of silently using empty strings.

---

### 2. Add GitHub Actions Check

**Update workflow to validate secrets before building:**

```yaml
- name: Validate environment variables
  run: |
    if [ -z "$NEXT_PUBLIC_API_URL" ]; then
      echo "❌ ERROR: NEXT_PUBLIC_API_URL is not set"
      exit 1
    fi
    if [[ "$NEXT_PUBLIC_API_URL" == *"localhost"* ]]; then
      echo "⚠️  WARNING: NEXT_PUBLIC_API_URL contains 'localhost' - is this intentional?"
      exit 1
    fi
    echo "✅ Environment variables validated"
    echo "NEXT_PUBLIC_API_URL: $NEXT_PUBLIC_API_URL"
```

---

### 3. Add Post-Build Verification

**Update `scripts/build-library.ts`:**

```typescript
function verifyBundleEnvVars(library: LibraryKey) {
  const distPath = path.join(process.cwd(), "dist", library);

  // Check if bundle contains localhost references
  try {
    const result = execSync(`grep -r "localhost:3000" ${distPath} || true`, {
      encoding: 'utf-8'
    });

    if (result.trim()) {
      console.error(`\n❌ BUNDLE VERIFICATION FAILED!`);
      console.error(`Found localhost references in bundle:`);
      console.error(result);
      process.exit(1);
    }

    console.log(`✅ Bundle verification passed - no localhost references\n`);
  } catch (error) {
    console.warn(`⚠️  Could not verify bundle contents\n`);
  }
}

// Call after buildLibrary()
verifyBundleEnvVars(libraryArg);
```

---

## Technical Deep Dive: Webpack DefinePlugin

### How It Works

**Before webpack (source code):**
```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
fetch(`${apiUrl}/api/auth/login`, { ... });
```

**After webpack with DefinePlugin (bundled code):**
```javascript
const apiUrl = "https://blogflow-three.vercel.app";
fetch("https://blogflow-three.vercel.app/api/auth/login", { ... });
```

**Key Points:**
- `DefinePlugin` performs **find-and-replace** at build time
- It's NOT a runtime variable
- The replacement happens during webpack bundling
- The deployed bundle contains literal string values

---

### Common Misconceptions

❌ **WRONG:** "Environment variables are read when the component runs in Webflow"
✅ **CORRECT:** "Environment variables are replaced with string literals during webpack bundling"

❌ **WRONG:** "I can change the API URL by updating .env and redeploying to Webflow"
✅ **CORRECT:** "I must rebuild with webpack to change the API URL, then deploy the new bundle"

❌ **WRONG:** "The .env file is read by Webflow components"
✅ **CORRECT:** "The .env file is read by webpack during local bundling, values are hardcoded into bundles"

---

## Summary

### Root Cause
GitHub Actions workflow uses a fallback value when the `NEXT_PUBLIC_API_URL` secret is not configured, causing all bundles to be built with `localhost:3000` hardcoded.

### Immediate Fix
Set the GitHub repository secret `NEXT_PUBLIC_API_URL` to `https://blogflow-three.vercel.app` and redeploy.

### Files Involved
- ✅ `webpack.webflow.js` - Correct configuration
- ✅ `src/libraries/*/webflow.json` - All correctly reference webpack config
- ✅ `src/libraries/*/index.ts` - Library configs correctly define env vars
- ✅ `scripts/build-library.ts` - Build script correctly passes env vars
- ⚠️  `.github/workflows/webflow-deploy-all.yml` - **Uses fallback value (ISSUE)**

### Required Action
**Configure the GitHub secret immediately and redeploy all libraries.**

---

## Appendix: Environment Variable Priority

Understanding the order of precedence for environment variables:

1. **GitHub Actions workflow `env:`** (highest priority for CI/CD)
2. **Shell environment variables** (e.g., `NEXT_PUBLIC_API_URL=x npm run build`)
3. **`.env` file** (loaded by Node.js/Next.js)
4. **Default values in code** (lowest priority)

In the GitHub Actions workflow, only #1 applies. The `.env` file in the repository is **NOT** read during CI/CD builds.

---

## Appendix: Debugging Commands

### Check Current Bundle Contents

```bash
# Build locally
pnpm library:build core

# Search for localhost references
grep -r "localhost" dist/core/

# Search for production URL
grep -r "blogflow-three.vercel.app" dist/core/

# Inspect webpack output
cat dist/core/Client/*.js | grep -i "api"
```

### Check GitHub Secrets

```bash
# List configured secrets (requires gh CLI)
gh secret list

# Set secret via CLI
gh secret set NEXT_PUBLIC_API_URL -b "https://blogflow-three.vercel.app"
```

### Manual Deployment with Correct Values

```bash
# Set environment variables and deploy
NEXT_PUBLIC_API_URL="https://blogflow-three.vercel.app" \
NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED="false" \
pnpm library:build core

# Verify bundle
grep -r "blogflow-three.vercel.app" dist/core/

# Deploy manually
cd src/libraries/core
npx webflow library share --manifest ./webflow.json --no-input
```

---

## Related Documentation

- [Webpack DefinePlugin Docs](https://webpack.js.org/plugins/define-plugin/)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Webflow CLI Documentation](https://developers.webflow.com/docs/webflow-cli)
- [Project docs: `docs/webflow-local-development.md`](../../docs/webflow-local-development.md)
- [Project docs: `docs/webflow-github-deployment.md`](../../docs/webflow-github-deployment.md)

---

**Document created:** 2025-10-30
**Status:** Root cause identified, solutions provided
**Priority:** Critical - Production components are broken
