import { test, expect } from './fixtures';
import { PRODUCTS } from './data/products';
import { USERS } from './data/users';

const { backpack } = PRODUCTS;

test('inventory lists all six products', async ({ loggedInPage }) => {
  await expect(loggedInPage.items).toHaveCount(6);
});

test('adding an item bumps the cart badge to 1', async ({ loggedInPage, header }) => {
  await loggedInPage.addToCart(backpack.slug);
  await expect(header.cartBadge).toHaveText('1');
});

test('removing the item clears the cart badge', async ({ loggedInPage, header }) => {
  await loggedInPage.addToCart(backpack.slug);
  await loggedInPage.removeFromCart(backpack.slug);
  await expect(header.cartBadge).toHaveCount(0);
});

test('cart page shows the item that was added', async ({
  page,
  loggedInPage,
  header,
  cartPage,
}) => {
  await loggedInPage.addToCart(backpack.slug);
  await header.openCart();
  await expect(page).toHaveURL(/cart\.html/);
  // the SPA briefly leaves the inventory grid mounted after the URL changes, so the
  // testid is momentarily ambiguous — wait it down to the single cart row first.
  await expect(cartPage.itemNames).toHaveCount(1);
  await expect(cartPage.itemNames).toHaveText(backpack.name);
});

test('a fresh session starts with an empty cart', async ({
  page,
  loggedInPage,
  header,
  cartPage,
}) => {
  // anchor on the loaded inventory first: a "no badge" assertion is trivially true
  // while the login page is still on screen, and would pass without testing anything.
  await expect(loggedInPage.title).toBeVisible();
  await expect(header.cartBadge).toHaveCount(0);
  await header.openCart();
  await expect(page).toHaveURL(/cart\.html/);
  await expect(cartPage.items).toHaveCount(0);
});

test('removing the item from the cart page leaves it empty', async ({
  loggedInPage,
  header,
  cartPage,
}) => {
  await loggedInPage.addToCart(backpack.slug);
  await header.openCart();
  await cartPage.remove(backpack.slug);
  await expect(cartPage.items).toHaveCount(0);
  await expect(header.cartBadge).toHaveCount(0);
});

// Known site defect: logout clears the session cookie but not the cart, so the next
// person to log in on a shared machine inherits the previous session's items.
// Asserted as the correct behaviour and marked expected-to-fail, so this flips to a
// hard failure the day SauceDemo fixes it. Verified failing on chromium and firefox.
test.fail('cart contents do not survive a logout', async ({ loggedInPage, header, loginPage }) => {
  await loggedInPage.addToCart(backpack.slug);
  await header.logout();
  await loginPage.login(USERS.standard);
  await expect(loggedInPage.title).toBeVisible();
  await expect(header.cartBadge).toHaveCount(0);
});
