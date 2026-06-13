import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import type { Database } from 'sqlite';

export async function bootstrapDatabase(dbPath: string): Promise<Database> {
  // Open the SQLite database connection
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  // Enable foreign key constraints
  await db.exec('PRAGMA foreign_keys = ON;');

  // Create required tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS assets (
      id TEXT PRIMARY KEY,
      symbol TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      assetType TEXT NOT NULL,
      currentPrice REAL NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS investments (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      assetId TEXT NOT NULL,
      quantity REAL NOT NULL,
      purchasePrice REAL NOT NULL,
      purchaseDate TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (assetId) REFERENCES assets(id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      investmentId TEXT NOT NULL,
      transactionType TEXT NOT NULL,
      quantity REAL NOT NULL,
      price REAL NOT NULL,
      transactionDate TEXT NOT NULL,
      FOREIGN KEY (investmentId) REFERENCES investments(id) ON DELETE CASCADE
    );
  `);

  // Create indexes for foreign keys to optimize query performance
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_investments_userId ON investments (userId);
    CREATE INDEX IF NOT EXISTS idx_investments_assetId ON investments (assetId);
    CREATE INDEX IF NOT EXISTS idx_transactions_investmentId ON transactions (investmentId);
  `);

  return db;
}
