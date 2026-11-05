import { expect, Locator, Page } from '@playwright/test';

/** Whole cents from any text holding one "$12.34" amount, so totals compare without float errors. */
function toCents(text: string | null) {
  const match = text?.match(/\$(\d+)\.(\d{2})/);
  if (!match) throw new Error(`No money amount in: ${text}`);
  return Number(match[1]) * 100 + Number(match[2]);
}

export class CheckoutOverviewPage {
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly subtotal: Locator;
  readonly tax: Locator;
  readonly total: Locator;
  readonly finishButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.itemNames = page.getByTestId('inventory-item-name');
    this.itemPrices = page.getByTestId('inventory-item-price');
    this.subtotal = page.getByTestId('subtotal-label');
    this.tax = page.getByTestId('tax-label');
    this.total = page.getByTestId('total-label');
    this.finishButton = page.getByTestId('finish');
    this.cancelButton = page.getByTestId('cancel');
  }

  /** Finish only exists on this step, unlike `cancel`, which the previous step has too. */
  async expectLoaded() {
    await expect(this.finishButton).toBeVisible();
  }

  async amountsInCents() {
    const prices = await this.itemPrices.allTextContents();
    return {
      items: prices.map(toCents),
      subtotal: toCents(await this.subtotal.textContent()),
      tax: toCents(await this.tax.textContent()),
      total: toCents(await this.total.textContent()),
    };
  }
}
