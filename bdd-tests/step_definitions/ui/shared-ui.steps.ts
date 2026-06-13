import { Given, Then } from '@cucumber/cucumber';
import axios from 'axios';
import { randomUUID } from 'crypto';
import { getDb } from '../../support/db';
import { CustomWorld } from '../../support/ui-world';
import { expect, state, BACKEND_URL } from '../../support/state';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4200';

Given('the user exists in database with email {string} and password {string} and name {string}', async (email, password, name) => {
  state.currentEmail = email;
  state.currentPassword = password;
  state.currentFullName = name;

  const db = await getDb();
  await db.run('DELETE FROM users WHERE email = ?', [email]);
  
  try {
    const res = await axios.post(`${BACKEND_URL}/api/auth/register`, {
      email,
      password,
      fullName: name,
    });
    state.currentUserId = res.data.user.id;
  } catch (err: any) {
    const row = await db.get('SELECT id FROM users WHERE email = ?', [email]);
    if (row) {
      state.currentUserId = row.id;
    }
  }
});

Given('the email {string} does not exist in database', async (email) => {
  const db = await getDb();
  await db.run('DELETE FROM users WHERE email = ?', [email]);
});

Given('the user navigates to the login page', async function (this: CustomWorld) {
  await this.page.goto(`${FRONTEND_URL}/auth/login`);
  await this.page.waitForSelector('input[type="email"]');
});

Given('the user is authenticated on the UI as {string} with password {string}', async function (this: CustomWorld, email, password) {
  state.currentEmail = email;
  state.currentPassword = password;
  state.currentFullName = 'Test Investor';

  const db = await getDb();
  await db.run('DELETE FROM users WHERE email = ?', [email]);
  
  try {
    const res = await axios.post(`${BACKEND_URL}/api/auth/register`, {
      email,
      password,
      fullName: state.currentFullName,
    });
    state.currentUserId = res.data.user.id;
  } catch (err: any) {
    const row = await db.get('SELECT id FROM users WHERE email = ?', [email]);
    if (row) {
      state.currentUserId = row.id;
    }
  }

  // Visual login
  await this.page.goto(`${FRONTEND_URL}/auth/login`);
  await this.page.fill('input[type="email"]', email);
  await this.page.fill('input[type="password"]', password);
  await this.page.click('button:has-text("Sign In")');
  
  // Wait for redirection and dashboard content
  await this.page.waitForURL(`${FRONTEND_URL}/dashboard`);
  await this.page.waitForSelector('.stats-grid', { timeout: 10000 });
});

Given('the user has investments in database:', async (table) => {
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

Given('the user has no investments in database', async () => {
  const db = await getDb();
  await db.run('DELETE FROM investments WHERE userId = ?', [state.currentUserId]);
});
