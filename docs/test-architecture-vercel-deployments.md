# Comprehensive Test Architecture: Vercel Deployment Features

## Overview

This document provides a complete test architecture for implementing Vercel deployment management features. All tests should be written BEFORE implementation following strict TDD principles.

---

## Table of Contents

1. [Test File Structure](#test-file-structure)
2. [Unit Tests](#unit-tests)
3. [Integration Tests](#integration-tests)
4. [E2E Tests](#e2e-tests)
5. [Test Fixtures](#test-fixtures)
6. [Test Utilities](#test-utilities)
7. [Mocking Strategies](#mocking-strategies)
8. [Testing Challenges & Solutions](#testing-challenges--solutions)

---

## Test File Structure

```
/home/gennadii/workspace/repos/blogflow/
├── lib/
│   └── integrations/
│       └── __tests__/
│           ├── fixtures/
│           │   └── vercel-api-responses.json (UPDATE)
│           └── vercel/
│               ├── deployments.test.ts (NEW)
│               └── projects.test.ts (NEW)
├── __tests__/
│   ├── api/
│   │   └── routers/
│   │       └── integrations-deployments.test.ts (NEW)
│   ├── components/
│   │   └── vercel/
│   │       ├── success-page.test.tsx (NEW)
│   │       ├── database-list.test.tsx (NEW)
│   │       ├── deployment-form.test.tsx (NEW)
│   │       └── deployment-list.test.tsx (NEW)
│   └── utils/
│       └── test-helpers.ts (UPDATE)
└── e2e/
    ├── vercel-success-flow.spec.ts (NEW)
    ├── vercel-database-management.spec.ts (NEW)
    ├── vercel-deployment-creation.spec.ts (NEW)
    └── vercel-complete-workflow.spec.ts (NEW)
```

---

## Unit Tests

### 1. Vercel Deployment Client Tests

**File:** `/home/gennadii/workspace/repos/blogflow/lib/integrations/__tests__/vercel/deployments.test.ts`

**Purpose:** Test Vercel deployment API client methods

**Test Cases:**

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { VercelProvider } from '@/lib/integrations/vercel/client';
import {
  AuthenticationError,
  RateLimitError,
  ProviderError,
} from '@/lib/integrations/types';

describe('VercelProvider - Deployments', () => {
  let provider: VercelProvider;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    provider = new VercelProvider();
    mockFetch = vi.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createDeployment()', () => {
    it('should create deployment with static HTML config', async () => {
      // Test creating deployment from static HTML template
      // Verify correct API endpoint called
      // Verify request payload structure
      // Verify response parsing
    });

    it('should create deployment with Next.js template config', async () => {
      // Test creating Next.js hello-world deployment
      // Verify template configuration in request
      // Verify Git repository handling
    });

    it('should create deployment with custom name', async () => {
      // Test deployment name validation
      // Verify name is included in request
    });

    it('should throw error for invalid deployment name', async () => {
      // Test name validation (invalid characters, length)
      // Verify error message
    });

    it('should handle rate limit errors', async () => {
      // Mock 429 response
      // Verify RateLimitError thrown
      // Verify retry-after header parsing
    });

    it('should handle authentication errors', async () => {
      // Mock 401/403 response
      // Verify AuthenticationError thrown
    });

    it('should handle deployment creation failures', async () => {
      // Mock 400/500 errors
      // Verify ProviderError thrown with details
    });
  });

  describe('getDeployment()', () => {
    it('should fetch deployment by ID', async () => {
      // Test fetching specific deployment
      // Verify correct endpoint
      // Verify response structure
    });

    it('should return deployment status correctly', async () => {
      // Test status parsing (BUILDING, READY, ERROR, CANCELED)
      // Verify status enumeration
    });

    it('should include deployment URL in response', async () => {
      // Verify URL construction
      // Verify inspector URL
    });

    it('should throw error for non-existent deployment', async () => {
      // Mock 404 response
      // Verify error handling
    });
  });

  describe('listDeployments()', () => {
    it('should list all deployments for a project', async () => {
      // Test listing deployments
      // Verify pagination handling
      // Verify response array structure
    });

    it('should return empty array when no deployments exist', async () => {
      // Test empty state
    });

    it('should filter deployments by state', async () => {
      // Test filtering (READY, BUILDING, ERROR)
      // Verify query parameters
    });

    it('should handle pagination correctly', async () => {
      // Test pagination parameters
      // Verify next/prev handling
    });
  });

  describe('listProjects()', () => {
    it('should list all Vercel projects', async () => {
      // Test project listing
      // Verify response structure
    });

    it('should return empty array when no projects exist', async () => {
      // Test empty state
    });

    it('should include project metadata', async () => {
      // Verify framework, name, ID in response
    });
  });

  describe('deleteDeployment()', () => {
    it('should delete deployment by ID', async () => {
      // Test deletion
      // Verify DELETE request
      // Verify response
    });

    it('should return true on successful deletion', async () => {
      // Verify success response
    });

    it('should return false for non-existent deployment', async () => {
      // Test 404 handling
    });

    it('should throw error for forbidden deletion', async () => {
      // Test 403 handling
    });
  });

  describe('waitForDeploymentReady()', () => {
    it('should poll deployment until READY status', async () => {
      // Test polling logic
      // Use fake timers
      // Verify multiple API calls
    });

    it('should return immediately if already READY', async () => {
      // Test early return
    });

    it('should throw error on ERROR status', async () => {
      // Test error state handling
    });

    it('should throw error on CANCELED status', async () => {
      // Test canceled deployment
    });

    it('should timeout after maximum wait time', async () => {
      // Test timeout (default 10 minutes)
      // Use fake timers
    });

    it('should use custom timeout when provided', async () => {
      // Test custom timeout parameter
    });

    it('should respect polling interval', async () => {
      // Test 5-second polling interval
      // Verify timing between requests
    });
  });
});
```

**Key Testing Patterns:**

- Use `vi.fn()` to mock `fetch` globally
- Mock API responses with realistic fixtures
- Test both happy paths and error scenarios
- Use `vi.useFakeTimers()` for polling tests
- Verify rate limit tracking via response headers

---

### 2. Vercel Projects Client Tests

**File:** `/home/gennadii/workspace/repos/blogflow/lib/integrations/__tests__/vercel/projects.test.ts`

**Purpose:** Test project-specific API methods

**Test Cases:**

```typescript
describe('VercelProvider - Projects', () => {
  describe('getProject()', () => {
    it('should fetch project by ID', async () => {
      // Test project fetching
      // Verify response structure
    });

    it('should include latest deployment info', async () => {
      // Verify deployment metadata
    });

    it('should throw error for non-existent project', async () => {
      // Test 404 handling
    });
  });

  describe('getProjectEnvVars()', () => {
    it('should fetch environment variables for project', async () => {
      // Test env var listing
      // Verify encrypted values are masked
    });

    it('should handle empty env vars', async () => {
      // Test empty state
    });
  });
});
```

---

### 3. oRPC Deployment Procedures Tests

**File:** `/home/gennadii/workspace/repos/blogflow/__tests__/api/routers/integrations-deployments.test.ts`

**Purpose:** Test oRPC API procedures for deployment management

**Test Cases:**

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { integrationsRouter } from '@/lib/api/routers/integrations';
import { db, integrations } from '@/lib/db';
import { encrypt } from '@/lib/integrations/encryption';
import { nanoid } from 'nanoid';

describe('Integrations Router - Deployments', () => {
  let mockUserId: string;
  let mockIntegrationId: string;
  let mockAccessToken: string;

  beforeEach(async () => {
    // Setup test user and integration
    mockUserId = nanoid();
    mockAccessToken = 'test-access-token';

    const encrypted = encrypt(mockAccessToken);
    const [integration] = await db
      .insert(integrations)
      .values({
        id: nanoid(),
        userId: mockUserId,
        provider: 'vercel',
        accessToken: encrypted.encrypted,
        accessTokenIv: encrypted.iv,
        accessTokenAuthTag: encrypted.authTag,
        metadata: null,
      })
      .returning();

    mockIntegrationId = integration.id;
  });

  afterEach(async () => {
    // Cleanup test data
    await db.delete(integrations).where(eq(integrations.userId, mockUserId));
  });

  describe('createVercelDeployment', () => {
    it('should create deployment with authentication', async () => {
      // Test authenticated deployment creation
      // Verify input validation
      // Verify access token decryption
      // Verify deployment result
    });

    it('should validate deployment name format', async () => {
      // Test Zod schema validation
      // Invalid characters should fail
      // Name too long should fail
    });

    it('should validate template selection', async () => {
      // Test template enum validation
      // Only 'static-html' and 'nextjs-hello-world' allowed
    });

    it('should require valid integration ID', async () => {
      // Test with invalid integration ID
      // Should throw error
    });

    it('should enforce user ownership of integration', async () => {
      // Test with different user's integration
      // Should throw authorization error
    });

    it('should handle Vercel API errors gracefully', async () => {
      // Mock provider error
      // Verify error propagation
    });

    it('should handle rate limit errors', async () => {
      // Mock rate limit error
      // Verify error response includes retry info
    });
  });

  describe('getVercelDeploymentStatus', () => {
    it('should fetch deployment status', async () => {
      // Test status fetching
      // Verify authentication
    });

    it('should return deployment URL when ready', async () => {
      // Test READY status response
      // Verify URL included
    });

    it('should return build logs URL when building', async () => {
      // Test BUILDING status
      // Verify inspector URL
    });

    it('should require authentication', async () => {
      // Test without auth
      // Should throw error
    });

    it('should enforce integration ownership', async () => {
      // Test with wrong user
      // Should fail
    });
  });

  describe('listVercelDeployments', () => {
    it('should list deployments for authenticated user', async () => {
      // Test listing
      // Verify auth check
    });

    it('should filter deployments by project', async () => {
      // Test projectId filter
      // Verify query parameter
    });

    it('should support pagination', async () => {
      // Test limit/offset
      // Verify pagination params
    });

    it('should return empty array when no deployments', async () => {
      // Test empty state
    });

    it('should require valid integration ID', async () => {
      // Test with invalid ID
    });
  });

  describe('listVercelProjects', () => {
    it('should list all projects for authenticated user', async () => {
      // Test project listing
      // Verify auth
    });

    it('should return empty array when no projects', async () => {
      // Test empty state
    });

    it('should include project metadata', async () => {
      // Verify framework, name, createdAt
    });
  });

  describe('deleteVercelDeployment', () => {
    it('should delete deployment with authentication', async () => {
      // Test deletion
      // Verify auth check
    });

    it('should require confirmation parameter', async () => {
      // Test that confirmation is required
      // Schema validation
    });

    it('should return success on deletion', async () => {
      // Verify success response
    });

    it('should handle non-existent deployment gracefully', async () => {
      // Test 404 scenario
    });

    it('should enforce integration ownership', async () => {
      // Test authorization
    });
  });
});
```

**Key Testing Patterns:**

- Use actual database for integration tests
- Test authentication via `protectedProcedure`
- Test authorization (user owns integration)
- Verify Zod input validation
- Test token encryption/decryption
- Mock `VercelProvider` methods to avoid external API calls

---

### 4. Component Unit Tests

#### 4.1 Success Page Component

**File:** `/home/gennadii/workspace/repos/blogflow/__tests__/components/vercel/success-page.test.tsx`

**Test Cases:**

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SuccessPage from '@/app/integrations/vercel/success/page';

describe('Vercel Success Page', () => {
  it('should render welcome message', () => {
    // Test heading and success message
  });

  it('should display navigation cards', () => {
    // Test "Manage Databases" and "Create Deployment" cards
  });

  it('should have links to test page sections', () => {
    // Test anchor links with fragment identifiers
  });

  it('should render "Continue to Dashboard" button', () => {
    // Test button presence
  });

  it('should link to integrations page', () => {
    // Test navigation link
  });
});
```

#### 4.2 Database List Component

**File:** `/home/gennadii/workspace/repos/blogflow/__tests__/components/vercel/database-list.test.tsx`

**Test Cases:**

```typescript
describe('Database List Component', () => {
  it('should display empty state when no databases', () => {
    // Test empty state message
  });

  it('should render database cards', () => {
    // Test database display with name, region, status
  });

  it('should display status badges', () => {
    // Test "Creating", "Ready", "Error" badges
  });

  it('should show delete button for each database', () => {
    // Test delete button presence
  });

  it('should open confirmation dialog on delete', () => {
    // Test modal opening
  });

  it('should cancel deletion when dialog is dismissed', () => {
    // Test cancel action
  });

  it('should call delete API when confirmed', () => {
    // Test actual deletion
  });

  it('should show loading state during deletion', () => {
    // Test loading indicator
  });

  it('should show error message on deletion failure', () => {
    // Test error handling
  });

  it('should refresh list after successful deletion', () => {
    // Test list update
  });

  it('should display connection string (masked)', () => {
    // Test sensitive data masking
  });

  it('should have refresh button', () => {
    // Test manual refresh
  });
});
```

#### 4.3 Deployment Form Component

**File:** `/home/gennadii/workspace/repos/blogflow/__tests__/components/vercel/deployment-form.test.tsx`

**Test Cases:**

```typescript
describe('Deployment Form Component', () => {
  it('should render template selector', () => {
    // Test dropdown/radio for templates
  });

  it('should render deployment name input', () => {
    // Test name field
  });

  it('should validate name on blur', () => {
    // Test validation message
  });

  it('should disable submit when form is invalid', () => {
    // Test button state
  });

  it('should show template descriptions', () => {
    // Test help text for each template
  });

  it('should submit form with valid data', () => {
    // Test submission
  });

  it('should show loading state during submission', () => {
    // Test loading indicator
  });

  it('should show success message after creation', () => {
    // Test success notification
  });

  it('should show error message on failure', () => {
    // Test error handling
  });

  it('should reset form after successful submission', () => {
    // Test form reset
  });
});
```

#### 4.4 Deployment List Component

**File:** `/home/gennadii/workspace/repos/blogflow/__tests__/components/vercel/deployment-list.test.tsx`

**Test Cases:**

```typescript
describe('Deployment List Component', () => {
  it('should display empty state when no deployments', () => {
    // Test empty message
  });

  it('should render deployment table', () => {
    // Test table structure
  });

  it('should show deployment name in table', () => {
    // Test column rendering
  });

  it('should show deployment status with badge', () => {
    // Test status badges (Building, Ready, Error)
  });

  it('should show deployment URL as clickable link', () => {
    // Test link opens in new tab
  });

  it('should show Vercel inspector link', () => {
    // Test inspector URL
  });

  it('should show created timestamp', () => {
    // Test date formatting
  });

  it('should poll status for BUILDING deployments', () => {
    // Test auto-refresh
  });

  it('should stop polling when deployment is READY', () => {
    // Test polling termination
  });

  it('should show error details for ERROR status', () => {
    // Test error message display
  });

  it('should have refresh button', () => {
    // Test manual refresh
  });
});
```

---

## Integration Tests

### Complete Workflow Test

**File:** `/home/gennadii/workspace/repos/blogflow/__tests__/integration/vercel-deployment-workflow.test.ts`

**Purpose:** Test complete deployment workflow with database integration

**Test Cases:**

```typescript
import { describe, it, expect, beforeEach } from 'vitest';

describe('Vercel Deployment Integration Workflow', () => {
  beforeEach(() => {
    // Setup test database
    // Create test user
    // Create test integration
  });

  it('should complete deployment creation workflow', async () => {
    // Step 1: User navigates to success page
    // Step 2: User clicks "Create Deployment"
    // Step 3: User selects template
    // Step 4: User enters deployment name
    // Step 5: User submits form
    // Step 6: Deployment is created
    // Step 7: Status shows "Building"
    // Step 8: Status updates to "Ready"
    // Step 9: Deployment URL is displayed
  });

  it('should complete database management workflow', async () => {
    // Step 1: User views database list
    // Step 2: User creates database
    // Step 3: Database appears in list
    // Step 4: User refreshes list
    // Step 5: User deletes database
    // Step 6: Database removed from list
  });

  it('should handle concurrent deployments', async () => {
    // Create multiple deployments simultaneously
    // Verify all are created
    // Verify status polling works for all
  });
});
```

---

## E2E Tests

### 1. Success Flow E2E Test

**File:** `/home/gennadii/workspace/repos/blogflow/e2e/vercel-success-flow.spec.ts`

**Purpose:** Test OAuth completion and navigation to success page

**Test Cases:**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Vercel Integration Success Flow', () => {
  test('should redirect to success page after OAuth', async ({ page }) => {
    // Complete OAuth flow
    // Verify redirect to /integrations/vercel/success
    // Verify success message displays
  });

  test('should navigate to database section', async ({ page }) => {
    await page.goto('/integrations/vercel/success');

    // Click "Manage Databases" card
    await page.getByRole('link', { name: /manage databases/i }).click();

    // Verify navigation to test page with database section visible
    await expect(page).toHaveURL(/integrations\/test#databases/);
  });

  test('should navigate to deployment section', async ({ page }) => {
    await page.goto('/integrations/vercel/success');

    // Click "Create Deployment" card
    await page.getByRole('link', { name: /create deployment/i }).click();

    // Verify navigation
    await expect(page).toHaveURL(/integrations\/test#deployments/);
  });

  test('should navigate to dashboard', async ({ page }) => {
    await page.goto('/integrations/vercel/success');

    // Click "Continue to Dashboard"
    await page.getByRole('button', { name: /continue to dashboard/i }).click();

    // Verify navigation
    await expect(page).toHaveURL(/dashboard/);
  });
});
```

---

### 2. Database Management E2E Test

**File:** `/home/gennadii/workspace/repos/blogflow/e2e/vercel-database-management.spec.ts`

**Purpose:** Test complete database CRUD operations

**Test Cases:**

```typescript
test.describe('Vercel Database Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login and navigate to test page
    await page.goto('/integrations/test');
  });

  test('should display empty database list', async ({ page }) => {
    // Verify empty state message
    const emptyState = page.getByText(/no databases found/i);
    await expect(emptyState).toBeVisible();
  });

  test('should create database', async ({ page }) => {
    // Fill database creation form
    await page.getByLabel(/database name/i).fill('test_database');
    await page.getByLabel(/region/i).selectOption('us-east-1');

    // Submit form
    await page.getByRole('button', { name: /create database/i }).click();

    // Verify success message
    const success = page.getByRole('status', { name: /success/i });
    await expect(success).toBeVisible();

    // Verify database appears in list
    const dbCard = page.getByText('test_database');
    await expect(dbCard).toBeVisible();
  });

  test('should refresh database list', async ({ page }) => {
    // Click refresh button
    await page.getByRole('button', { name: /refresh/i }).click();

    // Verify loading indicator
    const loading = page.getByTestId('loading');
    await expect(loading).toBeVisible();

    // Verify list reloads
    await expect(loading).not.toBeVisible();
  });

  test('should delete database with confirmation', async ({ page }) => {
    // Create a database first
    // ... (database creation steps)

    // Click delete button
    await page.getByRole('button', { name: /delete/i }).first().click();

    // Verify confirmation dialog
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Confirm deletion
    await page.getByRole('button', { name: /confirm|yes/i }).click();

    // Verify database removed
    await expect(page.getByText('test_database')).not.toBeVisible();
  });

  test('should cancel database deletion', async ({ page }) => {
    // Create database
    // Click delete
    // Click cancel in dialog
    // Verify database still exists
  });
});
```

---

### 3. Deployment Creation E2E Test

**File:** `/home/gennadii/workspace/repos/blogflow/e2e/vercel-deployment-creation.spec.ts`

**Purpose:** Test deployment creation and status monitoring

**Test Cases:**

```typescript
test.describe('Vercel Deployment Creation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/integrations/test#deployments');
  });

  test('should create static HTML deployment', async ({ page }) => {
    // Select "Static HTML" template
    await page.getByLabel(/template/i).selectOption('static-html');

    // Enter deployment name
    await page.getByLabel(/deployment name/i).fill('my-static-site');

    // Submit form
    await page.getByRole('button', { name: /create deployment/i }).click();

    // Verify success notification
    const success = page.getByRole('status');
    await expect(success).toContainText(/deployment created/i);

    // Verify deployment appears in list
    const deployment = page.getByText('my-static-site');
    await expect(deployment).toBeVisible();
  });

  test('should create Next.js deployment', async ({ page }) => {
    // Select "Next.js Hello World" template
    await page.getByLabel(/template/i).selectOption('nextjs-hello-world');

    // Enter name
    await page.getByLabel(/deployment name/i).fill('my-nextjs-app');

    // Submit
    await page.getByRole('button', { name: /create/i }).click();

    // Verify creation
    await expect(page.getByText('my-nextjs-app')).toBeVisible();
  });

  test('should display building status initially', async ({ page }) => {
    // Create deployment
    // Verify status badge shows "Building"
    const status = page.locator('[data-testid="deployment-status"]').first();
    await expect(status).toContainText(/building/i);
  });

  test('should poll status until ready', async ({ page }) => {
    // Create deployment
    // Wait for status to change to "Ready"
    const status = page.locator('[data-testid="deployment-status"]').first();

    // Should eventually show "Ready" (polling)
    await expect(status).toContainText(/ready/i, { timeout: 60000 });
  });

  test('should display deployment URL when ready', async ({ page }) => {
    // Create deployment
    // Wait for Ready status
    // Verify URL is clickable link
    const urlLink = page.getByRole('link', { name: /view deployment/i });
    await expect(urlLink).toBeVisible();
    await expect(urlLink).toHaveAttribute('href', /vercel\.app/);
  });

  test('should display Vercel inspector link', async ({ page }) => {
    // Create deployment
    // Verify inspector link
    const inspectorLink = page.getByRole('link', { name: /inspector/i });
    await expect(inspectorLink).toBeVisible();
    await expect(inspectorLink).toHaveAttribute('target', '_blank');
  });

  test('should handle deployment errors', async ({ page }) => {
    // Mock API to return error
    await page.route('**/api/integrations/deployments', (route) => {
      route.fulfill({
        status: 400,
        body: JSON.stringify({ error: 'Deployment failed' }),
      });
    });

    // Try to create deployment
    await page.getByLabel(/template/i).selectOption('static-html');
    await page.getByLabel(/deployment name/i).fill('test');
    await page.getByRole('button', { name: /create/i }).click();

    // Verify error message
    const error = page.getByRole('alert');
    await expect(error).toContainText(/failed/i);
  });
});
```

---

### 4. Complete Workflow E2E Test

**File:** `/home/gennadii/workspace/repos/blogflow/e2e/vercel-complete-workflow.spec.ts`

**Purpose:** Test end-to-end user journey from OAuth to deployment

**Test Cases:**

```typescript
test.describe('Complete Vercel Integration Workflow', () => {
  test('should complete full integration setup', async ({ page }) => {
    // Step 1: OAuth connection
    await page.goto('/integrations');
    await page.getByRole('button', { name: /connect vercel/i }).click();

    // Mock OAuth callback
    await page.goto('/integrations/vercel/callback?code=test-code&state=test');

    // Step 2: Success page
    await expect(page).toHaveURL(/success/);
    await expect(page.getByText(/connected successfully/i)).toBeVisible();

    // Step 3: Navigate to database management
    await page.getByRole('link', { name: /manage databases/i }).click();

    // Step 4: Create database
    await page.getByLabel(/database name/i).fill('production_db');
    await page.getByRole('button', { name: /create database/i }).click();

    // Verify database created
    await expect(page.getByText('production_db')).toBeVisible();

    // Step 5: Navigate to deployments
    await page.goto('/integrations/test#deployments');

    // Step 6: Create deployment
    await page.getByLabel(/template/i).selectOption('nextjs-hello-world');
    await page.getByLabel(/deployment name/i).fill('my-app');
    await page.getByRole('button', { name: /create/i }).click();

    // Step 7: Verify deployment list
    await expect(page.getByText('my-app')).toBeVisible();

    // Step 8: Wait for deployment ready
    const status = page.locator('[data-testid="deployment-status"]').first();
    await expect(status).toContainText(/ready/i, { timeout: 60000 });

    // Step 9: Verify deployment URL
    const urlLink = page.getByRole('link', { name: /view deployment/i });
    await expect(urlLink).toBeVisible();

    // Step 10: Clean up - delete database
    await page.goto('/integrations/test#databases');
    await page.getByRole('button', { name: /delete/i }).first().click();
    await page.getByRole('button', { name: /confirm/i }).click();
    await expect(page.getByText('production_db')).not.toBeVisible();
  });
});
```

---

## Test Fixtures

### Update Fixture File

**File:** `/home/gennadii/workspace/repos/blogflow/lib/integrations/__tests__/fixtures/vercel-api-responses.json`

**Add the following to existing file:**

```json
{
  "deployments": {
    "create": {
      "staticHtml": {
        "id": "dpl_abc123def456",
        "name": "my-static-site",
        "url": "my-static-site-abc123.vercel.app",
        "state": "BUILDING",
        "createdAt": "2024-11-01T10:00:00Z",
        "creator": {
          "uid": "user_abc123"
        },
        "inspectorUrl": "https://vercel.com/username/my-static-site/dpl_abc123def456"
      },
      "nextjsHelloWorld": {
        "id": "dpl_xyz789uvw123",
        "name": "my-nextjs-app",
        "url": "my-nextjs-app-xyz789.vercel.app",
        "state": "BUILDING",
        "createdAt": "2024-11-01T10:05:00Z",
        "creator": {
          "uid": "user_abc123"
        },
        "inspectorUrl": "https://vercel.com/username/my-nextjs-app/dpl_xyz789uvw123"
      }
    },
    "get": {
      "building": {
        "id": "dpl_abc123def456",
        "name": "my-static-site",
        "url": "my-static-site-abc123.vercel.app",
        "state": "BUILDING",
        "createdAt": "2024-11-01T10:00:00Z",
        "inspectorUrl": "https://vercel.com/username/my-static-site/dpl_abc123def456"
      },
      "ready": {
        "id": "dpl_abc123def456",
        "name": "my-static-site",
        "url": "https://my-static-site-abc123.vercel.app",
        "state": "READY",
        "createdAt": "2024-11-01T10:00:00Z",
        "readyAt": "2024-11-01T10:02:30Z",
        "inspectorUrl": "https://vercel.com/username/my-static-site/dpl_abc123def456"
      },
      "error": {
        "id": "dpl_abc123def456",
        "name": "my-static-site",
        "url": "my-static-site-abc123.vercel.app",
        "state": "ERROR",
        "createdAt": "2024-11-01T10:00:00Z",
        "errorMessage": "Build failed: Missing required file",
        "inspectorUrl": "https://vercel.com/username/my-static-site/dpl_abc123def456"
      },
      "canceled": {
        "id": "dpl_abc123def456",
        "name": "my-static-site",
        "state": "CANCELED",
        "createdAt": "2024-11-01T10:00:00Z",
        "canceledAt": "2024-11-01T10:01:00Z"
      }
    },
    "list": {
      "success": {
        "deployments": [
          {
            "id": "dpl_abc123",
            "name": "my-app-production",
            "url": "https://my-app-production.vercel.app",
            "state": "READY",
            "createdAt": "2024-10-30T10:00:00Z"
          },
          {
            "id": "dpl_xyz789",
            "name": "my-app-staging",
            "url": "https://my-app-staging.vercel.app",
            "state": "READY",
            "createdAt": "2024-10-29T14:30:00Z"
          },
          {
            "id": "dpl_uvw456",
            "name": "my-app-preview",
            "url": "https://my-app-preview.vercel.app",
            "state": "BUILDING",
            "createdAt": "2024-11-01T09:00:00Z"
          }
        ],
        "pagination": {
          "count": 3,
          "next": null,
          "prev": null
        }
      },
      "empty": {
        "deployments": [],
        "pagination": {
          "count": 0
        }
      }
    },
    "delete": {
      "success": {
        "state": "DELETED",
        "uid": "dpl_abc123def456"
      },
      "notFound": {
        "error": {
          "code": "NOT_FOUND",
          "message": "Deployment not found"
        }
      }
    }
  },
  "projects": {
    "listDeployments": {
      "success": {
        "deployments": [
          {
            "id": "dpl_abc123",
            "name": "deployment-1",
            "state": "READY",
            "createdAt": "2024-10-30T10:00:00Z"
          },
          {
            "id": "dpl_xyz789",
            "name": "deployment-2",
            "state": "BUILDING",
            "createdAt": "2024-11-01T09:00:00Z"
          }
        ]
      }
    }
  }
}
```

---

## Test Utilities

### Test Helper Functions

**File:** `/home/gennadii/workspace/repos/blogflow/__tests__/utils/test-helpers.ts`

**Add these utilities:**

```typescript
import { vi } from 'vitest';
import type { Page } from '@playwright/test';

/**
 * Mock Vercel API responses for E2E tests
 */
export function mockVercelDeploymentAPI(page: Page) {
  // Mock deployment creation
  page.route('**/api/integrations/deployments', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          id: 'dpl_test123',
          name: 'test-deployment',
          state: 'BUILDING',
          url: 'test-deployment.vercel.app',
        }),
      });
    } else if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          deployments: [],
        }),
      });
    }
  });

  // Mock deployment status polling
  page.route('**/api/integrations/deployments/*', async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify({
        id: 'dpl_test123',
        state: 'READY',
        url: 'https://test-deployment.vercel.app',
      }),
    });
  });
}

/**
 * Mock authenticated session for E2E tests
 */
export async function mockAuthSession(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem(
      'vercel_integration',
      JSON.stringify({
        connected: true,
        integrationId: 'int_test123',
        provider: 'vercel',
      })
    );
  });
}

/**
 * Wait for deployment status to change
 */
export async function waitForDeploymentStatus(
  page: Page,
  deploymentId: string,
  expectedStatus: 'BUILDING' | 'READY' | 'ERROR',
  timeoutMs = 60000
) {
  const statusLocator = page.locator(
    `[data-deployment-id="${deploymentId}"] [data-testid="deployment-status"]`
  );

  await statusLocator.waitFor({ state: 'visible', timeout: timeoutMs });
  await expect(statusLocator).toContainText(expectedStatus, {
    timeout: timeoutMs,
  });
}

/**
 * Create mock Vercel provider for unit tests
 */
export function createMockVercelProvider() {
  return {
    createDeployment: vi.fn(),
    getDeployment: vi.fn(),
    listDeployments: vi.fn(),
    listProjects: vi.fn(),
    deleteDeployment: vi.fn(),
    waitForDeploymentReady: vi.fn(),
  };
}

/**
 * Load fixture data
 */
export function loadFixture(path: string) {
  const fixtures = require('../lib/integrations/__tests__/fixtures/vercel-api-responses.json');

  // Navigate nested path (e.g., 'deployments.create.staticHtml')
  const parts = path.split('.');
  let result = fixtures;
  for (const part of parts) {
    result = result[part];
  }
  return result;
}
```

---

## Mocking Strategies

### 1. Mocking Fetch for Unit Tests

```typescript
// Mock global fetch
beforeEach(() => {
  global.fetch = vi.fn();
});

// Mock successful response
(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
  ok: true,
  status: 200,
  headers: new Headers({
    'x-ratelimit-limit': '100',
    'x-ratelimit-remaining': '99',
    'x-ratelimit-reset': String(Date.now() + 3600000),
  }),
  json: async () => loadFixture('deployments.create.staticHtml'),
});

// Mock error response
(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
  ok: false,
  status: 429,
  headers: new Headers(),
  json: async () => ({
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Rate limit exceeded',
    },
  }),
});
```

### 2. Mocking Database for Integration Tests

```typescript
import { db, integrations } from '@/lib/db';
import { vi } from 'vitest';

// Mock database query
vi.spyOn(db.query.integrations, 'findFirst').mockResolvedValueOnce({
  id: 'int_123',
  userId: 'user_123',
  provider: 'vercel',
  accessToken: 'encrypted_token',
  accessTokenIv: 'iv',
  accessTokenAuthTag: 'tag',
});
```

### 3. Mocking Vercel Provider for oRPC Tests

```typescript
import { VercelProvider } from '@/lib/integrations/vercel/client';
import { vi } from 'vitest';

// Mock provider methods
vi.spyOn(VercelProvider.prototype, 'createDeployment').mockResolvedValueOnce(
  loadFixture('deployments.create.staticHtml')
);

vi.spyOn(VercelProvider.prototype, 'getDeployment').mockResolvedValueOnce(
  loadFixture('deployments.get.ready')
);
```

### 4. Mocking Playwright Routes for E2E Tests

```typescript
// Mock API endpoint
await page.route('**/api/integrations/deployments', async (route) => {
  if (route.request().method() === 'POST') {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(loadFixture('deployments.create.staticHtml')),
    });
  }
});

// Mock multiple responses for polling
let callCount = 0;
await page.route('**/api/integrations/deployments/dpl_*', async (route) => {
  callCount++;
  const fixture =
    callCount < 3
      ? loadFixture('deployments.get.building')
      : loadFixture('deployments.get.ready');

  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(fixture),
  });
});
```

---

## Testing Challenges & Solutions

### Challenge 1: Testing Async Status Polling

**Problem:** Deployments take time to build. How do we test status polling without waiting minutes?

**Solution:**

```typescript
import { vi } from 'vitest';

describe('waitForDeploymentReady()', () => {
  it('should poll deployment until READY status', async () => {
    vi.useFakeTimers();

    // Mock API responses: BUILDING -> BUILDING -> READY
    const mockFetch = vi.fn();
    global.fetch = mockFetch;

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ state: 'BUILDING' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ state: 'BUILDING' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ state: 'READY' }),
      });

    const provider = new VercelProvider();
    const promise = provider.waitForDeploymentReady('dpl_123', 'token');

    // Fast-forward through polling intervals
    await vi.runAllTimersAsync();

    const result = await promise;

    expect(result.state).toBe('READY');
    expect(mockFetch).toHaveBeenCalledTimes(3);

    vi.useRealTimers();
  });
});
```

### Challenge 2: Testing External Links Without Visiting Them

**Problem:** We want to verify deployment URLs are correct without actually navigating to Vercel.

**Solution:**

```typescript
test('should display deployment URL without visiting', async ({ page }) => {
  // Find the link
  const urlLink = page.getByRole('link', { name: /view deployment/i });

  // Verify link exists and has correct attributes
  await expect(urlLink).toBeVisible();
  await expect(urlLink).toHaveAttribute('href', /vercel\.app/);
  await expect(urlLink).toHaveAttribute('target', '_blank');
  await expect(urlLink).toHaveAttribute('rel', /noopener noreferrer/);

  // Don't actually click the link
  // Instead verify the href value
  const href = await urlLink.getAttribute('href');
  expect(href).toMatch(/^https:\/\/.+\.vercel\.app$/);
});
```

### Challenge 3: Testing Confirmation Dialogs

**Problem:** How do we test delete confirmation modals reliably?

**Solution:**

```typescript
test('should delete database with confirmation', async ({ page }) => {
  // Click delete button
  const deleteButton = page
    .locator('[data-testid="database-card"]')
    .first()
    .getByRole('button', { name: /delete/i });
  await deleteButton.click();

  // Wait for dialog to appear
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  // Verify dialog content
  await expect(dialog).toContainText(/are you sure/i);
  await expect(dialog).toContainText(/cannot be undone/i);

  // Find and click confirmation button
  const confirmButton = dialog.getByRole('button', { name: /confirm|yes|delete/i });
  await confirmButton.click();

  // Verify dialog closes
  await expect(dialog).not.toBeVisible();

  // Verify deletion API was called
  const apiRequest = page.waitForRequest(
    (req) => req.url().includes('/api/integrations/databases') && req.method() === 'DELETE'
  );
  expect(apiRequest).toBeDefined();
});
```

### Challenge 4: Testing Rate Limit Handling

**Problem:** How do we test rate limit errors without actually hitting rate limits?

**Solution:**

```typescript
it('should handle rate limit errors with retry info', async () => {
  const resetTime = Date.now() + 60000; // 1 minute from now

  // Mock rate limit response
  (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
    ok: false,
    status: 429,
    headers: new Headers({
      'x-ratelimit-limit': '100',
      'x-ratelimit-remaining': '0',
      'x-ratelimit-reset': String(Math.floor(resetTime / 1000)),
    }),
    json: async () => ({
      error: {
        code: 'TOO_MANY_REQUESTS',
        message: 'Rate limit exceeded',
      },
    }),
  });

  const provider = new VercelProvider();

  await expect(provider.createDeployment({ name: 'test' }, 'token')).rejects.toThrow(
    RateLimitError
  );

  // Verify rate limit info is tracked
  const rateLimitInfo = provider.getRateLimitInfo();
  expect(rateLimitInfo).toMatchObject({
    limit: 100,
    remaining: 0,
    reset: Math.floor(resetTime / 1000),
  });
});
```

### Challenge 5: Testing Long-Running Deployments

**Problem:** Deployments can take 5-10 minutes. How do we test without waiting?

**Solution:**

```typescript
test('should handle long-running deployments', async ({ page }) => {
  // Mock deployment status to simulate slow build
  let pollCount = 0;
  await page.route('**/api/integrations/deployments/dpl_*', async (route) => {
    pollCount++;

    // First 5 polls: BUILDING
    // 6th poll: READY
    const state = pollCount < 6 ? 'BUILDING' : 'READY';

    await route.fulfill({
      status: 200,
      body: JSON.stringify({
        id: 'dpl_123',
        state,
        url: state === 'READY' ? 'https://test.vercel.app' : 'test.vercel.app',
      }),
    });
  });

  // Create deployment
  await page.getByLabel(/deployment name/i).fill('test-app');
  await page.getByRole('button', { name: /create/i }).click();

  // Verify status shows "Building" initially
  const status = page.locator('[data-testid="deployment-status"]').first();
  await expect(status).toContainText(/building/i);

  // Wait for status to change to "Ready" (with timeout)
  await expect(status).toContainText(/ready/i, {
    timeout: 60000, // Max 60 seconds in test
  });

  // Verify URL is now visible
  const urlLink = page.getByRole('link', { name: /view/i });
  await expect(urlLink).toBeVisible();
});
```

---

## Test Execution Order

### Recommended Testing Sequence

1. **Unit Tests First**
   - Test Vercel provider methods
   - Test type definitions
   - Test utility functions
   - All tests should FAIL initially (Red phase)

2. **Integration Tests Second**
   - Test oRPC procedures
   - Test database integration
   - Test authentication flow
   - Implement just enough to pass (Green phase)

3. **Component Tests Third**
   - Test UI components in isolation
   - Test form validation
   - Test event handlers
   - Refactor components (Refactor phase)

4. **E2E Tests Last**
   - Test complete user workflows
   - Test browser interactions
   - Test responsive design
   - Final validation (Green phase maintained)

---

## Coverage Goals

### Minimum Coverage Requirements

- **Unit Tests:** 90%+ coverage
  - All provider methods tested
  - All error scenarios covered
  - All validation logic tested

- **Integration Tests:** 80%+ coverage
  - All oRPC procedures tested
  - Authentication tested
  - Authorization tested

- **Component Tests:** 85%+ coverage
  - All user interactions tested
  - All UI states tested
  - All validation messages tested

- **E2E Tests:** Critical paths only
  - OAuth success flow
  - Database CRUD operations
  - Deployment creation
  - Status monitoring

---

## Running Tests

### Commands

```bash
# Run all unit and integration tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage report
pnpm test:coverage

# Run E2E tests
pnpm test:e2e

# Run E2E tests in UI mode
pnpm test:e2e:ui

# Run specific test file
pnpm test deployments.test.ts

# Run tests for specific pattern
pnpm test vercel
```

### CI/CD Integration

Tests should run in this order in CI:

1. Lint and type check
2. Unit tests
3. Integration tests
4. Build application
5. E2E tests (against built application)

---

## Summary

This test architecture provides:

- **Comprehensive Coverage:** Unit, integration, component, and E2E tests
- **TDD-First Approach:** Write tests before implementation
- **Realistic Mocking:** Use fixtures that match actual Vercel API responses
- **Async Testing:** Strategies for polling and long-running operations
- **Error Scenarios:** Test rate limits, auth errors, and failures
- **User Workflows:** Complete E2E journeys from OAuth to deployment

All tests should be written and FAILING before any implementation code is written. This ensures we're building exactly what the tests specify and prevents over-engineering.
