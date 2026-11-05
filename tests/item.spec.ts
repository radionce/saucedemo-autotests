import { test, expect } from './fixtures';
import { PRODUCTS } from './data/products';

const { bikeLight } = PRODUCTS;

test('opening a product from the inventory shows the same name and price', async ({
  loggedInPage,
  itemPage,
}) => {
  const row = loggedInPage.row(bikeLight.name);
  const name = await row.getByTestId('inventory-item-name').textContent();
  const price = await row.getByTestId('inventory-item-price').textContent();

  await loggedInPage.openItem(bikeLight.name);
  await itemPage.expectLoaded();

  await expect(itemPage.name).toHaveText(name ?? '');
  await expect(itemPage.price).toHaveText(price ?? '');
});

test('adding and removing on the item page updates the cart badge', async ({
  loggedInPage,
  itemPage,
  header,
}) => {
  await loggedInPage.openItem(bikeLight.name);
  await itemPage.expectLoaded();

  await itemPage.addToCartButton.click();
  await expect(header.cartBadge).toHaveText('1');

  await itemPage.removeButton.click();
  await expect(header.cartBadge).toHaveCount(0);
});
