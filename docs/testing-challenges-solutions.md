# Testing Challenges & Solutions: Vercel Deployments

## Practical Guide to Common Testing Obstacles

This document addresses specific testing challenges encountered when implementing Vercel deployment features and provides battle-tested solutions.

---

## Challenge 1: Testing Async Status Polling

### Problem
Deployments take 2-10 minutes to build. How do we test status polling without waiting?

### Solution: Fake Timers + Sequential Mocks

```typescript
import { vi } from 'vitest';
import { VercelProvider } from '@/lib/integrations/vercel/client';

describe('waitForDeploymentReady()', () => {
  it('should poll deployment status until ready', async () => {
    // Use fake timers to control time
    vi.useFakeTimers();

    const provider = new VercelProvider();
    const mockFetch = vi.fn();
    global.fetch = mockFetch;

    // Mock sequential responses: BUILDING → BUILDING → READY
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({
          id: 'dpl_123',
          state: 'BUILDING',
          url: 'test.vercel.app',
          createdAt: new Date().toISOString(),
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({
          id: 'dpl_123',
          state: 'BUILDING',
          url: 'test.vercel.app',
          createdAt: new Date().toISOString(),
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({
          id: 'dpl_123',
          state: 'READY',
          url: 'https://test.vercel.app',
          createdAt: new Date().toISOString(),
          readyAt: new Date().toISOString(),
        }),
      });

    // Start polling (returns promise)
    const promise = provider.waitForDeploymentReady('dpl_123', 'token');

    // Fast-forward through all timers
    await vi.runAllTimersAsync();

    // Await the result
    const result = await promise;

    // Assertions
    expect(result.state).toBe('READY');
    expect(mockFetch).toHaveBeenCalledTimes(3);
    expect(result.url).toContain('https://');

    // Restore real timers
    vi.useRealTimers();
  });

  it('should timeout after maximum wait time', async () => {
    vi.useFakeTimers();

    const provider = new VercelProvider();
    const mockFetch = vi.fn();
    global.fetch = mockFetch;

    // Always return BUILDING status
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers(),
      json: async () => ({
        id: 'dpl_123',
        state: 'BUILDING',
      }),
    });

    // Set short timeout for test (10 seconds)
    const promise = provider.waitForDeploymentReady('dpl_123', 'token', 10000);

    // Advance time past timeout
    await vi.advanceTimersByTimeAsync(11000);

    // Should throw timeout error
    await expect(promise).rejects.toThrow(/timeout|timed out/i);

    vi.useRealTimers();
  });
});
```

**Key Concepts:**
- Use `vi.useFakeTimers()` to control time
- Use `vi.runAllTimersAsync()` to fast-forward through polling intervals
- Use `vi.advanceTimersByTimeAsync(ms)` to advance time precisely
- Always restore real timers with `vi.useRealTimers()`

---

## Challenge 2: Testing External Links Without Navigation

### Problem
Deployment URLs point to external Vercel sites. How do we test links without actually visiting them?

### Solution: Attribute Testing + Route Interception

#### Component Test Approach
```typescript
import { render, screen } from '@testing-library/react';
import DeploymentList from '@/components/DeploymentList';

describe('DeploymentList - External Links', () => {
  it('should display deployment URL without navigation', () => {
    const deployments = [
      {
        id: 'dpl_123',
        name: 'my-app',
        url: 'https://my-app-abc123.vercel.app',
        state: 'READY',
      },
    ];

    render(<DeploymentList deployments={deployments} />);

    // Find link by accessible name or text
    const urlLink = screen.getByRole('link', { name: /view deployment|my-app/i });

    // Verify link attributes (don't click)
    expect(urlLink).toHaveAttribute('href', 'https://my-app-abc123.vercel.app');
    expect(urlLink).toHaveAttribute('target', '_blank');
    expect(urlLink).toHaveAttribute('rel', 'noopener noreferrer');

    // Verify URL format
    const href = urlLink.getAttribute('href');
    expect(href).toMatch(/^https:\/\/.+\.vercel\.app$/);
  });

  it('should display inspector URL for debugging', () => {
    const deployments = [
      {
        id: 'dpl_123',
        name: 'my-app',
        inspectorUrl: 'https://vercel.com/user/my-app/dpl_123',
        state: 'BUILDING',
      },
    ];

    render(<DeploymentList deployments={deployments} />);

    const inspectorLink = screen.getByRole('link', { name: /inspector|view in vercel/i });

    expect(inspectorLink).toHaveAttribute('href', expect.stringContaining('vercel.com'));
    expect(inspectorLink).toHaveAttribute('target', '_blank');
  });
});
```

