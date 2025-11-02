# Webflow Export Test Architecture

## System Architecture with Test Points

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER BROWSER (E2E Tests)                     │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Webflow Integration Page (/integrations/webflow)           │   │
│  │  ─────────────────────────────────────────────────────────  │   │
│  │  [Token Input] → [Save Token]                                │   │
│  │                                                               │   │
│  │  ✅ Connected                                                 │   │
│  │  [Export All Components to Webflow]  ← E2E Test: Click      │   │
│  │                                                               │   │
│  │  Build Logs:                          ← E2E Test: Verify     │   │
│  │  [2025-11-02T10:00:00] Cloning...                           │   │
│  │  [2025-11-02T10:00:05] Copying...                           │   │
│  │  [2025-11-02T10:00:20] Building...                          │   │
│  │  [2025-11-02T10:00:50] Deploying...                         │   │
│  │                                                               │   │
│  │  ✅ Success! [View in Webflow]       ← E2E Test: Click URL  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│         │                                                             │
│         │ React Query Mutation                                       │
│         ▼                                                             │
└─────────────────────────────────────────────────────────────────────┘
         │
         │ POST /api/orpc/webflow.exportComponents
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    oRPC ROUTER (Integration Tests)                   │
│                                                                       │
│  webflowRouter.exportComponents                                      │
│  ├─ protectedProcedure (auth check)    ← Test: Requires auth        │
│  ├─ input: z.object({})                ← Test: No input needed      │
│  └─ handler:                                                         │
│      1. Get userId from context        ← Test: Context has userId    │
│      2. authProvider.getToken(userId)  ← Test: Token decrypted      │
│      3. buildProvider.buildComponents  ← Test: Called with config   │
│      4. Return BuildResult             ← Test: Logs + URL returned  │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
         │
         │ getToken(userId)
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│              MANUAL TOKEN PROVIDER (Unit Tests)                      │
│                                                                       │
│  ManualTokenProvider.getToken()                                      │
│  ├─ Query database for integration     ← Test: Finds by userId      │
│  ├─ Check encryption fields exist      ← Test: Validates fields     │
│  ├─ decrypt(token, iv, authTag)        ← Test: Decrypts correctly   │
│  └─ Return plaintext token             ← Test: Returns valid token  │
│                                                                       │
│  Test Cases:                                                         │
│  ✅ Token found and decrypted                                        │
│  ✅ Token not found → AuthProviderError                              │
│  ✅ Missing IV/authTag → AuthProviderError                           │
│  ✅ Decryption fails → AuthProviderError                             │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
         │
         │ Returns: "wf_workspace_token_abc123"
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│           VERCEL BUILD PROVIDER (Unit + Integration Tests)           │
│                                                                       │
│  buildComponents(config)                                             │
│  ├─ Generate job ID (nanoid)          ← Test: Unique ID generated   │
│  ├─ Set repoDir = /tmp/webflow-export-{jobId}                       │
│  └─ try {                                                            │
│      │                                                                │
│      ├─ Step 1: cloneRepository()      ← Test: Git clone            │
│      │   ├─ Check GITHUB_TOKEN         ← Test: Missing → Error      │
│      │   ├─ Check GITHUB_REPO_URL      ← Test: Missing → Error      │
│      │   ├─ Insert token in URL        ← Test: Auth format correct  │
│      │   ├─ runCommand('git', [        ← Test: Correct args         │
│      │   │     'clone',                                              │
│      │   │     '--depth=1',            ← Test: Shallow clone        │
│      │   │     '--single-branch',                                    │
│      │   │     authenticatedUrl,                                     │
│      │   │     targetDir                                             │
│      │   │   ])                                                      │
│      │   └─ Collect logs               ← Test: Logs collected       │
│      │                                                                │
│      ├─ Step 2: copyNodeModules()      ← Test: Node modules copied  │
│      │   ├─ Source: process.cwd()/node_modules                      │
│      │   ├─ Target: repoDir/node_modules                            │
│      │   └─ runCommand('cp', ['-r', src, dest])                     │
│      │                                                                │
│      ├─ Step 3: Run Webpack            ← Test: Webpack compiles     │
│      │   └─ runCommand('npx', [                                      │
│      │         'webpack',                                            │
│      │         '--config',                                           │
│      │         'webpack.webflow.js'                                  │
│      │       ], repoDir)                                             │
│      │                                                                │
│      ├─ Step 4: Deploy to Webflow      ← Test: CLI deploys          │
│      │   └─ runCommand('npx', [                                      │
│      │         'webflow',                                            │
│      │         'library',                                            │
│      │         'share',                                              │
│      │         '--api-token',                                        │
│      │         webflowToken,           ← Test: Token passed         │
│      │         '--no-input'                                          │
│      │       ], repoDir)                                             │
│      │                                                                │
│      ├─ Step 5: Extract URL            ← Test: URL extraction       │
│      │   └─ extractDeploymentUrl(logs)                              │
│      │       └─ Regex: /https?:\/\/[^\s]+/                          │
│      │                                                                │
│      └─ Return BuildResult {           ← Test: Result structure     │
│            success: true,                                            │
│            logs: [...],                ← Test: All logs included    │
│            deploymentUrl: "...",       ← Test: URL present          │
│            artifacts: [...]            ← Test: Artifacts listed     │
│          }                                                           │
│    }                                                                 │
│    catch (error) {                     ← Test: Error handling       │
│      └─ Return BuildResult {                                         │
│            success: false,                                           │
│            logs: [...],                ← Test: Error logs included   │
│            error: error.message        ← Test: Error message set    │
│          }                                                           │
│    }                                                                 │
│    finally {                           ← Test: Cleanup always runs  │
│      └─ rm(repoDir, { recursive, force })                           │
│    }                                                                 │
│                                                                       │
│  Test Categories:                                                    │
│  ────────────────                                                    │
│  1. Unit Tests (Mock all I/O):                                       │
│     ✅ cloneRepository() success                                     │
│     ✅ cloneRepository() missing env vars                            │
│     ✅ cloneRepository() git fails                                   │
│     ✅ copyNodeModules() success                                     │
│     ✅ copyNodeModules() permission error                            │
│     ✅ runCommand() success                                          │
│     ✅ runCommand() exit code 1                                      │
│     ✅ runCommand() spawn error                                      │
│     ✅ extractDeploymentUrl() finds URL                              │
│     ✅ extractDeploymentUrl() no URL found                           │
│     ✅ buildComponents() full success                                │
│     ✅ buildComponents() git failure                                 │
│     ✅ buildComponents() webpack failure                             │
│     ✅ buildComponents() cleanup on error                            │
│                                                                       │
│  2. Integration Tests (Mock only external commands):                │
│     ✅ Full workflow coordination                                    │
│     ✅ Token retrieval → build → cleanup                             │
│     ✅ Error propagation through layers                              │
│     ✅ Log collection across steps                                   │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
         │
         │ spawn() calls (mocked in tests)
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  EXTERNAL COMMANDS (Mocked)                          │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ git clone --depth=1 --single-branch                          │  │
│  │   https://TOKEN@github.com/user/repo.git /tmp/export-abc    │  │
│  │                                                               │  │
│  │ Mock Output:                                                  │  │
│  │ [stdout] Cloning into /tmp/export-abc...                     │  │
│  │ [stdout] remote: Enumerating objects: 100, done.             │  │
│  │ [exit] 0                              ← Test: Exit code      │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ cp -r /var/task/node_modules /tmp/export-abc/node_modules    │  │
│  │                                                               │  │
│  │ Mock Output:                                                  │  │
│  │ [stdout] Copied successfully                                 │  │
│  │ [exit] 0                              ← Test: Exit code      │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ npx webpack --config webpack.webflow.js                      │  │
│  │                                                               │  │
│  │ Mock Output:                                                  │  │
│  │ [stdout] asset Client.js 145 KiB [emitted]                   │  │
│  │ [stdout] webpack 5.90.0 compiled successfully                │  │
│  │ [exit] 0                              ← Test: Exit code      │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ npx webflow library share --api-token wf_... --no-input      │  │
│  │                                                               │  │
│  │ Mock Output:                                                  │  │
│  │ [stdout] ✨ Preparing component upload...                     │  │
│  │ [stdout] ✅ Components deployed successfully                  │  │
│  │ [stdout] 🔗 https://webflow.com/workspace/library/components │  │
│  │ [exit] 0                              ← Test: Exit code      │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Test Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                          TEST INPUTS                                 │
└─────────────────────────────────────────────────────────────────────┘
         │
         ├─ Environment Variables:
         │  ├─ GITHUB_TOKEN = "ghp_test_token_123"
         │  ├─ GITHUB_REPO_URL = "https://github.com/user/repo.git"
         │  └─ ENCRYPTION_SECRET = "test_secret_32_chars_long_xxx"
         │
         ├─ User Input:
         │  └─ webflowToken = "wf_test_workspace_token_valid_abc123"
         │
         └─ Mock Process Outputs:
            ├─ Git clone → Exit 0, logs: ["Cloning...", "Done"]
            ├─ Node modules copy → Exit 0, logs: ["Copied"]
            ├─ Webpack → Exit 0, logs: ["Compiled successfully"]
            └─ Webflow CLI → Exit 0, logs: ["Deployed: https://..."]
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      SYSTEM UNDER TEST                               │
│                                                                       │
│  Input: { webflowToken, outputDir }                                  │
│    ↓                                                                  │
│  Process:                                                             │
│    1. Validate env vars ✓                                            │
│    2. Clone repo ✓                                                   │
│    3. Copy node_modules ✓                                            │
│    4. Compile webpack ✓                                              │
│    5. Deploy CLI ✓                                                   │
│    6. Extract URL ✓                                                  │
│    7. Cleanup /tmp ✓                                                 │
│    ↓                                                                  │
│  Output: BuildResult                                                 │
└─────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       TEST ASSERTIONS                                │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ Unit Test Assertions:                                                │
│                                                                       │
│ ✅ expect(spawn).toHaveBeenCalledWith('git', [...], {...})          │
│ ✅ expect(spawn).toHaveBeenCalledWith('cp', [...], {...})           │
│ ✅ expect(spawn).toHaveBeenCalledWith('npx', ['webpack'], {...})    │
│ ✅ expect(spawn).toHaveBeenCalledWith('npx', ['webflow'], {...})    │
│ ✅ expect(result.success).toBe(true)                                 │
│ ✅ expect(result.logs).toContain('Cloning repository')               │
│ ✅ expect(result.logs).toContain('Copying node_modules')             │
│ ✅ expect(result.logs).toContain('Running webpack')                  │
│ ✅ expect(result.logs).toContain('Deploying to Webflow')             │
│ ✅ expect(result.deploymentUrl).toMatch(/https:\/\/webflow\.com/)   │
│ ✅ expect(result.artifacts).toEqual(['Client.js', 'manifest.json']) │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ Integration Test Assertions:                                         │
│                                                                       │
│ ✅ Token is retrieved from database                                  │
│ ✅ Token is decrypted correctly                                      │
│ ✅ All 4 commands are executed in order                              │
│ ✅ Logs are collected from all steps                                 │
│ ✅ Cleanup is called even on error                                   │
│ ✅ Error propagates to frontend with logs                            │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ E2E Test Assertions:                                                 │
│                                                                       │
│ ✅ Token input field is visible                                      │
│ ✅ Save token shows success message                                  │
│ ✅ Export button becomes enabled                                     │
│ ✅ Clicking export shows loading state                               │
│ ✅ Build logs appear in real-time                                    │
│ ✅ Success alert is shown on completion                              │
│ ✅ Deployment URL is clickable                                       │
│ ✅ Error alert is shown on failure                                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Error Path Testing

