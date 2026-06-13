import { randomUUID } from 'crypto';
import type { Database } from 'sqlite';
import type { IUserRepository, IInvestmentRepository, ITransactionRepository, IAssetRepository } from '../../domain/repositories/interfaces';
import type { User, Investment, Transaction, AssetType, TransactionType, Asset } from '../../domain/entities';

export class SqliteUserRepository implements IUserRepository {
  constructor(private db: Database) {}

  async findById(id: string): Promise<User | null> {
    const row = await this.db.get('SELECT * FROM users WHERE id = ?', id);
    if (!row) return null;
    return {
      id: row.id,
      email: row.email,
      passwordHash: row.passwordHash,
      createdAt: new Date(row.createdAt),
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.db.get('SELECT * FROM users WHERE email = ?', email);
    if (!row) return null;
    return {
      id: row.id,
      email: row.email,
      passwordHash: row.passwordHash,
      createdAt: new Date(row.createdAt),
    };
  }

  async create(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const id = randomUUID();
    const createdAt = new Date();
    await this.db.run(
      'INSERT INTO users (id, email, passwordHash, createdAt) VALUES (?, ?, ?, ?)',
      id,
      user.email,
      user.passwordHash,
      createdAt.toISOString()
    );
    return {
      id,
      email: user.email,
      passwordHash: user.passwordHash,
      createdAt,
    };
  }
}

export class SqliteAssetRepository implements IAssetRepository {
  constructor(private db: Database) {}

  async findById(id: string): Promise<Asset | null> {
    const row = await this.db.get('SELECT * FROM assets WHERE id = ?', id);
    if (!row) return null;
    return {
      id: row.id,
      symbol: row.symbol,
      name: row.name,
      assetType: row.assetType as AssetType,
      currentPrice: row.currentPrice,
      updatedAt: new Date(row.updatedAt),
    };
  }

  async findBySymbol(symbol: string): Promise<Asset | null> {
    const row = await this.db.get('SELECT * FROM assets WHERE symbol = ?', symbol);
    if (!row) return null;
    return {
      id: row.id,
      symbol: row.symbol,
      name: row.name,
      assetType: row.assetType as AssetType,
      currentPrice: row.currentPrice,
      updatedAt: new Date(row.updatedAt),
    };
  }

  async findAll(): Promise<Asset[]> {
    const rows = await this.db.all('SELECT * FROM assets');
    return rows.map(row => ({
      id: row.id,
      symbol: row.symbol,
      name: row.name,
      assetType: row.assetType as AssetType,
      currentPrice: row.currentPrice,
      updatedAt: new Date(row.updatedAt),
    }));
  }

  async create(asset: Omit<Asset, 'id' | 'updatedAt'>): Promise<Asset> {
    const id = randomUUID();
    const updatedAt = new Date();
    await this.db.run(
      'INSERT INTO assets (id, symbol, name, assetType, currentPrice, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
      id,
      asset.symbol,
      asset.name,
      asset.assetType,
      asset.currentPrice,
      updatedAt.toISOString()
    );
    return {
      id,
      symbol: asset.symbol,
      name: asset.name,
      assetType: asset.assetType,
      currentPrice: asset.currentPrice,
      updatedAt,
    };
  }

  async updatePrice(id: string, price: number): Promise<Asset> {
    const updatedAt = new Date();
    await this.db.run(
      'UPDATE assets SET currentPrice = ?, updatedAt = ? WHERE id = ?',
      price,
      updatedAt.toISOString(),
      id
    );
    const asset = await this.findById(id);
    if (!asset) throw new Error('Asset not found');
    return asset;
  }
}

export class SqliteInvestmentRepository implements IInvestmentRepository {
  constructor(private db: Database) {}

  async findById(id: string): Promise<Investment | null> {
    const row = await this.db.get('SELECT * FROM investments WHERE id = ?', id);
    if (!row) return null;
    return {
      id: row.id,
      userId: row.userId,
      assetId: row.assetId,
      quantity: row.quantity,
      purchasePrice: row.purchasePrice,
      purchaseDate: new Date(row.purchaseDate),
    };
  }

  async findByUserId(userId: string): Promise<Investment[]> {
    const rows = await this.db.all('SELECT * FROM investments WHERE userId = ?', userId);
    return rows.map(row => ({
      id: row.id,
      userId: row.userId,
      assetId: row.assetId,
      quantity: row.quantity,
      purchasePrice: row.purchasePrice,
      purchaseDate: new Date(row.purchaseDate),
    }));
  }