#### E2E Test Approach
```typescript
import { test, expect } from '@playwright/test';

test('should display deployment URL correctly', async ({ page, context }) => {
  await page.goto('/integrations/test#deployments');

  // Wait for deployment list to load
  await page.waitForSelector('[data-testid="deployment-list"]');

  // Find deployment URL link
  const urlLink = page.getByRole('link', { name: /view deployment/i }).first();

  // Verify link is visible
  await expect(urlLink).toBeVisible();

  // Verify href attribute
  const href = await urlLink.getAttribute('href');
  expect(href).toMatch(/^https:\/\/.+\.vercel\.app$/);

  // Verify link opens in new tab (without actually opening)
  const target = await urlLink.getAttribute('target');
  expect(target).toBe('_blank');

  // Optional: Intercept click to prevent navigation
  await urlLink.click({ modifiers: ['Meta'] }); // Cmd/Ctrl+Click

  // Or use context.waitForEvent to capture new page without visiting
  const [newPage] = await Promise.all([
    context.waitForEvent('page'),
    urlLink.click(),
  ]);

  // Verify URL of new page
  expect(newPage.url()).toContain('.vercel.app');

  // Close new page immediately
  await newPage.close();
});
```

**Key Concepts:**
- Test link attributes, not navigation behavior
- Use `getByRole('link')` for semantic queries
- Verify `target="_blank"` and `rel="noopener noreferrer"`
- For E2E, intercept page events instead of navigating
- Close new pages immediately to prevent browser resource usage

---

## Challenge 3: Testing Confirmation Dialogs

### Problem
Delete confirmation modals need careful testing. How do we test all branches (confirm, cancel, X button)?

### Solution: Dialog Role Testing + Event Simulation

#### Component Test
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DatabaseList from '@/components/DatabaseList';

