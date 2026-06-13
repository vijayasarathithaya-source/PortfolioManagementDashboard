import { Given, When, Then } from '@cucumber/cucumber';
import { expect, state } from '../../support/state';

Given('quantity is {int}', (q: number) => {
  state.qty = q;
});

Given('purchase price is {int}', (price: number) => {
  state.buyPrice = price;
});

Given('current value is {int}', (val: number) => {
  state.currentPrice = val;
});

When('profit loss is calculated', () => {
  state.calcProfitLoss = state.qty * (state.currentPrice - state.buyPrice);
});

Then('profit loss should equal {int}', (expectedPL) => {
  expect(state.calcProfitLoss).toBe(expectedPL);
});

When('return percentage is calculated', () => {
  state.calcReturnPercentage = state.buyPrice === 0 ? 0 : ((state.currentPrice - state.buyPrice) / state.buyPrice) * 100;
});

Then('return percentage should equal {int}', (expectedPct) => {
  expect(state.calcReturnPercentage).toBe(expectedPct);
});