```
┌─────────────────────────────────────────────────────────────────────┐
│                     ERROR SCENARIO 1: Missing GITHUB_TOKEN           │
└─────────────────────────────────────────────────────────────────────┘

delete process.env.GITHUB_TOKEN
  ↓
buildComponents()
  ↓
cloneRepository()
  ↓
Check GITHUB_TOKEN
  ↓
undefined! ❌
  ↓
throw BuildProviderError(
  'GITHUB_TOKEN environment variable is not set',
  'vercel',
  'MISSING_GITHUB_TOKEN'
)
  ↓
Caught in buildComponents()
  ↓
return {
  success: false,
  logs: [..., 'Export failed: GITHUB_TOKEN...'],
  error: 'GITHUB_TOKEN environment variable is not set'
}
  ↓
Frontend displays error alert

✅ Test: expect(result.success).toBe(false)
✅ Test: expect(result.error).toContain('GITHUB_TOKEN')

┌─────────────────────────────────────────────────────────────────────┐
│                  ERROR SCENARIO 2: Git Clone Fails                   │
└─────────────────────────────────────────────────────────────────────┘

spawn('git', ['clone', ...])
  ↓
Mock process emits:
  [stderr] "fatal: repository not found"
  [exit] 128
  ↓
runCommand() rejects with BuildProviderError
  ↓
Caught in cloneRepository()
  ↓
throw BuildProviderError(
  'Failed to clone repository: Command failed with exit code 128',
  'vercel',
  'CLONE_FAILED'
)
  ↓
Caught in buildComponents()
  ↓
return {
  success: false,
  logs: [..., 'Export failed: Failed to clone repository'],
  error: 'Failed to clone repository: Command failed with exit code 128'
}
  ↓
finally block runs: rm(repoDir) ← Cleanup

✅ Test: expect(mockRm).toHaveBeenCalled()
✅ Test: expect(result.logs).toContain('Cleaning up')

┌─────────────────────────────────────────────────────────────────────┐
│              ERROR SCENARIO 3: Webpack Compilation Fails             │
└─────────────────────────────────────────────────────────────────────┘

Git clone ✓
Copy node_modules ✓
  ↓
spawn('npx', ['webpack', ...])
  ↓
Mock process emits:
  [stderr] "ERROR in ./src/Component.tsx"
  [stderr] "Module parse failed: Unexpected token"
  [exit] 1
  ↓
runCommand() rejects with BuildProviderError
  ↓
Caught in buildComponents()
  ↓
return {
  success: false,
  logs: [
    'Cloning repository...',
    'Copying node_modules...',
    'Running webpack...',
    '[stderr] ERROR in ./src/Component.tsx',
    'Export failed: Command failed with exit code 1'
  ],
  error: 'Command failed with exit code 1'
}
  ↓
finally block runs: rm(repoDir) ← Cleanup

✅ Test: expect(result.logs).toContain('ERROR in')
✅ Test: expect(mockRm).toHaveBeenCalled()
```

