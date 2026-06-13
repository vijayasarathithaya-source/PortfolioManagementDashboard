import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../../../src/app.js';
import type { IUserRepository, IInvestmentRepository, ITransactionRepository } from '../../../src/domain/repositories/interfaces.js';
import type { Investment } from '../../../src/domain/entities.js';

describe('Investment Controller (TDD)', () => {
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockInvestmentRepository: jest.Mocked<IInvestmentRepository>;
  let mockTransactionRepository: jest.Mocked<ITransactionRepository>;
  let app: any;
  let authToken: string;

  const JWT_SECRET = 'test-secret';
  const userId = 'user-uuid-123';

  beforeEach(() => {
    process.env.JWT_SECRET = JWT_SECRET;
    
    // Create a valid auth token for requests
    authToken = jwt.sign({ id: userId, email: 'investor@example.com' }, JWT_SECRET);

    mockUserRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
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
      investmentRepository: mockInvestmentRepository,
      transactionRepository: mockTransactionRepository,
    });
  });

  describe('Authorization check', () => {
    it('should return 401 Unauthorized if no token is provided', async () => {
      const response = await request(app).get('/api/investments');
      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/investments', () => {
    const validPayload = {
      assetName: 'Apple Inc.',
      assetType: 'Stocks',
      quantity: 10,
      purchasePrice: 150.50,
      currentValue: 175.00,
      purchaseDate: '2026-01-15'
    };

    it('should successfully create a new investment with valid data', async () => {
      const mockCreatedInvestment: Investment = {
        id: 'investment-uuid-1',
        userId: userId,
        assetName: validPayload.assetName,
        assetType: 'Stocks',
        quantity: validPayload.quantity,
        purchasePrice: validPayload.purchasePrice,
        currentValue: validPayload.currentValue,
        purchaseDate: new Date(validPayload.purchaseDate)
      };

      mockInvestmentRepository.create.mockResolvedValue(mockCreatedInvestment);

      const response = await request(app)
        .post('/api/investments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validPayload);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id', 'investment-uuid-1');
      expect(response.body.assetName).toBe(validPayload.assetName);
      expect(mockInvestmentRepository.create).toHaveBeenCalled();
    });

    it('should return 400 if assetName is missing', async () => {
      const response = await request(app)
        .post('/api/investments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ ...validPayload, assetName: '' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', expect.stringContaining('Asset name is mandatory'));
    });

    it('should return 400 if assetType is invalid', async () => {
      const response = await request(app)
        .post('/api/investments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ ...validPayload, assetType: 'Crypto' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', expect.stringContaining('Asset type must be Stocks, Bonds, or Mutual Funds'));
    });

    it('should return 400 if quantity is zero or negative', async () => {
      const response = await request(app)
        .post('/api/investments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ ...validPayload, quantity: 0 });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', expect.stringContaining('Quantity must be greater than zero'));
    });

    it('should return 400 if purchasePrice is zero or negative', async () => {
      const response = await request(app)
        .post('/api/investments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ ...validPayload, purchasePrice: -5 });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', expect.stringContaining('Purchase price must be greater than zero'));
    });

    it('should return 400 if currentValue is zero or negative', async () => {
      const response = await request(app)
        .post('/api/investments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ ...validPayload, currentValue: 0 });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', expect.stringContaining('Current value must be greater than zero'));
    });
  });

  describe('GET /api/investments', () => {
    it('should return all investments for the authenticated user', async () => {
      const mockInvestments: Investment[] = [
        {
          id: 'investment-1',
          userId: userId,
          assetName: 'Apple Inc.',
          assetType: 'Stocks',
          quantity: 10,
          purchasePrice: 150,
          currentValue: 170,
          purchaseDate: new Date(),
        },
        {
          id: 'investment-2',
          userId: userId,
          assetName: 'US Treasury Bond',
          assetType: 'Bonds',
          quantity: 5,
          purchasePrice: 1000,
          currentValue: 1010,
          purchaseDate: new Date(),
        }
      ];

      mockInvestmentRepository.findByUserId.mockResolvedValue(mockInvestments);

      const response = await request(app)
        .get('/api/investments')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].assetName).toBe('Apple Inc.');
    });
  });

  describe('GET /api/investments/:id', () => {
    it('should return the investment if it belongs to the user', async () => {
      const mockInvestment: Investment = {
        id: 'investment-1',
        userId: userId,
        assetName: 'Apple Inc.',
        assetType: 'Stocks',
        quantity: 10,
        purchasePrice: 150,
        currentValue: 170,
        purchaseDate: new Date(),
      };

      mockInvestmentRepository.findById.mockResolvedValue(mockInvestment);

      const response = await request(app)
        .get('/api/investments/investment-1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe('investment-1');
    });

    it('should return 404 if the investment does not exist', async () => {
      mockInvestmentRepository.findById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/investments/non-existent')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Investment not found');
    });

    it('should return 403 Forbidden if the investment belongs to another user', async () => {
      const otherUserInvestment: Investment = {
        id: 'investment-1',
        userId: 'different-user-uuid',
        assetName: 'Apple Inc.',
        assetType: 'Stocks',
        quantity: 10,
        purchasePrice: 150,
        currentValue: 170,
        purchaseDate: new Date(),
      };

      mockInvestmentRepository.findById.mockResolvedValue(otherUserInvestment);

      const response = await request(app)
        .get('/api/investments/investment-1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error', 'Access denied to this investment');
    });
  });

  describe('PUT /api/investments/:id', () => {
    const updatePayload = {
      quantity: 12,
      purchasePrice: 155.00,
      currentValue: 180.00
    };

    it('should successfully update investment and return the updated entity', async () => {
      const originalInvestment: Investment = {
        id: 'investment-1',
        userId: userId,
        assetName: 'Apple Inc.',
        assetType: 'Stocks',
        quantity: 10,
        purchasePrice: 150,
        currentValue: 170,
        purchaseDate: new Date(),
      };

      const updatedInvestment: Investment = {
        ...originalInvestment,
        quantity: updatePayload.quantity,
        purchasePrice: updatePayload.purchasePrice,
        currentValue: updatePayload.currentValue,
      };

      mockInvestmentRepository.findById.mockResolvedValue(originalInvestment);
      mockInvestmentRepository.update.mockResolvedValue(updatedInvestment);

      const response = await request(app)
        .put('/api/investments/investment-1')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatePayload);

      expect(response.status).toBe(200);
      expect(response.body.quantity).toBe(12);
      expect(response.body.currentValue).toBe(180.00);
      expect(mockInvestmentRepository.update).toHaveBeenCalledWith('investment-1', updatePayload);
    });

    it('should return 400 if user tries to update restricted fields like assetType', async () => {
      const originalInvestment: Investment = {
        id: 'investment-1',
        userId: userId,
        assetName: 'Apple Inc.',
        assetType: 'Stocks',
        quantity: 10,
        purchasePrice: 150,
        currentValue: 170,
        purchaseDate: new Date(),
      };

      mockInvestmentRepository.findById.mockResolvedValue(originalInvestment);

      const response = await request(app)
        .put('/api/investments/investment-1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ ...updatePayload, assetType: 'Bonds' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', expect.stringContaining('Asset type cannot be modified after creation'));
    });

    it('should return 404 if investment is not found', async () => {
      mockInvestmentRepository.findById.mockResolvedValue(null);

      const response = await request(app)
        .put('/api/investments/non-existent')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatePayload);

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/investments/:id', () => {
    it('should delete the investment and return 200 OK', async () => {
      const mockInvestment: Investment = {
        id: 'investment-1',
        userId: userId,
        assetName: 'Apple Inc.',
        assetType: 'Stocks',
        quantity: 10,
        purchasePrice: 150,
        currentValue: 170,
        purchaseDate: new Date(),
      };

      mockInvestmentRepository.findById.mockResolvedValue(mockInvestment);
      mockInvestmentRepository.delete.mockResolvedValue(true);

      const response = await request(app)
        .delete('/api/investments/investment-1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Investment deleted successfully');
      expect(mockInvestmentRepository.delete).toHaveBeenCalledWith('investment-1');
    });

    it('should return 404 if investment does not exist', async () => {
      mockInvestmentRepository.findById.mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/investments/non-existent')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });
});
