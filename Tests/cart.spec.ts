import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.beforeEach(async ({ page }) => {
  await login(page);
});

test('inventory lists all six products', async ({ page }) => {
  await expect(page.getByTestId('inventory-item')).toHaveCount(6);
});

test('adding an item bumps the cart badge to 1', async ({ page }) => {
  await page.getByTestId('add-to-cart-sauce-labs-backpack').click();
  await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1');
});

test('removing the item clears the cart badge', async ({ page }) => {
  await page.getByTestId('add-to-cart-sauce-labs-backpack').click();
  await page.getByTestId('remove-sauce-labs-backpack').click();
  await expect(page.getByTestId('shopping-cart-badge')).toHaveCount(0);
});

test('cart page shows the item that was added', async ({ page }) => {
  await page.getByTestId('add-to-cart-sauce-labs-backpack').click();
  await page.getByTestId('shopping-cart-link').click();
  await expect(page).toHaveURL(/cart\.html/);
  // the SPA briefly leaves the inventory grid mounted after the URL changes, so the
  // testid is momentarily ambiguous — wait it down to the single cart row first.
  const itemName = page.getByTestId('inventory-item-name');
  await expect(itemName).toHaveCount(1);
  await expect(itemName).toHaveText('Sauce Labs Backpack');
});