---

## Mock Setup Example

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventEmitter } from 'events';
import { spawn } from 'child_process';

// Mock child_process
vi.mock('child_process', () => ({
  spawn: vi.fn()
}));

// Mock fs/promises
vi.mock('fs/promises', () => ({
  rm: vi.fn().mockResolvedValue(undefined)
}));

describe('VercelBuildProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup environment variables
    process.env.GITHUB_TOKEN = 'ghp_test_token_123';
    process.env.GITHUB_REPO_URL = 'https://github.com/user/repo.git';

    // Setup spawn mock to return success for all commands
    vi.mocked(spawn).mockImplementation((command, args, options) => {
      const mockProc = new EventEmitter() as any;

      mockProc.stdout = new EventEmitter();
      mockProc.stderr = new EventEmitter();

      setTimeout(() => {
        if (command === 'git') {
          mockProc.stdout.emit('data', Buffer.from('Cloning...'));
          mockProc.emit('close', 0);
        } else if (command === 'cp') {
          mockProc.stdout.emit('data', Buffer.from('Copied'));
          mockProc.emit('close', 0);
        } else if (command === 'npx' && args[0] === 'webpack') {
          mockProc.stdout.emit('data', Buffer.from('Compiled successfully'));
          mockProc.emit('close', 0);
        } else if (command === 'npx' && args[0] === 'webflow') {
          mockProc.stdout.emit('data', Buffer.from('Deployed: https://webflow.com/abc'));
          mockProc.emit('close', 0);
        }
      }, 10);

      return mockProc;
    });
  });

  it('should execute full export workflow', async () => {
    const provider = new VercelBuildProvider();

    const result = await provider.buildComponents({
      webflowToken: 'wf_test_token',
      outputDir: '/tmp'
    });

    expect(result.success).toBe(true);
    expect(spawn).toHaveBeenCalledTimes(4); // git, cp, webpack, webflow
  });
});
```

---

## Summary

This architecture diagram shows:
1. **Where tests run** (unit, integration, E2E)
2. **What to mock** (external commands, not coordination logic)
3. **How data flows** (from user input to build result)
4. **Error handling paths** (each failure scenario)
5. **Test assertions** (what to verify at each layer)

Use this as a reference when implementing the actual test files.