  async create(investment: Omit<Investment, 'id'>): Promise<Investment> {
    const id = randomUUID();
    await this.db.run(
      'INSERT INTO investments (id, userId, assetId, quantity, purchasePrice, purchaseDate) VALUES (?, ?, ?, ?, ?, ?)',
      id,
      investment.userId,
      investment.assetId,
      investment.quantity,
      investment.purchasePrice,
      investment.purchaseDate instanceof Date ? investment.purchaseDate.toISOString() : new Date(investment.purchaseDate).toISOString()
    );
    return {
      id,
      userId: investment.userId,
      assetId: investment.assetId,
      quantity: investment.quantity,
      purchasePrice: investment.purchasePrice,
      purchaseDate: investment.purchaseDate instanceof Date ? investment.purchaseDate : new Date(investment.purchaseDate),
    };
  }

  async update(
    id: string,
    investment: Partial<Pick<Investment, 'quantity' | 'purchasePrice'>>
  ): Promise<Investment> {
    const current = await this.findById(id);
    if (!current) throw new Error('Investment not found');

    const quantity = investment.quantity !== undefined ? investment.quantity : current.quantity;
    const purchasePrice = investment.purchasePrice !== undefined ? investment.purchasePrice : current.purchasePrice;

    await this.db.run(
      'UPDATE investments SET quantity = ?, purchasePrice = ? WHERE id = ?',
      quantity,
      purchasePrice,
      id
    );

    return {
      ...current,
      quantity,
      purchasePrice,
    };
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.run('DELETE FROM investments WHERE id = ?', id);
    return (result.changes ?? 0) > 0;
  }
}

export class SqliteTransactionRepository implements ITransactionRepository {
  constructor(private db: Database) {}

  async findById(id: string): Promise<Transaction | null> {
    const row = await this.db.get('SELECT * FROM transactions WHERE id = ?', id);
    if (!row) return null;
    return {
      id: row.id,
      investmentId: row.investmentId,
      transactionType: row.transactionType as TransactionType,
      quantity: row.quantity,
      price: row.price,
      transactionDate: new Date(row.transactionDate),
    };
  }

  async findByInvestmentId(investmentId: string): Promise<Transaction[]> {
    const rows = await this.db.all('SELECT * FROM transactions WHERE investmentId = ?', investmentId);
    return rows.map(row => ({
      id: row.id,
      investmentId: row.investmentId,
      transactionType: row.transactionType as TransactionType,
      quantity: row.quantity,
      price: row.price,
      transactionDate: new Date(row.transactionDate),
    }));
  }

  async findByUserId(
    userId: string,
    filters?: {
      startDate?: Date;
      endDate?: Date;
      assetType?: AssetType;
      transactionType?: TransactionType;
    }
  ): Promise<Transaction[]> {
    let query = `
      SELECT t.*, a.symbol, a.name, a.assetType FROM transactions t
      JOIN investments i ON t.investmentId = i.id
      JOIN assets a ON i.assetId = a.id
      WHERE i.userId = ?
    `;
    const params: any[] = [userId];

    if (filters?.startDate) {
      query += ' AND t.transactionDate >= ?';
      params.push(filters.startDate.toISOString());
    }
    if (filters?.endDate) {
      query += ' AND t.transactionDate <= ?';
      params.push(filters.endDate.toISOString());
    }
    if (filters?.transactionType) {
      query += ' AND t.transactionType = ?';
      params.push(filters.transactionType);
    }
    if (filters?.assetType) {
      query += ' AND a.assetType = ?';
      params.push(filters.assetType);
    }

    const rows = await this.db.all(query, params);
    return rows.map(row => ({
      id: row.id,
      investmentId: row.investmentId,
      transactionType: row.transactionType as TransactionType,
      quantity: row.quantity,
      price: row.price,
      transactionDate: new Date(row.transactionDate),
      symbol: row.symbol,
      name: row.name,
      assetType: row.assetType as AssetType,
    }));
  }

  async create(transaction: Omit<Transaction, 'id' | 'transactionDate'>): Promise<Transaction> {
    const id = randomUUID();
    const transactionDate = new Date();
    await this.db.run(
      'INSERT INTO transactions (id, investmentId, transactionType, quantity, price, transactionDate) VALUES (?, ?, ?, ?, ?, ?)',
      id,
      transaction.investmentId,
      transaction.transactionType,
      transaction.quantity,
      transaction.price,
      transactionDate.toISOString()
    );
    return {
      id,
      investmentId: transaction.investmentId,
      transactionType: transaction.transactionType,
      quantity: transaction.quantity,
      price: transaction.price,
      transactionDate,
    };
  }
}
