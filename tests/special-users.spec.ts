import { test, expect } from './fixtures';
import { PRODUCTS } from './data/products';
import { PASSWORD, USERS } from './data/users';

// Site fixture behaviour: these accounts are broken on purpose by SauceDemo. The two
// expected-fail tests assert the correct behaviour, so they flip to a hard failure if
// the site ever changes what these accounts do.

// problem_user: typing into the last name field overwrites the first name instead, and
// the last name stays empty, so checkout can never get past the information step.
test.fail(
  'problem_user: a typed last name stays in the last name field',
  async ({ loginPage, inventoryPage, header, cartPage, checkoutInfoPage }) => {
    await loginPage.login(USERS.problem);
    await inventoryPage.addToCart(PRODUCTS.backpack.slug);
    await header.openCart();
    await cartPage.checkoutButton.click();
    await checkoutInfoPage.fillInfo('Yaroslav', 'Radko', '01001');
    await expect(checkoutInfoPage.lastName).toHaveValue('Radko');
  },
);

// error_user: the Finish button throws in the page ("cesetRart is not a function"), so
// the order is never placed and the user stays on the overview step with no message.
test.fail(
  'error_user: finish completes the order',
  async ({
    page,
    loginPage,
    inventoryPage,
    header,
    cartPage,
    checkoutInfoPage,
    checkoutOverviewPage,
  }) => {
    await loginPage.login(USERS.error);
    await inventoryPage.addToCart(PRODUCTS.backpack.slug);
    await header.openCart();
    await cartPage.checkoutButton.click();
    await checkoutInfoPage.fillInfo('Yaroslav', 'Radko', '01001');
    await checkoutInfoPage.continueButton.click();
    await checkoutOverviewPage.expectLoaded();
    await checkoutOverviewPage.finishButton.click();
    await expect(page).toHaveURL(/checkout-complete\.html/);
  },
);

test('performance_glitch_user still reaches the inventory', async ({
  loginPage,
  inventoryPage,
}) => {
  await loginPage.goto();
  await loginPage.username.fill(USERS.performanceGlitch);
  await loginPage.password.fill(PASSWORD);

  const start = Date.now();
  await loginPage.loginButton.click();
  await expect(inventoryPage.items.first()).toBeVisible({ timeout: 20_000 });

  // Reported rather than asserted: an exact number would make the test fragile.
  test.info().annotations.push({
    type: 'login-duration-ms',
    description: String(Date.now() - start),
  });
});
