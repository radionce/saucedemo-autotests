import { Locator, Page } from '@playwright/test';

export class ItemPage {
  readonly notFound: Locator;

  constructor(private readonly page: Page) {
    this.notFound = page.getByText('ITEM NOT FOUND');
  }

  async goto(id: number) {
    await this.page.goto(`/inventory-item.html?id=${id}`);
  }
}
