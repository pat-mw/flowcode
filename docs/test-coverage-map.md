# Test Coverage Map: Vercel Deployment Features

## Visual Test Coverage Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        FEATURE IMPLEMENTATION                            │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ 1. Types (vercel/types.ts)                                       │  │
│  │    - VercelDeployment                                            │  │
│  │    - VercelDeploymentConfig                                      │  │
│  │    - VercelDeploymentState                                       │  │
│  │    - VercelProject                                               │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│           │                                                              │
│           │ Used by                                                      │
│           ▼                                                              │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ 2. Provider Methods (vercel/client.ts)                           │  │
│  │    - createDeployment()                                          │  │
│  │    - getDeployment()                                             │  │
│  │    - listDeployments()                                           │  │
│  │    - listProjects()                                              │  │
│  │    - deleteDeployment()                                          │  │
│  │    - waitForDeploymentReady()                                    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│           │                                                              │
│           │ Called by                                                    │
│           ▼                                                              │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ 3. oRPC Procedures (api/routers/integrations.ts)                │  │
│  │    - createVercelDeployment                                      │  │
│  │    - getVercelDeploymentStatus                                   │  │
│  │    - listVercelDeployments                                       │  │
│  │    - listVercelProjects                                          │  │
│  │    - deleteVercelDeployment                                      │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│           │                                                              │
│           │ Consumed by                                                  │
│           ▼                                                              │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ 4. UI Components                                                 │  │
│  │    a. Success Page (app/integrations/vercel/success/page.tsx)   │  │
│  │    b. Database List (in test page)                              │  │
│  │    c. Deployment Form (in test page)                            │  │
│  │    d. Deployment List (in test page)                            │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                          TEST COVERAGE LAYERS                            │
│                                                                          │
│  Layer 1: UNIT TESTS                                                    │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ deployments.test.ts (25 tests)                                   │  │
│  │  ✓ createDeployment() - static HTML                             │  │
│  │  ✓ createDeployment() - Next.js template                        │  │
│  │  ✓ createDeployment() - invalid name                            │  │
│  │  ✓ getDeployment() - fetch by ID                                │  │
│  │  ✓ getDeployment() - status parsing                             │  │
│  │  ✓ getDeployment() - not found                                  │  │
│  │  ✓ listDeployments() - all                                      │  │
│  │  ✓ listDeployments() - empty                                    │  │
│  │  ✓ listDeployments() - filter by state                          │  │
│  │  ✓ listDeployments() - pagination                               │  │
│  │  ✓ waitForDeploymentReady() - polling                           │  │
│  │  ✓ waitForDeploymentReady() - already ready                     │  │
│  │  ✓ waitForDeploymentReady() - error status                      │  │
│  │  ✓ waitForDeploymentReady() - timeout                           │  │
│  │  ✓ Error handling: rate limit (429)                             │  │
│  │  ✓ Error handling: authentication (401/403)                     │  │
│  │  ✓ Error handling: deployment failure (400/500)                 │  │
│  │  ... (8 more tests)                                              │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ projects.test.ts (8 tests)                                       │  │
│  │  ✓ getProject() - fetch by ID                                   │  │
│  │  ✓ getProject() - not found                                     │  │
│  │  ✓ listProjects() - all                                         │  │
│  │  ✓ listProjects() - empty                                       │  │
│  │  ... (4 more tests)                                              │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  Layer 2: INTEGRATION TESTS                                             │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ integrations-deployments.test.ts (18 tests)                      │  │
│  │  ✓ createVercelDeployment - authenticated                       │  │
│  │  ✓ createVercelDeployment - name validation                     │  │
│  │  ✓ createVercelDeployment - template validation                 │  │
│  │  ✓ createVercelDeployment - requires valid integration          │  │
│  │  ✓ createVercelDeployment - enforces ownership                  │  │
│  │  ✓ getVercelDeploymentStatus - authenticated                    │  │
│  │  ✓ getVercelDeploymentStatus - returns URL when ready           │  │
│  │  ✓ listVercelDeployments - authenticated                        │  │
│  │  ✓ listVercelDeployments - filter by project                    │  │
│  │  ✓ listVercelProjects - authenticated                           │  │
│  │  ... (8 more tests)                                              │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ vercel-deployment-workflow.test.ts (3 tests)                     │  │
│  │  ✓ Complete deployment creation workflow                        │  │
│  │  ✓ Complete database management workflow                        │  │
│  │  ✓ Concurrent deployments                                       │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  Layer 3: COMPONENT TESTS                                               │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ success-page.test.tsx (5 tests)                                  │  │
│  │  ✓ Renders welcome message                                      │  │
│  │  ✓ Displays navigation cards                                    │  │
│  │  ✓ Links to database section                                    │  │
│  │  ✓ Links to deployment section                                  │  │
│  │  ✓ "Continue to Dashboard" button                               │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ database-list.test.tsx (12 tests)                                │  │
│  │  ✓ Empty state                                                   │  │
│  │  ✓ Renders database cards                                       │  │
│  │  ✓ Status badges (Creating, Ready, Error)                       │  │
│  │  ✓ Delete button                                                │  │
│  │  ✓ Confirmation dialog                                          │  │
│  │  ✓ Cancel deletion                                              │  │
│  │  ✓ API call on confirm                                          │  │
│  │  ✓ Loading state during deletion                                │  │
│  │  ✓ Error handling                                               │  │
│  │  ✓ Refresh list after deletion                                  │  │
│  │  ✓ Masked connection string                                     │  │
│  │  ✓ Refresh button                                               │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ deployment-form.test.tsx (10 tests)                              │  │
│  │  ✓ Template selector                                            │  │
│  │  ✓ Deployment name input                                        │  │
│  │  ✓ Name validation on blur                                      │  │
│  │  ✓ Disable submit when invalid                                  │  │
│  │  ✓ Template descriptions                                        │  │
│  │  ✓ Submit with valid data                                       │  │
│  │  ✓ Loading state                                                │  │
│  │  ✓ Success message                                              │  │
│  │  ✓ Error message                                                │  │
│  │  ✓ Form reset after success                                     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ deployment-list.test.tsx (11 tests)                              │  │
│  │  ✓ Empty state                                                   │  │
│  │  ✓ Renders table                                                │  │
│  │  ✓ Deployment name column                                       │  │
│  │  ✓ Status badges                                                │  │
│  │  ✓ Deployment URL (clickable)                                   │  │
│  │  ✓ Inspector link                                               │  │
│  │  ✓ Created timestamp                                            │  │
│  │  ✓ Poll BUILDING deployments                                    │  │
│  │  ✓ Stop polling when READY                                      │  │
│  │  ✓ Error details                                                │  │
│  │  ✓ Refresh button                                               │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  Layer 4: E2E TESTS                                                     │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ vercel-success-flow.spec.ts (4 scenarios)                        │  │
│  │  ✓ Redirect to success page after OAuth                         │  │
│  │  ✓ Navigate to database section                                 │  │
│  │  ✓ Navigate to deployment section                               │  │
│  │  ✓ Navigate to dashboard                                        │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ vercel-database-management.spec.ts (5 scenarios)                 │  │
│  │  ✓ Display empty database list                                  │  │
│  │  ✓ Create database                                              │  │
│  │  ✓ Refresh database list                                        │  │
│  │  ✓ Delete database with confirmation                            │  │
│  │  ✓ Cancel database deletion                                     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ vercel-deployment-creation.spec.ts (7 scenarios)                 │  │
│  │  ✓ Create static HTML deployment                                │  │
│  │  ✓ Create Next.js deployment                                    │  │
│  │  ✓ Display building status initially                            │  │
│  │  ✓ Poll status until ready                                      │  │
│  │  ✓ Display deployment URL when ready                            │  │
│  │  ✓ Display Vercel inspector link                                │  │
│  │  ✓ Handle deployment errors                                     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ vercel-complete-workflow.spec.ts (1 comprehensive scenario)      │  │
│  │  ✓ Complete full integration setup (10 steps)                   │  │
│  │    - OAuth connection                                            │  │
│  │    - Success page                                                │  │
│  │    - Database creation                                           │  │
│  │    - Deployment creation                                         │  │
│  │    - Status monitoring                                           │  │
│  │    - Cleanup                                                     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Test Dependency Graph