describe('DatabaseList - Confirmation Dialog', () => {
  it('should open confirmation dialog on delete click', async () => {
    const user = userEvent.setup();
    const databases = [
      { id: 'db_123', name: 'test_db', status: 'ready' },
    ];

    render(<DatabaseList databases={databases} />);

    // Click delete button
    const deleteBtn = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteBtn);

    // Verify dialog appears
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();

    // Verify dialog content
    expect(dialog).toHaveTextContent(/are you sure/i);
    expect(dialog).toHaveTextContent(/test_db/); // Database name mentioned
    expect(dialog).toHaveTextContent(/cannot be undone/i);
  });

  it('should cancel deletion when cancel button clicked', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    const databases = [{ id: 'db_123', name: 'test_db', status: 'ready' }];

    render(<DatabaseList databases={databases} onDelete={onDelete} />);

    // Open dialog
    await user.click(screen.getByRole('button', { name: /delete/i }));

    // Click cancel
    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelBtn);

    // Verify dialog closes
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    // Verify delete was not called
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('should confirm deletion and call API', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn().mockResolvedValue({ success: true });
    const databases = [{ id: 'db_123', name: 'test_db', status: 'ready' }];

    render(<DatabaseList databases={databases} onDelete={onDelete} />);

    // Open dialog
    await user.click(screen.getByRole('button', { name: /delete/i }));

    // Confirm deletion
    const confirmBtn = screen.getByRole('button', { name: /confirm|yes|delete/i });
    await user.click(confirmBtn);

    // Verify delete was called with correct ID
    expect(onDelete).toHaveBeenCalledWith('db_123');

    // Verify dialog closes
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('should close dialog when X button clicked', async () => {
    const user = userEvent.setup();
    const databases = [{ id: 'db_123', name: 'test_db', status: 'ready' }];

    render(<DatabaseList databases={databases} />);

    // Open dialog
    await user.click(screen.getByRole('button', { name: /delete/i }));

    // Click close button (usually aria-label="Close")
    const closeBtn = screen.getByRole('button', { name: /close/i });
    await user.click(closeBtn);

    // Verify dialog closes
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('should show loading state during deletion', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn().mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 1000))
    );
    const databases = [{ id: 'db_123', name: 'test_db', status: 'ready' }];

    render(<DatabaseList databases={databases} onDelete={onDelete} />);

    // Open and confirm
    await user.click(screen.getByRole('button', { name: /delete/i }));
    const confirmBtn = screen.getByRole('button', { name: /confirm/i });
    await user.click(confirmBtn);

    // Verify loading state
    expect(confirmBtn).toBeDisabled();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

    // Wait for completion
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
```

#### E2E Test
```typescript
test('should handle database deletion with confirmation', async ({ page }) => {
  await page.goto('/integrations/test#databases');

  // Find first database delete button
  const deleteBtn = page
    .locator('[data-testid="database-card"]')
    .first()
    .getByRole('button', { name: /delete/i });

  await deleteBtn.click();

  // Wait for dialog
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  // Verify dialog content
  await expect(dialog).toContainText(/are you sure/i);

  // Setup API request interceptor to verify call
  const deleteRequest = page.waitForRequest(
    (req) =>
      req.url().includes('/api/integrations/databases') &&
      req.method() === 'DELETE'
  );

  // Confirm deletion
  await dialog.getByRole('button', { name: /confirm|yes/i }).click();

  // Verify API was called
  await deleteRequest;

  // Verify dialog closes
  await expect(dialog).not.toBeVisible();

  // Verify database removed from list
  await expect(page.locator('[data-testid="database-card"]')).toHaveCount(0);
});
```

**Key Concepts:**
- Use `getByRole('dialog')` for semantic queries
- Test all exit paths: confirm, cancel, close button
- Verify dialog closes with `waitFor()`
- Test loading states during async operations
- Use `waitForRequest()` in E2E to verify API calls

---

## Challenge 4: Testing Rate Limit Handling

### Problem
How do we test rate limit errors without actually hitting rate limits?

### Solution: Mock 429 Responses with Headers

```typescript
import { RateLimitError } from '@/lib/integrations/types';

describe('VercelProvider - Rate Limiting', () => {
  it('should throw RateLimitError on 429 response', async () => {
    const resetTime = Date.now() + 60000; // 1 minute from now

    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
      headers: new Headers({
        'x-ratelimit-limit': '100',
        'x-ratelimit-remaining': '0',
        'x-ratelimit-reset': String(Math.floor(resetTime / 1000)),
      }),
      json: async () => ({
        error: {
          code: 'TOO_MANY_REQUESTS',
          message: 'Rate limit exceeded. Please try again later.',
        },
      }),
    });

    global.fetch = mockFetch;

    const provider = new VercelProvider();

    // Attempt to create deployment
    await expect(
      provider.createDeployment({ name: 'test', template: 'static-html' }, 'token')
    ).rejects.toThrow(RateLimitError);

    // Verify rate limit info is tracked
    const rateLimitInfo = provider.getRateLimitInfo();
    expect(rateLimitInfo).toMatchObject({
      limit: 100,
      remaining: 0,
      reset: Math.floor(resetTime / 1000),
    });
  });

  it('should include reset time in error message', async () => {
    const resetTime = Date.now() + 120000; // 2 minutes
    const resetDate = new Date(resetTime);

    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 429,
      headers: new Headers({
        'x-ratelimit-reset': String(Math.floor(resetTime / 1000)),
      }),
      json: async () => ({
        error: { code: 'TOO_MANY_REQUESTS', message: 'Rate limit exceeded' },
      }),
    });

    global.fetch = mockFetch;

    const provider = new VercelProvider();

    try {
      await provider.createDeployment({ name: 'test' }, 'token');
      fail('Should have thrown RateLimitError');
    } catch (error) {
      expect(error).toBeInstanceOf(RateLimitError);
      expect((error as RateLimitError).resetAt).toEqual(resetDate);
    }
  });

  it('should track rate limit headers on successful requests', async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({
        'x-ratelimit-limit': '100',
        'x-ratelimit-remaining': '95',
        'x-ratelimit-reset': String(Math.floor(Date.now() / 1000) + 3600),
      }),
      json: async () => ({
        id: 'dpl_123',
        state: 'BUILDING',
      }),
    });

    global.fetch = mockFetch;

    const provider = new VercelProvider();
    await provider.createDeployment({ name: 'test' }, 'token');

    // Verify rate limit tracking
    const rateLimitInfo = provider.getRateLimitInfo();
    expect(rateLimitInfo?.limit).toBe(100);
    expect(rateLimitInfo?.remaining).toBe(95);
  });
});
```

#### E2E Test for Rate Limit UI
```typescript
test('should display rate limit error to user', async ({ page }) => {
  // Mock API to return 429
  await page.route('**/api/integrations/deployments', async (route) => {
    await route.fulfill({
      status: 429,
      headers: {
        'x-ratelimit-reset': String(Math.floor(Date.now() / 1000) + 60),
      },
      body: JSON.stringify({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please try again in 1 minute.',
        },
      }),
    });
  });

  await page.goto('/integrations/test#deployments');

  // Try to create deployment
  await page.getByLabel(/deployment name/i).fill('test-app');
  await page.getByRole('button', { name: /create/i }).click();

  // Verify error message displays
  const alert = page.getByRole('alert');
  await expect(alert).toBeVisible();
  await expect(alert).toContainText(/rate limit|too many requests/i);
  await expect(alert).toContainText(/1 minute/i); // Reset time

  // Verify retry button is present
  const retryBtn = page.getByRole('button', { name: /try again|retry/i });
  await expect(retryBtn).toBeVisible();
});
```

**Key Concepts:**
- Mock 429 status with rate limit headers
- Parse `x-ratelimit-reset` as Unix timestamp
- Track rate limit info across requests
- Display user-friendly error messages with retry time
- Test both error and success rate limit tracking

---

## Challenge 5: Testing Long-Running Operations

### Problem
Deployments can take 5-10 minutes. How do we test without waiting?

### Solution: Progressive State Mocking + Timeout Testing

```typescript
describe('Long-running deployments', () => {
  it('should handle deployment that takes multiple polls to complete', async () => {
    vi.useFakeTimers();

    const provider = new VercelProvider();
    const mockFetch = vi.fn();
    global.fetch = mockFetch;

    // Simulate 5 polls before READY
    const buildingResponse = {
      ok: true,
      status: 200,
      headers: new Headers(),
      json: async () => ({ id: 'dpl_123', state: 'BUILDING' }),
    };

    const readyResponse = {
      ok: true,
      status: 200,
      headers: new Headers(),
      json: async () => ({ id: 'dpl_123', state: 'READY', url: 'https://test.vercel.app' }),
    };

    // Mock 4 BUILDING responses, then READY
    mockFetch
      .mockResolvedValueOnce(buildingResponse)
      .mockResolvedValueOnce(buildingResponse)
      .mockResolvedValueOnce(buildingResponse)
      .mockResolvedValueOnce(buildingResponse)
      .mockResolvedValueOnce(readyResponse);

    const promise = provider.waitForDeploymentReady('dpl_123', 'token');

    // Fast-forward through all polling intervals
    await vi.runAllTimersAsync();

    const result = await promise;

    expect(result.state).toBe('READY');
    expect(mockFetch).toHaveBeenCalledTimes(5);

    vi.useRealTimers();
  });

  it('should timeout on very long deployments', async () => {
    vi.useFakeTimers();

    const provider = new VercelProvider();
    const mockFetch = vi.fn();
    global.fetch = mockFetch;

    // Always return BUILDING
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers(),
      json: async () => ({ id: 'dpl_123', state: 'BUILDING' }),
    });

    // Set 10-minute timeout
    const promise = provider.waitForDeploymentReady('dpl_123', 'token', 600000);

    // Advance time past timeout
    await vi.advanceTimersByTimeAsync(610000);

    await expect(promise).rejects.toThrow(/timeout/i);

    vi.useRealTimers();
  });
});
```

#### E2E Test with Mocked Progressive Status
```typescript
test('should handle long-running deployment', async ({ page }) => {
  // Track poll count
  let pollCount = 0;

  // Mock deployment status endpoint
  await page.route('**/api/integrations/deployments/dpl_*', async (route) => {
    pollCount++;

    // First 8 polls: BUILDING
    // 9th poll: READY
    const response =
      pollCount < 9
        ? {
            id: 'dpl_123',
            state: 'BUILDING',
            url: 'test-app.vercel.app',
            createdAt: new Date().toISOString(),
          }
        : {
            id: 'dpl_123',
            state: 'READY',
            url: 'https://test-app.vercel.app',
            createdAt: new Date().toISOString(),
            readyAt: new Date().toISOString(),
          };

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response),
    });
  });

  await page.goto('/integrations/test#deployments');

  // Create deployment
  await page.getByLabel(/deployment name/i).fill('test-app');
  await page.getByRole('button', { name: /create/i }).click();

  // Verify initial BUILDING status
  const statusBadge = page.locator('[data-testid="deployment-status"]').first();
  await expect(statusBadge).toContainText(/building/i);

  // Wait for status to change to READY (with generous timeout)
  await expect(statusBadge).toContainText(/ready/i, {
    timeout: 60000, // 60 seconds max for test
  });

  // Verify URL is now clickable
  const urlLink = page.getByRole('link', { name: /view deployment/i });
  await expect(urlLink).toBeVisible();
  await expect(urlLink).toHaveAttribute('href', /^https:\/\//);

  // Verify we actually polled multiple times
  expect(pollCount).toBeGreaterThanOrEqual(9);
});
```

**Key Concepts:**
- Use counter to track poll attempts
- Mock progressive state changes
- Test timeout scenarios with fake timers
- Use generous timeouts in E2E tests (60s max)
- Verify multiple API calls occurred (polling worked)

---

## Challenge 6: Testing Form Validation

### Problem
How do we test complex validation logic (name format, template selection, etc.)?

### Solution: Parameterized Tests + Validation Scenarios

```typescript
describe('Deployment Form Validation', () => {
  describe('deployment name validation', () => {
    it.each([
      { name: '', expected: 'Name is required' },
      { name: 'a', expected: null }, // Valid: 1 char
      { name: 'a'.repeat(64), expected: null }, // Valid: 64 chars
      { name: 'a'.repeat(65), expected: 'Name must be 64 characters or less' },
      { name: 'My App', expected: 'Name cannot contain spaces' },
      { name: 'my_app', expected: null }, // Valid: underscore
      { name: 'my-app', expected: null }, // Valid: hyphen
      { name: 'my.app', expected: 'Name can only contain letters, numbers, hyphens, and underscores' },
      { name: 'my@app', expected: 'Name can only contain letters, numbers, hyphens, and underscores' },
      { name: 'MyApp', expected: null }, // Valid: camelCase
      { name: '123app', expected: null }, // Valid: starts with number
    ])('should validate name: "$name"', async ({ name, expected }) => {
      const user = userEvent.setup();
      const { container } = render(<DeploymentForm />);

      const nameInput = screen.getByLabelText(/deployment name/i);
      await user.type(nameInput, name);
      await user.tab(); // Trigger blur event

      if (expected) {
        // Should show error
        const error = await screen.findByText(expected);
        expect(error).toBeInTheDocument();
      } else {
        // Should not show error
        const errors = container.querySelectorAll('[role="alert"]');
        expect(errors).toHaveLength(0);
      }
    });
  });

  describe('template validation', () => {
    it('should require template selection', async () => {
      const user = userEvent.setup();
      render(<DeploymentForm />);

      // Try to submit without selecting template
      const submitBtn = screen.getByRole('button', { name: /create/i });
      await user.click(submitBtn);

      // Should show error
      const error = await screen.findByText(/template.*required/i);
      expect(error).toBeInTheDocument();
    });

    it('should accept valid template options', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<DeploymentForm onSubmit={onSubmit} />);

      const nameInput = screen.getByLabelText(/deployment name/i);
      const templateSelect = screen.getByLabelText(/template/i);
      const submitBtn = screen.getByRole('button', { name: /create/i });

      // Fill form with valid data
      await user.type(nameInput, 'test-app');
      await user.selectOptions(templateSelect, 'static-html');
      await user.click(submitBtn);

      // Should submit successfully
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'test-app',
        template: 'static-html',
      });
    });
  });

  describe('combined validation', () => {
    it('should disable submit button when form is invalid', async () => {
      const user = userEvent.setup();
      render(<DeploymentForm />);

      const submitBtn = screen.getByRole('button', { name: /create/i });

      // Initially disabled (no input)
      expect(submitBtn).toBeDisabled();

      // Still disabled with only name
      const nameInput = screen.getByLabelText(/deployment name/i);
      await user.type(nameInput, 'test-app');
      expect(submitBtn).toBeDisabled();

      // Enabled with both name and template
      const templateSelect = screen.getByLabelText(/template/i);
      await user.selectOptions(templateSelect, 'nextjs-hello-world');
      expect(submitBtn).toBeEnabled();
    });
  });
});
```

**Key Concepts:**
- Use `it.each()` for parameterized tests
- Test both valid and invalid inputs
- Test edge cases (empty, max length, special characters)
- Test form-level validation (disabled submit button)
- Test combined validation scenarios

---

## Challenge 7: Testing Error Recovery

### Problem
How do we test error recovery and retry mechanisms?

### Solution: Error Injection + State Reset Testing

```typescript
describe('Error Recovery', () => {
  it('should allow retry after deployment failure', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    // First call fails
    onSubmit.mockRejectedValueOnce(new Error('Deployment failed: Build error'));

    // Second call succeeds
    onSubmit.mockResolvedValueOnce({ id: 'dpl_123', state: 'BUILDING' });

    render(<DeploymentForm onSubmit={onSubmit} />);

    // Fill form
    await user.type(screen.getByLabelText(/deployment name/i), 'test-app');
    await user.selectOptions(screen.getByLabelText(/template/i), 'static-html');

    // Submit (fails)
    await user.click(screen.getByRole('button', { name: /create/i }));

    // Verify error message
    const error = await screen.findByRole('alert');
    expect(error).toHaveTextContent(/deployment failed/i);

    // Verify retry button appears
    const retryBtn = screen.getByRole('button', { name: /try again|retry/i });
    expect(retryBtn).toBeVisible();

    // Click retry
    await user.click(retryBtn);

    // Verify success
    const success = await screen.findByRole('status');
    expect(success).toHaveTextContent(/deployment created/i);

    // Verify onSubmit was called twice
    expect(onSubmit).toHaveBeenCalledTimes(2);
  });

  it('should allow form edit after error', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockRejectedValue(new Error('Invalid name'));

    render(<DeploymentForm onSubmit={onSubmit} />);

    // Fill and submit
    const nameInput = screen.getByLabelText(/deployment name/i);
    await user.type(nameInput, 'bad-name');
    await user.selectOptions(screen.getByLabelText(/template/i), 'static-html');
    await user.click(screen.getByRole('button', { name: /create/i }));

    // Wait for error
    await screen.findByRole('alert');

    // Verify form is still editable
    expect(nameInput).not.toBeDisabled();

    // Edit and retry
    await user.clear(nameInput);
    await user.type(nameInput, 'good-name');
    await user.click(screen.getByRole('button', { name: /create/i }));

    // Verify onSubmit called with new value
    expect(onSubmit).toHaveBeenLastCalledWith(
      expect.objectContaining({ name: 'good-name' })
    );
  });
});
```

#### E2E Error Recovery Test
```typescript
test('should recover from OAuth error and retry', async ({ page }) => {
  // First attempt: error
  await page.goto('/integrations/vercel/callback?error=access_denied');

  // Verify error message
  const error = page.getByRole('alert');
  await expect(error).toContainText(/denied|failed/i);

  // Click retry button
  const retryBtn = page.getByRole('button', { name: /try again|retry/i });
  await retryBtn.click();

  // Should redirect back to OAuth flow
  await expect(page).toHaveURL(/integrations/);

  // Find connect button
  const connectBtn = page.getByRole('button', { name: /connect vercel/i });
  await expect(connectBtn).toBeVisible();
});
```

**Key Concepts:**
- Mock sequential failures and successes
- Test retry button functionality
- Test form re-editability after error
- Test state cleanup between attempts
- Verify user can recover without refresh

---

## Summary Table

| Challenge | Solution | Test Type | Tools Used |
|-----------|----------|-----------|------------|
| Async Polling | Fake timers + sequential mocks | Unit | vi.useFakeTimers() |
| External Links | Attribute testing | Component/E2E | getAttribute() |
| Confirmation Dialogs | Role-based queries | Component/E2E | getByRole('dialog') |
| Rate Limiting | Mock 429 + headers | Unit/E2E | Headers, waitForRequest() |
| Long Operations | Progressive state mocking | Unit/E2E | Counter + timeouts |
| Form Validation | Parameterized tests | Component | it.each() |
| Error Recovery | Error injection + retry | Component/E2E | mockRejectedValue() |

---

## Best Practices Checklist

- [ ] Use fake timers for any time-based operations
- [ ] Test attributes instead of navigation for external links
- [ ] Test all dialog exit paths (confirm, cancel, close)
- [ ] Mock rate limit headers on both success and error
- [ ] Use progressive mocking for multi-step processes
- [ ] Use parameterized tests for validation scenarios
- [ ] Test error recovery and retry mechanisms
- [ ] Clean up timers with `vi.useRealTimers()`
- [ ] Use generous timeouts in E2E tests (60s max)
- [ ] Verify API calls with `waitForRequest()` in E2E tests

---

## Anti-Patterns to Avoid

### DON'T: Actually wait for async operations
```typescript
// ❌ BAD
it('should wait for deployment', async () => {
  await new Promise(resolve => setTimeout(resolve, 60000)); // Wait 1 minute
  expect(deployment.state).toBe('READY');
});

