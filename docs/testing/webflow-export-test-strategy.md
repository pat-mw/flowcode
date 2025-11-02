# Webflow Component Export System - Comprehensive Test Strategy

## Overview

This document outlines the complete testing strategy for the Webflow Component Export System using a git clone approach. The system clones the GitHub repository, copies node_modules, runs webpack compilation, and deploys components via Webflow CLI.

## Architecture Summary

### Key Components
1. **VercelBuildProvider** (`lib/integrations/build-providers/vercel.ts`)
   - Orchestrates the entire export workflow
   - Clones repository from GitHub
   - Copies node_modules from Vercel Function
   - Runs webpack compilation
   - Executes Webflow CLI deployment
   - Extracts deployment URL from logs
   - Handles cleanup

2. **WebflowRouter** (`lib/api/routers/webflow.ts`)
   - oRPC router handling export requests
   - Token management (save, get, revoke)
   - Component discovery
   - Export orchestration

3. **ManualTokenProvider** (`lib/integrations/webflow/auth/manual-token.ts`)
   - Encrypted token storage
   - Token retrieval and validation

4. **Frontend UI** (`app/integrations/webflow/page.tsx`)
   - Token input and management
   - Export button and status display
   - Build logs streaming
   - Deployment URL display

---

## Test File Structure

```
blogflow/
├── lib/integrations/build-providers/
│   └── __tests__/
│       ├── vercel-build-provider.test.ts       # Unit tests
│       └── vercel-integration.test.ts          # Integration tests
├── lib/api/routers/
│   └── __tests__/
│       └── webflow-router.test.ts              # oRPC router tests
└── e2e/
    └── webflow-export.spec.ts                   # E2E user workflow tests
```

---

## 1. Unit Tests

### File: `lib/integrations/build-providers/__tests__/vercel-build-provider.test.ts`

#### Test Coverage

##### `VercelBuildProvider.cloneRepository()`

**Purpose:** Test git clone authentication and execution

