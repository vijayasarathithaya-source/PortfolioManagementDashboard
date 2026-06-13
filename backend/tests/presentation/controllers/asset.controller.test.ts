import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import { createApp } from '../../../src/app';
import { EnvConfig } from '../../../src/infrastructure/config/env.config';
import type { IUserRepository, IInvestmentRepository, ITransactionRepository, IAssetRepository } from '../../../src/domain/repositories/interfaces';
import type { Asset } from '../../../src/domain/entities';

describe('Asset Controller (TDD)', () => {
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

  describe('GET /api/assets', () => {
    it('should return 401 if unauthorized', async () => {
      const response = await request(app).get('/api/assets');
      expect(response.status).toBe(401);
    });

    it('should return a list of assets if authenticated', async () => {
      const mockAssets: Asset[] = [
        {
          id: 'asset-1',
          symbol: 'AAPL',
          name: 'Apple Inc.',
          assetType: 'Stocks',
          currentPrice: 175.5,
          updatedAt: new Date(),
        }
      ];

      mockAssetRepository.findAll.mockResolvedValue(mockAssets);

      const response = await request(app)
        .get('/api/assets')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body[0].symbol).toBe('AAPL');
    });
  });
});
