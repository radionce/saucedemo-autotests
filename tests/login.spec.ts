import { test, expect } from './fixtures';
import { USERS } from './data/users';

test('valid credentials land on the inventory page', async ({ page, loginPage, inventoryPage }) => {
  await loginPage.login(USERS.standard);
  await expect(page).toHaveURL(/inventory\.html/);
  await expect(inventoryPage.title).toBeVisible();
});

test('wrong password shows an error', async ({ page, loginPage }) => {
  await loginPage.login(USERS.standard, 'wrong_password');
  await expect(loginPage.error).toContainText('Username and password do not match');
  await expect(page).not.toHaveURL(/inventory\.html/);
});

test('locked out user is refused', async ({ loginPage }) => {
  await loginPage.login(USERS.lockedOut);
  await expect(loginPage.error).toContainText('Sorry, this user has been locked out');
});

test('empty form is rejected before any credentials are checked', async ({ loginPage }) => {
  await loginPage.goto();
  await loginPage.loginButton.click();
  await expect(loginPage.error).toContainText('Username is required');
});

test('username without a password is rejected', async ({ loginPage }) => {
  await loginPage.goto();
  await loginPage.username.fill(USERS.standard);
  await loginPage.loginButton.click();
  await expect(loginPage.error).toContainText('Password is required');
});

test('unknown username is refused', async ({ page, loginPage }) => {
  await loginPage.login('no_such_user');
  await expect(loginPage.error).toContainText('Username and password do not match');
  await expect(page).not.toHaveURL(/inventory\.html/);
});

test('inventory page is unreachable when logged out', async ({ loginPage, inventoryPage }) => {
  await inventoryPage.goto();
  await expect(loginPage.error).toContainText(
    "You can only access '/inventory.html' when you are logged in",
  );
  await expect(loginPage.loginButton).toBeVisible();
});

test('cart page is unreachable when logged out', async ({ loginPage, cartPage }) => {
  await cartPage.goto();
  await expect(loginPage.error).toContainText(
    "You can only access '/cart.html' when you are logged in",
  );
});

test('logout returns to the login form', async ({ header, loginPage }) => {
  await loginPage.login(USERS.standard);
  await header.logout();
  await expect(loginPage.loginButton).toBeVisible();
});
