import { Given, When, Then } from '@cucumber/cucumber';
import axios from 'axios';
import { randomUUID } from 'crypto';
import { getDb } from '../support/db';
import { expect, state, BACKEND_URL } from '../support/state';

Given('the user has investment for {string} with quantity {int} and purchase price {float}', async (symbol, quantity, price) => {
  const db = await getDb();
  await db.run('DELETE FROM investments WHERE userId = ?', [state.currentUserId]);

  const asset = await db.get('SELECT id FROM assets WHERE symbol = ?', [symbol]);
  if (!asset) {
    throw new Error(`Asset not found: ${symbol}`);
  }

  const id = `inv-${randomUUID()}`;
  await db.run(
    'INSERT INTO investments (id, userId, assetId, quantity, purchasePrice, purchaseDate) VALUES (?, ?, ?, ?, ?, ?)',
    [id, state.currentUserId, asset.id, quantity, price, new Date().toISOString()]
  );
});

When('the user sells investment {string} with quantity {int} and price {float}', async (symbol, quantity, price) => {
  const db = await getDb();
  const asset = await db.get('SELECT id FROM assets WHERE symbol = ?', [symbol]);
  const investment = await db.get('SELECT id FROM investments WHERE userId = ? AND assetId = ?', [state.currentUserId, asset.id]);

  try {
    const res = await axios.post(
      `${BACKEND_URL}/api/transactions`,
      {
        investmentId: investment.id,
        transactionType: 'SELL',
        quantity,
        price,
      },
      {
        headers: { Authorization: `Bearer ${state.jwtToken}` },
      }
    );
    state.responseStatus = res.status;
    state.responseData = res.data;
  } catch (err: any) {
    state.responseStatus = err.response?.status || 500;
    state.responseError = err.response?.data || {};
  }
});

Then('a SELL transaction should be created', async () => {
  const db = await getDb();
  const tx = await db.get(
    `SELECT t.* FROM transactions t
     JOIN investments i ON t.investmentId = i.id
     WHERE i.userId = ? AND t.transactionType = 'SELL'
     ORDER BY t.transactionDate DESC LIMIT 1`,
    [state.currentUserId]
  );
  expect(tx).notToBeNull();
  expect(tx.transactionType).toBe('SELL');
});

When('the user attempts to sell {string} with quantity {int} and price {float}', async (symbol, quantity, price) => {
  const db = await getDb();
  const asset = await db.get('SELECT id FROM assets WHERE symbol = ?', [symbol]);
  const investment = await db.get('SELECT id FROM investments WHERE userId = ? AND assetId = ?', [state.currentUserId, asset.id]);

  try {
    const res = await axios.post(
      `${BACKEND_URL}/api/transactions`,
      {
        investmentId: investment.id,
        transactionType: 'SELL',
        quantity,
        price,
      },
      {
        headers: { Authorization: `Bearer ${state.jwtToken}` },
      }
    );
    state.responseStatus = res.status;
    state.responseData = res.data;
  } catch (err: any) {
    state.responseStatus = err.response?.status || 500;
    state.responseError = err.response?.data || {};
  }
});
