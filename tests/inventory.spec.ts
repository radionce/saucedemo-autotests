import { test, expect } from '@playwright/test';
import { login } from './helpers';

test('unknown product id shows the not-found page instead of a blank item', async ({ page }) => {
  await login(page);
  await page.goto('/inventory-item.html?id=999');
  await expect(page.getByText('ITEM NOT FOUND')).toBeVisible();
});

test('no product renders a blank name or a malformed price', async ({ page }) => {
  await login(page);
  await expect(page.getByTestId('inventory-item')).toHaveCount(6);

  for (const name of await page.getByTestId('inventory-item-name').allTextContents()) {
    expect(name.trim()).not.toBe('');
  }
  for (const price of await page.getByTestId('inventory-item-price').allTextContents()) {
    expect(price).toMatch(/^\$\d+\.\d{2}$/);
  }
});

/** problem_user is the site's deliberately broken fixture: it serves one placeholder for every product. */
test('problem_user serves the same image for every product', async ({ page }) => {
  await login(page, 'problem_user');
  const sources = await page
    .locator('[data-test="inventory-item"] img')
    .evaluateAll((imgs) => imgs.map((img) => img.getAttribute('src')));

  expect(sources).toHaveLength(6);
  expect(new Set(sources).size).toBe(1);
});

test('standard_user gets a distinct image per product', async ({ page }) => {
  await login(page);
  const sources = await page
    .locator('[data-test="inventory-item"] img')
    .evaluateAll((imgs) => imgs.map((img) => img.getAttribute('src')));

  expect(new Set(sources).size).toBe(6);
});
