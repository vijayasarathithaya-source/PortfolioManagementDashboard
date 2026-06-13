import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { PortfolioService } from '../../../src/application/services/portfolio.service.js';
import type { IInvestmentRepository } from '../../../src/domain/repositories/interfaces.js';
import type { Investment } from '../../../src/domain/entities.js';

describe('Portfolio Service Calculations (TDD)', () => {
  let mockInvestmentRepository: jest.Mocked<IInvestmentRepository>;
  let portfolioService: PortfolioService;
  const userId = 'user-uuid-123';

  beforeEach(() => {
    mockInvestmentRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    portfolioService = new PortfolioService(mockInvestmentRepository);
  });

  it('should return default zero values if the user has no investments', async () => {
    mockInvestmentRepository.findByUserId.mockResolvedValue([]);

    const summary = await portfolioService.getSummary(userId);

    expect(summary.totalValue).toBe(0);
    expect(summary.totalCost).toBe(0);
    expect(summary.totalProfitLoss).toBe(0);
    expect(summary.totalAssetsCount).toBe(0);
    expect(summary.returnPercentage).toBe(0);
  });

  it('should correctly calculate summary metrics based on user investments', async () => {
    const mockInvestments: Investment[] = [
      {
        id: 'inv-1',
        userId: userId,
        assetName: 'Apple Inc.',
        assetType: 'Stocks',
        quantity: 10,       // Cost: 1500, Current: 1700
        purchasePrice: 150,
        currentValue: 170,
        purchaseDate: new Date(),
      },
      {
        id: 'inv-2',
        userId: userId,
        assetName: 'US Bond A',
        assetType: 'Bonds',
        quantity: 5,        // Cost: 5000, Current: 4800
        purchasePrice: 1000,
        currentValue: 960,
        purchaseDate: new Date(),
      }
    ];
    mockInvestmentRepository.findByUserId.mockResolvedValue(mockInvestments);

    const summary = await portfolioService.getSummary(userId);

    // Total Cost = (10 * 150) + (5 * 1000) = 1500 + 5000 = 6500
    // Total Value = (10 * 170) + (5 * 960) = 1700 + 4800 = 6500
    // Total Profit/Loss = 6500 - 6500 = 0
    // Return % = (0 / 6500) * 100 = 0
    expect(summary.totalCost).toBe(6500);
    expect(summary.totalValue).toBe(6500);
    expect(summary.totalProfitLoss).toBe(0);
    expect(summary.totalAssetsCount).toBe(2);
    expect(summary.returnPercentage).toBe(0);
  });

  it('should correctly calculate positive profits and performance percentages', async () => {
    const mockInvestments: Investment[] = [
      {
        id: 'inv-1',
        userId: userId,
        assetName: 'Apple Inc.',
        assetType: 'Stocks',
        quantity: 10,       // Cost: 1000, Current: 1500
        purchasePrice: 100,
        currentValue: 150,
        purchaseDate: new Date(),
      }
    ];
    mockInvestmentRepository.findByUserId.mockResolvedValue(mockInvestments);

    const summary = await portfolioService.getSummary(userId);

    // Total Cost = 10 * 100 = 1000
    // Total Value = 10 * 150 = 1500
    // Profit = 1500 - 1000 = 500
    // Return % = (500 / 1000) * 100 = 50%
    expect(summary.totalCost).toBe(1000);
    expect(summary.totalValue).toBe(1500);
    expect(summary.totalProfitLoss).toBe(500);
    expect(summary.totalAssetsCount).toBe(1);
    expect(summary.returnPercentage).toBe(50);
  });

  it('should handle negative profits (losses)', async () => {
    const mockInvestments: Investment[] = [
      {
        id: 'inv-1',
        userId: userId,
        assetName: 'Lossy Mutual Fund',
        assetType: 'Mutual Funds',
        quantity: 10,       // Cost: 1000, Current: 800
        purchasePrice: 100,
        currentValue: 80,
        purchaseDate: new Date(),
      }
    ];
    mockInvestmentRepository.findByUserId.mockResolvedValue(mockInvestments);

    const summary = await portfolioService.getSummary(userId);

    // Total Cost = 1000
    // Total Value = 800
    // Profit = -200
    // Return % = (-200 / 1000) * 100 = -20%
    expect(summary.totalCost).toBe(1000);
    expect(summary.totalValue).toBe(800);
    expect(summary.totalProfitLoss).toBe(-200);
    expect(summary.returnPercentage).toBe(-20);
  });
});
