# Webflow Component Export - Test Plan Summary

## Quick Reference

This document summarizes the testing approach for the Webflow Component Export System using the git clone approach.

---

## Architecture Overview

```
User clicks "Export"
  → WebflowRouter.exportComponents (oRPC)
    → ManualTokenProvider.getToken (decrypt)
    → VercelBuildProvider.buildComponents
      → 1. Clone GitHub repo (git clone with token auth)
      → 2. Copy node_modules (cp -r from function)
      → 3. Run webpack (npx webpack)
      → 4. Deploy to Webflow (npx webflow library share)
      → 5. Extract deployment URL from logs
      → 6. Cleanup /tmp directory
    → Return BuildResult with logs & URL
  → Frontend displays logs + success + URL
```

---

## Test File Locations

```
lib/integrations/build-providers/__tests__/
  ├── vercel-build-provider.test.ts      # Unit tests (core logic)
  └── vercel-integration.test.ts         # Integration tests (coordination)

lib/api/routers/__tests__/
  └── webflow-router.test.ts             # oRPC procedure tests

e2e/
  └── webflow-export.spec.ts             # End-to-end user workflow
```

---

## Testing Pyramid

### Layer 1: Unit Tests (70% of tests)
**File:** `vercel-build-provider.test.ts`

**What to test:**
- `cloneRepository()` - Git authentication, shallow clone, error handling
- `copyNodeModules()` - File copying, permission errors
- `runCommand()` - Process spawning, log collection, exit codes
- `extractDeploymentUrl()` - URL regex extraction
- `buildComponents()` - Workflow orchestration, cleanup on failure

**Mocking:** Mock ALL I/O (spawn, fs, env vars)

**Key tests:**
- ✅ Git clone with token authentication
- ✅ Missing GITHUB_TOKEN throws error
- ✅ Webpack failure is handled gracefully
- ✅ Cleanup happens even on error (finally block)
- ✅ Logs are timestamped and formatted
- ✅ Token is hidden in logs

---

### Layer 2: Integration Tests (20% of tests)
**File:** `vercel-integration.test.ts`

**What to test:**
- Token retrieval → Build → Cleanup flow
- Real encryption/decryption
- Error propagation through layers
- Environment variable validation

**Mocking:** Mock ONLY external commands (git, webpack, CLI)

**Key tests:**
- ✅ Full workflow with real coordination
- ✅ Token is encrypted in database
- ✅ Git failure propagates to frontend
- ✅ Cleanup removes /tmp directory

---

### Layer 3: E2E Tests (10% of tests)
**File:** `webflow-export.spec.ts`

**What to test:**
- Complete user workflows in real browser
- UI interactions and status updates
- Real-time log streaming
- Error message display

**Mocking:** Mock ONLY external services (GitHub, Webflow API)

**Key tests:**
- ✅ Save token → Export → View logs → Success
- ✅ Missing env vars show error message
- ✅ Deployment URL is clickable
- ✅ Export button is disabled while exporting

---

## Mocking Strategy Summary

### ✅ ALWAYS Mock (Never Run Real):
```typescript
// Child processes (git, cp, webpack, webflow CLI)
vi.mock('child_process', () => ({
  spawn: vi.fn() // Controlled mock
}));

// External API calls
await page.route('**/github.com/**', route => route.abort());

// Environment variables (for controlled testing)
process.env.GITHUB_TOKEN = 'test_token_123';
```

### ❌ NEVER Mock (Always Run Real):
```typescript
// ✅ Coordination logic in VercelBuildProvider
// ✅ Error handling and BuildProviderError creation
// ✅ Log formatting and timestamp addition
// ✅ URL extraction regex
// ✅ Token encryption/decryption
// ✅ oRPC router procedure logic
```

---

## Critical Test Scenarios

### 1. Happy Path (MUST PASS)
```
User saves token
  → Token encrypted in database
  → User clicks export
  → Git clones repo successfully
  → Node modules copied
  → Webpack compiles successfully
  → Webflow CLI deploys
  → Deployment URL extracted
  → Success alert shown
  → Cleanup completes
```

### 2. Git Clone Failure
```
User clicks export
  → GITHUB_TOKEN missing
  → BuildProviderError thrown
  → Error message: "GITHUB_TOKEN environment variable is not set"
  → Frontend shows error alert
  → No cleanup needed (clone never started)
```

### 3. Webpack Compilation Failure
```
User clicks export
  → Git clone succeeds
  → Node modules copied
  → Webpack fails (syntax error)
  → BuildProviderError thrown
  → Cleanup removes /tmp directory
  → Frontend shows error with logs
  → User can retry
```

### 4. Webflow CLI Failure
```
User clicks export
  → All steps succeed until CLI
  → Webflow token invalid/expired
  → CLI exits with code 1
  → BuildProviderError thrown
  → Cleanup removes /tmp directory
  → Frontend shows error message
```

---

## Mock Data & Fixtures

### Test Tokens:
```typescript
export const VALID_WEBFLOW_TOKEN = 'wf_test_workspace_token_valid_abc123def456';
export const VALID_GITHUB_TOKEN = 'ghp_test_github_token_valid_xyz789';
export const INVALID_TOKEN_SHORT = 'wf_123';
```

### Mock Logs:
```typescript
export const MOCK_GIT_CLONE_SUCCESS = [
  '[stdout] Cloning into /tmp/webflow-export-abc123...',
  '[stdout] ✅ Repository cloned successfully'
];

export const MOCK_WEBPACK_SUCCESS = [
  '[stdout] asset Client.js 145 KiB [emitted]',
  '[stdout] webpack 5.90.0 compiled successfully'
];

export const MOCK_WEBFLOW_DEPLOY_SUCCESS = [
  '[stdout] ✅ Components deployed successfully',
  '[stdout] 🔗 https://webflow.com/workspace/library/components'
];
```

