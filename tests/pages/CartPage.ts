import { Locator, Page } from '@playwright/test';

export class CartPage {
  readonly items: Locator;
  readonly itemNames: Locator;
  readonly checkoutButton: Locator;

  constructor(private readonly page: Page) {
    this.items = page.getByTestId('inventory-item');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.checkoutButton = page.getByTestId('checkout');
  }

  async goto() {
    await this.page.goto('/cart.html');
  }

  async remove(productSlug: string) {
    await this.page.getByTestId(`remove-${productSlug}`).click();
  }
}
