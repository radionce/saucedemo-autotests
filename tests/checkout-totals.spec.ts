import { test, expect } from './fixtures';
import { PRODUCTS } from './data/products';

test('overview totals add up: item total is the sum of prices, total is item total plus tax', async ({
  loggedInPage,
  header,
  cartPage,
  checkoutInfoPage,
  checkoutOverviewPage,
}) => {
  const products = [PRODUCTS.backpack, PRODUCTS.bikeLight, PRODUCTS.fleeceJacket];
  for (const product of products) {
    await loggedInPage.addToCart(product.slug);
  }
  await header.openCart();
  await cartPage.checkoutButton.click();
  await checkoutInfoPage.fillInfo('Yaroslav', 'Radko', '01001');
  await checkoutInfoPage.continueButton.click();
  await checkoutOverviewPage.expectLoaded();
  await expect(checkoutOverviewPage.itemPrices).toHaveCount(products.length);

  const { items, subtotal, tax, total } = await checkoutOverviewPage.amountsInCents();

  expect(subtotal).toBe(items.reduce((sum, price) => sum + price, 0));
  expect(total).toBe(subtotal + tax);
  expect(tax).toBeGreaterThan(0);
});
