import { Before } from '@cucumber/cucumber';

export const BACKEND_URL = process.env.BACKEND_URL;
if (!BACKEND_URL) {
  throw new Error('BACKEND_URL environment variable is required to run the tests.');
}

// Custom assertions library
export const expect = (actual: any) => ({
  toBe: (expected: any) => {
    if (actual !== expected) {
      throw new Error(`Expected ${actual} to be ${expected}`);
    }
  },
  toBeGreaterThan: (expected: number) => {
    if (actual <= expected) {
      throw new Error(`Expected ${actual} to be greater than ${expected}`);
    }
  },
  toBeLessThan: (expected: number) => {
    if (actual >= expected) {
      throw new Error(`Expected ${actual} to be less than ${expected}`);
    }
  },
  notToBeNull: () => {
    if (actual === null || actual === undefined) {
      throw new Error(`Expected ${actual} not to be null or undefined`);
    }
  },
  toContain: (substring: string) => {
    if (typeof actual !== 'string' || !actual.includes(substring)) {
      throw new Error(`Expected ${actual} to contain ${substring}`);
    }
  },
  toBeTrue: () => {
    if (actual !== true) {
      throw new Error(`Expected ${actual} to be true`);
    }
  }
});

// Shared Scenario State
export const state = {
  currentEmail: '',
  currentPassword: '',
  currentUserId: '',
  currentFullName: '',
  jwtToken: '',
  responseStatus: 0,
  responseData: null as any,
  responseError: null as any,

  // Calculation variables
  qty: 0,
  buyPrice: 0,
  currentPrice: 0,
  calcProfitLoss: 0,
  calcReturnPercentage: 0,

  reset() {
    this.currentEmail = '';
    this.currentPassword = '';
    this.currentUserId = '';
    this.currentFullName = '';
    this.jwtToken = '';
    this.responseStatus = 0;
    this.responseData = null;
    this.responseError = null;
    this.qty = 0;
    this.buyPrice = 0;
    this.currentPrice = 0;
    this.calcProfitLoss = 0;
    this.calcReturnPercentage = 0;
  }
};

// Reset state automatically before each scenario runs
Before(() => {
  state.reset();
});
