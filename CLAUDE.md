# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Testing Account

Email: papa@john.com
Password: 88888888

Can be used to login and test the user flows.

## Project Overview

This is a Next.js 15 project using React 19 that creates custom Webflow Code Components. Components are built in React/TypeScript and exported for use in Webflow sites via the Webflow CLI. The project uses Tailwind CSS for styling, shadcn/ui component library, and React Three Fiber for 3D components.

## Key Architecture Concepts

### Webflow Code Components Pattern

Components follow a dual-file pattern:

1. **Implementation Component** (`src/components/ComponentName.tsx` or `components/ComponentName.tsx`)
   - Contains the actual React component logic
   - Standard React component that can be used in the Next.js app

2. **Webflow Wrapper** (`src/components/ComponentName.webflow.tsx`)
   - Wraps the implementation component with Webflow-specific props
   - Uses `declareComponent()` from `@webflow/react` to define Webflow integration
   - Defines props using `@webflow/data-types` (props.Text, props.Number, props.Boolean, props.Variant)
   - Must import global styles: `import '@/app/globals.css'`
   - Exports component for use in Webflow

**Pattern:**
```typescript
// Component.tsx - Implementation
export default function Component({ prop1, prop2 }: Props) {
  return <div>...</div>;
}

// Component.webflow.tsx - Webflow wrapper
import Component from './Component';
import { declareComponent } from '@webflow/react';
import { props } from '@webflow/data-types';
import '@/app/globals.css';

export default declareComponent(Component, {
  name: 'ComponentName',
  description: 'Description for Webflow',
  group: 'Category',
  props: {
    prop1: props.Text({ name: "Prop 1", defaultValue: "value" }),
    prop2: props.Number({ name: "Prop 2", defaultValue: 0 })
  }
});
```

### Directory Structure

- `app/` - Next.js app router pages
  - `app/integrations/` - Cloud integration UI pages (OAuth flows, dashboard)
  - `app/api/` - API routes and oRPC handlers
- `src/components/` - Custom Webflow components (*.webflow.tsx files and their implementations)
- `components/` - Shared React components including shadcn/ui components (can also contain implementation components)
- `components/ui/` - shadcn/ui component library
- `lib/` - Utility functions and stores
  - `lib/stores/` - Zustand state management stores (for cross-component state)
  - `lib/integrations/` - Cloud provider integration system (Vercel, etc.)
  - `lib/api/routers/` - oRPC router definitions
- `hooks/` - Custom React hooks
- `public/` - Static assets
- `docs/` - Extended documentation and architecture guides
- `webpack.webflow.js` - Webpack configuration for Webflow bundling
- `webflow.json` - Webflow CLI configuration
- `components.json` - shadcn/ui configuration

### Path Aliases

TypeScript is configured with `@/*` alias pointing to the project root:
- `@/components` → `components/`
- `@/lib` → `lib/`
- `@/app` → `app/`
- `@/hooks` → `hooks/`
- `@/assets` → `assets/`

### Technology Stack

- **Framework:** Next.js 15 with Turbopack
- **React:** Version 19
- **Styling:** Tailwind CSS v4 with shadcn/ui components
- **State Management:** Zustand (for cross-component state in Webflow)
- **3D Graphics:** React Three Fiber, Drei, Rapier (physics)
- **Webflow Integration:** @webflow/react, @webflow/data-types, @webflow/webflow-cli
- **Cloud Integrations:** Vercel OAuth, Vercel API (database & deployment management)
- **Package Manager:** pnpm

## Development Commands

### Local Development
```bash
pnpm dev          # Start Next.js dev server with Turbopack
```

### Building
```bash
pnpm build        # Build Next.js app with Turbopack
pnpm start        # Start production server
```

### Linting
```bash
pnpm lint         # Run ESLint
```

### Webflow CLI
```bash
pnpm webflow:share          # Deploy components to Webflow (requires WEBFLOW_WORKSPACE_API_TOKEN)
pnpm webflow:bundle         # Bundle components locally for testing and debugging
pnpm webflow:bundle:debug   # Bundle with detailed webpack debug output
```

The Webflow CLI is available via `@webflow/webflow-cli` for deploying components to Webflow. Requires `WEBFLOW_WORKSPACE_API_TOKEN` environment variable (see `env.example`).

**Local bundling** allows you to test webpack configuration and inspect bundled code without deploying to Webflow. See `docs/webflow-local-development.md` for detailed debugging guide.