```
                    ┌─────────────────┐
                    │  Fixture Data   │
                    │  (JSON file)    │
                    └────────┬────────┘
                             │
                             │ Loaded by
                             │
          ┌──────────────────┴──────────────────┐
          │                                     │
          ▼                                     ▼
┌──────────────────┐                  ┌──────────────────┐
│   Unit Tests     │                  │ Integration Tests│
│ (Mocked fetch)   │                  │ (Real database)  │
└────────┬─────────┘                  └────────┬─────────┘
         │                                     │
         │ Tests                               │ Tests
         │                                     │
         ▼                                     ▼
┌─────────────────────────────────────────────────────────┐
│         Provider Methods (vercel/client.ts)             │
│  - createDeployment()                                   │
│  - getDeployment()                                      │
│  - listDeployments()                                    │
└────────┬────────────────────────────────────────────────┘
         │
         │ Used by
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│     oRPC Procedures (api/routers/integrations.ts)       │
│  - createVercelDeployment                               │
│  - getVercelDeploymentStatus                            │
│  - listVercelDeployments                                │
└────────┬────────────────────────────────────────────────┘
         │
         │ Called by
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│              UI Components                              │
│  - Success Page                                         │
│  - Database List                                        │
│  - Deployment Form                                      │
│  - Deployment List                                      │
└────────┬────────────────────────────────────────────────┘
         │
         │ Tested by
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│         Component Tests + E2E Tests                     │
└─────────────────────────────────────────────────────────┘
```

