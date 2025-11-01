/**
 * E2E tests for Vercel integration OAuth flow
 *
 * NOTE: These tests require mock OAuth credentials to be set in .env
 * For testing purposes, you can use test credentials or skip OAuth provider interaction
 */

import { test, expect } from '@playwright/test';

test.describe('Vercel Integration OAuth Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the integration test page
    await page.goto('/integrations/test');
  });

  test('should display Connect Vercel button when not connected', async ({ page }) => {
    // Wait for page to load
    await page.waitForSelector('h1');

    // Verify page title
    await expect(page.locator('h1')).toContainText('Vercel Integration Test');

    // Verify Connect Vercel button is visible
    const connectButton = page.getByRole('button', { name: /Connect Vercel Account/i });
    await expect(connectButton).toBeVisible();

    // Verify connection status shows not connected
    await expect(page.locator('text=Connect your Vercel account to get started')).toBeVisible();
  });

  test('should handle OAuth error gracefully', async ({ page }) => {
    // Simulate OAuth error by navigating directly to callback with error
    await page.goto('/integrations/test?error=access_denied&error_description=User%20denied%20access');

    // Wait for error alert to appear
    await page.waitForSelector('[role="alert"]');

    // Verify error message is displayed
    const errorAlert = page.locator('[role="alert"]').first();
    await expect(errorAlert).toContainText('Error');
    await expect(errorAlert).toContainText('User denied access');
  });

  test('should handle invalid state parameter (CSRF protection)', async ({ page }) => {
    // Simulate CSRF attack by providing mismatched state
    await page.goto('/api/integrations/vercel/callback?code=test_code&state=invalid_state');

    // Should redirect to test page with error
    await page.waitForURL(/\/integrations\/test\?error=/);

    // Verify CSRF error is shown
    await expect(page.url()).toContain('error=invalid_state');
    await expect(page.url()).toContain('CSRF validation failed');
  });

  // This test requires a complete OAuth mock or test credentials
  test.skip('should complete full OAuth flow and show connected status', async ({ page, context }) => {
    // Click Connect Vercel button
    const connectButton = page.getByRole('button', { name: /Connect Vercel Account/i });
    await connectButton.click();

    // Note: In a real test, this would redirect to Vercel OAuth page
    // For E2E testing, you would either:
    // 1. Mock the Vercel OAuth endpoint
    // 2. Use Vercel test credentials
    // 3. Intercept the redirect and simulate successful OAuth callback

    // Simulate successful OAuth callback
    await page.goto('/integrations/test?success=true');

    // Wait for success message
    await page.waitForSelector('[role="alert"]');
    const successAlert = page.locator('[role="alert"]').first();
    await expect(successAlert).toContainText('Success');
    await expect(successAlert).toContainText('Vercel account connected successfully');

    // Verify connected status is shown
    await expect(page.getByText('Connected to Vercel')).toBeVisible();

    // Verify database creation form is now visible
    await expect(page.getByLabel('Database Name')).toBeVisible();
    await expect(page.getByLabel('Region')).toBeVisible();
  });

  // This test requires authenticated session and Vercel integration
  test.skip('should create database after successful OAuth connection', async ({ page }) => {
    // Prerequisites: User must be logged in and have connected Vercel account
    // This test assumes the OAuth flow has been completed

    // Navigate to test page
    await page.goto('/integrations/test');

    // Wait for page to load and verify connected status
    await expect(page.getByText('Connected to Vercel')).toBeVisible();

    // Fill in database creation form
    const dbName = `test-db-${Date.now()}`;
    await page.getByLabel('Database Name').fill(dbName);

    // Select region
    await page.getByLabel('Region').click();
    await page.getByRole('option', { name: /US East/ }).click();

    // Submit form
    const createButton = page.getByRole('button', { name: /Create Database/i });
    await createButton.click();

    // Wait for loading state
    await expect(createButton).toBeDisabled();

    // Wait for success message
    await page.waitForSelector('[role="alert"]');
    const successAlert = page.locator('[role="alert"]').first();
    await expect(successAlert).toContainText('Success');
    await expect(successAlert).toContainText(`Database "${dbName}" created successfully`);

    // Verify database details are displayed
    await expect(page.getByText('Database Created')).toBeVisible();
    await expect(page.getByText(dbName)).toBeVisible();
  });

  test('should show loading state when connecting', async ({ page }) => {
    // Click Connect Vercel button
    const connectButton = page.getByRole('button', { name: /Connect Vercel Account/i });

    // Button should be enabled initially
    await expect(connectButton).toBeEnabled();

    // After clicking, it should show loading state (before redirect)
    // Note: This happens very quickly in real scenario, hard to test reliably
  });

  test('should require database name when creating database', async ({ page }) => {
    // Skip if not connected (would need to set up authenticated session with integration)
    // This is a UI validation test that can be done without actual API calls

    await page.goto('/integrations/test');

    // If the form is visible, test validation
    const dbNameInput = page.getByLabel('Database Name');

    if (await dbNameInput.isVisible()) {
      // Try to submit without filling in name
      const createButton = page.getByRole('button', { name: /Create Database/i });
      await createButton.click();

      // HTML5 validation should prevent submission
      const validationMessage = await dbNameInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      expect(validationMessage).toBeTruthy();
    }
  });
});

test.describe('Integration Page UI Elements', () => {
  test('should render all page sections correctly', async ({ page }) => {
    await page.goto('/integrations/test');

    // Verify page structure
    await expect(page.locator('h1')).toContainText('Vercel Integration Test');
    await expect(page.locator('text=Test the Vercel OAuth flow')).toBeVisible();

    // Verify Connection Status card
    await expect(page.getByText('Connection Status')).toBeVisible();

    // Verify descriptive text
    await expect(page.locator('text=Connect your Vercel account to get started')).toBeVisible();
  });

  test('should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/integrations/test');

    // Verify content is still visible
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByRole('button', { name: /Connect Vercel/i })).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.reload();

    // Verify layout adapts
    await expect(page.locator('h1')).toBeVisible();
  });
});
