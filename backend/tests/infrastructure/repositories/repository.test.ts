import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { bootstrapDatabase } from '../../../src/infrastructure/database/bootstrap';
import { SqliteUserRepository, SqliteInvestmentRepository, SqliteTransactionRepository } from '../../../src/infrastructure/repositories/sqlite.repository';
import type { User, Investment, Transaction } from '../../../src/domain/entities';
import type { Database } from 'sqlite';

describe('SQLite Repositories (TDD)', () => {
  let db: Database;
  let userRepository: SqliteUserRepository;
  let investmentRepository: SqliteInvestmentRepository;
  let transactionRepository: SqliteTransactionRepository;

  beforeEach(async () => {
    // Open and bootstrap in-memory SQLite database
    db = await bootstrapDatabase(':memory:');

    userRepository = new SqliteUserRepository(db);
    investmentRepository = new SqliteInvestmentRepository(db);
    transactionRepository = new SqliteTransactionRepository(db);
  });

  afterEach(async () => {
    await db.close();
  });

  describe('SqliteUserRepository', () => {
    it('should insert a user and find them by email and id', async () => {
      const userPayload = {
        email: 'test@example.com',
        fullName: 'Test Investor',
        passwordHash: 'hashedpass',
      };

      const created = await userRepository.create(userPayload);
      expect(created).toHaveProperty('id');
      expect(created.email).toBe(userPayload.email);
      expect(created.fullName).toBe(userPayload.fullName);

      const foundByEmail = await userRepository.findByEmail(userPayload.email);
      expect(foundByEmail).not.toBeNull();
      expect(foundByEmail?.id).toBe(created.id);

      const foundById = await userRepository.findById(created.id);
      expect(foundById).not.toBeNull();
      expect(foundById?.email).toBe(userPayload.email);
    });
  });

  describe('SqliteInvestmentRepository', () => {
    const userId = 'user-uuid-123';
    const assetId = 'asset-uuid-1';

    beforeEach(async () => {
      // Seed user and reference asset
      await db.run('INSERT INTO users (id, email, fullName, passwordHash, createdAt) VALUES (?, ?, ?, ?, ?)', [
        userId, 'user@example.com', 'Test User', 'hash', new Date().toISOString()
      ]);
      await db.run('INSERT INTO assets (id, symbol, name, assetType, currentPrice, updatedAt) VALUES (?, ?, ?, ?, ?, ?)', [
        assetId, 'AAPL_TEST', 'Apple Inc.', 'Stocks', 170.00, new Date().toISOString()
      ]);
    });

    it('should create and retrieve investments for a user', async () => {
      const investmentPayload = {
        userId,
        assetId,
        quantity: 10,
        purchasePrice: 150,
        purchaseDate: new Date(),
      };

      const created = await investmentRepository.create(investmentPayload);
      expect(created).toHaveProperty('id');
      expect(created.assetId).toBe(assetId);

      const found = await investmentRepository.findByUserId(userId);
      expect(found).toHaveLength(1);
      expect(found[0]?.id).toBe(created.id);
    });

    it('should update and delete an investment', async () => {
      const investmentPayload = {
        userId,
        assetId,
        quantity: 10,
        purchasePrice: 200,
        purchaseDate: new Date(),
      };

      const created = await investmentRepository.create(investmentPayload);
      
      const updated = await investmentRepository.update(created.id, {
        quantity: 12,
        purchasePrice: 210
      });
      expect(updated.quantity).toBe(12);
      expect(updated.purchasePrice).toBe(210);

      const deleted = await investmentRepository.delete(created.id);
      expect(deleted).toBe(true);

      const found = await investmentRepository.findById(created.id);
      expect(found).toBeNull();
    });
  });

  describe('SqliteTransactionRepository', () => {
    const investmentId = 'investment-uuid-1';
    const userId = 'user-uuid-123';
    const assetId = 'asset-uuid-1';

    beforeEach(async () => {
      // Seed user, asset, and investment
      await db.run('INSERT INTO users (id, email, fullName, passwordHash, createdAt) VALUES (?, ?, ?, ?, ?)', [
        userId, 'user@example.com', 'Test User', 'hash', new Date().toISOString()
      ]);
      await db.run('INSERT INTO assets (id, symbol, name, assetType, currentPrice, updatedAt) VALUES (?, ?, ?, ?, ?, ?)', [
        assetId, 'AAPL_TEST', 'Apple Inc.', 'Stocks', 170.00, new Date().toISOString()
      ]);
      await db.run('INSERT INTO investments (id, userId, assetId, quantity, purchasePrice, purchaseDate) VALUES (?, ?, ?, ?, ?, ?)', [
        investmentId, userId, assetId, 10, 150, new Date().toISOString()
      ]);
    });

    it('should insert a transaction and find it by investmentId', async () => {
      const txPayload = {
        investmentId,
        transactionType: 'BUY' as const,
        quantity: 5,
        price: 155,
      };

      const created = await transactionRepository.create(txPayload);
      expect(created).toHaveProperty('id');
      expect(created.price).toBe(155);

      const transactions = await transactionRepository.findByInvestmentId(investmentId);
      expect(transactions).toHaveLength(1);
      expect(transactions[0]?.id).toBe(created.id);
    });

    it('should return transactions filtered by type and date range', async () => {
      // Insert multiple transactions
      const tx1Date = new Date('2026-01-01T10:00:00.000Z');
      const tx2Date = new Date('2026-05-01T10:00:00.000Z');

      await db.run('INSERT INTO transactions (id, investmentId, transactionType, quantity, price, transactionDate) VALUES (?, ?, ?, ?, ?, ?)', [
        'tx-1', investmentId, 'BUY', 5, 150, tx1Date.toISOString()
      ]);
      await db.run('INSERT INTO transactions (id, investmentId, transactionType, quantity, price, transactionDate) VALUES (?, ?, ?, ?, ?, ?)', [
        'tx-2', investmentId, 'SELL', 3, 160, tx2Date.toISOString()
      ]);

      const filtered = await transactionRepository.findByUserId(userId, {
        transactionType: 'SELL',
        startDate: new Date('2026-04-01'),
        endDate: new Date('2026-06-01'),
      });

      expect(filtered.transactions).toHaveLength(1);
      expect(filtered.total).toBe(1);
      expect(filtered.transactions[0]?.id).toBe('tx-2');
    });

    it('should return paginated transactions in descending date order', async () => {
      const dates = [
        new Date('2026-01-01T10:00:00.000Z'),
        new Date('2026-02-01T10:00:00.000Z'),
        new Date('2026-03-01T10:00:00.000Z'),
      ];
      for (let i = 0; i < 3; i++) {
        await db.run('INSERT INTO transactions (id, investmentId, transactionType, quantity, price, transactionDate) VALUES (?, ?, ?, ?, ?, ?)', [
          `tx-pag-${i}`, investmentId, 'BUY', 1, 100, dates[i].toISOString()
        ]);
      }

      const page1 = await transactionRepository.findByUserId(userId, {
        page: 1,
        limit: 2,
      });
      expect(page1.transactions).toHaveLength(2);
      expect(page1.total).toBe(3);
      expect(page1.transactions[0]?.id).toBe('tx-pag-2');
      expect(page1.transactions[1]?.id).toBe('tx-pag-1');

      const page2 = await transactionRepository.findByUserId(userId, {
        page: 2,
        limit: 2,
      });
      expect(page2.transactions).toHaveLength(1);
      expect(page2.total).toBe(3);
      expect(page2.transactions[0]?.id).toBe('tx-pag-0');
    });
  });
});
