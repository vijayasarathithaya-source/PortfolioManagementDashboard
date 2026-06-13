import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../../support/ui-world';
import { expect } from '../../support/state';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4200';

Given('the user navigates to the dashboard page', async function (this: CustomWorld) {
  await this.page.goto(`${FRONTEND_URL}/dashboard`);
  await this.page.waitForSelector('.stats-grid', { timeout: 10000 });
});

Given('the user navigates to the holdings page', async function (this: CustomWorld) {
  await this.page.goto(`${FRONTEND_URL}/portfolio`);
  await this.page.waitForSelector('.holdings-table-container, .empty-state-wrapper', { timeout: 10000 });
});


Then('the {string} stat card should display a positive dollar number', async function (this: CustomWorld, label: string) {
  const card = this.page.locator(`app-card:has-text("${label}")`);
  await card.scrollIntoViewIfNeeded();
  const valText = await card.locator('.stat-value').textContent();
  expect(valText?.trim()).notToBeNull();
  expect(valText?.includes('$')).toBeTrue();
});

Then('the {string} stat card should display {string}', async function (this: CustomWorld, label: string, expectedVal: string) {
  const card = this.page.locator(`app-card:has-text("${label}")`);
  await card.scrollIntoViewIfNeeded();
  const valText = await card.locator('.stat-value').textContent();
  expect(valText?.trim()).toBe(expectedVal);
});

Then('the allocation segment details should display {string}', async function (this: CustomWorld, assetType: string) {
  const legend = this.page.locator(`.allocation-item:has-text("${assetType}")`);
  await legend.scrollIntoViewIfNeeded();
  const visible = await legend.isVisible();
  expect(visible).toBeTrue();
});

Then('the asset share chart center should show {string}', async function (this: CustomWorld, text: string) {
  const centerValue = await this.page.textContent('.donut-center .center-value');
  const centerLabel = await this.page.textContent('.donut-center .center-label');
  expect(`${centerValue?.trim()} ${centerLabel?.trim()}`).toBe(text);
});

Then('the empty state placeholder {string} should be visible', async function (this: CustomWorld, title: string) {
  await this.page.waitForSelector('.empty-state-container');
  const titleText = await this.page.textContent('.empty-title');
  expect(titleText?.trim()).toBe(title);
});

Then('a {string} button should be visible in the empty state', async function (this: CustomWorld, label: string) {
  const btn = this.page.locator(`.empty-state-container button:has-text("${label}")`);
  const visible = await btn.isVisible();
  expect(visible).toBeTrue();
});
