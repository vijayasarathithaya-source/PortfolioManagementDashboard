import type { IInvestmentRepository } from '../../domain/repositories/interfaces.js';

export interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  totalProfitLoss: number;
  totalAssetsCount: number;
  returnPercentage: number;
}

export class PortfolioService {
  constructor(private investmentRepository: IInvestmentRepository) {}

  async getSummary(userId: string): Promise<PortfolioSummary> {
    // Stub implementation for TDD: throws Error
    throw new Error('Not implemented');
  }
}
