import type { ITransactionRepository, IInvestmentRepository } from '../../domain/repositories/interfaces.js';
import type { Transaction, TransactionType, AssetType } from '../../domain/entities.js';

export interface CreateTransactionDto {
  investmentId: string;
  transactionType: TransactionType;
  quantity: number;
  price: number;
}

export class TransactionService {
  constructor(
    private transactionRepository: ITransactionRepository,
    private investmentRepository: IInvestmentRepository
  ) {}

  async createTransaction(userId: string, dto: CreateTransactionDto): Promise<Transaction> {
    // Stub implementation for TDD: throws Error
    throw new Error('Not implemented');
  }

  async getTransactions(
    userId: string,
    filters?: {
      startDate?: Date;
      endDate?: Date;
      assetType?: AssetType;
      transactionType?: TransactionType;
    }
  ): Promise<Transaction[]> {
    // Stub implementation for TDD: throws Error
    throw new Error('Not implemented');
  }
}
