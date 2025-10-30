# Testing Guide

This project uses a comprehensive testing strategy with **Vitest** for unit/integration tests and **Playwright** for E2E tests.

## Quick Start

```bash
# Run unit tests (watch mode)
pnpm test

# Run unit tests once
pnpm test:run

# Run tests with coverage
pnpm test:coverage

# Run E2E tests
pnpm test:e2e

# Run E2E tests with UI
pnpm test:e2e:ui

# Debug E2E tests
pnpm test:e2e:debug
```

## Testing Stack

### Unit & Integration Tests
- **Framework**: Vitest 3.2.4
- **Component Testing**: @testing-library/react 16.3.0
- **Coverage**: @vitest/coverage-v8
- **Test Environment**: jsdom

### E2E Tests
- **Framework**: Playwright 1.56.1
- **Browsers**: Chromium, Firefox, WebKit
- **Auto-server**: Starts `pnpm dev` automatically

## Directory Structure

```
blogflow/
├── __tests__/              # Unit and integration tests
│   ├── components/         # Component tests
│   ├── actions/            # Server action tests
│   ├── lib/                # Utility tests
│   └── integration/        # Integration tests
├── e2e/                    # E2E tests with Playwright
│   └── example.spec.ts     # Example E2E test
├── vitest.config.mts       # Vitest configuration
├── vitest.setup.ts         # Global test setup
└── playwright.config.ts    # Playwright configuration
```

## Test Types

### 1. Unit Tests (Vitest)

**What to test:**
- Pure functions in `lib/`
- Custom React hooks
- Zustand stores
- Utility functions

**Example:**
```typescript
import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn utility', () => {
  it('merges class names', () => {
    expect(cn('class1', 'class2')).toContain('class1');
  });
});
```

### 2. Integration Tests (Vitest)

**What to test:**
- Server actions with mocked database
- API integrations
- Complex component interactions
- Zustand stores with multiple components

**Location:** `__tests__/integration/`

### 3. E2E Tests (Playwright)

**What to test:**
- Complete user workflows
- Multi-page navigation
- Form submissions
- Authentication flows
- Webflow component behavior
- Responsive design

**Example:**
```typescript
import { test, expect } from '@playwright/test';

test('user can navigate', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Dashboard');
  await expect(page).toHaveURL(/\/dashboard/);
});
```

## Known Limitations

### React 19 + @testing-library/react Incompatibility

**Issue:** React 19 changed the `act` API, causing @testing-library/react 16.3.0 to fail with "React.act is not a function" errors.

**Current Status:** Component testing with Testing Library is disabled until a compatible version is released.

**Workarounds:**

1. **Use Playwright for Component Testing** (Recommended)
   - Test components in real browser environment
   - More accurate representation of user experience
   - Already working and available

2. **Test Component Logic Without DOM**
   - Test pure functions and hooks
   - Test Zustand stores independently
   - Test utility functions

3. **Wait for Testing Library Update**
   - @testing-library/react team is working on React 19 support
   - Track: https://github.com/testing-library/react-testing-library/issues

**Temporary Solution:**
- Component tests are in `__tests__/components/*.test.tsx.disabled`
- Re-enable when Testing Library supports React 19

## Testing Best Practices

### 1. Follow TDD Workflow
```
1. Write test (Red)
2. Implement minimal code (Green)
3. Refactor (Refactor)
4. Commit only when tests pass
```

### 2. Test Coverage Goals
- **Unit Tests:** >80% coverage
- **Integration Tests:** All server actions
- **E2E Tests:** All critical user flows

### 3. Webflow Shadow DOM Considerations

Components run in Shadow DOM in Webflow. Test accordingly:

```typescript
// ✅ Test browser-native APIs
test('navigates with window.location', () => {
  // Mock window.location
  window.location.href = '/dashboard';
});

// ❌ Don't test Next.js router (not available in Webflow)
test('navigates with useRouter', () => {
  // This won't work in Webflow Shadow DOM
  router.push('/dashboard');
});
```

### 4. Mock External Dependencies

```typescript
import { vi } from 'vitest';

// Mock fetch calls
global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ data: 'mocked' }),
  })
);
```

### 5. Test Zustand Stores

```typescript
import { renderHook, act } from '@testing-library/react';
import { useSliderStore } from '@/lib/stores/slider-store';

it('updates slider value', () => {
  const { result } = renderHook(() => useSliderStore());

  act(() => {
    result.current.setBlueValue(0.8);
  });

  expect(result.current.blueValue).toBe(0.8);
});
```

## Playwright MCP Integration

The project includes Playwright MCP for manual browser testing:

```bash
# MCP server configured in .mcp.json
# Available in Claude Code after restart
```

**Use for:**
- Visual verification of components
- Manual testing of complex interactions
- Screenshot capture for documentation
- Responsive design verification

## CI/CD Integration

```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: |
    pnpm test:run
    pnpm test:e2e --project chromium
```

## Troubleshooting

### Tests hang or timeout
- Increase timeout in `vitest.config.mts` or `playwright.config.ts`
- Check for infinite loops or unresolved promises

### "Cannot find module" errors
- Verify path aliases in `vitest.config.mts` match `tsconfig.json`
- Run `pnpm install` to ensure dependencies are installed

### E2E tests fail to start dev server
- Check port 3000 is available
- Increase `webServer.timeout` in `playwright.config.ts`

### Coverage reports missing files
- Check `coverage.exclude` patterns in `vitest.config.mts`

## Additional Resources

- [Vitest Docs](https://vitest.dev/)
- [Playwright Docs](https://playwright.dev/)
- [Testing Library Docs](https://testing-library.com/)
- [TDD Best Practices](https://martinfowler.com/bliki/TestDrivenDevelopment.html)

## Next Steps

1. ✅ Testing infrastructure installed
2. ✅ Example tests created
3. ✅ Test scripts configured
4. ⏳ Wait for React 19 support in Testing Library
5. ⏳ Write comprehensive test suites for features
6. ⏳ Integrate with CI/CD pipeline
