import { Given, When, Then } from '@cucumber/cucumber';
import { randomUUID } from 'crypto';
import { getDb } from '../../support/db';
import { CustomWorld } from '../../support/ui-world';
import { expect, state } from '../../support/state';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4200';

Given('the user navigates to the transactions page', async function (this: CustomWorld) {
  // Visual navigation by clicking sidebar link
  await this.page.click('a[routerLink="/transactions"]');
  await this.page.waitForSelector('.filters-container', { timeout: 10000 });
});

Given('the user has standard transactions seeded in database', async () => {
  const db = await getDb();
  await db.run('DELETE FROM investments WHERE userId = ?', [state.currentUserId]);

  const asset1 = await db.get("SELECT id FROM assets WHERE symbol = 'AAPL'");
  const asset2 = await db.get("SELECT id FROM assets WHERE symbol = 'BND'");

  const inv1Id = `inv-${randomUUID()}`;
  const inv2Id = `inv-${randomUUID()}`;

  await db.run(
    'INSERT INTO investments (id, userId, assetId, quantity, purchasePrice, purchaseDate) VALUES (?, ?, ?, ?, ?, ?)',
    [inv1Id, state.currentUserId, asset1.id, 10, 150.0, new Date().toISOString()]
  );
  await db.run(
    'INSERT INTO investments (id, userId, assetId, quantity, purchasePrice, purchaseDate) VALUES (?, ?, ?, ?, ?, ?)',
    [inv2Id, state.currentUserId, asset2.id, 5, 80.0, new Date().toISOString()]
  );

  // Insert standard transactions
  await db.run(
    'INSERT INTO transactions (id, investmentId, transactionType, quantity, price, transactionDate) VALUES (?, ?, ?, ?, ?, ?)',
    [`tx-${randomUUID()}`, inv1Id, 'BUY', 10, 150.0, new Date('2026-06-05T10:00:00Z').toISOString()]
  );
  await db.run(
    'INSERT INTO transactions (id, investmentId, transactionType, quantity, price, transactionDate) VALUES (?, ?, ?, ?, ?, ?)',
    [`tx-${randomUUID()}`, inv2Id, 'BUY', 5, 80.0, new Date('2026-06-08T10:00:00Z').toISOString()]
  );
  await db.run(
    'INSERT INTO transactions (id, investmentId, transactionType, quantity, price, transactionDate) VALUES (?, ?, ?, ?, ?, ?)',
    [`tx-${randomUUID()}`, inv2Id, 'SELL', 2, 85.0, new Date('2026-06-10T10:00:00Z').toISOString()]
  );
});

Then('the transactions list table should show transactions', async function (this: CustomWorld) {
  await this.page.waitForSelector('.transactions-table-container table');
  const count = await this.page.locator('.transactions-table-container table tbody tr').count();
  expect(count > 0).toBeTrue();
});

When('the user selects transaction type filter {string}', async function (this: CustomWorld, type: string) {
  const dropdown = this.page.locator('app-dropdown:has-text("Transaction Type")');
  await dropdown.locator('mat-select').click();
  await this.page.waitForSelector('mat-option');
  await this.page.click(`mat-option:has-text("${type}")`);
  // Wait for loading to finish and table to update
  await this.page.waitForTimeout(500); // Wait briefly for state updates
});

Then('the transactions list table should only display {string} transaction rows', async function (this: CustomWorld, type: string) {
  await this.page.waitForSelector('.transactions-table-container table');
  const rows = this.page.locator('.transactions-table-container table tbody tr');
  const count = await rows.count();
  for (let i = 0; i < count; i++) {
    const text = await rows.nth(i).textContent();
    expect(text?.includes(type)).toBeTrue();
  }
});

When('the user selects asset type filter {string}', async function (this: CustomWorld, assetType: string) {
  const dropdown = this.page.locator('app-dropdown:has-text("Asset Type")');
  await dropdown.locator('mat-select').click();
  await this.page.waitForSelector('mat-option');
  await this.page.click(`mat-option:has-text("${assetType}")`);
  // Wait for loading to finish and table to update
  await this.page.waitForTimeout(500); // Wait briefly for state updates
});

Then('the transactions list table should only display {string} rows', async function (this: CustomWorld, assetType: string) {
  await this.page.waitForSelector('.transactions-table-container table');
  const rows = this.page.locator('.transactions-table-container table tbody tr');
  const count = await rows.count();
  for (let i = 0; i < count; i++) {
    const text = await rows.nth(i).textContent();
    if (assetType === 'Bonds') {
      expect(text?.includes('BND')).toBeTrue();
    } else if (assetType === 'Stocks') {
      expect(text?.includes('AAPL')).toBeTrue();
    } else if (assetType === 'Mutual Funds') {
      expect(text?.includes('VTSAX')).toBeTrue();
    } else {
      expect(text?.includes(assetType)).toBeTrue();
    }
  }
});