---

## Test Coverage by Code Path

### Path 1: Create Static HTML Deployment

```
User Action → Component Test → Integration Test → Unit Test
    │              │                  │               │
    ▼              ▼                  ▼               ▼
┌────────┐   ┌──────────┐   ┌────────────┐   ┌──────────┐
│ User   │   │Deployment│   │createVercel│   │Provider. │
│ clicks │→→ │Form      │→→ │Deployment  │→→ │create    │
│"Create"│   │.submit() │   │(oRPC)      │   │Deployment│
└────────┘   └──────────┘   └────────────┘   └──────────┘
                                                    │
                                                    ▼
                                              ┌──────────┐
                                              │ POST to  │
                                              │ Vercel   │
                                              │ API      │
                                              └──────────┘

E2E Test:     vercel-deployment-creation.spec.ts
Component:    deployment-form.test.tsx
Integration:  integrations-deployments.test.ts
Unit:         deployments.test.ts → createDeployment()
```

### Path 2: Monitor Deployment Status

```
Component Poll → Integration Poll → Unit Poll → API Poll
      │                │                │           │
      ▼                ▼                ▼           ▼
┌──────────┐   ┌────────────┐   ┌──────────┐   ┌────────┐
│Deployment│   │getVercel   │   │Provider. │   │ GET    │
│List      │→→ │Deployment  │→→ │get       │→→ │Vercel  │
│useEffect │   │Status      │   │Deployment│   │API     │
│(polling) │   │(oRPC)      │   │          │   │        │
└──────────┘   └────────────┘   └──────────┘   └────────┘

E2E Test:     vercel-deployment-creation.spec.ts (poll test)
Component:    deployment-list.test.tsx (polling)
Integration:  integrations-deployments.test.ts
Unit:         deployments.test.ts → getDeployment()
              deployments.test.ts → waitForDeploymentReady()
```

### Path 3: Delete Database

