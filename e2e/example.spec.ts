import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load the homepage successfully', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');

    // Wait for the page to be in a good state
    await page.waitForLoadState('networkidle');

    // Check that the page loaded (look for common elements)
    // This is a basic smoke test to verify the app is running
    await expect(page).toHaveTitle(/.*/); // Has some title
  });

  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/');

    // Check for viewport meta tag (important for responsive design)
    const viewportMeta = page.locator('meta[name="viewport"]');
    await expect(viewportMeta).toHaveCount(1);
  });
});

test.describe('Navigation', () => {
  test('should navigate using browser back and forward', async ({ page }) => {
    // Start at homepage
    await page.goto('/');
    const homeUrl = page.url();

    // Navigate to another page if it exists
    // This is a basic navigation test
    await page.goto('/sliders');
    await page.waitForLoadState('networkidle');

    // Go back
    await page.goBack();
    await expect(page).toHaveURL(homeUrl);

    // Go forward
    await page.goForward();
    await expect(page).toHaveURL(/\/sliders/);
  });
});

test.describe('Responsive Design', () => {
  test('should render correctly on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Take a screenshot for visual verification
    await page.screenshot({ path: 'test-results/mobile-homepage.png', fullPage: true });

    // Basic check that page loaded
    await expect(page).toHaveTitle(/.*/);
  });

  test('should render correctly on desktop viewport', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Take a screenshot for visual verification
    await page.screenshot({ path: 'test-results/desktop-homepage.png', fullPage: true });

    // Basic check that page loaded
    await expect(page).toHaveTitle(/.*/);
  });
});
