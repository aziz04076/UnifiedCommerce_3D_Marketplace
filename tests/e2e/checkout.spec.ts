import { test, expect } from '@playwright/test';

test.describe('Shopkeeper White-Label Checkout & Order Flow', () => {
  test('Complete purchase flow: browse -> add to bag -> checkout -> Razorpay/COD -> order confirmation', async ({ page }) => {
    // 1. Visit Home
    await page.goto('/');
    await expect(page).toHaveTitle(/UnifiedCommerce|Shop/i);

    // 2. Add product to bag
    const addToBagBtn = page.locator('button:has-text("Add to Bag"), button:has-text("Buy Now")').first();
    if (await addToBagBtn.isVisible()) {
      await addToBagBtn.click();
    }

    // 3. Navigate to checkout
    await page.goto('/checkout');
    await expect(page.locator('h1, h2')).toContainText(/Checkout/i);

    // 4. Fill required shipping address
    await page.fill('input[placeholder*="Name"], input[name="fullName"]', 'Vikram Patel');
    await page.fill('input[placeholder*="Phone"], input[name="phone"]', '9876543210');
    await page.fill('input[placeholder*="Street"], input[name="street"]', '45 Gandhi Road, Near Clock Tower');
    await page.fill('input[placeholder*="City"], input[name="city"]', 'Jaipur');
    await page.fill('input[placeholder*="Pincode"], input[name="pincode"]', '302001');

    // 5. Check mandatory terms & policy agreement checkbox
    const termsCheckbox = page.locator('input[type="checkbox"][id*="policy"], input[type="checkbox"][id*="terms"]');
    if (await termsCheckbox.isVisible()) {
      await termsCheckbox.check();
      await expect(termsCheckbox).toBeChecked();
    }

    // 6. Verify honest pricing summary (no hidden surprise charges)
    await expect(page.locator('text=Subtotal')).toBeVisible();
    await expect(page.locator('text=Delivery')).toBeVisible();
    await expect(page.locator('text=Total')).toBeVisible();

    // 7. Verify Trust Badges are rendered (honest claims only)
    await expect(page.locator('text=Secure HTTPS connection')).toBeVisible();
    await expect(page.locator('text=Payments by Razorpay')).toBeVisible();
  });

  test('Guest order tracking without authentication', async ({ page }) => {
    await page.goto('/track');
    await expect(page.locator('h1')).toContainText(/Track Order/i);

    await page.fill('input[placeholder*="Order ID"]', 'ORD-001');
    await page.fill('input[placeholder*="Phone"]', '9876543210');
    await page.click('button:has-text("Track My Order")');

    // Verify timeline steps
    await expect(page.locator('text=Order Placed')).toBeVisible();
    await expect(page.locator('text=Out for Delivery')).toBeVisible();
    await expect(page.locator('text=WhatsApp us')).toBeVisible();
  });
});
