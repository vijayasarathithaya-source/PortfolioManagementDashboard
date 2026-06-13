import type { User, Investment, Transaction, AssetType, TransactionType, Asset } from '../entities';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: Omit<User, 'id' | 'createdAt'>): Promise<User>;
}

export interface IAssetRepository {
  findById(id: string): Promise<Asset | null>;
  findBySymbol(symbol: string): Promise<Asset | null>;
  findAll(): Promise<Asset[]>;
  create(asset: Omit<Asset, 'id' | 'updatedAt'>): Promise<Asset>;
  updatePrice(id: string, price: number): Promise<Asset>;
}

export interface IInvestmentRepository {
  findById(id: string): Promise<Investment | null>;
  findByUserId(userId: string): Promise<Investment[]>;
  create(investment: Omit<Investment, 'id'>): Promise<Investment>;
  update(
    id: string,
    investment: Partial<Pick<Investment, 'quantity' | 'purchasePrice'>>
  ): Promise<Investment>;
  delete(id: string): Promise<boolean>;
}

export interface ITransactionRepository {
  findById(id: string): Promise<Transaction | null>;
  findByInvestmentId(investmentId: string): Promise<Transaction[]>;
  findByUserId(
    userId: string,
    filters?: {
      startDate?: Date;
      endDate?: Date;
      assetType?: AssetType;
      transactionType?: TransactionType;
    }
  ): Promise<Transaction[]>;
  create(transaction: Omit<Transaction, 'id' | 'transactionDate'>): Promise<Transaction>;
}
