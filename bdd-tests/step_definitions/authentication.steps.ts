import { Given, When, Then } from '@cucumber/cucumber';
import axios from 'axios';
import { getDb } from '../support/db';
import { expect, state, BACKEND_URL } from '../support/state';

Given('the user exists with email {string} and password {string} and name {string}', async (email, password, name) => {
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

When('the user enters email {string} and password {string}', async (email, password) => {
  try {
    const res = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      email,
      password,
    });
    state.responseStatus = res.status;
    state.responseData = res.data;
    if (res.data.token) {
      state.jwtToken = res.data.token;
    }
  } catch (err: any) {
    state.responseStatus = err.response?.status || 500;
    state.responseError = err.response?.data || {};
  }
});

Then('the system should generate JWT token', () => {
  expect(state.jwtToken).notToBeNull();
  expect(typeof state.jwtToken).toBe('string');
});

Then('the user should get a successful response', () => {
  expect(state.responseStatus === 200 || state.responseStatus === 201).toBeTrue();
});

Then('login should fail with error {string}', (expectedError) => {
  expect(state.responseStatus).toBe(401);
  expect(state.responseError?.error).toBe(expectedError);
});

Given('the email {string} does not exist', async (email) => {
  const db = await getDb();
  await db.run('DELETE FROM users WHERE email = ?', [email]);
});

When('the user attempts login with empty email and empty password', async () => {
  try {
    const res = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      email: '',
      password: '',
    });
    state.responseStatus = res.status;
    state.responseData = res.data;
  } catch (err: any) {
    state.responseStatus = err.response?.status || 500;
    state.responseError = err.response?.data || {};
  }
});
