import { expect, Locator, Page } from '@playwright/test';

export class InventoryPage {
  readonly title: Locator;
  readonly items: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly sortDropdown: Locator;

  constructor(private readonly page: Page) {
    this.title = page.getByText('Products');
    this.items = page.getByTestId('inventory-item');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.itemPrices = page.getByTestId('inventory-item-price');
    this.sortDropdown = page.getByTestId('product-sort-container');
  }

  async goto() {
    await this.page.goto('/inventory.html');
  }

  async expectLoaded() {
    await expect(this.items.first()).toBeVisible();
  }

  async addToCart(productSlug: string) {
    await this.page.getByTestId(`add-to-cart-${productSlug}`).click();
  }

  async removeFromCart(productSlug: string) {
    await this.page.getByTestId(`remove-${productSlug}`).click();
  }

  async sortBy(option: 'az' | 'za' | 'lohi' | 'hilo') {
    await this.sortDropdown.selectOption(option);
  }

  row(productName: string) {
    return this.items.filter({ hasText: productName });
  }

  async openItem(productName: string) {
    await this.row(productName).getByTestId('inventory-item-name').click();
  }

  async imageSources() {
    await this.expectLoaded();
    return this.items
      .locator('img')
      .evaluateAll((imgs) => imgs.map((img) => img.getAttribute('src')));
  }
}
