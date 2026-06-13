import { When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../../support/ui-world';
import { expect } from '../../support/state';

When('the user clicks the {string} empty state button', async function (this: CustomWorld, label: string) {
  const isDashboard = this.page.url().includes('/dashboard');
  await this.page.click(`.empty-state-container button:has-text("${label}")`);
  if (isDashboard) {
    await this.page.waitForURL('**/portfolio');
    await this.page.click(`.empty-state-container button:has-text("Buy Asset")`);
  }
});

Then('the buy modal dialog should open', async function (this: CustomWorld) {
  await this.page.waitForSelector('.mat-mdc-dialog-container', { timeout: 5000 });
  const open = await this.page.isVisible('.mat-mdc-dialog-container');
  expect(open).toBeTrue();
});

When('the user selects the asset type filter pill {string}', async function (this: CustomWorld, pillLabel: string) {
  await this.page.click(`.filter-pill:has-text("${pillLabel}")`);
});

When('the user selects the asset symbol {string} from dropdown', async function (this: CustomWorld, symbol: string) {
  await this.page.click('mat-select');
  // Wait for overlay options to load
  await this.page.waitForSelector('mat-option');
  await this.page.click(`mat-option:has-text("${symbol}")`);
});

Then('the purchase price field should be prefilled with a random price', async function (this: CustomWorld) {
  const priceInput = this.page.locator('app-input[label="Purchase Price"] input');
  const val = await priceInput.inputValue();
  expect(val).notToBeNull();
  expect(parseFloat(val) > 0).toBeTrue();
});

When('the user enters quantity {string} in buy modal', async function (this: CustomWorld, quantity: string) {
  await this.page.fill('app-input[label="Quantity"] input', quantity);
});

When('the user clicks the {string} button inside dialog', async function (this: CustomWorld, label: string) {
  await this.page.click(`.dialog-actions button:has-text("${label}")`);
});

Then('the buy modal dialog should close', async function (this: CustomWorld) {
  await this.page.waitForSelector('.mat-mdc-dialog-container', { state: 'detached', timeout: 5000 });
  const open = await this.page.isVisible('.mat-mdc-dialog-container');
  expect(open).toBe(false);
});

Then('the holdings table should display symbol {string} with quantity {string}', async function (this: CustomWorld, symbol: string, quantity: string) {
  // Wait for table to load updated content
  await this.page.waitForSelector('app-table');
  // Check the table content
  const row = this.page.locator(`app-table tr:has-text("${symbol}")`);
  const text = await row.textContent();
  expect(text).toContain(symbol);
  expect(text).toContain(quantity);
});

Then('the validation error {string} or equivalent should be shown for asset field', async function (this: CustomWorld, errorMsg: string) {
  const errText = await this.page.locator('app-dropdown mat-error').textContent();
  expect(errText?.trim()).notToBeNull();
});
