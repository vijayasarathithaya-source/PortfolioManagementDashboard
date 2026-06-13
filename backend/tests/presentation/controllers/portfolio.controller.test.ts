import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import { createApp } from '../../../src/app';
import { EnvConfig } from '../../../src/infrastructure/config/env.config';
import type { IUserRepository, IInvestmentRepository, ITransactionRepository, IAssetRepository } from '../../../src/domain/repositories/interfaces';
import type { Investment, Asset } from '../../../src/domain/entities';

describe('Portfolio Controller (TDD)', () => {
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockAssetRepository: jest.Mocked<IAssetRepository>;
  let mockInvestmentRepository: jest.Mocked<IInvestmentRepository>;
  let mockTransactionRepository: jest.Mocked<ITransactionRepository>;
  let app: any;
  let authToken: string;

  const userId = 'user-uuid-123';

  beforeEach(() => {
    const privateKey = fs.readFileSync(EnvConfig.JWT_PRIVATE_KEY_PATH, 'utf8');
    authToken = jwt.sign({ id: userId, email: 'investor@example.com' }, privateKey, { algorithm: 'RS256' });

    mockUserRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
    };

    mockAssetRepository = {
      findById: jest.fn(),
      findBySymbol: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      updatePrice: jest.fn(),
    };

    mockInvestmentRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockTransactionRepository = {
      findById: jest.fn(),
      findByInvestmentId: jest.fn(),
      findByUserId: jest.fn(),
      create: jest.fn(),
    };

    app = createApp({
      userRepository: mockUserRepository,
      assetRepository: mockAssetRepository,
      investmentRepository: mockInvestmentRepository,
      transactionRepository: mockTransactionRepository,
    });
  });

  describe('Authorization check', () => {
    it('should return 401 Unauthorized if no token is provided for /api/portfolio/summary', async () => {
      const response = await request(app).get('/api/portfolio/summary');
      expect(response.status).toBe(401);
    });

    it('should return 401 Unauthorized if no token is provided for /api/portfolio', async () => {
      const response = await request(app).get('/api/portfolio');
      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/portfolio/summary', () => {
    it('should return correct portfolio summary calculations', async () => {
      const mockInvestments: Investment[] = [
        {
          id: 'inv-1',
          userId,
          assetId: 'asset-1',
          quantity: 10,
          purchasePrice: 100,
          purchaseDate: new Date(),
        },
        {
          id: 'inv-2',
          userId,
          assetId: 'asset-2',
          quantity: 5,
          purchasePrice: 200,
          purchaseDate: new Date(),
        }
      ];

      mockInvestmentRepository.findByUserId.mockResolvedValue(mockInvestments);
      mockAssetRepository.findById.mockImplementation(async (id) => {
        if (id === 'asset-1') {
          return { id, symbol: 'AAPL', name: 'Apple Inc.', assetType: 'Stocks', currentPrice: 150, updatedAt: new Date() };
        }
        if (id === 'asset-2') {
          return { id, symbol: 'MSFT', name: 'Microsoft Corp.', assetType: 'Stocks', currentPrice: 180, updatedAt: new Date() };
        }
        return null;
      });

      const response = await request(app)
        .get('/api/portfolio/summary')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        totalValue: 2400, // (10 * 150) + (5 * 180) = 1500 + 900 = 2400
        totalCost: 2000,  // (10 * 100) + (5 * 200) = 1000 + 1000 = 2000
        totalProfitLoss: 400, // 2400 - 2000 = 400
        totalAssetsCount: 2,
        returnPercentage: 20, // (400 / 2000) * 100 = 20
      });
    });
  });

  describe('GET /api/portfolio', () => {
    it('should return detailed holdings with profit/loss metrics', async () => {
      const mockInvestments: Investment[] = [
        {
          id: 'inv-1',
          userId,
          assetId: 'asset-1',
          quantity: 10,
          purchasePrice: 100,
          purchaseDate: new Date(),
        }
      ];

      mockInvestmentRepository.findByUserId.mockResolvedValue(mockInvestments);
      mockAssetRepository.findById.mockResolvedValue({
        id: 'asset-1',
        symbol: 'AAPL',
        name: 'Apple Inc.',
        assetType: 'Stocks',
        currentPrice: 150,
        updatedAt: new Date(),
      });

      const response = await request(app)
        .get('/api/portfolio')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toEqual(expect.objectContaining({
        id: 'inv-1',
        assetId: 'asset-1',
        symbol: 'AAPL',
        name: 'Apple Inc.',
        assetType: 'Stocks',
        quantity: 10,
        purchasePrice: 100,
        currentPrice: 150,
        currentValue: 1500,
        profitLoss: 500,
        returnPercentage: 50,
      }));
    });
  });
});