**Test Cases:**
1. ✅ Should clone repository successfully with valid token
2. ✅ Should authenticate using token in URL (https://token@github.com)
3. ✅ Should use --depth=1 for shallow clone (performance)
4. ✅ Should use --single-branch to clone only main branch
5. ✅ Should throw BuildProviderError if GITHUB_TOKEN is missing
6. ✅ Should throw BuildProviderError if GITHUB_REPO_URL is missing
7. ✅ Should hide token in logs (security)
8. ✅ Should handle git command failures gracefully
9. ✅ Should handle network errors during clone
10. ✅ Should handle authentication failures (invalid token)
11. ✅ Should handle repository not found errors
12. ✅ Should return logs array with clone progress

**Mocking Strategy:**
```typescript
// Mock spawn to simulate git clone
vi.mock('child_process', () => ({
  spawn: vi.fn((command, args, options) => {
    const mockProc = new EventEmitter();

    // Simulate stdout/stderr
    setTimeout(() => {
      mockProc.emit('stdout', 'Cloning into...');
      mockProc.emit('close', 0); // Success
    }, 10);

    return mockProc;
  })
}));

// Mock environment variables
beforeEach(() => {
  process.env.GITHUB_TOKEN = 'ghp_test_token_123';
  process.env.GITHUB_REPO_URL = 'https://github.com/user/repo.git';
});
```

---

##### `VercelBuildProvider.copyNodeModules()`

**Purpose:** Test node_modules copying from function to cloned repo

**Test Cases:**
1. ✅ Should copy node_modules using cp -r command
2. ✅ Should use correct source path (process.cwd()/node_modules)
3. ✅ Should use correct target path (repoDir/node_modules)
4. ✅ Should throw BuildProviderError if cp command fails
5. ✅ Should handle permission errors gracefully
6. ✅ Should handle disk space errors
7. ✅ Should return logs array with copy progress

**Mocking Strategy:**
```typescript
// Mock spawn to simulate cp command
vi.mock('child_process', () => ({
  spawn: vi.fn((command, args, options) => {
    if (command === 'cp') {
      const mockProc = new EventEmitter();
      setTimeout(() => {
        mockProc.emit('stdout', 'Copying node_modules...');
        mockProc.emit('close', 0);
      }, 10);
      return mockProc;
    }
  })
}));
```

---

##### `VercelBuildProvider.runCommand()`

**Purpose:** Test generic shell command execution

**Test Cases:**
1. ✅ Should execute command with correct args
2. ✅ Should use correct working directory (cwd)
3. ✅ Should collect stdout logs
4. ✅ Should collect stderr logs
5. ✅ Should resolve with logs on exit code 0
6. ✅ Should reject with BuildProviderError on non-zero exit code
7. ✅ Should handle spawn errors (command not found)
8. ✅ Should trim empty lines from logs
9. ✅ Should prefix logs with [stdout] and [stderr]
10. ✅ Should pass environment variables to child process

**Mocking Strategy:**
```typescript
// Test successful command
it('should execute command successfully', async () => {
  const mockProc = new EventEmitter();
  vi.mocked(spawn).mockReturnValue(mockProc as any);

  const promise = provider.runCommand('echo', ['test'], '/tmp');

  setTimeout(() => {
    mockProc.emit('data', Buffer.from('test output'));
    mockProc.emit('close', 0);
  }, 10);

  const logs = await promise;
  expect(logs).toContain('[stdout] test output');
});

// Test failed command
it('should handle command failure', async () => {
  const mockProc = new EventEmitter();
  vi.mocked(spawn).mockReturnValue(mockProc as any);

  const promise = provider.runCommand('false', [], '/tmp');

  setTimeout(() => {
    mockProc.emit('close', 1);
  }, 10);

  await expect(promise).rejects.toThrow(BuildProviderError);
});
```

---

##### `VercelBuildProvider.extractDeploymentUrl()`

**Purpose:** Test deployment URL extraction from CLI logs

**Test Cases:**
1. ✅ Should extract https URL from logs
2. ✅ Should extract http URL from logs
3. ✅ Should return first URL found in logs
4. ✅ Should return default URL if no URL found
5. ✅ Should handle empty logs array
6. ✅ Should ignore malformed URLs
7. ✅ Should extract URL from multi-line log entries

**Mocking Strategy:**
```typescript
// No mocking needed - pure function
it('should extract URL from logs', () => {
  const logs = [
    '[stdout] Deploying components...',
    '[stdout] ✅ Deployed successfully: https://webflow.com/library/abc123',
    '[stdout] Done',
  ];

  const url = provider.extractDeploymentUrl(logs);
  expect(url).toBe('https://webflow.com/library/abc123');
});
```

---

##### `VercelBuildProvider.buildComponents()`

**Purpose:** Test full export workflow orchestration

**Test Cases:**
1. ✅ Should execute all steps in correct order
   - Clone repository
   - Copy node_modules
   - Run webpack
   - Run Webflow CLI
   - Extract URL
   - Cleanup
2. ✅ Should generate unique job ID
3. ✅ Should use /tmp directory
4. ✅ Should collect logs from all steps
5. ✅ Should add timestamps to logs
6. ✅ Should return BuildResult on success
7. ✅ Should return artifacts array
8. ✅ Should handle clone failure gracefully
9. ✅ Should handle copy failure gracefully
10. ✅ Should handle webpack compilation failure
11. ✅ Should handle Webflow CLI failure
12. ✅ Should cleanup even on failure (finally block)
13. ✅ Should not throw if cleanup fails
14. ✅ Should include cleanup warnings in logs

**Mocking Strategy:**
```typescript
describe('buildComponents', () => {
  let mockSpawn: any;

  beforeEach(() => {
    mockSpawn = vi.fn((command, args, options) => {
      const mockProc = new EventEmitter();

      // Mock different commands
      setTimeout(() => {
        if (command === 'git') {
          mockProc.emit('stdout', 'Cloned successfully');
          mockProc.emit('close', 0);
        } else if (command === 'cp') {
          mockProc.emit('stdout', 'Copied node_modules');
          mockProc.emit('close', 0);
        } else if (command === 'npx' && args[0] === 'webpack') {
          mockProc.emit('stdout', 'Build completed');
          mockProc.emit('close', 0);
        } else if (command === 'npx' && args[0] === 'webflow') {
          mockProc.emit('stdout', 'Deployed: https://webflow.com/abc');
          mockProc.emit('close', 0);
        }
      }, 10);

      return mockProc;
    });

    vi.mocked(spawn).mockImplementation(mockSpawn);
  });

  it('should complete full export successfully', async () => {
    const result = await provider.buildComponents({
      webflowToken: 'wf_test_token',
      outputDir: '/tmp',
    });

    expect(result.success).toBe(true);
    expect(result.logs).toContain(expect.stringContaining('Cloning repository'));
    expect(result.logs).toContain(expect.stringContaining('Copying node_modules'));
    expect(result.logs).toContain(expect.stringContaining('Running webpack'));
    expect(result.logs).toContain(expect.stringContaining('Deploying to Webflow'));
    expect(result.deploymentUrl).toBe('https://webflow.com/abc');
  });
});
```

---

### File: `lib/api/routers/__tests__/webflow-router.test.ts`

#### Test Coverage

##### `webflowRouter.exportComponents`

**Purpose:** Test oRPC procedure for component export

**Test Cases:**
1. ✅ Should require authentication (protectedProcedure)
2. ✅ Should retrieve Webflow token from provider
3. ✅ Should throw error if token not found
4. ✅ Should call buildProvider.buildComponents with correct config
5. ✅ Should pass webflowToken to build provider
6. ✅ Should return BuildResult from provider
7. ✅ Should handle build failures gracefully
8. ✅ Should not expose encrypted token in response

**Mocking Strategy:**
```typescript
// Mock auth provider
vi.mock('@/lib/integrations/webflow/auth/manual-token', () => ({
  ManualTokenProvider: vi.fn().mockImplementation(() => ({
    getToken: vi.fn().mockResolvedValue('wf_mock_token_123'),
  })),
}));

// Mock build provider
vi.mock('@/lib/integrations/build-providers/vercel', () => ({
  VercelBuildProvider: vi.fn().mockImplementation(() => ({
    buildComponents: vi.fn().mockResolvedValue({
      success: true,
      logs: ['Build completed'],
      deploymentUrl: 'https://webflow.com/abc',
    }),
  })),
}));

it('should export components successfully', async () => {
  const result = await webflowRouter.exportComponents({
    context: { userId: 'user_123' },
    input: {},
  });

  expect(result.success).toBe(true);
  expect(result.deploymentUrl).toBeTruthy();
});
```

---

## 2. Integration Tests

### File: `lib/integrations/build-providers/__tests__/vercel-integration.test.ts`

#### Test Coverage

**Purpose:** Test interactions between multiple components with partial mocking

**Test Cases:**
1. ✅ Should authenticate and export workflow end-to-end
2. ✅ Should handle token retrieval → build → cleanup
3. ✅ Should verify token encryption/decryption
4. ✅ Should test with real filesystem operations (in /tmp)
5. ✅ Should verify cleanup happens on success
6. ✅ Should verify cleanup happens on failure
7. ✅ Should test log collection across multiple steps
8. ✅ Should test error propagation from git → router
9. ✅ Should test error propagation from webpack → router
10. ✅ Should verify environment variables are read correctly

**Mocking Strategy:**
```typescript
// Mock only external commands (git, webpack, CLI)
// Test real coordination between router, provider, auth
describe('Webflow Export Integration', () => {
  beforeEach(async () => {
    // Setup real database with test schema
    await setupTestDb();

    // Mock git/webpack/CLI but use real coordination logic
    vi.mock('child_process');
  });

  it('should handle full export workflow', async () => {
    // Save token (real encryption)
    const authProvider = new ManualTokenProvider();
    await authProvider.saveToken('user_123', 'wf_real_token');

    // Mock git clone success
    mockSpawn.mockImplementation((command) => {
      if (command === 'git') return mockSuccessProcess();
      if (command === 'cp') return mockSuccessProcess();
      if (command === 'npx') return mockSuccessProcess();
    });

    // Call router (real coordination)
    const result = await webflowRouter.exportComponents({
      context: { userId: 'user_123' },
      input: {},
    });

    // Verify full workflow
    expect(result.success).toBe(true);
    expect(mockSpawn).toHaveBeenCalledWith('git', expect.any(Array), expect.any(Object));
    expect(mockSpawn).toHaveBeenCalledWith('cp', expect.any(Array), expect.any(Object));
    expect(mockSpawn).toHaveBeenCalledWith('npx', expect.arrayContaining(['webpack']), expect.any(Object));
  });
});
```

---

## 3. E2E Tests

### File: `e2e/webflow-export.spec.ts`

#### Test Coverage

**Purpose:** Test complete user workflows in real browser

**Test Cases:**

##### Token Management
1. ✅ Should display token input form when not connected
2. ✅ Should validate token format (minimum length)
3. ✅ Should show validation error for invalid token
4. ✅ Should save token and show success message
5. ✅ Should display "Connected" status after saving token
6. ✅ Should allow revoking token
7. ✅ Should hide token input after connection
8. ✅ Should mask token value in input field (type="password")

##### Export Workflow
1. ✅ Should display "Export to Webflow" button when connected
2. ✅ Should disable export button while exporting
3. ✅ Should show loading spinner during export
4. ✅ Should stream build logs in real-time
5. ✅ Should display each log line with timestamp
6. ✅ Should show success alert on completion
7. ✅ Should display deployment URL link
8. ✅ Should make deployment URL clickable (opens in new tab)
9. ✅ Should handle export failure gracefully
10. ✅ Should display error message on failure
11. ✅ Should allow retry after failure
12. ✅ Should scroll logs automatically as they appear

##### Environment Variables Error Handling
1. ✅ Should show error if GITHUB_TOKEN is missing
2. ✅ Should show error if GITHUB_REPO_URL is missing
3. ✅ Should display helpful error messages with instructions

##### Build Logs Visibility
1. ✅ Should show "Cloning repository..." log
2. ✅ Should show "Copying node_modules..." log
3. ✅ Should show "Running webpack..." log
4. ✅ Should show "Deploying to Webflow..." log
5. ✅ Should show "Export completed successfully" log
6. ✅ Should show cleanup log even on error

##### Responsive Design
1. ✅ Should work on mobile viewport (375px)
2. ✅ Should work on tablet viewport (768px)
3. ✅ Should work on desktop viewport (1920px)

##### Accessibility
1. ✅ Should have proper ARIA labels
2. ✅ Should support keyboard navigation
3. ✅ Should have sufficient color contrast
4. ✅ Should announce status changes to screen readers

**Test Implementation:**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Webflow Export E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Login as test user
    await page.goto('/login');
    await page.fill('[name="email"]', 'papa@john.com');
    await page.fill('[name="password"]', '88888888');
    await page.click('[type="submit"]');

    // Navigate to Webflow integration page
    await page.goto('/integrations/webflow');
  });

  test('should complete full export workflow', async ({ page }) => {
    // Step 1: Save token
    const tokenInput = page.locator('input[type="password"]');
    await expect(tokenInput).toBeVisible();

    await tokenInput.fill('wf_test_workspace_token_valid_123');
    await page.click('button:has-text("Save Token")');

    await expect(page.locator('text=Connected')).toBeVisible();

    // Step 2: Click export
    const exportButton = page.locator('button:has-text("Export All Components")');
    await expect(exportButton).toBeVisible();
    await expect(exportButton).toBeEnabled();

    await exportButton.click();

    // Step 3: Verify loading state
    await expect(exportButton).toBeDisabled();
    await expect(page.locator('text=Exporting...')).toBeVisible();

    // Step 4: Wait for logs to appear
    const logsContainer = page.locator('[data-testid="build-logs"]');
    await expect(logsContainer).toBeVisible();

    // Verify log content
    await expect(logsContainer).toContainText('Cloning repository');
    await expect(logsContainer).toContainText('Copying node_modules');
    await expect(logsContainer).toContainText('Running webpack');
    await expect(logsContainer).toContainText('Deploying to Webflow');

    // Step 5: Wait for success
    await expect(page.locator('[role="alert"]:has-text("Success")')).toBeVisible({
      timeout: 60000, // Allow up to 60 seconds for full build
    });

    // Step 6: Verify deployment URL
    const deploymentLink = page.locator('[data-testid="deployment-url"]');
    await expect(deploymentLink).toBeVisible();
    await expect(deploymentLink).toHaveAttribute('href', /webflow\.com/);
  });

  test('should handle missing environment variables', async ({ page }) => {
    // Mock missing env vars by intercepting API call
    await page.route('**/api/webflow/export', (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({
          success: false,
          error: 'GITHUB_TOKEN environment variable is not set',
        }),
      });
    });

    // Save token and attempt export
    await page.fill('input[type="password"]', 'wf_test_token');
    await page.click('button:has-text("Save Token")');
    await page.click('button:has-text("Export All Components")');

    // Should show error
    await expect(page.locator('[role="alert"]')).toContainText('GITHUB_TOKEN');
  });
});
```

---

## 4. Mocking Strategies

### What to Mock vs What to Run

#### ALWAYS Mock:
1. ✅ `child_process.spawn` - Git, cp, webpack, Webflow CLI
2. ✅ External network calls (GitHub API, Webflow API)
3. ✅ Filesystem operations (except in /tmp for integration tests)
4. ✅ Time-dependent functions (nanoid for deterministic IDs)
5. ✅ Environment variables (control test environment)

#### NEVER Mock (Run Real Code):
1. ✅ VercelBuildProvider coordination logic
2. ✅ WebflowRouter procedure logic
3. ✅ ManualTokenProvider encryption/decryption
4. ✅ Log collection and formatting
5. ✅ Error handling and BuildProviderError creation
6. ✅ URL extraction regex logic

#### Mock Strategy by Test Type:

**Unit Tests:**
```typescript
// Mock all I/O, test single function
vi.mock('child_process');
vi.mock('fs/promises');

