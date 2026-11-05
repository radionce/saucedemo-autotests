import { expect, Locator, Page } from '@playwright/test';

export class InventoryPage {
  readonly title: Locator;
  readonly items: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;

  constructor(private readonly page: Page) {
    this.title = page.getByText('Products');
    this.items = page.getByTestId('inventory-item');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.itemPrices = page.getByTestId('inventory-item-price');
  }

  async goto() {
    await this.page.goto('/inventory.html');
  }

  async expectLoaded(timeout?: number) {
    await expect(this.items.first()).toBeVisible({ timeout });
  }

  async addToCart(productSlug: string) {
    await this.page.getByTestId(`add-to-cart-${productSlug}`).click();
  }

  async removeFromCart(productSlug: string) {
    await this.page.getByTestId(`remove-${productSlug}`).click();
  }

  async imageSources() {
    await this.expectLoaded();
    return this.items
      .locator('img')
      .evaluateAll((imgs) => imgs.map((img) => img.getAttribute('src')));
  }
}
