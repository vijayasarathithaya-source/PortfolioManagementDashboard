import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import type { Database } from 'sqlite';
import { SqliteUserRepository, SqliteInvestmentRepository, SqliteTransactionRepository } from '../../../src/infrastructure/repositories/sqlite.repository.js';
import type { User, Investment, Transaction } from '../../../src/domain/entities.js';

describe('SQLite Repositories (TDD)', () => {
  let db: Database;
  let userRepository: SqliteUserRepository;
  let investmentRepository: SqliteInvestmentRepository;
  let transactionRepository: SqliteTransactionRepository;

  beforeEach(async () => {
    // Open in-memory SQLite database
    db = await open({
      filename: ':memory:',
      driver: sqlite3.Database
    });

    // Create Tables based on BRD design
    await db.exec(`
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        passwordHash TEXT NOT NULL,
        createdAt TEXT NOT NULL
      );

      CREATE TABLE investments (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        assetName TEXT NOT NULL,
        assetType TEXT NOT NULL,
        quantity REAL NOT NULL,
        purchasePrice REAL NOT NULL,
        currentValue REAL NOT NULL,
        purchaseDate TEXT NOT NULL,
        FOREIGN KEY(userId) REFERENCES users(id)
      );

      CREATE TABLE transactions (
        id TEXT PRIMARY KEY,
        investmentId TEXT NOT NULL,
        transactionType TEXT NOT NULL,
        quantity REAL NOT NULL,
        price REAL NOT NULL,
        transactionDate TEXT NOT NULL,
        FOREIGN KEY(investmentId) REFERENCES investments(id)
      );
    `);

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
        passwordHash: 'hashedpass',
      };

      const created = await userRepository.create(userPayload);
      expect(created).toHaveProperty('id');
      expect(created.email).toBe(userPayload.email);

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

    beforeEach(async () => {
      // Insert mock user to satisfy foreign keys if verified, but SQLite in-memory FK is off by default unless enabled
      await db.run('INSERT INTO users (id, email, passwordHash, createdAt) VALUES (?, ?, ?, ?)', [
        userId, 'user@example.com', 'hash', new Date().toISOString()
      ]);
    });

    it('should create and retrieve investments for a user', async () => {
      const investmentPayload = {
        userId,
        assetName: 'Apple Inc.',
        assetType: 'Stocks' as const,
        quantity: 10,
        purchasePrice: 150,
        currentValue: 170,
        purchaseDate: new Date(),
      };

      const created = await investmentRepository.create(investmentPayload);
      expect(created).toHaveProperty('id');
      expect(created.assetName).toBe('Apple Inc.');

      const found = await investmentRepository.findByUserId(userId);
      expect(found).toHaveLength(1);
      expect(found[0]?.id).toBe(created.id);
    });

    it('should update and delete an investment', async () => {
      const investmentPayload = {
        userId,
        assetName: 'Microsoft',
        assetType: 'Stocks' as const,
        quantity: 10,
        purchasePrice: 200,
        currentValue: 210,
        purchaseDate: new Date(),
      };

      const created = await investmentRepository.create(investmentPayload);
      
      const updated = await investmentRepository.update(created.id, {
        quantity: 12,
        currentValue: 220
      });
      expect(updated.quantity).toBe(12);
      expect(updated.currentValue).toBe(220);

      const deleted = await investmentRepository.delete(created.id);
      expect(deleted).toBe(true);

      const found = await investmentRepository.findById(created.id);
      expect(found).toBeNull();
    });
  });

  describe('SqliteTransactionRepository', () => {
    const investmentId = 'investment-uuid-1';
    const userId = 'user-uuid-123';

    beforeEach(async () => {
      // Seed user and investment
      await db.run('INSERT INTO users (id, email, passwordHash, createdAt) VALUES (?, ?, ?, ?)', [
        userId, 'user@example.com', 'hash', new Date().toISOString()
      ]);
      await db.run('INSERT INTO investments (id, userId, assetName, assetType, quantity, purchasePrice, currentValue, purchaseDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
        investmentId, userId, 'Apple Inc.', 'Stocks', 10, 150, 170, new Date().toISOString()
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

      expect(filtered).toHaveLength(1);
      expect(filtered[0]?.id).toBe('tx-2');
    });
  });
});
