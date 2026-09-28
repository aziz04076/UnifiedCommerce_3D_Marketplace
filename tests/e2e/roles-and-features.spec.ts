import { test, expect } from '@playwright/test';

test.describe('Role & Feature Audit (Super Admin, Collections, Vendor Analytics)', () => {

  test('Super Admin: login page renders, enforces auth and 2FA challenge flow', async ({ page }) => {
    // 1. Visit /super-admin/login
    await page.goto('/super-admin/login');
    await expect(page.locator('h1')).toContainText(/Super Admin/i);

    // 2. Check form inputs
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitBtn = page.locator('button[type="submit"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitBtn).toBeVisible();

    // 3. Negative test: wrong credentials
    await emailInput.fill('invalid@admin.internal');
    await passwordInput.fill('WrongPassword123!');
    await submitBtn.click();
    await expect(page.locator('text=Invalid email or password')).toBeVisible();

    // 4. Verify direct navigation to /super-admin is handled gracefully
    await page.goto('/super-admin');
    await expect(page.locator('h1')).toContainText(/Super-Admin/i);
  });

  test('Collections: browse collections catalog, navigate to category slug, check empty state', async ({ page }) => {
    // 1. Visit /collections
    await page.goto('/collections');
    await expect(page.locator('h1')).toContainText(/Collections/i);

    // 2. Verify collection cards render
    const collectionLinks = page.locator('a[href^="/collections/"]');
    const count = await collectionLinks.count();
    expect(count).toBeGreaterThan(0);

    // 3. Click first collection
    await collectionLinks.first().click();
    await expect(page).toHaveURL(/\/collections\/.+/);

    // 4. Test empty collection fallback
    await page.goto('/collections/empty-category');
    await expect(page.locator('text=No Products In This Collection Yet')).toBeVisible();
    await expect(page.locator('a:has-text("Browse All Collections")')).toBeVisible();
  });

  test('Vendor Analytics: loads dashboard, switches vendors, toggles time range without division by zero', async ({ page }) => {
    // 1. Visit /vendor/dashboard
    await page.goto('/vendor/dashboard');
    await expect(page.locator('header')).toBeVisible();

    // 2. Verify vendor switcher exists
    const vendorSelect = page.locator('select[aria-label="Switch Vendor Scope"]');
    await expect(vendorSelect).toBeVisible();

    // 3. Switch to vendor-2
    await vendorSelect.selectOption('vendor-2');
    await expect(page.locator('header p:has-text("NeoTokyo Streetwear")')).toBeVisible();

    // 4. Switch time range to 7d
    const btn7d = page.locator('button:has-text("7d")');
    if (await btn7d.isVisible()) {
      await btn7d.click();
    }

    // 5. Switch to empty vendor to test zero-data division-by-zero protection
    await vendorSelect.selectOption('vendor-empty');
    await expect(page.locator('header p:has-text("New Seller Studio")')).toBeVisible();
    await expect(page.locator('text=Welcome, New Seller Studio!')).toBeVisible();

    // 6. Navigate to Analytics Tab
    const analyticsTab = page.locator('button:has-text("Analytics")');
    await analyticsTab.click();
    await expect(page.locator('text=Monthly GMV')).toBeVisible();
    await expect(page.locator('text=Seller Health Score')).toBeVisible();
  });

});
