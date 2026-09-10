import { test, expect } from '@playwright/test';
import { login, PASSWORD } from './helpers';

test('valid credentials land on the inventory page', async ({ page }) => {
  await login(page);
  await expect(page).toHaveURL(/inventory\.html/);
  await expect(page.getByText('Products')).toBeVisible();
});

test('wrong password shows an error', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('username').fill('standard_user');
  await page.getByTestId('password').fill('wrong_password');
  await page.getByTestId('login-button').click();
  await expect(page.getByTestId('error')).toContainText('Username and password do not match');
  await expect(page).not.toHaveURL(/inventory\.html/);
});

test('locked out user is refused', async ({ page }) => {
  await login(page, 'locked_out_user');
  await expect(page.getByTestId('error')).toContainText('Sorry, this user has been locked out');
});

test('logout returns to the login form', async ({ page }) => {
  await login(page);
  await page.getByRole('button', { name: 'Open Menu' }).click();
  await page.getByTestId('logout-sidebar-link').click();
  await expect(page.getByTestId('login-button')).toBeVisible();
});