```
User Confirm → Component → Integration → Unit → API
     │            │            │           │      │
     ▼            ▼            ▼           ▼      ▼
┌────────┐  ┌──────────┐  ┌────────┐  ┌───────┐  ┌──────┐
│Dialog  │  │Database  │  │delete  │  │delete │  │DELETE│
│Confirm │→→│List      │→→│Vercel  │→→│Database→→│Vercel│
│button  │  │.onDelete │  │Database│  │       │  │API   │
└────────┘  └──────────┘  └────────┘  └───────┘  └──────┘

E2E Test:     vercel-database-management.spec.ts
Component:    database-list.test.tsx (confirmation)
Integration:  N/A (existing database tests)
Unit:         database.test.ts (existing)
```

---

## Error Path Coverage

### Error 1: Rate Limit (429)

```
Unit Test → Mock 429 → Provider throws RateLimitError
                                │
                                ▼
Integration Test → Catch error → Return error to client
                                │
                                ▼
Component Test → Display error → Show retry time
                                │
                                ▼
E2E Test → See error message → User can retry
```

**Tests covering this:**
- `deployments.test.ts` - "should handle rate limit errors"
- `integrations-deployments.test.ts` - "should handle rate limit errors"
- `deployment-form.test.tsx` - "should show error message on failure"
- `vercel-deployment-creation.spec.ts` - "should handle deployment errors"

### Error 2: Authentication Failure (401)

```
Unit Test → Mock 401 → Provider throws AuthenticationError
                                │
                                ▼
Integration Test → Catch error → Clear integration tokens
                                │
                                ▼
Component Test → Show error → "Please reconnect"
                                │
                                ▼
E2E Test → Redirect to OAuth → User reconnects
```

**Tests covering this:**
- `deployments.test.ts` - "should handle authentication errors"
- `integrations-deployments.test.ts` - "should require authentication"
- Not in component tests (handled at router level)
- Could add E2E test for token expiration

### Error 3: Deployment Build Failure

```
Unit Test → Mock ERROR state → Provider returns error details
                                │
                                ▼
Integration Test → Pass through → Return errorMessage
                                │
                                ▼
Component Test → Display error → Show build logs link
                                │
                                ▼
E2E Test → See error badge → Click inspector link
```

**Tests covering this:**
- `deployments.test.ts` - "should return deployment status correctly" (ERROR)
- `deployments.test.ts` - "waitForDeploymentReady() should throw on ERROR"
- `deployment-list.test.tsx` - "should show error details for ERROR status"
- `vercel-deployment-creation.spec.ts` - Could add build failure test

---

## Coverage Metrics by Layer

### Unit Tests (Provider Methods)

| Method                   | Test Cases | Edge Cases | Error Cases |
|--------------------------|------------|------------|-------------|
| createDeployment()       | 3          | 2          | 3           |
| getDeployment()          | 3          | 1          | 1           |
| listDeployments()        | 4          | 2          | 1           |
| listProjects()           | 2          | 1          | 1           |
| deleteDeployment()       | 2          | 1          | 2           |
| waitForDeploymentReady() | 5          | 2          | 2           |
| **TOTAL**                | **19**     | **9**      | **10**      |

**Coverage:** ~95% (38 test cases)

### Integration Tests (oRPC Procedures)

| Procedure                  | Test Cases | Auth Tests | Error Cases |
|----------------------------|------------|------------|-------------|
| createVercelDeployment     | 4          | 2          | 2           |
| getVercelDeploymentStatus  | 3          | 2          | 1           |
| listVercelDeployments      | 4          | 2          | 1           |
| listVercelProjects         | 2          | 1          | 1           |
| deleteVercelDeployment     | 3          | 2          | 1           |
| **TOTAL**                  | **16**     | **9**      | **6**       |

**Coverage:** ~90% (31 test cases)

### Component Tests (UI)

| Component         | Test Cases | User Interactions | Error Handling |
|-------------------|------------|-------------------|----------------|
| Success Page      | 5          | 3                 | 0              |
| Database List     | 12         | 6                 | 2              |
| Deployment Form   | 10         | 5                 | 2              |
| Deployment List   | 11         | 4                 | 2              |
| **TOTAL**         | **38**     | **18**            | **6**          |

