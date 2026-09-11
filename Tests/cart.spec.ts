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

test('a fresh session starts with an empty cart', async ({ page }) => {
  // anchor on the loaded inventory first: a "no badge" assertion is trivially true
  // while the login page is still on screen, and would pass without testing anything.
  await expect(page.getByText('Products')).toBeVisible();
  await expect(page.getByTestId('shopping-cart-badge')).toHaveCount(0);
  await page.getByTestId('shopping-cart-link').click();
  await expect(page).toHaveURL(/cart\.html/);
  await expect(page.getByTestId('inventory-item')).toHaveCount(0);
});

test('removing the item from the cart page leaves it empty', async ({ page }) => {
  await page.getByTestId('add-to-cart-sauce-labs-backpack').click();
  await page.getByTestId('shopping-cart-link').click();
  await page.getByTestId('remove-sauce-labs-backpack').click();
  await expect(page.getByTestId('inventory-item')).toHaveCount(0);
  await expect(page.getByTestId('shopping-cart-badge')).toHaveCount(0);
});

// Known site defect: logout clears the session cookie but not the cart, so the next
// person to log in on a shared machine inherits the previous session's items.
// Asserted as the correct behaviour and marked expected-to-fail, so this flips to a
// hard failure the day SauceDemo fixes it. Verified failing on chromium and firefox.
test.fail('cart contents do not survive a logout', async ({ page }) => {
  await page.getByTestId('add-to-cart-sauce-labs-backpack').click();
  await page.getByRole('button', { name: 'Open Menu' }).click();
  await page.getByTestId('logout-sidebar-link').click();
  await login(page);
  await expect(page.getByText('Products')).toBeVisible();
  await expect(page.getByTestId('shopping-cart-badge')).toHaveCount(0);
});