// ✅ GOOD
it('should wait for deployment', async () => {
  vi.useFakeTimers();
  const promise = waitForDeployment();
  await vi.runAllTimersAsync();
  expect(deployment.state).toBe('READY');
  vi.useRealTimers();
});
```

### DON'T: Click external links in tests
```typescript
// ❌ BAD
it('should navigate to deployment', async () => {
  await link.click(); // Opens external site!
  expect(page.url()).toContain('vercel.app');
});

// ✅ GOOD
it('should have correct deployment URL', async () => {
  const href = await link.getAttribute('href');
  expect(href).toContain('vercel.app');
});
```

### DON'T: Test implementation details
```typescript
// ❌ BAD
it('should call useState', () => {
  const spy = vi.spyOn(React, 'useState');
  render(<Component />);
  expect(spy).toHaveBeenCalled();
});

// ✅ GOOD
it('should display deployment name', () => {
  render(<Component deployment={{ name: 'test' }} />);
  expect(screen.getByText('test')).toBeVisible();
});
```

### DON'T: Rely on timing in E2E tests
```typescript
// ❌ BAD
test('should show success', async ({ page }) => {
  await button.click();
  await page.waitForTimeout(5000); // Arbitrary wait
  expect(success).toBeVisible();
});

// ✅ GOOD
test('should show success', async ({ page }) => {
  await button.click();
  const success = page.getByRole('status');
  await expect(success).toBeVisible({ timeout: 10000 });
});
```

---

## Debugging Failed Tests

### Problem: Test fails intermittently
**Solution:** Add debug output and screenshots

```typescript
test('flaky test', async ({ page }) => {
  test.setTimeout(60000); // Increase timeout

  // Take screenshot on failure
  test.info().annotations.push({
    type: 'screenshot',
    description: 'Failed state',
  });

  try {
    await expect(element).toBeVisible({ timeout: 10000 });
  } catch (error) {
    await page.screenshot({ path: 'failure.png' });
    console.log('Page URL:', page.url());
    console.log('Page content:', await page.content());
    throw error;
  }
});
```

### Problem: Mock not working
**Solution:** Verify mock setup and call order

```typescript
it('debug mock', async () => {
  const mockFn = vi.fn().mockResolvedValue('result');

  // Call the function
  await someFunction();

  // Debug: Check if mock was called
  console.log('Mock called:', mockFn.mock.calls.length);
  console.log('Mock calls:', mockFn.mock.calls);

  // Verify
  expect(mockFn).toHaveBeenCalled();
});
```

### Problem: Timing issues in unit tests
**Solution:** Verify fake timers are active

```typescript
it('debug timing', async () => {
  vi.useFakeTimers();

  // Verify timers are fake
  expect(vi.isFakeTimers()).toBe(true);

  const promise = asyncFunction();

  // Log pending timers
  console.log('Pending timers:', vi.getPendingTimers());

  await vi.runAllTimersAsync();
  await promise;

  vi.useRealTimers();
});
```

---

This document provides practical, battle-tested solutions for the most common testing challenges in the Vercel deployment features. Use it as a reference during TDD implementation.
