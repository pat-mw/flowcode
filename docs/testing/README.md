# Webflow Component Export Testing Documentation

## Overview

This directory contains comprehensive testing documentation for the Webflow Component Export System, which uses a git clone approach to deploy components via Vercel Functions.

---

## Document Index

### 1. **Test Strategy** (Start Here)
**File:** `webflow-export-test-strategy.md`

**Purpose:** Complete testing strategy with detailed test cases, mocking strategies, and coverage goals

**Contents:**
- Architecture overview
- Test file structure
- Unit test specifications (50+ test cases)
- Integration test specifications (15+ test cases)
- E2E test specifications (35+ test cases)
- Mocking strategies (what to mock vs what to run)
- Test data management
- Coverage goals and metrics
- Error scenarios
- Performance benchmarks
- Security testing approach

**When to use:**
- Before implementing any tests (understand full scope)
- When writing individual test cases (reference test scenarios)
- When deciding what to mock (mocking strategy guide)
- When measuring coverage (reference coverage goals)

---

### 2. **Test Plan Summary** (Quick Reference)
**File:** `webflow-export-test-plan-summary.md`

**Purpose:** Condensed test plan with key information and quick reference tables

**Contents:**
- Architecture diagram (ASCII)
- Testing pyramid breakdown
- Test file locations
- Mocking strategy summary
- Critical test scenarios
- Mock data fixtures
- Test execution commands
- Coverage requirements table
- Success criteria checklist

**When to use:**
- Quick reference during test implementation
- Onboarding new team members
- Reviewing test approach (high-level)
- Checking coverage requirements

---

### 3. **Test Architecture** (Visual Guide)
**File:** `webflow-export-test-architecture.md`

**Purpose:** Visual representation of system architecture with test points

**Contents:**
- System architecture diagram (detailed ASCII)
- Test data flow visualization
- Error path diagrams
- Mock setup examples
- Assertion examples by layer
- Process mocking patterns

**When to use:**
- Understanding where tests run in the system
- Visualizing data flow through components
- Tracing error handling paths
- Setting up mocks for specific scenarios

---

### 4. **Test Checklist** (Implementation Tracker)
**File:** `webflow-export-test-checklist.md`

**Purpose:** Step-by-step implementation checklist with progress tracking

**Contents:**
- Phase 1: Unit Tests - VercelBuildProvider (50 tasks)
- Phase 2: Unit Tests - WebflowRouter (15 tasks)
- Phase 3: Integration Tests (15 tasks)
- Phase 4: E2E Tests (35 tasks)
- Phase 5: Coverage Verification
- Phase 6: Test Quality Assurance
- Phase 7: CI/CD Integration
- Phase 8: Final Validation
- Test statistics summary
- Next actions timeline

**When to use:**
- Tracking implementation progress
- Ensuring no test cases are missed
- Planning test implementation phases
- Reporting test completion status

---

## Quick Start Guide

### For Test Implementers:

1. **Read the Test Strategy** (`webflow-export-test-strategy.md`)
   - Understand full scope of testing
   - Review mocking strategies
   - Note coverage goals

2. **Reference the Architecture** (`webflow-export-test-architecture.md`)
   - Visualize system under test
   - Understand data flow
   - See mock setup examples

3. **Follow the Checklist** (`webflow-export-test-checklist.md`)
   - Check off tasks as you complete them
   - Track your progress through phases
   - Ensure comprehensive coverage

4. **Use the Summary for Quick Reference** (`webflow-export-test-plan-summary.md`)
   - Look up mock patterns
   - Check coverage requirements
   - Verify test locations

---

## Test Implementation Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│ PHASE 1: PREPARATION                                                 │
└─────────────────────────────────────────────────────────────────────┘
  1. Read webflow-export-test-strategy.md (full understanding)
  2. Review webflow-export-test-architecture.md (visual guide)
  3. Understand mocking strategy (what to mock vs run)
        ↓
