# Webflow Export Test Implementation Checklist

## Test Implementation Progress Tracker

Use this checklist to track test implementation progress and ensure complete coverage.

---

## Phase 1: Unit Tests - VercelBuildProvider

### File: `lib/integrations/build-providers/__tests__/vercel-build-provider.test.ts`

#### Setup & Configuration
- [ ] Import Vitest utilities (describe, it, expect, beforeEach, vi)
- [ ] Mock `child_process` module
- [ ] Mock `fs/promises` module
- [ ] Create mock process factory function
- [ ] Setup environment variables in beforeEach

#### Test: `cloneRepository()`
- [ ] ✅ Should clone repository with valid token
- [ ] ✅ Should use token authentication in URL format
- [ ] ✅ Should use --depth=1 flag (shallow clone)
- [ ] ✅ Should use --single-branch flag
- [ ] ✅ Should throw BuildProviderError if GITHUB_TOKEN missing
- [ ] ✅ Should throw BuildProviderError if GITHUB_REPO_URL missing
- [ ] ✅ Should hide token in logs (security)
- [ ] ✅ Should handle git command failure (exit code 128)
- [ ] ✅ Should handle network timeout
- [ ] ✅ Should handle authentication failure (401)
- [ ] ✅ Should handle repository not found (404)
- [ ] ✅ Should return logs array

#### Test: `copyNodeModules()`
- [ ] ✅ Should copy node_modules using cp -r
- [ ] ✅ Should use correct source path (process.cwd()/node_modules)
- [ ] ✅ Should use correct target path (repoDir/node_modules)
- [ ] ✅ Should throw BuildProviderError on cp failure
- [ ] ✅ Should handle permission errors (EACCES)
- [ ] ✅ Should handle disk space errors (ENOSPC)
- [ ] ✅ Should return logs array

#### Test: `runCommand()`
- [ ] ✅ Should execute command with correct args
- [ ] ✅ Should use correct working directory (cwd)
- [ ] ✅ Should collect stdout logs
- [ ] ✅ Should collect stderr logs
- [ ] ✅ Should resolve on exit code 0
- [ ] ✅ Should reject on non-zero exit code
- [ ] ✅ Should handle spawn errors (ENOENT)
- [ ] ✅ Should trim empty lines
- [ ] ✅ Should prefix logs with [stdout] and [stderr]
- [ ] ✅ Should pass environment variables

#### Test: `extractDeploymentUrl()`
- [ ] ✅ Should extract https URL from logs
- [ ] ✅ Should extract http URL from logs
- [ ] ✅ Should return first URL found
- [ ] ✅ Should return default URL if none found
- [ ] ✅ Should handle empty logs array
- [ ] ✅ Should handle malformed URLs
- [ ] ✅ Should extract URL from multi-line entries

#### Test: `buildComponents()`
- [ ] ✅ Should execute all steps in correct order
- [ ] ✅ Should generate unique job ID
- [ ] ✅ Should use /tmp directory
- [ ] ✅ Should collect logs from all steps
- [ ] ✅ Should add timestamps to logs
- [ ] ✅ Should return BuildResult on success
- [ ] ✅ Should return artifacts array
- [ ] ✅ Should handle clone failure
- [ ] ✅ Should handle copy failure
- [ ] ✅ Should handle webpack failure
- [ ] ✅ Should handle Webflow CLI failure
- [ ] ✅ Should cleanup on success (finally)
- [ ] ✅ Should cleanup on failure (finally)
- [ ] ✅ Should not throw if cleanup fails
- [ ] ✅ Should include cleanup warnings in logs

**Total Unit Tests: ~50 test cases**

---

## Phase 2: Unit Tests - WebflowRouter

### File: `lib/api/routers/__tests__/webflow-router.test.ts`

#### Setup & Configuration
- [ ] Import oRPC testing utilities
- [ ] Mock ManualTokenProvider
- [ ] Mock VercelBuildProvider
- [ ] Mock FilesystemDiscovery
- [ ] Create test context with userId

#### Test: `exportComponents` procedure
- [ ] ✅ Should require authentication (protectedProcedure)
- [ ] ✅ Should retrieve Webflow token from provider
- [ ] ✅ Should throw error if token not found
- [ ] ✅ Should call buildProvider.buildComponents
- [ ] ✅ Should pass webflowToken to build provider
- [ ] ✅ Should pass outputDir to build provider
- [ ] ✅ Should return BuildResult from provider
- [ ] ✅ Should handle build failures gracefully
- [ ] ✅ Should not expose encrypted token in response

