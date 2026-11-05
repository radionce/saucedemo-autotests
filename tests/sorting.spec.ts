import { test, expect } from './fixtures';
import { PRODUCTS } from './data/products';

const catalog = Object.values(PRODUCTS);
const namesAscending = catalog.map((product) => product.name).sort();
const pricesAscending = catalog
  .map((product) => product.price)
  .sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));

// Two products cost the same and the site does not define their relative order,
// so the price tests assert the order of prices, not of names.

test('sorting by name A to Z lists every product in ascending order', async ({ loggedInPage }) => {
  // A to Z is the default, so sort away first or this would pass without sorting anything.
  await loggedInPage.sortBy('za');
  await loggedInPage.sortBy('az');
  await expect(loggedInPage.itemNames).toHaveText(namesAscending);
});

test('sorting by name Z to A lists every product in descending order', async ({ loggedInPage }) => {
  await loggedInPage.sortBy('za');
  await expect(loggedInPage.itemNames).toHaveText([...namesAscending].reverse());
});

test('sorting by price low to high lists every price in ascending order', async ({
  loggedInPage,
}) => {
  await loggedInPage.sortBy('lohi');
  await expect(loggedInPage.itemPrices).toHaveText(pricesAscending);
});

test('sorting by price high to low lists every price in descending order', async ({
  loggedInPage,
}) => {
  await loggedInPage.sortBy('hilo');
  await expect(loggedInPage.itemPrices).toHaveText([...pricesAscending].reverse());
});
