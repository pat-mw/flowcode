# Test Coverage Summary: Vercel Deployment Features

## Quick Reference Guide

This document provides a high-level summary of the test architecture. For detailed test specifications, see `test-architecture-vercel-deployments.md`.

---

## Test Files to Create

### Unit Tests (7 files)

1. **`lib/integrations/__tests__/vercel/deployments.test.ts`**
   - Tests: 25 test cases
   - Coverage: VercelProvider deployment methods
   - Key: createDeployment, getDeployment, listDeployments, waitForDeploymentReady

2. **`lib/integrations/__tests__/vercel/projects.test.ts`**
   - Tests: 8 test cases
   - Coverage: VercelProvider project methods
   - Key: listProjects, getProject, getProjectEnvVars

### Integration Tests (2 files)

3. **`__tests__/api/routers/integrations-deployments.test.ts`**
   - Tests: 18 test cases
   - Coverage: oRPC procedures for deployments
   - Key: createVercelDeployment, getVercelDeploymentStatus, listVercelDeployments

4. **`__tests__/integration/vercel-deployment-workflow.test.ts`**
   - Tests: 3 workflow tests
   - Coverage: End-to-end integration flows
   - Key: Complete deployment and database workflows

### Component Tests (4 files)

5. **`__tests__/components/vercel/success-page.test.tsx`**
   - Tests: 5 test cases
   - Coverage: Success page after OAuth

6. **`__tests__/components/vercel/database-list.test.tsx`**
   - Tests: 12 test cases
   - Coverage: Database list, delete confirmation, refresh

7. **`__tests__/components/vercel/deployment-form.test.tsx`**
   - Tests: 10 test cases
   - Coverage: Deployment creation form

8. **`__tests__/components/vercel/deployment-list.test.tsx`**
   - Tests: 11 test cases
   - Coverage: Deployment table, status polling

### E2E Tests (4 files)

9. **`e2e/vercel-success-flow.spec.ts`**
   - Tests: 4 scenarios
   - Coverage: OAuth completion and navigation

10. **`e2e/vercel-database-management.spec.ts`**
    - Tests: 5 scenarios
    - Coverage: Database CRUD operations

11. **`e2e/vercel-deployment-creation.spec.ts`**
    - Tests: 7 scenarios
    - Coverage: Deployment creation and status monitoring

12. **`e2e/vercel-complete-workflow.spec.ts`**
    - Tests: 1 comprehensive scenario
    - Coverage: Full user journey (OAuth → Database → Deployment)

---

## Total Test Count

- **Unit Tests:** ~33 tests
- **Integration Tests:** ~21 tests
- **Component Tests:** ~38 tests
- **E2E Tests:** ~17 tests
- **TOTAL:** ~109 tests

---

## Test Coverage by Feature

### Feature 1: Success Page
- Unit: N/A (UI component)
- Component: 5 tests
- E2E: 4 tests
- **Total:** 9 tests

### Feature 2: Database Management
- Unit: Already covered (existing tests)
- Component: 12 tests
- E2E: 5 tests
- **Total:** 17 tests (12 new)

### Feature 3: Deployment Creation
- Unit: 25 tests
- Integration: 18 tests
- Component: 10 tests
- E2E: 7 tests
- **Total:** 60 tests

### Feature 4: Deployment Status & List
- Unit: 8 tests
- Integration: 3 tests
- Component: 11 tests
- E2E: Covered in creation tests
- **Total:** 22 tests

### Feature 5: Complete Workflow
- Integration: 3 workflow tests
- E2E: 1 comprehensive test
- **Total:** 4 tests

---

## Key Testing Patterns

### 1. Async Status Polling
```typescript
vi.useFakeTimers();
const promise = provider.waitForDeploymentReady('dpl_123', 'token');
await vi.runAllTimersAsync();
expect(result.state).toBe('READY');
vi.useRealTimers();
```

### 2. Mocking Fetch Responses
```typescript
(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
  ok: true,
  status: 200,
  json: async () => loadFixture('deployments.create.staticHtml'),
});
```