// Test pure logic
it('should extract URL', () => {
  const result = extractDeploymentUrl(['https://webflow.com/abc']);
  expect(result).toBe('https://webflow.com/abc');
});
```

**Integration Tests:**
```typescript
// Mock external commands, run real coordination
vi.mock('child_process', () => ({
  spawn: mockSpawnFactory(), // Controlled mock
}));

// Use real database with test schema
beforeEach(async () => {
  await resetTestDatabase();
});

// Test real workflow
it('should coordinate all steps', async () => {
  const result = await provider.buildComponents(config);
  expect(mockSpawn).toHaveBeenCalledTimes(4); // git, cp, webpack, cli
});
```

**E2E Tests:**
```typescript
// Mock only external services not under test
await page.route('**/github.com/**', (route) => route.abort());

// Use real application
await page.goto('http://localhost:3000/integrations/webflow');

// Test real user interactions
await page.click('button:has-text("Export")');
```

---

## 5. Test Data Management

### Test Tokens
```typescript
// Valid test tokens
export const VALID_WEBFLOW_TOKEN = 'wf_test_workspace_token_valid_abc123def456';
export const VALID_GITHUB_TOKEN = 'ghp_test_github_token_valid_xyz789';

// Invalid test tokens
export const INVALID_TOKEN_EMPTY = '';
export const INVALID_TOKEN_SHORT = 'wf_123';
export const INVALID_TOKEN_WRONG_FORMAT = 'not-a-token';
```

### Mock Repository Data
```typescript
export const MOCK_GITHUB_REPO_URL = 'https://github.com/test-user/test-repo.git';
export const MOCK_CLONE_DIR = '/tmp/webflow-export-test-123';
```

### Mock Build Logs
```typescript
export const MOCK_GIT_LOGS = [
  '[stdout] Cloning into /tmp/webflow-export-123...',
  '[stdout] remote: Enumerating objects: 100, done.',
  '[stdout] Receiving objects: 100% (100/100), done.',
];

