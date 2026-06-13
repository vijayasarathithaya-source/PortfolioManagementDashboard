import type { ITransactionRepository, IInvestmentRepository } from '../../domain/repositories/interfaces';
import type { Transaction, TransactionType, AssetType } from '../../domain/entities';

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
    const investment = await this.investmentRepository.findById(dto.investmentId);
    if (!investment) {
      throw new Error('Investment not found');
    }
    if (investment.userId !== userId) {
      throw new Error('Access denied to this investment');
    }

    let newQuantity = investment.quantity;
    if (dto.transactionType === 'BUY') {
      newQuantity += dto.quantity;
    } else if (dto.transactionType === 'SELL') {
      if (investment.quantity < dto.quantity) {
        throw new Error('Insufficient quantity to sell');
      }
      newQuantity -= dto.quantity;
    }

    await this.investmentRepository.update(dto.investmentId, {
      quantity: newQuantity,
    });

    return await this.transactionRepository.create({
      investmentId: dto.investmentId,
      transactionType: dto.transactionType,
      quantity: dto.quantity,
      price: dto.price,
    });
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
    return await this.transactionRepository.findByUserId(userId, filters);
  }
}