### 3. Testing Confirmation Dialogs
```typescript
await deleteButton.click();
const dialog = page.getByRole('dialog');
await expect(dialog).toBeVisible();
await dialog.getByRole('button', { name: /confirm/i }).click();
await expect(dialog).not.toBeVisible();
```

### 4. Testing External Links
```typescript
const urlLink = page.getByRole('link', { name: /view deployment/i });
await expect(urlLink).toHaveAttribute('href', /vercel\.app/);
await expect(urlLink).toHaveAttribute('target', '_blank');
// Don't actually click - just verify attributes
```

### 5. Testing Rate Limits
```typescript
mockFetch.mockResolvedValueOnce({
  ok: false,
  status: 429,
  headers: new Headers({
    'x-ratelimit-reset': String(resetTime),
  }),
});
await expect(provider.createDeployment(...)).rejects.toThrow(RateLimitError);
```

---

## Fixture Data Required

### Update Existing File
**File:** `lib/integrations/__tests__/fixtures/vercel-api-responses.json`

**Add sections:**
- `deployments.create` (staticHtml, nextjsHelloWorld)
- `deployments.get` (building, ready, error, canceled)
- `deployments.list` (success, empty)
- `deployments.delete` (success, notFound)
- `projects.listDeployments` (success)

**Total additions:** ~15 fixture objects

---

## Test Utilities to Create

### File: `__tests__/utils/test-helpers.ts`

**Add functions:**
1. `mockVercelDeploymentAPI(page)` - Mock Playwright routes
2. `mockAuthSession(page)` - Setup authenticated session
3. `waitForDeploymentStatus(page, id, status)` - Wait helper
4. `createMockVercelProvider()` - Provider mock factory
5. `loadFixture(path)` - Load fixture data

---

## Implementation Types Needed

### File: `lib/integrations/vercel/types.ts`

**Add types:**
```typescript
export type VercelDeploymentState =
  | 'BUILDING'
  | 'READY'
  | 'ERROR'
  | 'CANCELED';

export interface VercelDeployment {
  id: string;
  name: string;
  url: string;
  state: VercelDeploymentState;
  createdAt: string;
  readyAt?: string;
  errorMessage?: string;
  inspectorUrl: string;
}

export interface VercelDeploymentConfig {
  name: string;
  template: 'static-html' | 'nextjs-hello-world';
  gitRepository?: {
    repo: string;
    branch?: string;
  };
}

export interface VercelProject {
  id: string;
  name: string;
  framework: string | null;
  createdAt: string;
}
```

---

## oRPC Procedures to Add

### File: `lib/api/routers/integrations.ts`

**Add procedures:**
1. `createVercelDeployment` - Create deployment
2. `getVercelDeploymentStatus` - Get deployment status
3. `listVercelDeployments` - List all deployments
4. `listVercelProjects` - List all projects
5. `deleteVercelDeployment` - Delete deployment (optional)

**Input schemas:**
```typescript
// createVercelDeployment
z.object({
  integrationId: z.string(),
  name: z.string().min(1).max(64),
  template: z.enum(['static-html', 'nextjs-hello-world']),
})

// getVercelDeploymentStatus
z.object({
  integrationId: z.string(),
  deploymentId: z.string(),
})

// listVercelDeployments
z.object({
  integrationId: z.string(),
  projectId: z.string().optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
})
```

---

## Provider Methods to Add

### File: `lib/integrations/vercel/client.ts`

**Add methods to VercelProvider class:**
```typescript
async createDeployment(
  config: VercelDeploymentConfig,
  accessToken: string
): Promise<VercelDeployment>

async getDeployment(
  deploymentId: string,
  accessToken: string
): Promise<VercelDeployment>

async listDeployments(
  accessToken: string,
  projectId?: string
): Promise<VercelDeployment[]>

async listProjects(
  accessToken: string
): Promise<VercelProject[]>

async deleteDeployment(
  deploymentId: string,
  accessToken: string
): Promise<boolean>

async waitForDeploymentReady(
  deploymentId: string,
  accessToken: string,
  timeoutMs?: number
): Promise<VercelDeployment>
```

---

## UI Components to Create

### 1. Success Page
**File:** `app/integrations/vercel/success/page.tsx`
- Welcome message
- Navigation cards (Database, Deployment)
- "Continue to Dashboard" button

