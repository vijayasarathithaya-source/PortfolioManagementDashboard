import type { Database } from 'sqlite';
import type { IUserRepository, IInvestmentRepository, ITransactionRepository } from '../../domain/repositories/interfaces.js';
import type { User, Investment, Transaction, AssetType, TransactionType } from '../../domain/entities.js';

export class SqliteUserRepository implements IUserRepository {
  constructor(private db: Database) {}

  async findById(id: string): Promise<User | null> {
    throw new Error('Not implemented');
  }

  async findByEmail(email: string): Promise<User | null> {
    throw new Error('Not implemented');
  }

  async create(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
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
    investment: Partial<Pick<Investment, 'quantity' | 'currentValue' | 'purchasePrice'>>
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
