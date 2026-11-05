import { Locator, Page } from '@playwright/test';

export class CheckoutOverviewPage {
  readonly itemNames: Locator;
  readonly finishButton: Locator;

  constructor(page: Page) {
    this.itemNames = page.getByTestId('inventory-item-name');
    this.finishButton = page.getByTestId('finish');
  }
}
