import type { IInvestmentRepository, IAssetRepository } from '../../domain/repositories/interfaces';

export interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  totalProfitLoss: number;
  totalAssetsCount: number;
  returnPercentage: number;
}

export interface Holding {
  id: string;
  assetId: string;
  symbol: string;
  name: string;
  assetType: string;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  currentValue: number;
  profitLoss: number;
  returnPercentage: number;
}

export class PortfolioService {
  constructor(
    private investmentRepository: IInvestmentRepository,
    private assetRepository: IAssetRepository
  ) {}

  async getSummary(userId: string): Promise<PortfolioSummary> {
    const holdings = await this.getHoldings(userId);
    if (holdings.length === 0) {
      return {
        totalValue: 0,
        totalCost: 0,
        totalProfitLoss: 0,
        totalAssetsCount: 0,
        returnPercentage: 0,
      };
    }

    let totalValue = 0;
    let totalCost = 0;
    const uniqueAssetIds = new Set<string>();

    for (const h of holdings) {
      totalCost += h.purchasePrice * h.quantity;
      totalValue += h.currentValue;
      uniqueAssetIds.add(h.assetId);
    }

    const totalProfitLoss = totalValue - totalCost;
    const returnPercentage = totalCost === 0 ? 0 : (totalProfitLoss / totalCost) * 100;

    return {
      totalValue,
      totalCost,
      totalProfitLoss,
      totalAssetsCount: uniqueAssetIds.size,
      returnPercentage,
    };
  }

  async getHoldings(userId: string): Promise<Holding[]> {
    const investments = await this.investmentRepository.findByUserId(userId);
    const holdings: Holding[] = [];

    for (const inv of investments) {
      const asset = await this.assetRepository.findById(inv.assetId);
      const currentPrice = asset ? asset.currentPrice : inv.purchasePrice;
      const symbol = asset ? asset.symbol : 'UNKNOWN';
      const name = asset ? asset.name : 'Unknown Asset';
      const assetType = asset ? asset.assetType : 'Stocks';

      const currentValue = currentPrice * inv.quantity;
      const cost = inv.purchasePrice * inv.quantity;
      const profitLoss = currentValue - cost;
      const returnPercentage = inv.purchasePrice === 0 ? 0 : ((currentPrice - inv.purchasePrice) / inv.purchasePrice) * 100;

      holdings.push({
        id: inv.id,
        assetId: inv.assetId,
        symbol,
        name,
        assetType,
        quantity: inv.quantity,
        purchasePrice: inv.purchasePrice,
        currentPrice,
        currentValue,
        profitLoss,
        returnPercentage,
      });
    }

    return holdings;
  }
}
