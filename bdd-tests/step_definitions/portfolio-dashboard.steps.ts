import { When, Then } from '@cucumber/cucumber';
import axios from 'axios';
import { expect, state, BACKEND_URL } from '../support/state';

When('the dashboard is opened', async () => {
  try {
    const res = await axios.get(`${BACKEND_URL}/api/portfolio/summary`, {
      headers: { Authorization: `Bearer ${state.jwtToken}` }
    });
    state.responseStatus = res.status;
    state.responseData = res.data;
  } catch (err: any) {
    state.responseStatus = err.response?.status || 500;
    state.responseError = err.response?.data || {};
  }
});

When('the user requests the portfolio summary', async () => {
  try {
    const res = await axios.get(`${BACKEND_URL}/api/portfolio/summary`, {
      headers: { Authorization: `Bearer ${state.jwtToken}` }
    });
    state.responseStatus = res.status;
    state.responseData = res.data;
  } catch (err: any) {
    state.responseStatus = err.response?.status || 500;
    state.responseError = err.response?.data || {};
  }
});

Then('total portfolio value should be displayed', () => {
  expect(typeof state.responseData.totalValue).toBe('number');
  expect(state.responseData.totalValue >= 0).toBeTrue();
});

Then('total investment cost should be displayed', () => {
  expect(typeof state.responseData.totalCost).toBe('number');
  expect(state.responseData.totalCost >= 0).toBeTrue();
});

Then('total profit loss should be displayed', () => {
  expect(typeof state.responseData.totalProfitLoss).toBe('number');
});

Then('total asset count should be {int}', (expectedCount) => {
  expect(state.responseData.totalAssetsCount).toBe(expectedCount);
});

Then('total portfolio value should be {int}', (expectedValue) => {
  expect(state.responseData.totalValue).toBe(expectedValue);
});

Then('total investment cost should be {int}', (expectedCost) => {
  expect(state.responseData.totalCost).toBe(expectedCost);
});

Then('total profit loss should be {int}', (expectedPL) => {
  expect(state.responseData.totalProfitLoss).toBe(expectedPL);
});
