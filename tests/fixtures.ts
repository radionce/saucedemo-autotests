import { test as base } from '@playwright/test';
import { USERS } from './data/users';
import { CartPage } from './pages/CartPage';
import { CheckoutCompletePage } from './pages/CheckoutCompletePage';
import { CheckoutInfoPage } from './pages/CheckoutInfoPage';
import { CheckoutOverviewPage } from './pages/CheckoutOverviewPage';
import { HeaderMenu } from './pages/HeaderMenu';
import { InventoryPage } from './pages/InventoryPage';
import { ItemPage } from './pages/ItemPage';
import { LoginPage } from './pages/LoginPage';

type Fixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  itemPage: ItemPage;
  cartPage: CartPage;
  checkoutInfoPage: CheckoutInfoPage;
  checkoutOverviewPage: CheckoutOverviewPage;
  checkoutCompletePage: CheckoutCompletePage;
  header: HeaderMenu;
  /** The inventory page, logged in as standard_user and loaded. */
  loggedInPage: InventoryPage;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  inventoryPage: async ({ page }, use) => use(new InventoryPage(page)),
  itemPage: async ({ page }, use) => use(new ItemPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutInfoPage: async ({ page }, use) => use(new CheckoutInfoPage(page)),
  checkoutOverviewPage: async ({ page }, use) => use(new CheckoutOverviewPage(page)),
  checkoutCompletePage: async ({ page }, use) => use(new CheckoutCompletePage(page)),
  header: async ({ page }, use) => use(new HeaderMenu(page)),
  loggedInPage: async ({ loginPage, inventoryPage }, use) => {
    await loginPage.login(USERS.standard);
    await inventoryPage.expectLoaded();
    await use(inventoryPage);
  },
});

export { expect } from '@playwright/test';
