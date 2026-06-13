import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { PortfolioService } from '../../../src/application/services/portfolio.service.js';
import type { IInvestmentRepository, IAssetRepository } from '../../../src/domain/repositories/interfaces.js';
import type { Investment, Asset } from '../../../src/domain/entities.js';

describe('Portfolio Service Calculations (TDD)', () => {
  let mockInvestmentRepository: jest.Mocked<IInvestmentRepository>;
  let mockAssetRepository: jest.Mocked<IAssetRepository>;
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

    mockAssetRepository = {
      findById: jest.fn(),
      findBySymbol: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      updatePrice: jest.fn(),
    };

    portfolioService = new PortfolioService(mockInvestmentRepository, mockAssetRepository);
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
        assetId: 'asset-uuid-1',
        quantity: 10,       // Cost: 1500, Current: 1700
        purchasePrice: 150,
        purchaseDate: new Date(),
      },
      {
        id: 'inv-2',
        userId: userId,
        assetId: 'asset-uuid-2',
        quantity: 5,        // Cost: 5000, Current: 4800
        purchasePrice: 1000,
        purchaseDate: new Date(),
      }
    ];
    mockInvestmentRepository.findByUserId.mockResolvedValue(mockInvestments);
    mockAssetRepository.findById.mockImplementation(async (id) => {
      if (id === 'asset-uuid-1') {
        return { id, symbol: 'AAPL', name: 'Apple Inc.', assetType: 'Stocks', currentPrice: 170, updatedAt: new Date() };
      }
      if (id === 'asset-uuid-2') {
        return { id, symbol: 'USB', name: 'US Bond A', assetType: 'Bonds', currentPrice: 960, updatedAt: new Date() };
      }
      return null;
    });

    const summary = await portfolioService.getSummary(userId);

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
        assetId: 'asset-uuid-1',
        quantity: 10,       // Cost: 1000, Current: 1500
        purchasePrice: 100,
        purchaseDate: new Date(),
      }
    ];
    mockInvestmentRepository.findByUserId.mockResolvedValue(mockInvestments);
    mockAssetRepository.findById.mockImplementation(async (id) => {
      if (id === 'asset-uuid-1') {
        return { id, symbol: 'AAPL', name: 'Apple Inc.', assetType: 'Stocks', currentPrice: 150, updatedAt: new Date() };
      }
      return null;
    });

    const summary = await portfolioService.getSummary(userId);

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
        assetId: 'asset-uuid-3',
        quantity: 10,       // Cost: 1000, Current: 800
        purchasePrice: 100,
        purchaseDate: new Date(),
      }
    ];
    mockInvestmentRepository.findByUserId.mockResolvedValue(mockInvestments);
    mockAssetRepository.findById.mockImplementation(async (id) => {
      if (id === 'asset-uuid-3') {
        return { id, symbol: 'LMF', name: 'Lossy Mutual Fund', assetType: 'Mutual Funds', currentPrice: 80, updatedAt: new Date() };
      }
      return null;
    });

    const summary = await portfolioService.getSummary(userId);

    expect(summary.totalCost).toBe(1000);
    expect(summary.totalValue).toBe(800);
    expect(summary.totalProfitLoss).toBe(-200);
    expect(summary.returnPercentage).toBe(-20);
  });
});
