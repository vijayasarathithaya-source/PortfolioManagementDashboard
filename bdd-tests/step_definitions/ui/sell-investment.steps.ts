import { When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../../support/ui-world';
import { expect } from '../../support/state';

When('the user clicks the sell action for row {string}', async function (this: CustomWorld, symbol: string) {
  // Wait for table to load
  await this.page.waitForSelector('app-table');
  const row = this.page.locator(`app-table tr:has-text("${symbol}")`);
  await row.scrollIntoViewIfNeeded();
  await row.locator('button.sell').click();
});

Then('the sell modal dialog should open', async function (this: CustomWorld) {
  await this.page.waitForSelector('.mat-mdc-dialog-container', { timeout: 5000 });
  const open = await this.page.isVisible('.mat-mdc-dialog-container');
  expect(open).toBeTrue();
});

When('the user enters quantity {string} in sell modal', async function (this: CustomWorld, quantity: string) {
  await this.page.fill('app-input[label="Quantity to Sell"] input, app-input[label="Quantity"] input', quantity);
});

When('the user clicks the submit sell button inside dialog', async function (this: CustomWorld) {
  // The submit sell button has confirmText="Sell" inside the dialog
  await this.page.click('.dialog-actions button:has-text("Sell")');
});

Then('the sell modal dialog should close', async function (this: CustomWorld) {
  await this.page.waitForSelector('.mat-mdc-dialog-container', { state: 'detached', timeout: 5000 });
  const open = await this.page.isVisible('.mat-mdc-dialog-container');
  expect(open).toBe(false);
});

Then('the error alert {string} should be displayed inside dialog', async function (this: CustomWorld, errMsg: string) {
  await this.page.waitForSelector('.error-alert');
  const txt = await this.page.textContent('.error-alert');
  expect(txt?.trim()).toBe(errMsg);
});
