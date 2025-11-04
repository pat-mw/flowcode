# Webflow React Component Library Development

Your role is to help design, implement, and test features for the multi-library Webflow React component system. This project uses a modular architecture where components are organized into independent libraries that deploy to Webflow.

## Core Architecture

### Multi-Library System
This project uses a **multi-library architecture** to manage Webflow Code Components. Each library:
- Has independent bundle size limits (~15MB per library)
- Can be built and deployed separately
- Groups related components by purpose
- Auto-discovers components via folder structure

**Current Libraries:**

- **core**: Authentication, posts, navigation (LoginForm, RegistrationForm, PostEditor, PostsList, ProfileEditor, PublicPostsList, Navigation, Dashboard, HelloUser)
  - **Backend:** `auth.getSession`, `auth.isAuthenticated`, `posts.list`, `posts.create`, `posts.update`, `posts.delete`, `posts.publish`, `posts.publicList`, `people.getMe`, `people.update`
  - **Database:** `users` (Better Auth managed), `people` (user profiles with displayName, bio, avatar, website), `posts` (blog content with drafts/published status, cover images, excerpts)
  - **Dependencies:** None (lightweight forms and UI)
  - **Environment:** NEXT_PUBLIC_API_URL, NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED

- **analytics**: Charts and metrics (ChartTest, PieChart, BarChart)
  - **Backend:** None (static data visualization)
  - **Database:** None (components accept data as props)
  - **Dependencies:** recharts (~2.2MB - chart library)
  - **Environment:** NEXT_PUBLIC_API_URL

- **interactive**: 3D models and experiences (Lanyard, RedSlider, BlueSlider)
  - **Backend:** None (client-side 3D rendering and state)
  - **Database:** None (uses Zustand for cross-component state)
  - **Dependencies:** @react-three/fiber, @react-three/drei, @react-three/rapier (~13MB - Three.js ecosystem)
  - **Environment:** NEXT_PUBLIC_API_URL

- **webcn**: Landing page components (Navbar, Hero, Features, ComponentGrid, Footer, etc.)
  - **Backend:** None (static marketing content, embeds WaitlistSection from waitlist library)
  - **Database:** None (purely presentational)
  - **Dependencies:** None (lightweight UI components)
  - **Environment:** NEXT_PUBLIC_API_URL

- **waitlist**: Waitlist capture and admin components (WaitlistCapture, WaitlistAdmin)
  - **Backend:** `waitlist.join` (public), `waitlist.getAll`, `waitlist.getStats`, `waitlist.update`, `waitlist.remove`, `waitlist.bulkUpdate` (protected)
  - **Database:** `waitlist` table (id, email, name, company, referralSource, metadata, status, invitedAt, notes, isPriority, timestamps)
  - **Dependencies:** None (lightweight forms and tables)
  - **Environment:** NEXT_PUBLIC_API_URL

**Registry:** @src/libraries/registry.config.ts
**Types:** @src/libraries/types.ts
**Documentation:** @src/libraries/README.md

### Folder Structure

```
src/libraries/
├── registry.config.ts          # Central registry (imports all libraries)
├── types.ts                    # LibraryConfig type definitions
├── index.ts                    # Exports registry + helper functions
│
├── {library-name}/
│   ├── index.ts               # Library config (LibraryConfig)
│   ├── components/
│   │   └── *.webflow.tsx      # Webflow wrapper components
│   └── webflow.json           # Auto-generated manifest
│
app/
├── (demos)/                   # Demo pages for visual testing
│   └── lander/webcn/          # Example: webcn landing page demo
│
└── (tests)/                   # Test harness pages
    ├── test-wrappers/         # Example: multi-library wrapper testing
    └── test-components/       # Component-specific tests

scratchpads/                   # Feature development workspace
├── {feature-name}/            # One folder per feature
│   ├── spec.md               # Feature specification
│   ├── update_001.md         # First progress update
│   ├── update_002.md         # Second progress update
│   └── update_NNN.md         # Sequential updates
│
├── webcn/                     # Example: webcn landing page
│   └── lander.md             # Feature notes
│
└── specs/                     # Example: system-wide specs
    └── multi-library-registry-system.md
```

## Feature Development Workflow

**CRITICAL: For ANY feature development, you MUST work inside the scratchpads system.**

