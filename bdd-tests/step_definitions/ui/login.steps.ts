import { When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../../support/ui-world';
import { expect } from '../../support/state';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4200';

When('the user fills the email field with {string}', async function (this: CustomWorld, email: string) {
  await this.page.fill('input[type="email"]', email);
});

When('the user fills the password field with {string}', async function (this: CustomWorld, password: string) {
  await this.page.fill('input[type="password"]', password);
});

When('the user clicks the {string} button', async function (this: CustomWorld, label: string) {
  await this.page.click(`button:has-text("${label}")`);
});

Then('the user should be redirected to the dashboard page', async function (this: CustomWorld) {
  await this.page.waitForURL(`${FRONTEND_URL}/dashboard`);
  expect(this.page.url()).toBe(`${FRONTEND_URL}/dashboard`);
});

Then('a welcome greeting {string} should be visible', async function (this: CustomWorld, name: string) {
  await this.page.waitForSelector('.welcome-text');
  const txt = await this.page.textContent('.welcome-text');
  expect(txt).toContain(name);
});

Then('an auth error alert {string} should be displayed', async function (this: CustomWorld, errMsg: string) {
  await this.page.waitForSelector('.error-alert');
  const txt = await this.page.textContent('.error-alert');
  expect(txt?.trim()).toBe(errMsg);
});

Then('the email validation error {string} should be displayed', async function (this: CustomWorld, errorMsg: string) {
  const emailInput = this.page.locator('app-input[type="email"]');
  await emailInput.scrollIntoViewIfNeeded();
  const errText = await emailInput.locator('mat-error').textContent();
  expect(errText?.trim()).toBe(errorMsg);
});

Then('the password validation error {string} should be displayed', async function (this: CustomWorld, errorMsg: string) {
  const pwdInput = this.page.locator('app-input[type="password"]');
  await pwdInput.scrollIntoViewIfNeeded();
  const errText = await pwdInput.locator('mat-error').textContent();
  expect(errText?.trim()).toBe(errorMsg);
});
