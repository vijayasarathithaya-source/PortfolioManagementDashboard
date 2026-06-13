import { Given, When, Then } from '@cucumber/cucumber';
import axios from 'axios';
import { expect, state, BACKEND_URL } from '../../support/state';

When('the user calls protected portfolio API with valid JWT token', async () => {
  try {
    const res = await axios.get(`${BACKEND_URL}/api/portfolio`, {
      headers: { Authorization: `Bearer ${state.jwtToken}` }
    });
    state.responseStatus = res.status;
    state.responseData = res.data;
  } catch (err: any) {
    state.responseStatus = err.response?.status || 500;
  }
});

Then('data should be returned', () => {
  expect(state.responseStatus).toBe(200);
  expect(Array.isArray(state.responseData)).toBeTrue();
});

When('the user calls protected portfolio API without JWT token', async () => {
  try {
    const res = await axios.get(`${BACKEND_URL}/api/portfolio`);
    state.responseStatus = res.status;
  } catch (err: any) {
    state.responseStatus = err.response?.status || 500;
  }
});

Then('request should be rejected with status {int}', (status) => {
  expect(state.responseStatus).toBe(status);
});

Given('an invalid or expired JWT token', () => {
  state.jwtToken = 'invalid-expired-mock-token-abc';
});

When('the user calls protected portfolio API with expired JWT token', async () => {
  try {
    const res = await axios.get(`${BACKEND_URL}/api/portfolio`, {
      headers: { Authorization: `Bearer ${state.jwtToken}` }
    });
    state.responseStatus = res.status;
  } catch (err: any) {
    state.responseStatus = err.response?.status || 500;
  }
});
