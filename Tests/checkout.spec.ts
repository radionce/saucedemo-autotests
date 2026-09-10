import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.beforeEach(async ({ page }) => {
  await login(page);
  await page.getByTestId('add-to-cart-sauce-labs-backpack').click();
  await page.getByTestId('shopping-cart-link').click();
  await page.getByTestId('checkout').click();
});

test('completes an order end to end', async ({ page }) => {
  await page.getByTestId('firstName').fill('Yaroslav');
  await page.getByTestId('lastName').fill('Radko');
  await page.getByTestId('postalCode').fill('01001');
  await page.getByTestId('continue').click();

  // same SPA-transition race as cart.spec.ts: wait the testid down to one match first.
  const itemName = page.getByTestId('inventory-item-name');
  await expect(itemName).toHaveCount(1);
  await expect(itemName).toHaveText('Sauce Labs Backpack');
  await page.getByTestId('finish').click();

  await expect(page).toHaveURL(/checkout-complete\.html/);
  await expect(page.getByTestId('complete-header')).toHaveText('Thank you for your order!');
});

test('missing last name blocks checkout', async ({ page }) => {
  await page.getByTestId('firstName').fill('Yaroslav');
  await page.getByTestId('postalCode').fill('01001');
  await page.getByTestId('continue').click();
  await expect(page.getByTestId('error')).toContainText('Last Name is required');
});
