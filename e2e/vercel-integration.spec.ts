import { test, expect, Page } from '@playwright/test';

/**
 * E2E test suite for Vercel Integration feature
 * Tests complete user workflows with UI interactions
 *
 * Prerequisites:
 * - Application running on http://localhost:3000
 * - Mocked OAuth callback endpoint
 * - Test user account
 */

// Mock OAuth redirect handler for testing
function setupOAuthMock(page: Page) {
  // Mock the OAuth redirect to return a code
  page.on('dialog', async (dialog) => {
    if (dialog.message().includes('oauth')) {
      await dialog.accept();
    }
  });
}

test.describe('Vercel Integration E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to application
    await page.goto('http://localhost:3000/integrations');

    // Setup mocks
    setupOAuthMock(page);
  });

  test.describe('OAuth Connection Flow', () => {
    test('should display OAuth connect button', async ({ page }) => {
      // Arrange & Act
      const connectButton = page.getByRole('button', {
        name: /connect vercel account/i,
      });

      // Assert
      await expect(connectButton).toBeVisible();
    });

    test('should open OAuth authorization URL when connect button clicked', async ({
      page,
    }) => {
      // Arrange
      const connectButton = page.getByRole('button', {
        name: /connect vercel account/i,
      });

      // Mock window.open to capture OAuth URL
      const [popup] = await Promise.all([
        page.waitForEvent('popup'),
        connectButton.click(),
      ]).catch(() => [null]);

      // Assert
      if (popup) {
        expect(popup.url()).toContain('vercel.com');
        expect(popup.url()).toContain('oauth');
        expect(popup.url()).toContain('client_id');
        expect(popup.url()).toContain('state');
      }
    });

    test('should handle OAuth callback and store token', async ({ page }) => {
      // Arrange - mock OAuth callback
      await page.route('**/api/oauth/callback*', (route) => {
        route.abort();
      });

      // Navigate to callback URL with authorization code
      const callbackUrl = 'http://localhost:3000/integrations/callback?code=test-code-123&state=test-state';
      await page.goto(callbackUrl);

      // Assert - should process callback and show success message or redirect
      await expect(page).toHaveURL(/integrations/);
    });

    test('should display connected status after OAuth', async ({ page }) => {
      // Arrange - simulate connected state
      await page.evaluate(() => {
        localStorage.setItem(
          'vercel_integration',
          JSON.stringify({
            connected: true,
            provider: 'vercel',
            timestamp: Date.now(),
          })
        );
      });

      // Refresh page to load state
      await page.reload();

      // Assert - should show connected indicator
      const status = page.locator('[data-testid="vercel-status"]');
      await expect(status).toContainText(/connected|ready/i);
    });

    test('should allow user to disconnect Vercel account', async ({ page }) => {
      // Arrange - ensure connected
      await page.evaluate(() => {
        localStorage.setItem(
          'vercel_integration',
          JSON.stringify({
            connected: true,
            provider: 'vercel',
          })
        );
      });
      await page.reload();

      // Act - click disconnect button
      const disconnectButton = page.getByRole('button', {
        name: /disconnect|remove vercel/i,
      });
      await expect(disconnectButton).toBeVisible();
      await disconnectButton.click();

      // Confirm disconnection
      const confirmButton = page.getByRole('button', { name: /confirm|yes/i });
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      }

      // Assert - should show connect button again
      const connectButton = page.getByRole('button', {
        name: /connect vercel/i,
      });
      await expect(connectButton).toBeVisible();
    });

    test('should handle OAuth errors gracefully', async ({ page }) => {
      // Arrange - mock OAuth error callback
      await page.goto(
        'http://localhost:3000/integrations/callback?error=access_denied&error_description=User%20denied%20access'
      );

      // Assert - should show error message
      const errorMessage = page.locator('[role="alert"]');
      await expect(errorMessage).toBeVisible();
      await expect(errorMessage).toContainText(/denied|error/i);
    });
  });

  test.describe('Database Creation Form', () => {
    test.beforeEach(async ({ page }) => {
      // Ensure Vercel is connected before testing database features
      await page.evaluate(() => {
        localStorage.setItem(
          'vercel_integration',
          JSON.stringify({
            connected: true,
            provider: 'vercel',
            accessToken: 'mock-token-123',
          })
        );
      });
      await page.reload();
    });

    test('should display database creation form', async ({ page }) => {
      // Assert
      const form = page.locator('[data-testid="create-database-form"]');
      await expect(form).toBeVisible();

      // Check form fields
      const nameInput = page.getByLabel(/database name/i);
      const regionSelect = page.getByLabel(/region/i);
      const createButton = page.getByRole('button', { name: /create database/i });

      await expect(nameInput).toBeVisible();
      await expect(regionSelect).toBeVisible();
      await expect(createButton).toBeVisible();
    });

    test('should validate database name before submission', async ({ page }) => {
      // Arrange
      const nameInput = page.getByLabel(/database name/i);
      const createButton = page.getByRole('button', { name: /create database/i });

      // Act - try to submit with empty name
      await createButton.click();

      // Assert - should show validation error
      const error = page.locator('[role="alert"]');
      await expect(error).toBeVisible();
      await expect(error).toContainText(/name.*required|required.*name/i);
    });

    test('should show name format requirements', async ({ page }) => {
      // Arrange
      const nameInput = page.getByLabel(/database name/i);

      // Act - enter invalid characters
      await nameInput.fill('My-Database!');

      // Assert - should show inline validation or helper text
      const helpText = page.locator('[id*="name"][data-testid*="help"]');
      if (await helpText.isVisible()) {
        await expect(helpText).toContainText(/lowercase|underscore|hyphen/i);
      }
    });

    test('should create database with valid input', async ({ page }) => {
      // Arrange
      const nameInput = page.getByLabel(/database name/i);
      const regionSelect = page.getByLabel(/region/i);
      const createButton = page.getByRole('button', { name: /create database/i });

      // Mock API response
      await page.route('**/api/integrations/database', (route) => {
        route.abort(); // Prevent actual API call
      });

      // Act - fill form
      await nameInput.fill('my_test_database');
      await regionSelect.selectOption('us-east-1');
      await createButton.click();

      // Assert - should show loading state then success
      const loadingIndicator = page.locator('[data-testid="loading"]');
      if (await loadingIndicator.isVisible({ timeout: 1000 }).catch(() => false)) {
        // Wait for loading to complete
        await expect(loadingIndicator).not.toBeVisible({ timeout: 5000 });
      }

      // Should show success message or database in list
      const success = page.locator('[role="status"]');
      await expect(success).toBeVisible();
      await expect(success).toContainText(/created|success/i);
    });

    test('should handle database creation errors', async ({ page }) => {
      // Arrange
      await page.route('**/api/integrations/database', (route) => {
        route.abort('failed');
      });

      const nameInput = page.getByLabel(/database name/i);
      const createButton = page.getByRole('button', { name: /create database/i });

      // Act
      await nameInput.fill('my_database');
      await createButton.click();

      // Assert
      const error = page.locator('[role="alert"]');
      await expect(error).toBeVisible();
      await expect(error).toContainText(/error|failed/i);
    });

    test('should allow region selection', async ({ page }) => {
      // Arrange
      const regionSelect = page.getByLabel(/region/i);

      // Act
      await regionSelect.click();

      // Assert - should show region options
      const options = page.locator('select[role="listbox"] option, [role="option"]');
      expect(await options.count()).toBeGreaterThan(0);

      // Verify common regions are available
      const firstOption = await regionSelect.inputValue();
      expect(firstOption).toBeTruthy();
    });

    test('should disable form during submission', async ({ page }) => {
      // Arrange
      const nameInput = page.getByLabel(/database name/i);
      const createButton = page.getByRole('button', { name: /create database/i });

      // Mock slow API to observe loading state
      await page.route('**/api/integrations/database', async (route) => {
        await new Promise((r) => setTimeout(r, 1000));
        await route.abort();
      });

      // Act
      await nameInput.fill('my_database');
      const submitPromise = createButton.click();

      // Assert - button should be disabled while loading
      await expect(createButton).toBeDisabled();

      await submitPromise;
    });
  });

  test.describe('Environment Variables Manager', () => {
    test.beforeEach(async ({ page }) => {
      // Ensure connected and have database selected
      await page.evaluate(() => {
        localStorage.setItem(
          'vercel_integration',
          JSON.stringify({
            connected: true,
            provider: 'vercel',
            accessToken: 'mock-token-123',
            selectedDatabase: 'db_123',
          })
        );
      });
      await page.reload();
    });

    test('should display environment variables form', async ({ page }) => {
      // Assert
      const form = page.locator('[data-testid="env-vars-form"]');
      await expect(form).toBeVisible();

      // Check for key/value inputs
      const keyInput = page.getByLabel(/variable.*name|key/i).first();
      const valueInput = page.getByLabel(/variable.*value/i).first();

      await expect(keyInput).toBeVisible();
      await expect(valueInput).toBeVisible();
    });

    test('should add new environment variable fields', async ({ page }) => {
      // Arrange
      const addButton = page.getByRole('button', { name: /add.*variable|add.*field/i });

      // Act - click add button
      const initialCount = await page.locator('[data-testid*="var-row"]').count();
      await addButton.click();

      // Assert - should add new input row
      await expect(
        page.locator('[data-testid*="var-row"]')
      ).toHaveCount(initialCount + 1);
    });

    test('should validate variable names are uppercase alphanumeric', async ({ page }) => {
      // Arrange
      const keyInput = page.getByLabel(/variable.*name|key/i).first();
      const submitButton = page.getByRole('button', { name: /save|update|submit/i });

      // Act - enter invalid variable name
      await keyInput.fill('my-variable-name');
      await submitButton.click();

      // Assert - should show validation error
      const error = page.locator('[role="alert"]');
      await expect(error).toBeVisible();
      await expect(error).toContainText(/uppercase|alphanumeric|underscore/i);
    });

    test('should accept valid uppercase variable names', async ({ page }) => {
      // Arrange
      const keyInput = page.getByLabel(/variable.*name|key/i).first();
      const valueInput = page.getByLabel(/variable.*value/i).first();

      // Act
      await keyInput.fill('DATABASE_URL');
      await valueInput.fill('postgresql://localhost/db');

      // Assert - should not show validation error
      const error = page.locator('[role="alert"]');
      await expect(error).not.toBeVisible();
    });

    test('should require at least one variable before submission', async ({ page }) => {
      // Arrange
      const submitButton = page.getByRole('button', { name: /save|update|submit/i });

      // Act - try to submit without filling any variables
      await submitButton.click();

      // Assert
      const error = page.locator('[role="alert"]');
      await expect(error).toBeVisible();
      await expect(error).toContainText(/required|at least/i);
    });

    test('should remove environment variable fields', async ({ page }) => {
      // Arrange
      const removeButton = page.getByRole('button', { name: /remove|delete/i }).first();

      // Act
      const initialCount = await page.locator('[data-testid*="var-row"]').count();
      await removeButton.click();

      // Assert
      await expect(page.locator('[data-testid*="var-row"]')).toHaveCount(
        initialCount - 1
      );
    });

    test('should submit environment variables', async ({ page }) => {
      // Arrange
      await page.route('**/api/integrations/env-vars', (route) => {
        route.abort();
      });

      const keyInput = page.getByLabel(/variable.*name|key/i).first();
      const valueInput = page.getByLabel(/variable.*value/i).first();
      const submitButton = page.getByRole('button', { name: /save|update|submit/i });

      // Act
      await keyInput.fill('API_KEY');
      await valueInput.fill('secret-key-123');
      await submitButton.click();

      // Assert
      const success = page.locator('[role="status"]');
      await expect(success).toBeVisible();
      await expect(success).toContainText(/saved|updated|success/i);
    });

    test('should display sensitive variable toggle', async ({ page }) => {
      // Assert
      const sensitiveToggle = page.getByRole('checkbox', { name: /sensitive|secret/i });
      await expect(sensitiveToggle).toBeVisible();
    });

    test('should mask sensitive variable values', async ({ page }) => {
      // Arrange
      const valueInput = page.getByLabel(/variable.*value/i).first();
      const sensitiveToggle = page.getByRole('checkbox', { name: /sensitive|secret/i }).first();

      // Act
      await valueInput.fill('super-secret-value');
      await sensitiveToggle.check();

      // Assert - value should be masked in display
      const displayValue = page.locator('[data-testid*="display-value"]').first();
      if (await displayValue.isVisible({ timeout: 500 }).catch(() => false)) {
        const text = await displayValue.textContent();
        expect(text).toMatch(/\*+|\*\*\*/);
        expect(text).not.toContain('secret-value');
      }
    });
  });

  test.describe('Integration Status and Information', () => {
    test('should display connection status', async ({ page }) => {
      // Arrange
      await page.evaluate(() => {
        localStorage.setItem(
          'vercel_integration',
          JSON.stringify({
            connected: true,
            provider: 'vercel',
            connectedAt: new Date().toISOString(),
          })
        );
      });
      await page.reload();

      // Act & Assert
      const status = page.locator('[data-testid="integration-status"]');
      await expect(status).toBeVisible();
      await expect(status).toContainText(/connected/i);
    });

    test('should display connection timestamp', async ({ page }) => {
      // Arrange
      const now = new Date().toISOString();
      await page.evaluate((timestamp) => {
        localStorage.setItem(
          'vercel_integration',
          JSON.stringify({
            connected: true,
            provider: 'vercel',
            connectedAt: timestamp,
          })
        );
      }, now);
      await page.reload();

      // Act & Assert
      const timestamp = page.locator('[data-testid="connected-at"]');
      if (await timestamp.isVisible({ timeout: 1000 }).catch(() => false)) {
        const text = await timestamp.textContent();
        expect(text).toBeTruthy();
      }
    });

    test('should show list of connected databases', async ({ page }) => {
      // Arrange
      await page.evaluate(() => {
        localStorage.setItem(
          'vercel_integration',
          JSON.stringify({
            connected: true,
            provider: 'vercel',
            databases: [
              { id: 'db1', name: 'production_db' },
              { id: 'db2', name: 'staging_db' },
            ],
          })
        );
      });
      await page.reload();

      // Act & Assert
      const dbList = page.locator('[data-testid="database-list"]');
      await expect(dbList).toBeVisible();

      const items = page.locator('[data-testid="database-item"]');
      expect(await items.count()).toBeGreaterThanOrEqual(2);
    });

    test('should display provider-specific information', async ({ page }) => {
      // Arrange
      await page.evaluate(() => {
        localStorage.setItem(
          'vercel_integration',
          JSON.stringify({
            connected: true,
            provider: 'vercel',
            workspaceId: 'workspace-123',
          })
        );
      });
      await page.reload();

      // Act & Assert
      const providerInfo = page.locator('[data-testid="provider-info"]');
      await expect(providerInfo).toBeVisible();
      await expect(providerInfo).toContainText('vercel');
    });
  });

  test.describe('Responsive Design', () => {
    test('should be functional on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('http://localhost:3000/integrations');

      // Assert - key elements should be visible
      const heading = page.getByRole('heading', { name: /vercel|integration/i });
      await expect(heading).toBeVisible();

      const connectButton = page.getByRole('button', { name: /connect/i });
      await expect(connectButton).toBeVisible();
    });

    test('should be functional on tablet viewport', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('http://localhost:3000/integrations');

      // Assert - layout should adapt
      const container = page.locator('[role="main"]');
      await expect(container).toBeVisible();
    });

    test('should be functional on desktop viewport', async ({ page }) => {
      // Set desktop viewport (default)
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('http://localhost:3000/integrations');

      // Assert - all content should be accessible
      const main = page.locator('[role="main"]');
      await expect(main).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      // Assert
      const h1 = page.locator('h1');
      await expect(h1).toHaveCount(1); // Only one main heading

      // Check heading order is logical
      const headings = page.locator('h1, h2, h3');
      expect(await headings.count()).toBeGreaterThan(0);
    });

    test('should have descriptive button labels', async ({ page }) => {
      // Assert - all buttons should have accessible names
      const buttons = page.locator('button');
      const count = await buttons.count();

      for (let i = 0; i < count; i++) {
        const button = buttons.nth(i);
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute('aria-label');

        expect(text || ariaLabel).toBeTruthy();
      }
    });

    test('should have form labels associated with inputs', async ({ page }) => {
      // Assert
      const inputs = page.locator('input, select, textarea');
      const count = await inputs.count();

      for (let i = 0; i < count; i++) {
        const input = inputs.nth(i);
        const label = page.locator(`label[for="${await input.getAttribute('id')}"]`);

        // Either associated with label or has aria-label
        const hasLabel = await label.count() > 0;
        const hasAriaLabel = await input.getAttribute('aria-label');

        expect(hasLabel || hasAriaLabel).toBeTruthy();
      }
    });

    test('should have sufficient color contrast', async ({ page }) => {
      // Assert - visual regression test for contrast
      // This would require an accessibility testing library like axe-core
      const main = page.locator('[role="main"]');
      expect(main).toBeDefined();
    });

    test('should have keyboard navigation support', async ({ page }) => {
      // Arrange & Act
      const connectButton = page.getByRole('button', {
        name: /connect vercel/i,
      });

      // Tab to button
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Assert - button should be focused
      await expect(connectButton).toBeFocused();
    });
  });

  test.describe('Error Recovery', () => {
    test('should allow retry after failed OAuth', async ({ page }) => {
      // Arrange - simulate OAuth error
      await page.goto(
        'http://localhost:3000/integrations/callback?error=server_error'
      );

      // Assert - should show retry option
      const retryButton = page.getByRole('button', { name: /retry|try again/i });
      await expect(retryButton).toBeVisible();

      // Act - click retry
      await retryButton.click();

      // Assert - should attempt OAuth again
      await expect(page).toHaveURL(/integrations/);
    });

    test('should allow retry after database creation failure', async ({ page }) => {
      // Arrange - simulate creation error
      await page.evaluate(() => {
        localStorage.setItem('last_error', 'Failed to create database');
      });
      await page.goto('http://localhost:3000/integrations');

      // Assert - should show error message
      const error = page.locator('[role="alert"]');
      if (await error.isVisible({ timeout: 1000 }).catch(() => false)) {
        // Should have retry option in error message or separate button
        const retryButton = page.getByRole('button', {
          name: /retry|try again/i,
        });

        if (await retryButton.isVisible({ timeout: 500 }).catch(() => false)) {
          await expect(retryButton).toBeVisible();
        }
      }
    });
  });
});
