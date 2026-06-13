import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import { createApp } from '../../../src/app';
import { EnvConfig } from '../../../src/infrastructure/config/env.config';
import type { IUserRepository, IInvestmentRepository, ITransactionRepository, IAssetRepository } from '../../../src/domain/repositories/interfaces';
import type { Transaction } from '../../../src/domain/entities';

describe('Transaction Controller (TDD)', () => {
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
    it('should return 401 Unauthorized if no token is provided', async () => {
      const response = await request(app).get('/api/transactions');
      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/transactions', () => {
    const validPayload = {
      investmentId: 'investment-uuid-1',
      transactionType: 'BUY',
      quantity: 5,
      price: 150.00
    };

    it('should successfully create a new transaction with valid data', async () => {
      const mockCreatedTransaction: Transaction = {
        id: 'transaction-uuid-1',
        investmentId: validPayload.investmentId,
        transactionType: 'BUY',
        quantity: validPayload.quantity,
        price: validPayload.price,
        transactionDate: new Date()
      };

      mockTransactionRepository.create.mockResolvedValue(mockCreatedTransaction);

      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validPayload);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id', 'transaction-uuid-1');
      expect(response.body.investmentId).toBe(validPayload.investmentId);
      expect(response.body.transactionType).toBe('BUY');
      expect(mockTransactionRepository.create).toHaveBeenCalled();
    });

    it('should return 400 if investmentId is missing', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ ...validPayload, investmentId: '' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', expect.stringContaining('Investment ID is mandatory'));
    });

    it('should return 400 if transactionType is invalid', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ ...validPayload, transactionType: 'DIVIDEND' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', expect.stringContaining('Transaction type must be BUY or SELL'));
    });

    it('should return 400 if quantity is zero or negative', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ ...validPayload, quantity: -1 });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', expect.stringContaining('Quantity must be greater than zero'));
    });

    it('should return 400 if price is zero or negative', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ ...validPayload, price: 0 });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', expect.stringContaining('Price must be greater than zero'));
    });
  });

  describe('GET /api/transactions', () => {
    it('should return all transactions for the authenticated user without filters', async () => {
      const mockTransactions: Transaction[] = [
        {
          id: 't-1',
          investmentId: 'inv-1',
          transactionType: 'BUY',
          quantity: 10,
          price: 150,
          transactionDate: new Date(),
        },
        {
          id: 't-2',
          investmentId: 'inv-1',
          transactionType: 'SELL',
          quantity: 5,
          price: 160,
          transactionDate: new Date(),
        }
      ];

      mockTransactionRepository.findByUserId.mockResolvedValue(mockTransactions);

      const response = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].transactionType).toBe('BUY');
    });

    it('should forward query filters (date range, type, assetType) to the repository', async () => {
      mockTransactionRepository.findByUserId.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/transactions')
        .query({
          startDate: '2026-01-01',
          endDate: '2026-06-30',
          transactionType: 'SELL',
          assetType: 'Stocks'
        })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(mockTransactionRepository.findByUserId).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          startDate: expect.any(Date),
          endDate: expect.any(Date),
          transactionType: 'SELL',
          assetType: 'Stocks'
        })
      );
    });
  });
});
