import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import { createApp } from '../../../src/app.js';
import type { IUserRepository, IInvestmentRepository, ITransactionRepository, IAssetRepository } from '../../../src/domain/repositories/interfaces.js';
import type { User } from '../../../src/domain/entities.js';

describe('Auth Controller (TDD)', () => {
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockAssetRepository: jest.Mocked<IAssetRepository>;
  let mockInvestmentRepository: jest.Mocked<IInvestmentRepository>;
  let mockTransactionRepository: jest.Mocked<ITransactionRepository>;
  let app: any;

  beforeEach(() => {
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

  describe('POST /api/auth/register', () => {
    const validRegisterPayload = {
      email: 'investor@example.com',
      password: 'password123',
    };

    it('should successfully register a user when valid email and password are provided', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      
      const createdUser: User = {
        id: 'user-uuid-123',
        email: validRegisterPayload.email,
        passwordHash: 'hashedpassword',
        createdAt: new Date(),
      };
      
      mockUserRepository.create.mockResolvedValue(createdUser);

      const response = await request(app)
        .post('/api/auth/register')
        .send(validRegisterPayload);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe(validRegisterPayload.email);
      expect(response.body.user).not.toHaveProperty('passwordHash');
      expect(response.body).toHaveProperty('message', 'Registration successful');
    });

    it('should fail registration if the email is already registered', async () => {
      const existingUser: User = {
        id: 'user-uuid-existing',
        email: validRegisterPayload.email,
        passwordHash: 'hashedpassword',
        createdAt: new Date(),
      };
      mockUserRepository.findByEmail.mockResolvedValue(existingUser);

      const response = await request(app)
        .post('/api/auth/register')
        .send(validRegisterPayload);

      expect(response.status).toBe(409); // Conflict
      expect(response.body).toHaveProperty('error');
    });

    it('should fail registration if email format is invalid', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'invalid-email', password: 'password123' });

      expect(response.status).toBe(400); // Bad Request
      expect(response.body).toHaveProperty('error');
    });

    it('should fail registration if password is too short', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'investor@example.com', password: '123' });

      expect(response.status).toBe(400); // Bad Request
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    const validLoginPayload = {
      email: 'investor@example.com',
      password: 'password123',
    };

    it('should successfully log in and return a JWT token with valid credentials', async () => {
      const dbUser: User = {
        id: 'user-uuid-123',
        email: validLoginPayload.email,
        passwordHash: 'hashedpassword', // Assume mocked hashing resolves correctly
        createdAt: new Date(),
      };
      
      mockUserRepository.findByEmail.mockResolvedValue(dbUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send(validLoginPayload);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(validLoginPayload.email);
    });

    it('should fail log in with incorrect credentials', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send(validLoginPayload);

      expect(response.status).toBe(401); // Unauthorized
      expect(response.body).toHaveProperty('error');
    });

    it('should validate missing email/password fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: '' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should successfully log out', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer valid-jwt-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Logged out successfully');
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should return 200 and the user profile if authenticated', async () => {
      const dbUser: User = {
        id: 'user-uuid-123',
        email: 'investor@example.com',
        passwordHash: 'hashedpassword',
        createdAt: new Date(),
      };
      mockUserRepository.findById.mockResolvedValue(dbUser);

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer valid-jwt-token'); // Verified token

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 'user-uuid-123');
      expect(response.body).toHaveProperty('email', 'investor@example.com');
      expect(response.body).not.toHaveProperty('passwordHash');
    });

    it('should return 401 if auth header is missing', async () => {
      const response = await request(app).get('/api/auth/profile');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });
});
