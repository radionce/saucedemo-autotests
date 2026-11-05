import { Locator, Page } from '@playwright/test';
import { PASSWORD } from '../data/users';

export class LoginPage {
  readonly username: Locator;
  readonly password: Locator;
  readonly loginButton: Locator;
  readonly error: Locator;

  constructor(private readonly page: Page) {
    this.username = page.getByTestId('username');
    this.password = page.getByTestId('password');
    this.loginButton = page.getByTestId('login-button');
    this.error = page.getByTestId('error');
  }

  async goto() {
    await this.page.goto('/');
  }

  /** Leaves the browser wherever the site sends it (inventory, or the login page with an error). */
  async login(user: string, password: string = PASSWORD) {
    await this.goto();
    await this.username.fill(user);
    await this.password.fill(password);
    await this.loginButton.click();
  }
}
