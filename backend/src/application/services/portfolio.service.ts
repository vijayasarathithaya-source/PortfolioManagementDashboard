import type { IInvestmentRepository, IAssetRepository } from '../../domain/repositories/interfaces';

export interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  totalProfitLoss: number;
  totalAssetsCount: number;
  returnPercentage: number;
}

export class PortfolioService {
  constructor(
    private investmentRepository: IInvestmentRepository,
    private assetRepository: IAssetRepository
  ) {}

  async getSummary(userId: string): Promise<PortfolioSummary> {
    // Stub implementation for TDD: throws Error
    throw new Error('Not implemented');
  }
}
