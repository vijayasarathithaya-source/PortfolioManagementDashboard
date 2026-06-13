import { When, Then } from '@cucumber/cucumber';
import axios from 'axios';
import { getDb } from '../../support/db';
import { expect, state, BACKEND_URL } from '../../support/state';

When('the user buys asset {string} with quantity {int} and price {float}', async (symbol, quantity, price) => {
  const db = await getDb();
  const asset = await db.get('SELECT id FROM assets WHERE symbol = ?', [symbol]);
  if (!asset) {
    throw new Error(`Asset not found for symbol ${symbol}`);
  }

  try {
    const res = await axios.post(
      `${BACKEND_URL}/api/investments`,
      {
        assetId: asset.id,
        quantity,
        purchasePrice: price,
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

Then('a BUY transaction should be created', async () => {
  const db = await getDb();
  const tx = await db.get(
    `SELECT t.* FROM transactions t
     JOIN investments i ON t.investmentId = i.id
     WHERE i.userId = ? AND t.transactionType = 'BUY'
     ORDER BY t.transactionDate DESC LIMIT 1`,
    [state.currentUserId]
  );
  expect(tx).notToBeNull();
  expect(tx.transactionType).toBe('BUY');
});

Then('portfolio holdings quantity for {string} should be {int}', async (symbol, expectedQuantity) => {
  const res = await axios.get(`${BACKEND_URL}/api/portfolio`, {
    headers: { Authorization: `Bearer ${state.jwtToken}` },
  });
  const holdings = res.data;
  const holding = holdings.find((h: any) => h.symbol === symbol);
  if (expectedQuantity === 0) {
    expect(holding === undefined || holding.quantity === 0).toBeTrue();
  } else {
    expect(holding).notToBeNull();
    expect(holding.quantity).toBe(expectedQuantity);
  }
});

When('the user attempts to buy investment with empty asset ID', async () => {
  try {
    const res = await axios.post(
      `${BACKEND_URL}/api/investments`,
      {
        assetId: '',
        quantity: 10,
        purchasePrice: 150.0,
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

Then('transaction request should fail with status {int}', (status) => {
  expect(state.responseStatus).toBe(status);
});

When(/^the user attempts to buy "([^"]+)" with quantity (-?\d+(?:\.\d+)?) and price (-?\d+(?:\.\d+)?)$/, async (symbol: string, quantityStr: string, priceStr: string) => {
  const quantity = parseFloat(quantityStr);
  const price = parseFloat(priceStr);
  const db = await getDb();
  const asset = await db.get('SELECT id FROM assets WHERE symbol = ?', [symbol]);
  
  try {
    const res = await axios.post(
      `${BACKEND_URL}/api/investments`,
      {
        assetId: asset?.id || 'invalid',
        quantity,
        purchasePrice: price,
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