### Mock Process Factory:
```typescript
export function createMockSuccessProcess(logs: string[]) {
  const mockProc = new EventEmitter();
  setTimeout(() => {
    logs.forEach(log => mockProc.emit('data', Buffer.from(log)));
    mockProc.emit('close', 0); // Success
  }, 10);
  return mockProc;
}

export function createMockFailureProcess(errorMessage: string) {
  const mockProc = new EventEmitter();
  setTimeout(() => {
    mockProc.emit('data', Buffer.from(errorMessage));
    mockProc.emit('close', 1); // Failure
  }, 10);
  return mockProc;
}
```

---

## Environment Variables Required for Tests

### Unit Tests:
```bash
# Set in test setup
GITHUB_TOKEN=test_token_123
GITHUB_REPO_URL=https://github.com/test-user/test-repo.git
ENCRYPTION_SECRET=test_encryption_secret_32_chars_long
```

### E2E Tests:
```bash
# Real values needed for E2E (or mocked at network level)
GITHUB_TOKEN=<real-or-mocked-token>
GITHUB_REPO_URL=https://github.com/user/blogflow.git
ENCRYPTION_SECRET=<real-encryption-key>
```

---

## Test Execution Commands

```bash
# Unit tests (fast, no I/O)
pnpm test lib/integrations/build-providers/vercel-build-provider.test.ts

# Integration tests (with mocked external commands)
pnpm test lib/integrations/build-providers/vercel-integration.test.ts

# oRPC router tests
pnpm test lib/api/routers/webflow-router.test.ts

# E2E tests (full browser workflow)
pnpm test:e2e e2e/webflow-export.spec.ts

# All tests with coverage
pnpm test:coverage

# Watch mode during development
pnpm test --watch
```

---

## Coverage Requirements

| Test Type      | Coverage Goal | Focus Area                    |
|----------------|--------------|-------------------------------|
| Unit           | >90%         | Function-level logic          |
| Integration    | >80%         | Component coordination        |
| E2E            | 100%         | Critical user paths           |

---

## Success Criteria

### Before marking feature complete:
- [ ] All unit tests pass (>90% coverage)
- [ ] All integration tests pass (>80% coverage)
- [ ] All E2E tests pass (100% critical paths)
- [ ] No secrets exposed in logs
- [ ] Cleanup happens on success AND failure
- [ ] Error messages are user-friendly
- [ ] Deployment URL is correctly extracted
- [ ] Export completes within 90 seconds

---

## Common Pitfalls to Avoid

### ❌ DON'T:
1. Use real git clone in unit tests (too slow)
2. Mock coordination logic (defeats the purpose)
3. Expose tokens in logs or error messages
4. Skip cleanup testing (memory leaks)
5. Assume command always succeeds
6. Test implementation details (test behavior)

### ✅ DO:
1. Mock all I/O in unit tests
2. Test cleanup in finally block
3. Test all error scenarios
4. Verify logs are collected correctly
5. Test timestamp formatting
6. Test URL extraction edge cases
7. Use deterministic test data

---

## Next Steps

1. **Write Unit Tests** - Start with `vercel-build-provider.test.ts`
2. **Write Integration Tests** - Test coordination in `vercel-integration.test.ts`
3. **Write oRPC Tests** - Test router in `webflow-router.test.ts`
4. **Write E2E Tests** - Test full workflow in `webflow-export.spec.ts`
5. **Run Tests** - Verify all pass
6. **Measure Coverage** - Ensure goals met
7. **Document Findings** - Update test strategy if needed

---

## Quick Test Template

```typescript
// Unit Test Template
describe('VercelBuildProvider.functionName', () => {
  let provider: VercelBuildProvider;

  beforeEach(() => {
    vi.clearAllMocks();
    provider = new VercelBuildProvider();

    // Setup mocks
    process.env.GITHUB_TOKEN = 'test_token';
    process.env.GITHUB_REPO_URL = 'https://github.com/user/repo.git';
  });

  it('should [expected behavior] when [condition]', async () => {
    // Arrange
    const mockProc = createMockSuccessProcess(['output']);
    vi.mocked(spawn).mockReturnValue(mockProc as any);

    // Act
    const result = await provider.functionName();

    // Assert
    expect(result).toEqual(expectedValue);
  });

  it('should throw error when [error condition]', async () => {
    // Arrange
    delete process.env.GITHUB_TOKEN;

    // Act & Assert
    await expect(provider.functionName()).rejects.toThrow(BuildProviderError);
  });
});
```

---

## Questions for Clarification

Before implementing tests, confirm:
1. Should we test with real /tmp filesystem or mock it?
2. What's the maximum acceptable export time (90 seconds?)?
3. Should concurrent exports be queued or rejected?
4. What error codes should Webflow CLI return?
5. Should we test git clone with real GitHub or mock network?

---

## Resources

- **Full Test Strategy:** `docs/testing/webflow-export-test-strategy.md`
- **Testing Guide:** `TESTING.md`
- **Project Instructions:** `CLAUDE.md`
- **Vitest Docs:** https://vitest.dev/
- **Playwright Docs:** https://playwright.dev/

---

**Test Plan Created By:** Claude Code (Test Architect Agent)
**Date:** 2025-11-02
**Status:** Ready for Implementation
