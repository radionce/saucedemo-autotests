import { test, expect } from './fixtures';
import { PRODUCTS } from './data/products';

const { backpack } = PRODUCTS;

test.beforeEach(async ({ loggedInPage, header, cartPage }) => {
  await loggedInPage.addToCart(backpack.slug);
  await header.openCart();
  await cartPage.checkoutButton.click();
});

test('completes an order end to end', async ({
  page,
  checkoutInfoPage,
  checkoutOverviewPage,
  checkoutCompletePage,
}) => {
  await checkoutInfoPage.fillInfo('Yaroslav', 'Radko', '01001');
  await checkoutInfoPage.continueButton.click();

  // same SPA-transition race as cart.spec.ts: wait the testid down to one match first.
  await expect(checkoutOverviewPage.itemNames).toHaveCount(1);
  await expect(checkoutOverviewPage.itemNames).toHaveText(backpack.name);
  await checkoutOverviewPage.finishButton.click();

  await expect(page).toHaveURL(/checkout-complete\.html/);
  await expect(checkoutCompletePage.header).toHaveText('Thank you for your order!');
});

test('missing last name blocks checkout', async ({ checkoutInfoPage }) => {
  await checkoutInfoPage.fillInfo('Yaroslav', '', '01001');
  await checkoutInfoPage.continueButton.click();
  await expect(checkoutInfoPage.error).toContainText('Last Name is required');
});
