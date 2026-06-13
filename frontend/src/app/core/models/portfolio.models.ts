export interface User {
  id: string;
  email: string;
  fullName: string;
  createdAt: Date;
}

export type AssetType = 'Stocks' | 'Bonds' | 'Mutual Funds';

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  assetType: AssetType;
  currentPrice: number;
  updatedAt: Date;
}

export interface Investment {
  id: string;
  userId: string;
  assetId: string;
  quantity: number;
  purchasePrice: number;
  purchaseDate: Date;
}

export type TransactionType = 'BUY' | 'SELL';

export interface Transaction {
  id: string;
  investmentId: string;
  transactionType: TransactionType;
  quantity: number;
  price: number;
  transactionDate: Date;
  symbol?: string;
  name?: string;
  assetType?: AssetType;
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

export interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  totalProfitLoss: number;
  totalAssetsCount: number;
  returnPercentage: number;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    createdAt: string;
  };
}