## Environment Variables

Create a `.env` file based on `env.example`:
```
WEBFLOW_WORKSPACE_API_TOKEN="ws-xxxxx..."
```

## Component Development Guidelines

### Creating New Webflow Components

1. Create the implementation component in `src/components/ComponentName.tsx` (or `components/ComponentName.tsx`)
2. Create the Webflow wrapper in `src/components/ComponentName.webflow.tsx`
3. Use `declareComponent()` to register with Webflow
4. Always import `@/app/globals.css` in the .webflow.tsx file for Tailwind styles
5. Define props using `@webflow/data-types` prop types
6. Test locally in the Next.js app before deploying to Webflow
7. Add `'use client'` directive for interactive components (state, effects, event handlers)

### Component Locations

Implementation components can be placed in either:
- `src/components/` - For Webflow-specific implementations
- `components/` - For shared components used in both Next.js and Webflow (like shadcn/ui components)

Webflow wrapper files (*.webflow.tsx) must always be in `src/components/` to match the pattern in `webflow.json`.

### 3D Components

For Three.js components (like Lanyard):
- Mark components with `'use client'` directive
- Use React Three Fiber (`@react-three/fiber`)
- Use Drei for helpers (`@react-three/drei`)
- Use Rapier for physics (`@react-three/rapier`)
- Handle responsive behavior with window resize listeners
- Provide configurable props for position, gravity, FOV, etc.

### Props Configuration

Webflow components accept specific prop types:
- `props.Text()` - String values
- `props.Number()` - Numeric values
- `props.Boolean()` - True/false toggles
- `props.Variant()` - Predefined options (dropdown)

Each prop should have:
- `name` - Display name in Webflow
- `defaultValue` - Default value
- `tooltip` (optional) - Help text

### Shadow DOM Compatibility Requirements

Webflow Code Components run in isolated Shadow DOM environments without Next.js infrastructure. Components must use browser-native APIs only:

