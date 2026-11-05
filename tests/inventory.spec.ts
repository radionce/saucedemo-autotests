import { test, expect } from './fixtures';
import { USERS } from './data/users';

test('unknown product id shows the not-found page instead of a blank item', async ({
  loginPage,
  itemPage,
}) => {
  await loginPage.login(USERS.standard);
  await itemPage.goto(999);
  await expect(itemPage.notFound).toBeVisible();
});

test('no product renders a blank name or a malformed price', async ({ loggedInPage }) => {
  await expect(loggedInPage.items).toHaveCount(6);

  for (const name of await loggedInPage.itemNames.allTextContents()) {
    expect(name.trim()).not.toBe('');
  }
  for (const price of await loggedInPage.itemPrices.allTextContents()) {
    expect(price).toMatch(/^\$\d+\.\d{2}$/);
  }
});

/** problem_user is the site's deliberately broken fixture: it serves one placeholder for every product. */
test('problem_user serves the same image for every product', async ({
  loginPage,
  inventoryPage,
}) => {
  await loginPage.login(USERS.problem);
  const sources = await inventoryPage.imageSources();

  expect(sources).toHaveLength(6);
  expect(new Set(sources).size).toBe(1);
});

test('standard_user gets a distinct image per product', async ({ loggedInPage }) => {
  const sources = await loggedInPage.imageSources();

  expect(new Set(sources).size).toBe(6);
});
