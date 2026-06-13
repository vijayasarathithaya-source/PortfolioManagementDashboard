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

  // Seed default 100 assets if table is empty
  const countRow = await db.get('SELECT COUNT(*) as count FROM assets');
  if (countRow && countRow.count === 0) {
    const assetsToSeed: { id: string; symbol: string; name: string; assetType: string; currentPrice: number }[] = [];

    // 50 Stocks
    const stockTickers = [
      'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'BRK.B', 'V', 'JNJ',
      'WMT', 'PG', 'JPM', 'UNH', 'HD', 'LLY', 'MA', 'ABBV', 'AVGO', 'COST',
      'PEP', 'KO', 'ADBE', 'INTC', 'CSCO', 'XOM', 'CVX', 'WFC', 'BAC', 'MCD',
      'NKE', 'DIS', 'AMD', 'NFLX', 'CRM', 'T', 'VZ', 'ORCL', 'PFE', 'MRK',
      'ABT', 'CSX', 'UPS', 'HON', 'GE', 'MS', 'SCHW', 'CAT', 'DE', 'TXN'
    ];
    stockTickers.forEach((symbol, i) => {
      assetsToSeed.push({
        id: `asset-stock-${i + 1}`,
        symbol,
        name: `${symbol} Corp`,
        assetType: 'Stocks',
        currentPrice: Math.round((50 + Math.random() * 300) * 100) / 100
      });
    });

    // 25 Bonds
    const bondTickers = [
      'BND', 'AGG', 'IEF', 'SHY', 'TLT', 'LQD', 'TIP', 'MBB', 'MUB', 'VCSH',
      'VCIT', 'BSV', 'BIV', 'BLV', 'IEI', 'VGSH', 'VGIT', 'VGLT', 'VTIP', 'VMBS',
      'BNDX', 'VWOB', 'IUSB', 'SUSB', 'FLOT'
    ];
    bondTickers.forEach((symbol, i) => {
      assetsToSeed.push({
        id: `asset-bond-${i + 1}`,
        symbol,
        name: `${symbol} Bond Fund`,
        assetType: 'Bonds',
        currentPrice: Math.round((80 + Math.random() * 50) * 100) / 100
      });
    });

    // 25 Mutual Funds
    const fundTickers = [
      'VTSAX', 'VFIAX', 'FXAIX', 'SWTSX', 'FZROX', 'FNILX', 'VIGAX', 'VMCPX', 'VEXAX', 'VTIAX',
      'VGTSX', 'FTIPX', 'FSPSX', 'FTIHX', 'VBTLX', 'FTBFX', 'FXNAX', 'VWUSX', 'FDGRX', 'PRGFX',
      'VWENX', 'VBIAX', 'VSMGX', 'VHGEX', 'VGSTX'
    ];
    fundTickers.forEach((symbol, i) => {
      assetsToSeed.push({
        id: `asset-fund-${i + 1}`,
        symbol,
        name: `${symbol} Mutual Fund`,
        assetType: 'Mutual Funds',
        currentPrice: Math.round((10 + Math.random() * 150) * 100) / 100
      });
    });

    await db.exec('BEGIN TRANSACTION;');
    try {
      const stmt = await db.prepare(
        'INSERT INTO assets (id, symbol, name, assetType, currentPrice, updatedAt) VALUES (?, ?, ?, ?, ?, ?)'
      );
      for (const asset of assetsToSeed) {
        await stmt.run(asset.id, asset.symbol, asset.name, asset.assetType, asset.currentPrice, new Date().toISOString());
      }
      await stmt.finalize();
      await db.exec('COMMIT;');
      console.log('Seeded 100 default assets successfully.');
    } catch (err) {
      await db.exec('ROLLBACK;');
      console.error('Failed to seed assets:', err);
    }
  }

  return db;
}