export const MOCK_WEBPACK_LOGS = [
  '[stdout] asset Client.js 145 KiB [emitted]',
  '[stdout] webpack 5.90.0 compiled successfully in 2134 ms',
];

export const MOCK_WEBFLOW_CLI_LOGS = [
  '[stdout] ✨  Preparing component upload...',
  '[stdout] ✅  Components deployed successfully',
  '[stdout] 🔗  https://webflow.com/workspace/library/components',
];
```

---

## 6. Coverage Goals

### Code Coverage Targets:
- **Unit Tests:** >90% line coverage
- **Integration Tests:** >80% workflow coverage
- **E2E Tests:** 100% critical user paths

### Critical Paths (Must Have E2E Tests):
1. ✅ Save token → Export → View logs → Success
2. ✅ Save token → Export → Git clone fails → Error shown
3. ✅ Save token → Export → Webpack fails → Error shown
4. ✅ Save token → Export → CLI fails → Error shown
5. ✅ Missing GITHUB_TOKEN → Error shown
6. ✅ Missing GITHUB_REPO_URL → Error shown

---

## 7. Test Execution Plan

### Local Development:
```bash
# Run unit tests in watch mode
pnpm test lib/integrations/build-providers

# Run integration tests
pnpm test:run __tests__/integration

# Run E2E tests
pnpm test:e2e webflow-export.spec.ts