#### Test: Other procedures (if testing comprehensively)
- [ ] ✅ saveWebflowToken - validates input
- [ ] ✅ saveWebflowToken - calls authProvider.saveToken
- [ ] ✅ getWebflowToken - returns hasToken status
- [ ] ✅ revokeWebflowToken - calls authProvider.revokeToken
- [ ] ✅ listWebflowComponents - calls discovery.listComponents

**Total Router Tests: ~15 test cases**

---

## Phase 3: Integration Tests

### File: `lib/integrations/build-providers/__tests__/vercel-integration.test.ts`

#### Setup & Configuration
- [ ] Setup test database with schema
- [ ] Mock only external commands (git, cp, webpack, CLI)
- [ ] Use real ManualTokenProvider
- [ ] Use real VercelBuildProvider
- [ ] Use real WebflowRouter

#### Test: Full Workflow
- [ ] ✅ Should save token (with encryption)
- [ ] ✅ Should retrieve token (with decryption)
- [ ] ✅ Should execute all build steps in order
- [ ] ✅ Should collect logs across all steps
- [ ] ✅ Should extract deployment URL
- [ ] ✅ Should cleanup /tmp directory

#### Test: Error Propagation
- [ ] ✅ Git clone error propagates to router
- [ ] ✅ Webpack error propagates to router
- [ ] ✅ CLI error propagates to router
- [ ] ✅ Error logs are collected
- [ ] ✅ Cleanup happens even on error

#### Test: Environment Variables
- [ ] ✅ GITHUB_TOKEN is read correctly
- [ ] ✅ GITHUB_REPO_URL is read correctly
- [ ] ✅ Missing env vars throw errors

**Total Integration Tests: ~15 test cases**

---

## Phase 4: E2E Tests

### File: `e2e/webflow-export.spec.ts`

#### Setup & Configuration
- [ ] Import Playwright test utilities
- [ ] Setup test user authentication
- [ ] Mock external services (GitHub, Webflow API)
- [ ] Navigate to /integrations/webflow

#### Test: Token Management
- [ ] ✅ Display token input form
- [ ] ✅ Validate token format (min length)
- [ ] ✅ Show validation error for invalid token
- [ ] ✅ Save token successfully
- [ ] ✅ Display "Connected" status
- [ ] ✅ Allow revoking token
- [ ] ✅ Hide token input after connection
- [ ] ✅ Mask token value (type="password")

#### Test: Export Workflow
- [ ] ✅ Display "Export to Webflow" button
- [ ] ✅ Disable button while exporting
- [ ] ✅ Show loading spinner
- [ ] ✅ Stream build logs in real-time
- [ ] ✅ Display logs with timestamps
- [ ] ✅ Show success alert on completion
- [ ] ✅ Display deployment URL link
- [ ] ✅ URL is clickable (opens new tab)
- [ ] ✅ Handle export failure gracefully
- [ ] ✅ Display error message on failure
- [ ] ✅ Allow retry after failure
- [ ] ✅ Auto-scroll logs

#### Test: Error Handling
- [ ] ✅ Show error if GITHUB_TOKEN missing
- [ ] ✅ Show error if GITHUB_REPO_URL missing
- [ ] ✅ Display helpful error messages

#### Test: Build Logs Visibility
- [ ] ✅ Show "Cloning repository..." log
- [ ] ✅ Show "Copying node_modules..." log
- [ ] ✅ Show "Running webpack..." log
- [ ] ✅ Show "Deploying to Webflow..." log
- [ ] ✅ Show "Export completed" log
- [ ] ✅ Show cleanup log even on error

#### Test: Responsive Design
- [ ] ✅ Works on mobile viewport (375px)
- [ ] ✅ Works on tablet viewport (768px)
- [ ] ✅ Works on desktop viewport (1920px)

#### Test: Accessibility
- [ ] ✅ Proper ARIA labels
- [ ] ✅ Keyboard navigation support
- [ ] ✅ Sufficient color contrast
- [ ] ✅ Screen reader announcements

**Total E2E Tests: ~35 test cases**

---

## Phase 5: Test Coverage Verification

### Coverage Metrics
- [ ] Run `pnpm test:coverage`
- [ ] Verify >90% line coverage for VercelBuildProvider
- [ ] Verify >80% line coverage for WebflowRouter
- [ ] Verify >80% branch coverage overall
- [ ] Review uncovered lines (acceptable?)

### Critical Paths
- [ ] All happy paths covered (E2E)
- [ ] All error scenarios covered (unit + E2E)
- [ ] All edge cases covered (unit)
- [ ] Cleanup always tested (unit + integration)