┌─────────────────────────────────────────────────────────────────────┐
│ PHASE 2: UNIT TESTS                                                  │
└─────────────────────────────────────────────────────────────────────┘
  1. Create vercel-build-provider.test.ts
  2. Implement cloneRepository() tests (12 test cases)
  3. Implement copyNodeModules() tests (7 test cases)
  4. Implement runCommand() tests (10 test cases)
  5. Implement extractDeploymentUrl() tests (7 test cases)
  6. Implement buildComponents() tests (14 test cases)
  7. Run tests: pnpm test vercel-build-provider.test.ts
  8. Check coverage: pnpm test:coverage
        ↓
  9. Create webflow-router.test.ts
  10. Implement exportComponents tests (9 test cases)
  11. Run tests: pnpm test webflow-router.test.ts
        ↓
┌─────────────────────────────────────────────────────────────────────┐
│ PHASE 3: INTEGRATION TESTS                                           │
└─────────────────────────────────────────────────────────────────────┘
  1. Create vercel-integration.test.ts
  2. Setup test database with schema
  3. Implement full workflow tests (15 test cases)
  4. Run tests: pnpm test vercel-integration.test.ts
        ↓
┌─────────────────────────────────────────────────────────────────────┐
│ PHASE 4: E2E TESTS                                                   │
└─────────────────────────────────────────────────────────────────────┘
  1. Create webflow-export.spec.ts
  2. Setup Playwright test environment
  3. Implement user workflow tests (35 test cases)
  4. Run tests: pnpm test:e2e webflow-export.spec.ts
        ↓
┌─────────────────────────────────────────────────────────────────────┐
│ PHASE 5: VALIDATION                                                  │
└─────────────────────────────────────────────────────────────────────┘
  1. Run all tests: pnpm test && pnpm test:e2e
  2. Measure coverage: pnpm test:coverage
  3. Verify >80% coverage achieved
  4. Review uncovered code (acceptable?)
  5. Update test checklist (mark all complete)
        ↓
┌─────────────────────────────────────────────────────────────────────┐
│ PHASE 6: CI/CD                                                       │
└─────────────────────────────────────────────────────────────────────┘
  1. Setup GitHub Actions workflow
  2. Configure environment variables
  3. Run tests in CI/CD pipeline
  4. Verify all tests pass
        ↓
┌─────────────────────────────────────────────────────────────────────┐
│ DONE ✅                                                               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Test Statistics

| Document                  | Pages | Test Cases Defined | Time to Read |
|--------------------------|-------|-------------------|--------------|
| Test Strategy            | 12    | ~115              | 30 minutes   |
| Test Plan Summary        | 5     | Key scenarios     | 10 minutes   |
| Test Architecture        | 8     | Visual reference  | 15 minutes   |
| Test Checklist           | 6     | 115+ tasks        | 5 minutes    |
| **Total**                | **31**| **115+**          | **60 min**   |

---

## Key Concepts

### Testing Pyramid
```
        /\
       /  \  E2E Tests (10%)
      /────\  ~35 test cases
     /      \ Real browser, full workflow
    /────────\
   /          \ Integration Tests (20%)
  /────────────\  ~15 test cases
 /              \ Real coordination, mocked I/O
/────────────────\
Unit Tests (70%)
~65 test cases
Pure functions, mocked everything
```

### Mocking Philosophy

**✅ ALWAYS Mock:**
- External I/O (git, file system, network)
- Child processes (spawn)
- External APIs (GitHub, Webflow)
- Time-dependent functions (for determinism)

**❌ NEVER Mock:**
- Coordination logic (VercelBuildProvider orchestration)
- Error handling (BuildProviderError creation)
- Data transformations (log formatting, URL extraction)
- Business logic (token encryption/decryption)

### Coverage Goals

| Layer       | Line Coverage | Branch Coverage | Focus                    |
|-------------|--------------|-----------------|--------------------------|
| Unit        | >90%         | >85%            | Function-level logic     |
| Integration | >80%         | >75%            | Component coordination   |
| E2E         | 100%         | 100%            | Critical user paths      |

---

## Testing Tools

