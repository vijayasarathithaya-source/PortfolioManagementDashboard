import { Given, Then } from '@cucumber/cucumber';
import axios from 'axios';
import { randomUUID } from 'crypto';
import { getDb } from '../support/db';
import { expect, state, BACKEND_URL } from '../support/state';

Given('the user is authenticated as {string} with password {string}', async (email, password) => {
  state.currentEmail = email;
  state.currentPassword = password;
  state.currentFullName = 'Test Investor';

  const db = await getDb();
  await db.run('DELETE FROM users WHERE email = ?', [email]);
  
  // Register and login to authenticate
  const regRes = await axios.post(`${BACKEND_URL}/api/auth/register`, {
    email,
    password,
    fullName: state.currentFullName,
  });
  state.currentUserId = regRes.data.user.id;

  const loginRes = await axios.post(`${BACKEND_URL}/api/auth/login`, {
    email,
    password,
  });
  state.jwtToken = loginRes.data.token;
});

Given('the user is authenticated', async () => {
  // Call default authenticated user
  state.currentEmail = 'investor@deepsea.com';
  state.currentPassword = 'Password123!';
  state.currentFullName = 'Test Investor';

  const db = await getDb();
  const row = await db.get('SELECT id FROM users WHERE email = ?', [state.currentEmail]);
  if (!row) {
    const regRes = await axios.post(`${BACKEND_URL}/api/auth/register`, {
      email: state.currentEmail,
      password: state.currentPassword,
      fullName: state.currentFullName,
    });
    state.currentUserId = regRes.data.user.id;
  } else {
    state.currentUserId = row.id;
  }

  const loginRes = await axios.post(`${BACKEND_URL}/api/auth/login`, {
    email: state.currentEmail,
    password: state.currentPassword,
  });
  state.jwtToken = loginRes.data.token;
});

Given('investments exist for the user:', async (table) => {
  const db = await getDb();
  await db.run('DELETE FROM investments WHERE userId = ?', [state.currentUserId]);

  const rows = table.hashes();
  for (const row of rows) {
    const asset = await db.get('SELECT id FROM assets WHERE symbol = ?', [row.symbol]);
    if (!asset) {
      throw new Error(`Asset not found for symbol ${row.symbol}`);
    }
    const id = `inv-${randomUUID()}`;
    await db.run(
      'INSERT INTO investments (id, userId, assetId, quantity, purchasePrice, purchaseDate) VALUES (?, ?, ?, ?, ?, ?)',
      [id, state.currentUserId, asset.id, parseFloat(row.quantity), parseFloat(row.purchasePrice), new Date().toISOString()]
    );
  }
});

Given('no investments exist for the user', async () => {
  const db = await getDb();
  await db.run('DELETE FROM investments WHERE userId = ?', [state.currentUserId]);
});

Then('validation error should be returned with status {int}', (status) => {
  expect(state.responseStatus).toBe(status);
});
