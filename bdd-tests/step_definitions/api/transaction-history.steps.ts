import { Given, When, Then } from '@cucumber/cucumber';
import axios from 'axios';
import { randomUUID } from 'crypto';
import { getDb } from '../../support/db';
import { expect, state, BACKEND_URL } from '../../support/state';

Given('transactions exist for the user', async () => {
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

When('the user requests the transaction list', async () => {
  try {
    const res = await axios.get(`${BACKEND_URL}/api/transactions?page=1&limit=10`, {
      headers: { Authorization: `Bearer ${state.jwtToken}` }
    });
    state.responseStatus = res.status;
    state.responseData = res.data;
  } catch (err: any) {
    state.responseStatus = err.response?.status || 500;
    state.responseError = err.response?.data || {};
  }
});

Then('transaction list should be returned', () => {
  expect(state.responseStatus).toBe(200);
  expect(Array.isArray(state.responseData.transactions)).toBeTrue();
  expect(state.responseData.transactions.length > 0).toBeTrue();
});

When('the user requests the transaction list filtered by type {string}', async (txType) => {
  try {
    const res = await axios.get(`${BACKEND_URL}/api/transactions?page=1&limit=10&transactionType=${txType}`, {
      headers: { Authorization: `Bearer ${state.jwtToken}` }
    });
    state.responseStatus = res.status;
    state.responseData = res.data;
  } catch (err: any) {
    state.responseStatus = err.response?.status || 500;
    state.responseError = err.response?.data || {};
  }
});

Then('only {string} transactions should be returned', (txType) => {
  expect(state.responseStatus).toBe(200);
  const txs = state.responseData.transactions;
  txs.forEach((tx: any) => {
    expect(tx.transactionType).toBe(txType);
  });
});

When('the user requests the transaction list filtered by asset type {string}', async (assetType) => {
  try {
    const res = await axios.get(`${BACKEND_URL}/api/transactions?page=1&limit=10&assetType=${assetType}`, {
      headers: { Authorization: `Bearer ${state.jwtToken}` }
    });
    state.responseStatus = res.status;
    state.responseData = res.data;
  } catch (err: any) {
    state.responseStatus = err.response?.status || 500;
    state.responseError = err.response?.data || {};
  }
});

Then('only transactions with asset type {string} should be returned', (assetType) => {
  expect(state.responseStatus).toBe(200);
  const txs = state.responseData.transactions;
  txs.forEach((tx: any) => {
    expect(tx.assetType).toBe(assetType);
  });
});

When('the user requests the transaction list filtered by date range from {string} to {string}', async (start, end) => {
  try {
    const res = await axios.get(`${BACKEND_URL}/api/transactions?page=1&limit=10&startDate=${start}&endDate=${end}`, {
      headers: { Authorization: `Bearer ${state.jwtToken}` } // wait, this should use state.jwtToken! Let's correct it.
    });
    state.responseStatus = res.status;
    state.responseData = res.data;
  } catch (err: any) {
    state.responseStatus = err.response?.status || 500;
    state.responseError = err.response?.data || {};
  }
});

Then('only transactions within that date range should be returned', () => {
  expect(state.responseStatus).toBe(200);
  const txs = state.responseData.transactions;
  txs.forEach((tx: any) => {
    const d = new Date(tx.transactionDate);
    expect(d >= new Date('2026-06-01') && d <= new Date('2026-06-15T23:59:59.999Z')).toBeTrue();
  });
});