### Unit & Integration Tests
- **Framework:** Vitest 3.2.4
- **Mocking:** Vitest's `vi.mock()`
- **Assertions:** `expect()` from Vitest
- **Coverage:** @vitest/coverage-v8

### E2E Tests
- **Framework:** Playwright 1.56.1
- **Browsers:** Chromium, Firefox, WebKit
- **Auto-server:** Starts dev server automatically

---

## Test Execution

### Development (Watch Mode)
```bash
# Unit tests
pnpm test --watch

# Specific file
pnpm test vercel-build-provider.test.ts --watch
```

### CI/CD (Run Once)
```bash
# All unit & integration tests
pnpm test:run

# E2E tests
pnpm test:e2e

# Coverage report
pnpm test:coverage
```

### Debug Mode
```bash
# E2E with UI
pnpm test:e2e:ui

# E2E with debug
pnpm test:e2e:debug
```

---

## Environment Variables

### Unit Tests
```bash
GITHUB_TOKEN=test_token_123
GITHUB_REPO_URL=https://github.com/test/repo.git
ENCRYPTION_SECRET=test_secret_32_chars_long
```

### Integration Tests
```bash
# Same as unit tests + database
DATABASE_URL=./data/test.db
```

### E2E Tests
```bash
# Real or mocked values
GITHUB_TOKEN=<real-or-mocked>
GITHUB_REPO_URL=https://github.com/user/blogflow.git
ENCRYPTION_SECRET=<real-key>
```

---

## Common Patterns

### Mock Process Factory
```typescript
export function createMockProcess(exitCode: number, logs: string[]) {
  const mockProc = new EventEmitter();
  setTimeout(() => {
    logs.forEach(log => mockProc.emit('data', Buffer.from(log)));
    mockProc.emit('close', exitCode);
  }, 10);
  return mockProc;
}
```

### Test Data
```typescript
export const VALID_WEBFLOW_TOKEN = 'wf_test_workspace_token_valid_abc123';
export const VALID_GITHUB_TOKEN = 'ghp_test_github_token_valid_xyz789';
```

### Error Testing
```typescript
it('should handle git clone failure', async () => {
  // Arrange
  const mockProc = createMockProcess(128, ['fatal: repo not found']);
  vi.mocked(spawn).mockReturnValue(mockProc as any);

  // Act & Assert
  await expect(provider.cloneRepository()).rejects.toThrow(BuildProviderError);
});
```

---

## Success Criteria

Before marking test implementation complete:

- [ ] All 115+ test cases implemented
- [ ] All unit tests pass (>90% coverage)
- [ ] All integration tests pass (>80% coverage)
- [ ] All E2E tests pass (100% critical paths)
- [ ] No tokens exposed in logs or errors
- [ ] Cleanup verified on success and failure
- [ ] CI/CD pipeline configured and passing
- [ ] Test checklist fully checked off
- [ ] Code review completed
- [ ] Documentation updated

---

## Troubleshooting

### Tests hang or timeout
- Increase timeout in test config
- Check for unresolved promises
- Verify mocks are calling callbacks

### "Cannot find module" errors
- Check path aliases in vitest.config.mts
- Verify imports match file structure
- Run `pnpm install`

### Mocks not working
- Ensure `vi.clearAllMocks()` in beforeEach
- Check mock is defined before test runs
- Verify mock path matches actual import

### Coverage too low
- Identify uncovered lines in report
- Add missing test cases
- Remove dead code if applicable

---

## Additional Resources

- **Main Testing Guide:** `/TESTING.md`
- **Project Instructions:** `/CLAUDE.md`
- **Vitest Documentation:** https://vitest.dev/
- **Playwright Documentation:** https://playwright.dev/
- **Vercel Integration:** `/lib/integrations/build-providers/README.md`

---

## Support

For questions about the test strategy:
1. Review the relevant documentation file
2. Check the test architecture diagram
3. Consult the project's TESTING.md
4. Review existing test files for patterns

---

**Documentation Created By:** Claude Code (Test Architect Agent)
**Date:** 2025-11-02
**Status:** Complete and Ready for Use
**Estimated Implementation Time:** 8-16 hours