### Why Scratchpads?

The scratchpads system enables:
- **Cross-session continuity**: Pick up where you left off across different sessions
- **Decision tracking**: Document why decisions were made
- **Progress logging**: Track what's been done and what remains
- **Context preservation**: Future sessions have full context without re-explaining
- **Collaboration**: Developers can review your thought process and decisions

### Scratchpads Protocol

**For EVERY feature (new component, library, refactor, etc.), follow this workflow:**

#### 1. Create Feature Folder

```bash
scratchpads/{feature-name}/
```

**Naming convention:**
- Use kebab-case
- Be descriptive but concise
- Examples: `user-authentication`, `chart-library`, `waitlist-admin-ui`

#### 2. Create spec.md

**ALWAYS start with a specification document:**

```markdown
# Feature: {Feature Name}

## Overview
Brief description of what this feature does and why it's needed.

## Goals
- Goal 1
- Goal 2
- Goal 3

## Technical Approach
Detailed explanation of how you plan to implement this.

### Libraries Affected
- **{library-name}**: What changes are needed

### Backend Requirements
- **oRPC Endpoints**: New/modified endpoints
- **Database Schema**: New tables or schema changes
- **Environment Variables**: Any new env vars needed

### Components to Create/Modify
1. Component 1 (src/libraries/{library}/components/X.webflow.tsx)
2. Component 2 (...)

### Test Pages
- app/(tests)/test-{feature}/ - What to test

## Dependencies
- npm packages to install
- Heavy dependencies affecting bundle size

## Success Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] All tests pass
- [ ] Documentation updated

## Open Questions
- Question 1?
- Question 2?

## Timeline Estimate
Rough estimate of implementation time.
```

**Write spec.md BEFORE writing any code.**

#### 3. Create update_001.md (First Progress Update)

After completing initial work or reaching a milestone:

```markdown
# Update 001 - {Date: YYYY-MM-DD}

## Session Info
- Started: {timestamp}
- Ended: {timestamp}
- Status: {In Progress / Blocked / Completed}

## Work Completed
1. Created library config at src/libraries/{library}/index.ts
2. Implemented component X
3. Added test page at app/(tests)/test-{feature}/

## Decisions Made
### Decision: {Decision Title}
- **Context**: Why this decision was needed
- **Options Considered**:
  - Option A: pros/cons
  - Option B: pros/cons
- **Chosen**: Option A
- **Rationale**: Why this option was chosen

## Code Changes
- **Files Created**:
  - path/to/file1.tsx
  - path/to/file2.tsx
- **Files Modified**:
  - path/to/existing.tsx (what changed)

## Blockers / Issues
- Issue 1: Description and impact
- Issue 2: Description and impact

## Next Steps
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

## Notes for Next Session
Important context or gotchas for when resuming this work.
```

#### 4. Create update_002.md, update_003.md, etc.