---

## Phase 6: Test Quality Assurance

### Code Quality
- [ ] Tests follow AAA pattern (Arrange, Act, Assert)
- [ ] Test names clearly describe behavior
- [ ] No duplicate test logic
- [ ] Mocks are properly cleaned up (afterEach)
- [ ] Test data is isolated (no shared state)

### Documentation
- [ ] Test files have descriptive headers
- [ ] Complex test setup is commented
- [ ] Mock strategies are documented
- [ ] Error scenarios are explained

### Performance
- [ ] Unit tests run in < 5 seconds
- [ ] Integration tests run in < 15 seconds
- [ ] E2E tests run in < 120 seconds
- [ ] No unnecessary delays (use minimal timeouts)

---

## Phase 7: CI/CD Integration

### GitHub Actions Setup
- [ ] Create `.github/workflows/test.yml`
- [ ] Add unit test job
- [ ] Add integration test job
- [ ] Add E2E test job
- [ ] Add coverage report upload
- [ ] Configure test failure notifications

### Environment Variables (CI)
- [ ] GITHUB_TOKEN set in CI secrets
- [ ] GITHUB_REPO_URL set in CI secrets
- [ ] ENCRYPTION_SECRET set in CI secrets
- [ ] Database URL configured for tests

### Test Matrix
- [ ] Test on Node 20
- [ ] Test on Node 22
- [ ] Test on Ubuntu
- [ ] Test on macOS (optional)

---

## Phase 8: Final Validation

### Manual Testing
- [ ] Run full export workflow manually
- [ ] Verify logs match test expectations
- [ ] Verify cleanup happens (check /tmp)
- [ ] Test with real GitHub token (local)
- [ ] Test with real Webflow token (local)

### Edge Case Testing
- [ ] Test with very long repo names
- [ ] Test with special characters in logs
- [ ] Test with extremely large node_modules
- [ ] Test with slow network (timeout scenarios)

### Security Review
- [ ] No tokens exposed in logs ✓
- [ ] No tokens in error messages ✓
- [ ] No tokens in test snapshots ✓
- [ ] Encrypted tokens not exposed in API ✓

---

## Completion Checklist

### Documentation
- [ ] Test strategy document created ✓
- [ ] Test plan summary created ✓
- [ ] Test architecture diagram created ✓
- [ ] Test checklist created ✓
- [ ] README updated with test commands

### Test Files
- [ ] vercel-build-provider.test.ts written
- [ ] webflow-router.test.ts written
- [ ] vercel-integration.test.ts written
- [ ] webflow-export.spec.ts written

### Execution
- [ ] All unit tests pass locally
- [ ] All integration tests pass locally
- [ ] All E2E tests pass locally
- [ ] Coverage goals met (>80%)
- [ ] CI/CD pipeline configured
- [ ] Tests pass in CI/CD

### Sign-off
- [ ] Code reviewer approved tests
- [ ] Test architect verified coverage
- [ ] User confirmed test scenarios match requirements
- [ ] Feature marked complete in FEATURES.md

---

## Test Statistics Summary

| Category        | Test Files | Test Cases | Estimated Time |
|----------------|-----------|-----------|----------------|
| Unit Tests     | 2         | ~65       | < 5 seconds    |
| Integration    | 1         | ~15       | < 15 seconds   |
| E2E Tests      | 1         | ~35       | < 120 seconds  |
| **Total**      | **4**     | **~115**  | **< 140 sec**  |

---

## Next Actions

### Immediate (Phase 1-2):
1. Create `vercel-build-provider.test.ts`
2. Implement all unit tests for VercelBuildProvider
3. Create `webflow-router.test.ts`
4. Implement all router tests

### Short-term (Phase 3-4):
1. Create `vercel-integration.test.ts`
2. Implement integration tests
3. Create `webflow-export.spec.ts`
4. Implement E2E tests

### Long-term (Phase 5-8):
1. Verify coverage metrics
2. Setup CI/CD pipeline
3. Perform manual testing
4. Document findings and sign-off

---

## Resources

- **Vitest Docs:** https://vitest.dev/
- **Playwright Docs:** https://playwright.dev/
- **oRPC Testing:** Check oRPC documentation for testing utilities
- **Project Testing Guide:** `/TESTING.md`
- **Test Strategy:** `/docs/testing/webflow-export-test-strategy.md`

---

**Last Updated:** 2025-11-02
**Status:** Ready for Implementation
**Estimated Total Time:** 8-16 hours for complete test suite
