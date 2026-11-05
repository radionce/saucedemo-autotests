import { expect, Locator, Page } from '@playwright/test';

export class ItemPage {
  readonly notFound: Locator;
  readonly backButton: Locator;
  readonly name: Locator;
  readonly price: Locator;
  readonly addToCartButton: Locator;
  readonly removeButton: Locator;

  constructor(private readonly page: Page) {
    this.notFound = page.getByText('ITEM NOT FOUND');
    this.backButton = page.getByTestId('back-to-products');
    this.name = page.getByTestId('inventory-item-name');
    this.price = page.getByTestId('inventory-item-price');
    this.addToCartButton = page.getByTestId('add-to-cart');
    this.removeButton = page.getByTestId('remove');
  }

  async goto(id: number) {
    await this.page.goto(`/inventory-item.html?id=${id}`);
  }

  /** The back button only exists here, so it proves the SPA has left the inventory grid. */
  async expectLoaded() {
    await expect(this.backButton).toBeVisible();
  }
}