**Every time you resume work on a feature:**
1. Read the spec.md
2. Read all previous update_*.md files (to understand what's been done)
3. Do your work
4. Create a new update_XXX.md documenting progress

**Use sequential numbering:** 001, 002, 003, etc.

#### 5. Update spec.md as Needed

If the specification changes:
- Update spec.md with new requirements
- Document WHY the spec changed in the update file
- Keep original goals visible (strikethrough if abandoned)

### When to Create Updates

Create a new update file when:
- **Session ends**: Document what you did before the session ends
- **Major milestone reached**: Component completed, tests passing, etc.
- **Blocked**: Can't proceed, need user input
- **Pivoting approach**: Changing technical direction
- **New session starts**: After reading old updates, document new work

**Minimum frequency:** At least one update file per session where code changes occur.

### Scratchpads Best Practices

✅ **DO:**
- Write spec.md BEFORE any code
- Create update files DURING work, not after
- Document decisions with full context
- Include file paths and specific changes
- Note blockers immediately
- Write for your future self (or another Claude)
- Reference other files: @src/libraries/X, @docs/Y

❌ **DON'T:**
- Skip spec.md and start coding
- Forget to create update files
- Write vague updates ("worked on feature X")
- Leave out decision rationale
- Assume you'll remember context next session

### Example: Adding a New Library

```
scratchpads/payment-processing-library/
├── spec.md                    # Full specification
├── update_001.md             # Created library structure
├── update_002.md             # Implemented Stripe integration
├── update_003.md             # Added test page and debugging
└── update_004.md             # Completed and deployed
```

Each update documents specific progress, decisions, and next steps.

### Resuming Work on Existing Feature

When a user asks you to continue work on a feature:

1. **Check for existing scratchpad:**
   ```bash
   ls scratchpads/{feature-name}/
   ```

2. **Read in order:**
   - spec.md (understand the goal)
   - update_001.md, update_002.md, etc. (understand what's done)

3. **Verify current state:**
   - Check mentioned files still exist
   - Verify tests still pass
   - Review any blockers

4. **Create next update:**
   - update_XXX.md with new session's work

5. **Update warm.md if needed:**
   - If new library was created, document it in "Current Libraries"

## Development Workflow

### 1. Creating New Components

**CRITICAL: Two-File Pattern for Webflow Components**

Webflow components MUST follow this strict separation pattern:

1. **Implementation Component** (REQUIRED, MUST be in `/components/` folder)
   ```typescript
   // components/MyComponent.tsx
   'use client'; // If interactive

   export default function MyComponent({ prop1, prop2 }: Props) {
     // All component logic goes here
     return <div>...</div>;
   }
   ```

2. **Webflow Wrapper** (REQUIRED, MUST be in `src/libraries/{library}/components/`)
   ```typescript
   // src/libraries/{library}/components/MyComponent.webflow.tsx
   'use client';

   import { declareComponent } from '@webflow/react';
   import { props } from '@webflow/data-types';
   import { WebflowProvidersWrapper } from '@/lib/webflow/providers';
   import MyComponent from '@/components/MyComponent';

   // ❌ DO NOT import globals.css - WebflowProvidersWrapper handles CSS
   // ❌ DO NOT put implementation logic here - only wrapper code

   export function MyComponentWrapper({ prop1, prop2 }: MyComponentProps) {
     return (
       <WebflowProvidersWrapper>
         <MyComponent prop1={prop1} prop2={prop2} />
       </WebflowProvidersWrapper>
     );
   }

   export default declareComponent(MyComponentWrapper, {
     name: 'MyComponent',
     description: 'Description for Webflow',
     group: 'Category',
     props: {
       prop1: props.Text({ name: "Prop 1", defaultValue: "value" }),
       prop2: props.Number({ name: "Prop 2", defaultValue: 0 })
     }
   });
   ```

**CRITICAL RULES:**

❌ **NEVER** import `@/app/globals.css` in `.webflow.tsx` files
  - Breaks Webflow's theming system
  - WebflowProvidersWrapper already imports correct CSS

❌ **NEVER** put implementation logic in `.webflow.tsx` files
  - These are ONLY thin wrappers
  - All logic goes in `/components` folder

✅ **ALWAYS** create implementation in `/components/`
  - Even for simple components
  - Maintains architecture consistency

✅ **ALWAYS** use `WebflowProvidersWrapper`
  - Provides QueryClient, auth, and CSS
  - Required for oRPC + TanStack Query to work

✅ **ALWAYS** keep `.webflow.tsx` files thin
  - Just import, wrap, declare
  - Props passthrough only

### 2. Testing Locally

**CRITICAL: Always create test pages in the Next.js app router for new features!**

Test pages embed wrapped components directly to validate:
- Component behavior and interactivity
- Props configuration
- Visual appearance and styling
- Cross-library integration
- State management (Zustand stores)

**Test Page Pattern:**

```typescript
// app/(tests)/test-{feature}/page.tsx
'use client';

import { MyComponentWrapper } from "@/src/libraries/{library}/components/MyComponent.webflow";

export default function TestMyFeaturePage() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-4">Testing MyComponent</h1>

      {/* Test with different prop configurations */}
      <MyComponentWrapper
        prop1="Test value"
        prop2={42}
      />
    </div>
  );
}
```

**Examples to Reference:**
- @app/(tests)/test-wrappers/ - Multi-library component testing
- @app/(demos)/lander/webcn/ - Full landing page demo with many components

### 3. Building and Deploying

**Local Testing (manual):**
```bash
pnpm library:manifests          # Generate webflow.json files
pnpm library:build {library}    # Build specific library
pnpm library:build:all          # Build all libraries
pnpm webflow:bundle:debug       # Debug webpack issues
```

**CI/CD (automatic):**
- Push to PR → All libraries build and validate
- Merge to main → Enabled libraries auto-deploy to Webflow
- See @src/libraries/README.md for CI/CD details

### 4. Adding New Libraries

1. **Create folder:** `src/libraries/{library-name}/components/`

2. **Define config:** `src/libraries/{library-name}/index.ts`
   ```typescript
   import type { LibraryConfig } from "../types";

   export const myLibrary: LibraryConfig = {
     name: "My Library",
     description: "What it does",
     id: "blogflow-my-library",

     env: {
       NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
     },

     deploy: {
       enabled: true,
       workspaceToken: process.env.WEBFLOW_WORKSPACE_API_TOKEN,
     },
   };
   ```

3. **Register in registry:** Add to @src/libraries/registry.config.ts

4. **Add components:** Create `*.webflow.tsx` files

5. **Create test page:** Add to `app/(tests)/test-{library}/page.tsx`

## Key Constraints

### Shadow DOM Compatibility

Webflow components run in isolated Shadow DOM environments. **Must use browser-native APIs only:**

**❌ DO NOT USE:**
- `next/navigation` hooks (useRouter, usePathname)
- `next/link` component (use `<a>` tags)
- `next/image` component (use `<img>` tags)
- React Context for cross-component state

**✅ USE INSTEAD:**
- `window.location.href` for navigation
- Standard HTML: `<a>`, `<img>`, `<button>`
- Zustand stores for cross-component state
- `fetch()` for API calls

### State Management

For sharing state across Webflow components (separate Shadow DOM roots):
- Create Zustand store in `@lib/stores/`
- Import and use in components
- See @lib/stores/slider-store.ts for example

## Documentation References

**Core Architecture:**
- @src/libraries/README.md - Multi-library system overview
- @docs/webflow-nextjs-architecture.md - Component patterns
- @CLAUDE.md - Project-wide conventions

**Development Guides:**
- @docs/webflow-local-development.md - Local bundling and debugging
- @docs/quick-start-guide.md - Getting started
- @docs/advanced-patterns.md - Advanced component patterns

**Deployment:**
- @docs/webflow-github-deployment.md - CI/CD workflows
- @scratchpads/next-steps/parallel-library-builds.md - Future optimizations

**Scratchpads (design notes):**
- @scratchpads/webcn/ - webcn landing page notes
- @scratchpads/specs/ - Feature specifications

## Testing Philosophy

**Every feature should have a test page in the app router:**
1. Create page in `app/(tests)/` or `app/(demos)/`
2. Import wrapped components from `@/src/libraries/{library}/components/`
3. Test all prop configurations
4. Validate visual appearance and behavior
5. Test cross-library integration if applicable

This ensures components work correctly before deploying to Webflow where debugging is harder.

## Common Tasks

**Add new component to existing library:**
1. **Create scratchpad:** `scratchpads/{component-name}/spec.md`
2. **Write spec:** Define purpose, props, behavior, test plan
3. Create `*.webflow.tsx` in library's `components/` folder
4. Create test page in `app/(tests)/`
5. Test locally with `pnpm dev`
6. **Document progress:** Create `update_001.md` with decisions and changes
7. Push to PR (CI validates)

**Create new feature across multiple libraries:**
1. **Create scratchpad:** `scratchpads/{feature-name}/spec.md`
2. **Write comprehensive spec:**
   - Which libraries are affected
   - Backend requirements (oRPC endpoints, DB schemas)
   - Component list
   - Test strategy
3. Identify which libraries need components
4. Create components in each library
5. Create comprehensive test page importing all components
6. Test interactions and state management
7. **Document progress:** Create `update_001.md`, `update_002.md`, etc.
8. **Update warm.md:** If new library created, document in "Current Libraries"
9. Push to PR

**Debug bundle size issues:**
1. Run `pnpm webflow:bundle:debug {library}`
2. Check output in `dist/webflow/{library}/bundle.js`
3. Identify heavy dependencies
4. **Document findings:** Add to scratchpad or create new one
5. Consider splitting into new library if needed
6. If creating new library, follow scratchpads protocol

**Resume work on existing feature:**
1. **Check for scratchpad:** `ls scratchpads/{feature-name}/`
2. **Read all documentation:** spec.md, then all update_*.md files in order
3. **Verify current state:** Check files, run tests
4. Continue implementation
5. **Create new update:** `update_XXX.md` documenting this session's work

**Test before deploying:**
1. Always run `pnpm dev` and test in browser
2. Check `app/(tests)/` pages
3. Verify component behavior matches expectations
4. Document test results in scratchpad update file
5. Only then push to trigger CI/CD

## Self-Improvement Protocol

**IMPORTANT: You must keep this file (.claude/commands/warm.md) updated as the project evolves.**

### When to Update This File

Update this command file whenever you:
1. **Create a new library** - Add to "Current Libraries" section
2. **Add backend dependencies** - Document oRPC endpoints or database schemas
3. **Change architecture patterns** - Update relevant sections
4. **Add new npm packages** that affect component development
5. **Discover important gotchas** or patterns worth documenting

### What to Document for New Libraries

When adding a new library to `src/libraries/{library-name}/`, update the "Current Libraries" section with:

```markdown
- **{library-name}**: {Purpose} ({Key components})
  - **Backend:** {oRPC endpoints used, if any}
  - **Database:** {Tables/schemas required, if any}
  - **Dependencies:** {Heavy npm packages that affect bundle size}
  - **Environment:** {Required env vars beyond NEXT_PUBLIC_API_URL}
```

**Example:**
```markdown
- **waitlist**: Waitlist capture and admin components (WaitlistCapture, WaitlistAdmin)
  - **Backend:** `waitlist.submit`, `waitlist.getAll`, `waitlist.updateStatus`
  - **Database:** `waitlist_entries` table (email, status, metadata, timestamps)
  - **Dependencies:** None (lightweight forms only)
  - **Environment:** NEXT_PUBLIC_API_URL
```

### Backend Integration References

When components interact with the backend:
- **oRPC Router:** Check `app/api/[[...route]]/route.ts` for available endpoints
- **Database Schema:** Check `server/db/schema/` for table definitions
- **Type Safety:** oRPC provides end-to-end type safety from DB to components

Document these dependencies in the library section so future developers understand:
1. What backend endpoints the library depends on
2. What database tables need to exist
3. What happens if endpoints are unavailable (error handling)

### Keeping Documentation Current

**After completing any significant work:**
1. Read this file (.claude/commands/warm.md)
2. Identify sections that need updating based on your changes
3. Update the file using the Edit tool
4. Verify accuracy by cross-referencing with:
   - @src/libraries/registry.config.ts (current libraries)
   - @src/libraries/{library}/index.ts (library configs)
   - @app/api/[[...route]]/route.ts (backend endpoints)
   - @server/db/schema/ (database schemas)

**This is not optional.** Keeping this documentation current ensures:
- Future Claude sessions have accurate context
- Developers understand the full architecture
- Backend dependencies are clearly documented
- The system remains maintainable as it grows

### Self-Check Questions

Before ending a session where you made significant changes, ask yourself:

**Scratchpads Documentation:**
- [ ] Did I create spec.md for this feature? → Spec should exist BEFORE code
- [ ] Did I create/update an update_XXX.md file? → Document progress this session
- [ ] Are decisions documented with rationale? → Future sessions need context
- [ ] Did I note blockers or next steps? → Clear path for continuation
- [ ] Are file paths and specific changes listed? → Enable verification

**warm.md Maintenance:**
- [ ] Did I create a new library? → Update "Current Libraries" section
- [ ] Did I add backend integration? → Document oRPC endpoints and DB schemas
- [ ] Did I change how components work? → Update "Development Workflow"
- [ ] Did I discover a new pattern or gotcha? → Add to relevant section
- [ ] Are all sections still accurate? → Verify against codebase

**Code Quality:**
- [ ] Did I create test pages in app/(tests)/ or app/(demos)/ ? → Required for all features
- [ ] Do all tests pass? → Run `pnpm dev` and verify
- [ ] Is bundle size acceptable? → Check with `pnpm library:build {library}`

**Remember:**
- This file (warm.md) is your memory across sessions. Keep it accurate.
- Scratchpads are your project journal. Document everything.
- Future you (or another Claude) will thank you for thorough documentation.