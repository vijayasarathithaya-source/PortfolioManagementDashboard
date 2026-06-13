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
    throw new Error('Not implemented');
  }

  async findBySymbol(symbol: string): Promise<Asset | null> {
    throw new Error('Not implemented');
  }

  async findAll(): Promise<Asset[]> {
    throw new Error('Not implemented');
  }

  async create(asset: Omit<Asset, 'id' | 'updatedAt'>): Promise<Asset> {
    throw new Error('Not implemented');
  }

  async updatePrice(id: string, price: number): Promise<Asset> {
    throw new Error('Not implemented');
  }
}

export class SqliteInvestmentRepository implements IInvestmentRepository {
  constructor(private db: Database) {}

  async findById(id: string): Promise<Investment | null> {
    throw new Error('Not implemented');
  }

  async findByUserId(userId: string): Promise<Investment[]> {
    throw new Error('Not implemented');
  }

  async create(investment: Omit<Investment, 'id'>): Promise<Investment> {
    throw new Error('Not implemented');
  }

  async update(
    id: string,
    investment: Partial<Pick<Investment, 'quantity' | 'purchasePrice'>>
  ): Promise<Investment> {
    throw new Error('Not implemented');
  }

  async delete(id: string): Promise<boolean> {
    throw new Error('Not implemented');
  }
}

export class SqliteTransactionRepository implements ITransactionRepository {
  constructor(private db: Database) {}

  async findById(id: string): Promise<Transaction | null> {
    throw new Error('Not implemented');
  }

  async findByInvestmentId(investmentId: string): Promise<Transaction[]> {
    throw new Error('Not implemented');
  }

  async findByUserId(
    userId: string,
    filters?: {
      startDate?: Date;
      endDate?: Date;
      assetType?: AssetType;
      transactionType?: TransactionType;
    }
  ): Promise<Transaction[] | any> {
    throw new Error('Not implemented');
  }

  async create(transaction: Omit<Transaction, 'id' | 'transactionDate'>): Promise<Transaction> {
    throw new Error('Not implemented');
  }
}