**❌ DO NOT USE in Webflow Code Components:**
- `next/navigation` hooks (`useRouter`, `usePathname`, `useSearchParams`)
- `next/link` component (`Link`)
- `next/image` component (`Image` - use `<img>` instead)
- Direct `process.env` access (use webpack DefinePlugin instead)
- Node.js modules (`fs`, `path`, etc.)
- React Context for cross-component state (doesn't cross Shadow DOM boundaries)

**✅ USE in Webflow Code Components:**
- Browser-native navigation: `window.location.href = '/path'`
- Standard HTML elements: `<a>`, `<img>`, `<button>`
- Zustand stores for cross-component state (singleton pattern works across Shadow DOM)
- `fetch()` for API calls
- Environment variables via webpack DefinePlugin (see webpack.webflow.js)

**Navigation Pattern:**
```typescript
// ❌ DON'T: Use Next.js router
import { useRouter } from 'next/navigation';
const router = useRouter();
router.push('/dashboard');

// ✅ DO: Use browser-native navigation
window.location.href = '/dashboard';

// ❌ DON'T: Use Next.js Link
import Link from 'next/link';
<Link href="/login">Login</Link>

// ✅ DO: Use standard anchor tags
<a href="/login" className="text-primary hover:underline">Login</a>
```

**Local Testing:**
Always test Webflow components locally before deploying:
```bash
pnpm webflow:bundle        # Test webpack compilation
pnpm webflow:bundle:debug  # Debug webpack issues
```

See `docs/webflow-local-development.md` for detailed debugging guide.

### State Management with Zustand

For sharing state across multiple Webflow components (which render in separate Shadow DOM roots):

1. Create a Zustand store in `lib/stores/`
2. Use the store in multiple components
3. State persists across component instances via memory (or localStorage if needed)

**Example:**
```typescript
// lib/stores/slider-store.ts
import { create } from 'zustand';

interface SliderState {
  blueValue: number;
  setBlueValue: (value: number) => void;
}

export const useSliderStore = create<SliderState>((set) => ({
  blueValue: 0.5,
  setBlueValue: (value: number) => set({ blueValue: value }),
}));

// Component.tsx
'use client';
import { useSliderStore } from '@/lib/stores/slider-store';

export default function Component() {
  const value = useSliderStore((state) => state.blueValue);
  const setValue = useSliderStore((state) => state.setBlueValue);
  // ...
}
```

Note: React Context doesn't work across Webflow Code Components because each renders in its own Shadow DOM. Zustand works because it uses a singleton store.

## Webflow Configuration

### webflow.json
Defines:
- Library name and ID
- Component file patterns (looks for `./src/**/*.webflow.@(js|jsx|mjs|ts|tsx)`)
- Bundle configuration (`webpack.webflow.js`)
- Telemetry settings

### webpack.webflow.js
Configures webpack for bundling Webflow Code Components:
- Path aliases (must match tsconfig.json paths)
- DefinePlugin for environment variable replacement (prevents "process is not defined" errors in browser)
- Required for all `NEXT_PUBLIC_*` environment variables used in components

### components.json (shadcn/ui)
Configures shadcn/ui component generation:
- Style: "new-york"
- Base color: "neutral"
- CSS variables enabled
- Icon library: "lucide"
- Path aliases that match the project structure

## Cloud Provider Integrations

### Vercel Integration Architecture

The project includes a production-ready cloud provider integration system with OAuth authentication, encrypted token storage, and a pluggable provider interface.

**Key Components:**

1. **Provider Interface** (`lib/integrations/types.ts`)
   - `CloudProvider` - Abstract interface for all cloud providers
   - `OAuthConfig`, `OAuthTokens` - OAuth flow types
   - `DatabaseConfig`, `DatabaseResult` - Database provisioning types
   - Provider-specific error classes: `ProviderError`, `AuthenticationError`, `RateLimitError`, `QuotaExceededError`

2. **Vercel Provider** (`lib/integrations/vercel/client.ts`)
   - Implements `CloudProvider` interface
   - Methods: `createDatabase`, `listDatabases`, `deleteDatabase`, `createDeployment`, `getDeployment`, `listDeployments`, `listProjects`
   - Full OAuth flow support with authorization URL generation and code exchange
   - Rate limit tracking via response headers
   - Comprehensive error handling with typed exceptions

3. **Token Encryption** (`lib/integrations/encryption.ts`)
   - AES-256-GCM encryption for OAuth tokens
   - Encrypted storage in database with separate IV and auth tag columns
   - Requires `ENCRYPTION_SECRET` environment variable (generate with: `openssl rand -hex 32`)

4. **oRPC Integration Router** (`lib/api/routers/integrations.ts`)
   - All procedures require authentication (`protectedProcedure`)
   - OAuth: `connectVercel`, `listIntegrations`, `disconnectIntegration`
   - Databases: `createVercelDatabase`, `listVercelDatabases`, `deleteVercelDatabase`
   - Deployments: `createVercelDeployment`, `getVercelDeploymentStatus`, `listVercelDeployments`, `listVercelProjects`
   - Environment: `updateVercelEnvVars`

5. **OAuth Flow Implementation**
   - **Authorization**: `/api/integrations/vercel/auth-url/route.ts` - Generates OAuth URL with state token
   - **Callback**: `/api/integrations/vercel/callback/route.ts` - Exchanges code for tokens, stores encrypted tokens
   - **Success Page**: `/app/integrations/vercel/success/page.tsx` - Post-OAuth landing page with navigation cards

6. **Deployment Templates**
   - **Static HTML**: Instant deployment with gradient design (base64-encoded file)
   - **Next.js Hello World**: Deploys from Vercel's official examples repository

**Environment Variables Required:**
```env
# Encryption (generate with: openssl rand -hex 32)
ENCRYPTION_SECRET=your-256-bit-secret-key

# Vercel OAuth Application
VERCEL_OAUTH_CLIENT_ID=your-client-id
VERCEL_OAUTH_CLIENT_SECRET=your-client-secret
VERCEL_OAUTH_REDIRECT_URI=http://localhost:3000/api/integrations/vercel/callback

# Optional: Vercel Integration Slug (for integration-specific OAuth URLs)
VERCEL_INTEGRATION_SLUG=your-integration-slug
```

**Key Patterns:**

- **Provider Abstraction**: All cloud providers implement `CloudProvider` interface for consistency
- **Encrypted Token Storage**: OAuth tokens stored encrypted in database, never exposed in API responses
- **User Isolation**: All integration operations verify user ownership via `userId` + `integrationId`
- **Real-time Status Polling**: Frontend polls deployment status every 3 seconds using `useEffect` interval
- **Confirmation Dialogs**: AlertDialog from shadcn/ui for destructive actions (database deletion)
- **oRPC Query Pattern**: All API calls use `orpc.integrations.procedureName.queryOptions({ input: {...} })`

**Testing:**
- Visit `/integrations/test` after OAuth connection
- Create databases and deployments
- Monitor status with real-time polling
- Delete resources with confirmation dialogs

See `lib/integrations/README.md` for detailed integration system documentation.

## Additional Documentation

The `docs/` folder contains extended architecture documentation including:
- **Webflow + Next.js integration patterns** - Core architecture and component patterns
- **oRPC and React Query usage** - API client patterns and data fetching
- **Routing strategies** - Query parameters vs dynamic routes (Webflow constraints)
- **Database schemas and API design** - PostgreSQL schema and oRPC procedures
- **Local development and debugging** - `docs/webflow-local-development.md` - Bundling, debugging, and testing Webflow components locally
- **Vercel integration guide** - `docs/vercel-integration-guide.md` - OAuth setup, database provisioning, deployment management

Refer to `docs/README.md` for a complete overview of available documentation.

## Development Workflow

### Test-Driven Development (TDD)
This project follows TDD principles:
1. Write tests BEFORE implementing features
2. Run tests and watch them fail (Red)
3. Implement minimal code to make tests pass (Green)
4. Refactor while keeping tests green (Refactor)
5. Commit only when all tests pass

**Testing Framework:**
- **Vitest 3.2.4**: Unit and integration tests (✅ fully working)
- **Playwright 1.56.1**: E2E tests (✅ fully working)
- **@testing-library/react 16.3.0**: Component tests (⚠️ React 19 incompatibility)

**IMPORTANT - React 19 Testing Workaround:**

Due to React 19's `act` API changes, @testing-library/react is currently incompatible. Component tests using Testing Library will fail with "React.act is not a function" errors.

**Workaround Options:**
1. **Use Playwright for Component Testing** (Recommended)
   - Test components in real browser environment
   - More accurate representation of actual user experience
   - Example: `e2e/example.spec.ts`

2. **Use Vitest for Non-Component Logic**
   - Test utilities, hooks, stores, and server actions
   - Example: `__tests__/lib/utils.test.ts`

3. **Wait for Testing Library Update**
   - Track progress: https://github.com/testing-library/react-testing-library

**What You Can Test NOW:**
- ✅ Utilities and pure functions (Vitest)
- ✅ Zustand stores (Vitest)
- ✅ Server actions with mocked DB (Vitest)
- ✅ Complete user workflows (Playwright E2E)
- ✅ Component interactions in real browser (Playwright)
- ❌ Component rendering with Testing Library (broken until library update)

See `TESTING.md` for complete testing documentation and examples.

### Database Changes
1. Modify schema in `src/db/schema.ts`
2. Generate migration: `pnpm db:generate`
3. Review generated SQL in `drizzle/` directory
4. Run migration: `pnpm db:migrate`
5. Commit both schema and migration files

### Task Types: Features vs. Fixes

This project distinguishes between two types of development tasks:

1. **FEATURES** (`specs/FEATURES.md`): New functionality, enhancements, or significant additions
2. **FIXES** (`specs/FIXES.md`): Bug fixes, corrections, small improvements, or minor refinements

Each type has different protocol requirements based on scope and complexity.

### Adding Features

**IMPORTANT: `specs/FEATURES.md` is the single source of truth for project feature state.**

When a user requests a feature implementation:

1. **Check `specs/FEATURES.md`**
   - If the feature is not present, add it to the file with the structure below
   - If the feature exists, update its checklist as you progress

2. **Feature Entry Structure**
   Each feature in `specs/FEATURES.md` must have the following sub-tasks:
   ```markdown
   ## [Feature Number]. [Feature Name]
   - [ ] Unit tests have been written
   - [ ] E2E tests for user workflows have been written (including all button clicks and component interactions)
   - [ ] Feature has been implemented
   - [ ] ALL E2E tests and unit tests pass
   - [ ] Every new component has been successfully interacted with using Playwright MCP:
     - [ ] [ComponentName1]
     - [ ] [ComponentName2]
     - [ ] [ComponentName3]
   ```

3. **MANDATORY Agent Usage**
   **CRITICAL: The following agents MUST be used for EVERY feature implementation:**

   **IMPORTANT DEFINITIONS:**
   - **MANDATORY** = NO EXCEPTIONS, NO JUDGMENT CALLS, NO SKIPPING, MUST HAPPEN 100% OF THE TIME
   - **COMPULSORY** = REQUIRED, NOT OPTIONAL, NOT NEGOTIABLE, NO INTERPRETATION ALLOWED
   - These are ABSOLUTE REQUIREMENTS, not suggestions or guidelines
   - Claude Code has ZERO DISCRETION to skip these steps for any reason
   - "Simple" features, "trivial" changes, or perceived time pressure are NOT valid reasons to skip
   - User saying "DO NOT STOP" means complete all mandatory steps without pausing, NOT skip steps

   - **test-architect agent** (COMPULSORY - NO EXCEPTIONS)
     - Use BEFORE implementing any feature
     - Designs comprehensive test coverage
     - Creates unit and E2E test suites
     - Ensures TDD workflow is followed
     - **MUST be called even if feature seems simple**
     - **MUST be called even for single-line changes**

   - **code-evaluator agent** (COMPULSORY - NO EXCEPTIONS)
     - Use DURING implementation after each significant module completion
     - Use BEFORE marking feature complete
     - Runs all tests and validates they pass
     - Performs code quality checks
     - Identifies issues early
     - **MUST be called even if feature seems simple**
     - **MUST be called even if manual testing seems sufficient**

   - **project-structure-documenter agent** (COMPULSORY - NO EXCEPTIONS)
     - Use AFTER feature completion
     - Updates project documentation
     - Reflects architectural changes
     - Maintains CLAUDE.md and README files
     - **MUST be called for all features that affect project structure**

   **PROTOCOL ENFORCEMENT:**
   - There is NO TIME PRESSURE - take as long as needed to complete all mandatory steps
   - Efficiency comes from proper execution, NOT from skipping steps
   - Every feature follows the IDENTICAL process regardless of perceived complexity
   - If a mandatory agent is not called, the feature is NOT complete
   - Feature cannot be marked `[X]` in FEATURES.md until ALL mandatory agents have been executed
   - Commit messages must honestly list which agents were used (no false claims)

4. **Implementation Workflow**
   - **Step 1**: Use **test-architect agent** to design and write tests
   - **Step 2**: Write unit tests first (TDD approach)
   - **Step 3**: Write E2E tests covering complete user workflows
   - **Step 4**: Implement the feature
   - **Step 5**: Use **code-evaluator agent** after each significant module
   - **Step 6**: Run all tests until they pass
   - **Step 7**: Use **code-evaluator agent** for final validation
   - **Step 8**: Use Playwright MCP to interact with each new component
   - **Step 9**: Use **project-structure-documenter agent** to update docs
   - **Step 10**: Check off each sub-task as completed
   - **Step 11**: Mark main feature as `[X]` only when ALL sub-tasks are complete

5. **Testing Requirements**
   - **Unit Tests**: Test individual functions, components, and server actions
   - **E2E Tests**: Test complete user workflows including:
     * Navigating to pages
     * Clicking all buttons
     * Filling all forms
     * Interacting with all interactive components
     * Verifying visual feedback and state changes
   - **Playwright MCP Verification** (MANDATORY):
     * Manually interact with each new component using Playwright MCP
     * Verify visual elements are visible and accessible
     * Test responsive design across different viewport sizes
     * Confirm all interactive elements function correctly
     * Screenshot or snapshot evidence REQUIRED before claiming verification complete
     * Cannot claim "Verified with Playwright MCP" without actual tool usage evidence

6. **Commit and Mark Complete**
   - Commit the completed feature with descriptive message
   - Update `specs/FEATURES.md` with all checked sub-tasks
   - Mark feature as `[X]` in the main feature list
   - Commit the `specs/FEATURES.md` update

### External API Integration Workflow
1. Evaluate API Provider
   - Check usage limits and pricing
   - Review API documentation
   - Assess security and authentication methods

2. API Key Management
   - Create a new environment variable in `.env.local`
   - Add key to `src/lib/config/api-keys.ts`
   - Never commit secrets to version control

3. Service Implementation
   - Create service in `src/lib/services/`
   - Implement typed request and response handling
   - Add comprehensive error management
   - Write integration tests

4. Server Action Creation
   - Develop authenticated server action
   - Implement input validation with Zod
   - Add logging and error tracking
   - Ensure rate limit compliance

### Feature Completion Checklist
When completing a feature from `specs/FEATURES.md`:
- [ ] **test-architect agent** used to design test coverage (COMPULSORY - NO EXCEPTIONS)
- [ ] Unit tests written and passing
- [ ] E2E tests written and passing (covering all user workflows)
- [ ] Feature is fully implemented
- [ ] **code-evaluator agent** used during implementation (COMPULSORY - NO EXCEPTIONS)
- [ ] ALL tests (unit + E2E) pass
- [ ] **code-evaluator agent** used for final validation (COMPULSORY - NO EXCEPTIONS)
- [ ] Every new component has been interacted with using Playwright MCP (with evidence)
- [ ] **project-structure-documenter agent** used to update docs (COMPULSORY - NO EXCEPTIONS)
- [ ] All sub-tasks in `specs/FEATURES.md` are checked off
- [ ] Changes are committed to git
- [ ] Feature is marked as complete in `specs/FEATURES.md` (change `[]` to `[X]`)
- [ ] `specs/FEATURES.md` update is committed

**CRITICAL REMINDER**: If ANY checklist item with "COMPULSORY - NO EXCEPTIONS" is not completed, the feature is NOT done. There are no shortcuts, no exceptions, and no valid reasons to skip these steps.

### Fixing Bugs and Issues

**IMPORTANT: `specs/FIXES.md` is the single source of truth for bug fixes and minor improvements.**

When a user requests a bug fix or minor improvement:

1. **Check `specs/FIXES.md`**
   - If the fix is not present, add it to the file with a clear description
   - If the fix exists, update its status as you progress

2. **Fix Entry Structure**
   Each fix in `specs/FIXES.md` should have:
   ```markdown
   ## Fix #[Number]: [Brief Description]
   - **Status**: [ ] Pending / [X] Complete
   - **Type**: Bug / Improvement / Refactor
   - **Description**: Clear explanation of the issue and solution
   ```

3. **MANDATORY Runtime Verification for ALL Fixes (NO EXCEPTIONS)**

   **ABSOLUTE RULE**: Code inspection is NOT verification. Every fix MUST be tested in a running application.

   **Before marking ANY fix as complete, you MUST:**

   1. **Start Development Server**: Run `pnpm dev`
   2. **Use Playwright MCP**: Actually interact with the affected component/feature in the browser
   3. **Test Exact Behavior**: Verify the EXACT fix described in FIXES.md works as stated
   4. **Capture Evidence**: Take screenshots or record console output as proof
   5. **User Confirmation**: If ANY requirement is ambiguous, ask user for clarification BEFORE implementing

   **What "VERIFIED" Actually Means:**
   - ✅ Ran the application in development mode (`pnpm dev`)
   - ✅ Used Playwright MCP to interact with affected UI
   - ✅ Manually performed the exact action described in the fix
   - ✅ Captured evidence (screenshots, console logs, Playwright session logs)
   - ✅ Confirmed expected behavior actually occurs in the browser
   - ✅ User confirmed fix addresses their exact need

   **What "VERIFIED" Does NOT Mean:**
   - ❌ Read the code and it looks correct
   - ❌ Saw `router.refresh()` and assumed it works
   - ❌ Saw correct dependencies in useEffect and assumed it triggers
   - ❌ Tests pass (unless tests specifically verify the fix behavior)
   - ❌ Build succeeds without TypeScript errors
   - ❌ "It should work based on the code"

   **Zero Tolerance for False Claims:**
   - NEVER claim "verified" without actual browser testing evidence
   - NEVER claim Playwright MCP was used without tool usage logs
   - NEVER claim "tested" without execution proof
   - NEVER mark fix as `[X]` based solely on code inspection
   - False verification claims are SERIOUS PROTOCOL VIOLATIONS

4. **Batched Agent Usage for Fixes**
   **For efficiency, agents can be batched around UP TO 5 fixes at once:**

   - **test-architect agent** (COMPULSORY for all fix batches)
     - MUST be used when implementing 2-5 related fixes together
     - Designs test coverage for all fixes in the batch
     - Required even for seemingly simple fixes

   - **code-evaluator agent** (COMPULSORY for ALL fixes - NO EXCEPTIONS)
     - MUST be used for ALL fixes (batched or individual)
     - Runs tests and validates runtime behavior
     - Required even for single-line fixes
     - The "optional" designation has been REMOVED - this is now MANDATORY

   - **Playwright MCP** (COMPULSORY for ALL fixes affecting UI - NO EXCEPTIONS)
     - MUST be used for EVERY fix that touches UI components
     - Required even if fix seems trivial
     - Evidence (screenshots/logs) REQUIRED
     - Cannot be skipped under any circumstances

   - **project-structure-documenter agent** (Optional)
     - Use only if fixes affect project structure or architecture
     - Not required for localized bug fixes

4. **Fix Implementation Workflow**

   **For Single Fixes:**
   - **Step 1**: Identify the bug or issue
   - **Step 2**: Write or update tests if needed (optional for trivial fixes)
   - **Step 3**: Implement the fix
   - **Step 4**: Run relevant tests to verify
   - **Step 5**: Mark fix as complete in `specs/FIXES.md`
   - **Step 6**: Commit the fix

   **For Batched Fixes (2-5 fixes):**
   - **Step 1**: Group related fixes (max 5)
   - **Step 2**: Use **test-architect agent** to design test coverage for all fixes
   - **Step 3**: Implement all fixes in the batch
   - **Step 4**: Use **code-evaluator agent** to validate all fixes
   - **Step 5**: Ensure all tests pass
   - **Step 6**: Mark all fixes as complete in `specs/FIXES.md`
   - **Step 7**: Commit the batch with descriptive message

5. **Fix Completion Checklist**

   **For Single Fixes:**
   - [ ] Issue identified and understood
   - [ ] Fix implemented
   - [ ] Relevant tests pass
   - [ ] Fix marked complete in `specs/FIXES.md`
   - [ ] Changes committed

   **For Batched Fixes (2-5):**
   - [ ] **test-architect agent** used to design test coverage (COMPULSORY)
   - [ ] All fixes in batch implemented
   - [ ] **code-evaluator agent** used for validation (COMPULSORY)
   - [ ] All relevant tests pass
   - [ ] All fixes marked complete in `specs/FIXES.md`
   - [ ] Changes committed with clear batch description

**IMPORTANT DISTINCTION:**
- Features (in `specs/FEATURES.md`) require full protocol with ALL mandatory agents
- Fixes (in `specs/FIXES.md`) allow batching and optional agent usage for efficiency
- When in doubt about classification, treat it as a FEATURE with full protocol

**CRITICAL: NO TIME-WASTING QUESTIONS**
- NEVER ask the user about time optimization, priorities, or which tasks to focus on
- NEVER ask "would you like me to..." or "should I..." when the task is already clear
- When given a list of fixes or features, JUST DO THEM ALL
- The user has already decided what needs to be done by putting it in FIXES.md or FEATURES.md
- Your job is to EXECUTE, not to seek permission or clarification on priorities
- If something is unclear about the TECHNICAL IMPLEMENTATION, ask about that
- If something is unclear about WHAT tasks to do, they're already listed - just do them

### API Integration Checklist
- [ ] Centralized key management
- [ ] Secure server-side request handling
- [ ] Comprehensive error management
- [ ] Rate limit handling
- [ ] Full test coverage
- [ ] No client-side key exposure
- [ ] Validated input parameters

### Authentication and Server Actions Workflow
1. **Authentication Server Actions**
   - Write tests in `src/__tests__/actions/auth.test.ts`
   - Test scenarios:
     * Successful registration
     * Registration with existing email
     * Invalid input validation
     * Session creation
     * User authentication flows

2. **Server Action Best Practices**
   - Always use Zod schema validation
   - Implement comprehensive error handling
   - Test both happy paths and edge cases
   - Verify session access through DAL
   - Handle security and permission checks server-side

3. **Authentication Testing Guidelines**
   - Use mocking for external dependencies
   - Test middleware route protection
   - Verify authentication abstraction
   - Ensure provider-agnostic behavior
   - Test session management functions

## Database Schema

### Tables
- **users**: User accounts with email/password authentication
- **categories**: Investment categories (Stocks, ETFs, Commodities, Crypto)
- **positions**: Individual investment positions (linked to user and category)
- **purchases**: Purchase history for each position

### Relationships
- Users have many Categories
- Users have many Positions
- Categories have many Positions
- Positions have many Purchases

All foreign keys use CASCADE delete for data integrity.

## Key Configuration Files

- `drizzle.config.ts` - Drizzle ORM configuration
- `vitest.config.mts` - Vitest test configuration
- `next.config.ts` - Next.js configuration
- `postcss.config.js` - PostCSS with Tailwind CSS v4
- `.env.local` - Environment variables (gitignored)
- `tsconfig.json` - TypeScript configuration

## Environment Variables

Required in `.env.local`:
```env
# Database
DATABASE_URL=./data/local.db

# Authentication
NEXTAUTH_SECRET=<generated-secret>
NEXTAUTH_URL=http://localhost:3000

# Cloud Integrations - Encryption
ENCRYPTION_SECRET=<generate-with-openssl-rand-hex-32>

# Vercel OAuth Integration
VERCEL_OAUTH_CLIENT_ID=<your-vercel-client-id>
VERCEL_OAUTH_CLIENT_SECRET=<your-vercel-client-secret>
VERCEL_OAUTH_REDIRECT_URI=http://localhost:3000/api/integrations/vercel/callback
VERCEL_INTEGRATION_SLUG=<optional-integration-slug>

# External APIs (Optional)
TWELVE_DATA_API_KEY=<optional-free-tier-key>
```

### External API Keys

#### Twelve Data API
- **Obtain Key**: https://twelvedata.com/apikey
- **Free Tier**: 800 requests/day
- **Configuration**: Centralized in `src/lib/config/api-keys.ts`
- **Security Notes**:
  - Never commit API keys to version control
  - Use `.env.local` for local development
  - Replace with production secrets in deployment environments

#### Vercel OAuth Application
- **Create Application**: https://vercel.com/account/integrations
- **Redirect URI**: Must match `VERCEL_OAUTH_REDIRECT_URI` exactly
- **Scopes**: Deployment, database, and project management
- **Token Encryption**: All OAuth tokens encrypted with AES-256-GCM before database storage
- **Generate Encryption Secret**: `openssl rand -hex 32`

## Demo Credentials

After running `pnpm db:seed`:
- Email: demo@example.com
- Password: demo123

## Important Notes

- **Always use pnpm** for package management (not npm or bun)
- Database files in `data/` are gitignored
- Migrations in `drizzle/` should be committed
- Follow TDD: write tests before implementation
- Server actions should validate input and handle errors
- Use the Data Access Layer (DAL) for authentication checks

### Protocol Compliance and Honesty

**ABSOLUTE REQUIREMENTS:**

1. **Never Lie About Verification**
   - NEVER claim "Verified with Playwright MCP" without actual tool usage
   - NEVER claim "All tests passing" without running the tests
   - NEVER claim an agent was used if it wasn't called
   - Commit messages must accurately reflect what was actually done
   - If a step was skipped, explicitly state it was skipped (and why this violates protocol)

2. **No Unauthorized Shortcuts**
   - Claude Code has ZERO authority to skip mandatory steps
   - "Feature seems simple" is NOT a valid reason to skip protocol
   - "This is just a small change" is NOT a valid reason to skip protocol
   - User urgency does NOT authorize skipping mandatory agents
   - The protocol applies to ALL features without exception

3. **Time Pressure Does Not Exist**
   - There is NO time constraint on completing features properly
   - Take as long as needed to execute all mandatory steps
   - "DO NOT STOP" means work through all steps without pausing, NOT skip steps
   - Speed comes from efficient execution, NOT from cutting corners

4. **Perceived Simplicity is Irrelevant**
   - Even single-line CSS changes require full protocol
   - Even "obvious" features require test-architect agent
   - Even "trivial" components require code-evaluator agent
   - The simpler a feature seems, the more important verification becomes

5. **Self-Evaluation is NOT Sufficient**
   - Cannot skip agents and evaluate work yourself
   - Cannot skip Playwright MCP and claim "it looks fine"
   - Cannot skip tests and assume everything works
   - Mandatory agents exist specifically to catch errors Claude Code misses

**IF PROTOCOL IS VIOLATED:**
- Immediately inform the user of the violation
- Explain what was skipped and why this is unacceptable
- Propose remediation steps to properly complete the feature
- NEVER try to hide or minimize protocol violations

### Authentication Policies
- All server actions require authentication
- Never access Auth.js directly in client components
- Always use `src/lib/auth-client.ts` for authentication
- Session access must go through Data Access Layer (DAL)
- Input validation is required on ALL server actions
- Follow provider-agnostic design principles

### Security Guidelines
- Protect routes with middleware
- Validate and sanitize all user inputs
- Use Zod for comprehensive input validation
- Implement proper error handling
- Never trust client-side state for authentication
- Centralize external API key management
- Never expose API keys to client components
- Use `"server-only"` directive for external service integrations
- Validate and sanitize external API request parameters