# Run all tests with coverage
pnpm test:coverage
```

### CI/CD Pipeline:
```yaml
# GitHub Actions
- name: Unit Tests
  run: pnpm test:run

- name: Integration Tests
  run: pnpm test:run __tests__/integration

- name: E2E Tests
  run: pnpm test:e2e --project chromium

- name: Coverage Report
  run: pnpm test:coverage

- name: Upload Coverage
  uses: codecov/codecov-action@v3
```

---

## 8. Error Scenarios to Test

### Git Clone Failures:
1. ✅ Invalid GitHub token (401 authentication error)
2. ✅ Repository not found (404 error)
3. ✅ Network timeout
4. ✅ Disk space exhausted
5. ✅ Permission denied (/tmp not writable)

### Webpack Compilation Failures:
1. ✅ Syntax error in component
2. ✅ Missing dependency in package.json
3. ✅ Webpack config error
4. ✅ Out of memory error

### Webflow CLI Failures:
1. ✅ Invalid workspace token
2. ✅ Token expired
3. ✅ Rate limit exceeded
4. ✅ Network timeout
5. ✅ Manifest validation error

### Environment Variable Errors:
1. ✅ GITHUB_TOKEN not set
2. ✅ GITHUB_REPO_URL not set
3. ✅ ENCRYPTION_SECRET not set (for token storage)

---

## 9. Performance Testing

### Benchmarks:
- Git clone: < 10 seconds (shallow clone)
- Node modules copy: < 15 seconds
- Webpack compilation: < 30 seconds
- Webflow CLI deployment: < 20 seconds
- **Total workflow: < 90 seconds**

### Test Cases:
1. ✅ Should complete export within 90 seconds
2. ✅ Should cleanup /tmp within 5 seconds
3. ✅ Should not exceed 512MB memory usage
4. ✅ Should handle concurrent exports (queue system)

---

## 10. Security Testing

### Test Cases:
1. ✅ Should not expose GITHUB_TOKEN in logs
2. ✅ Should not expose Webflow token in logs
3. ✅ Should encrypt tokens before database storage
4. ✅ Should not expose encrypted tokens in API responses
5. ✅ Should validate user owns token before export
6. ✅ Should sanitize git URLs in error messages
7. ✅ Should prevent directory traversal in clone path

---

## 11. Test Utilities

### Mock Process Factory:
```typescript
export function createMockProcess(exitCode: number, outputs: string[]) {
  const mockProc = new EventEmitter();

  setTimeout(() => {
    outputs.forEach(output => {
      mockProc.emit('data', Buffer.from(output));
    });
    mockProc.emit('close', exitCode);
  }, 10);

  return mockProc;
}
```

### Test Database Setup:
```typescript
export async function setupTestDb() {
  // Create in-memory SQLite database
  const db = createTestDb();
  await runMigrations(db);
  return db;
}

export async function seedWebflowToken(userId: string, token: string) {
  const provider = new ManualTokenProvider();
  await provider.saveToken(userId, token);
}
```

---

## 12. Continuous Testing Strategy

### Pre-Commit:
- Run unit tests for changed files
- Run lint checks
- Verify no secrets in code

### Pre-Push:
- Run all unit tests
- Run integration tests
- Verify coverage meets minimums

### Pull Request:
- Run full test suite
- Run E2E tests
- Generate coverage report
- Run security scans

### Deployment:
- Run smoke tests on staging
- Verify environment variables set
- Test OAuth flows
- Monitor error rates

---

## Summary

This comprehensive test strategy ensures:
1. **Reliability:** All critical paths covered by E2E tests
2. **Maintainability:** Unit tests for all functions
3. **Confidence:** Integration tests verify coordination
4. **Performance:** Benchmarks ensure fast exports
5. **Security:** Token handling verified at all layers

**Next Steps:**
1. Implement unit tests for VercelBuildProvider
2. Implement oRPC router tests
3. Implement integration tests
4. Implement E2E tests
5. Setup CI/CD pipeline
6. Monitor test coverage
7. Add performance benchmarks