**Coverage:** ~85% (62 test cases including interactions)

### E2E Tests (User Workflows)

| Workflow           | Scenarios | Steps per Scenario | Total Steps |
|--------------------|-----------|--------------------| ------------|
| Success Flow       | 4         | 2-3                | ~10         |
| Database CRUD      | 5         | 3-5                | ~18         |
| Deployment Create  | 7         | 3-6                | ~28         |
| Complete Workflow  | 1         | 10                 | ~10         |
| **TOTAL**          | **17**    | -                  | **~66**     |

**Coverage:** Critical user paths (100%)

---

## Test Execution Time Estimates

### Unit Tests
- Provider methods: ~5 seconds
- Type definitions: ~1 second
- **Total:** ~6 seconds

### Integration Tests
- oRPC procedures: ~15 seconds (with database)
- Workflow tests: ~8 seconds
- **Total:** ~23 seconds

### Component Tests
- Success page: ~2 seconds
- Database list: ~5 seconds
- Deployment form: ~4 seconds
- Deployment list: ~5 seconds
- **Total:** ~16 seconds

### E2E Tests
- Success flow: ~10 seconds
- Database management: ~20 seconds
- Deployment creation: ~30 seconds (with mocked polling)
- Complete workflow: ~45 seconds
- **Total:** ~105 seconds (~1.75 minutes)

### **TOTAL TEST SUITE:** ~2.5 minutes

---

## Continuous Integration Test Pipeline

```
┌────────────────────────────────────────────────────────┐
│                   CI/CD Pipeline                       │
└────────────────────────────────────────────────────────┘

Step 1: Lint & Type Check (30s)
  └─> ESLint
  └─> TypeScript tsc --noEmit

Step 2: Unit Tests (6s)
  └─> Vitest run (unit tests only)
  └─> Coverage report

Step 3: Integration Tests (23s)
  └─> Vitest run (integration tests)
  └─> Database setup/teardown

Step 4: Build Application (60s)
  └─> Next.js build
  └─> Verify no build errors

Step 5: Component Tests (16s)
  └─> Vitest run (component tests)
  └─> React Testing Library

Step 6: E2E Tests (105s)
  └─> Playwright run
  └─> All browsers (chromium, firefox, webkit)

──────────────────────────────────────────────────────────
TOTAL CI TIME: ~4 minutes
──────────────────────────────────────────────────────────

Success Criteria:
  ✓ All tests pass (100%)
  ✓ Coverage > 85%
  ✓ No linting errors
  ✓ Build succeeds
```

---

## Test Maintenance Strategy

### When to Update Tests

1. **API Changes**
   - Update fixture data
   - Update type definitions
   - Update provider method tests

2. **UI Changes**
   - Update component tests
   - Update E2E selectors
   - Update accessibility tests

3. **Business Logic Changes**
   - Update integration tests
   - Update validation tests
   - Update error handling tests

4. **New Features**
   - Add new test files
   - Update existing workflows
   - Update coverage reports

### Test Stability Guidelines

1. **Avoid Brittle Selectors**
   - Use `data-testid` attributes
   - Use semantic roles (`getByRole`)
   - Avoid CSS selectors

2. **Independent Tests**
   - Each test should be self-contained
   - No shared state between tests
   - Proper setup/teardown

3. **Deterministic Results**
   - Use fake timers for polling
   - Mock external APIs
   - No random data in tests

4. **Clear Error Messages**
   - Descriptive test names
   - Meaningful assertions
   - Debug information in failures

---

## Summary

This test coverage map provides:

- **Visual diagram** of test layers
- **Dependency graph** showing test relationships
- **Code path coverage** for key features
- **Error path coverage** for failure scenarios
- **Metrics by layer** with test counts
- **Execution time estimates** for CI/CD planning
- **Maintenance strategy** for long-term stability

All tests follow TDD principles and should be written BEFORE implementation.

**Total Coverage:** ~109 tests covering all layers from unit to E2E