### 2. Database List Component
**Location:** In test page (`app/integrations/test/page.tsx`)
- List databases with status badges
- Delete button with confirmation dialog
- Refresh button
- Empty state

### 3. Deployment Form Component
**Location:** In test page
- Template selector (dropdown/radio)
- Deployment name input
- Validation messages
- Submit button with loading state

### 4. Deployment List Component
**Location:** In test page
- Table with columns: Name, Status, URL, Created
- Status badges (Building, Ready, Error)
- Clickable deployment URL
- Inspector link
- Auto-refresh for building deployments

---

## Test Execution Strategy

### Phase 1: Write All Tests (Red Phase)
1. Write all unit tests → All fail
2. Write all integration tests → All fail
3. Write all component tests → All fail
4. Write all E2E tests → All fail

### Phase 2: Implement Features (Green Phase)
1. Add types to `vercel/types.ts`
2. Implement provider methods in `vercel/client.ts`
3. Add oRPC procedures to `integrations.ts`
4. Create UI components
5. Update fixtures

### Phase 3: Refactor (Refactor Phase)
1. Improve code quality while keeping tests green
2. Extract shared logic
3. Optimize performance
4. Update documentation

---

## Critical Test Scenarios

### Must Test Before Implementation Complete

1. **Rate Limit Handling**
   - Test 429 responses
   - Verify retry-after parsing
   - Test exponential backoff

2. **Authentication Errors**
   - Test expired tokens
   - Test invalid tokens
   - Test missing permissions

3. **Deployment Status Polling**
   - Test BUILDING → READY transition
   - Test BUILDING → ERROR transition
   - Test BUILDING → CANCELED transition
   - Test timeout scenarios

4. **Confirmation Dialogs**
   - Test delete confirmation
   - Test cancel action
   - Test successful deletion

5. **External Links**
   - Verify deployment URL format
   - Verify inspector URL format
   - Verify target="_blank"
   - Verify rel="noopener noreferrer"

6. **Empty States**
   - No databases
   - No deployments
   - No projects

7. **Validation**
   - Invalid deployment names
   - Invalid template selection
   - Missing required fields

8. **Authorization**
   - User owns integration
   - Integration exists
   - Correct provider type

---

## Running Tests

```bash
# Development workflow
pnpm test:watch  # Watch mode for TDD

# Pre-commit
pnpm test        # All unit/integration tests
pnpm test:e2e    # E2E tests

# CI/CD
pnpm test:coverage  # With coverage report
```

---

## Coverage Goals

- **Unit Tests:** 90%+ coverage
- **Integration Tests:** 80%+ coverage
- **Component Tests:** 85%+ coverage
- **E2E Tests:** Critical paths only

---

## Estimated Test Writing Time

- Unit tests: ~4-6 hours
- Integration tests: ~3-4 hours
- Component tests: ~3-4 hours
- E2E tests: ~2-3 hours
- Fixtures & utilities: ~1-2 hours
- **Total:** ~13-19 hours

---

## Next Steps

1. Read full test architecture document
2. Write all unit tests first (TDD Red phase)
3. Write all integration tests
4. Write all component tests
5. Write all E2E tests
6. Verify ALL tests fail
7. Begin implementation (TDD Green phase)
8. Run tests continuously
9. Refactor when tests pass (TDD Refactor phase)
10. Verify 100% test pass rate before marking feature complete

---

## Questions to Resolve During Implementation

1. Should deployment deletion be supported? (Add to UI?)
2. Should we support custom Git repositories? (Beyond templates?)
3. Should we cache deployment status? (Reduce API calls?)
4. Should we implement retry logic for failed deployments?
5. Should we show build logs in the UI?
6. Should we support environment variable configuration during deployment?
7. Should we limit concurrent deployments?
8. Should we implement deployment rollback?

---

## Reference Documentation

- Full test specifications: `docs/test-architecture-vercel-deployments.md`
- Vercel API docs: https://vercel.com/docs/rest-api
- Existing test patterns: `lib/integrations/__tests__/vercel/database.test.ts`
- Playwright best practices: https://playwright.dev/docs/best-practices
- Vitest documentation: https://vitest.dev/guide/
