import { Page } from '@playwright/test';

export const PASSWORD = 'secret_sauce';

/** Logs in and leaves the browser wherever the site sends it (inventory, or the login page with an error). */
export async function login(page: Page, user = 'standard_user') {
  await page.goto('/');
  await page.getByTestId('username').fill(user);
  await page.getByTestId('password').fill(PASSWORD);
  await page.getByTestId('login-button').click();
}
