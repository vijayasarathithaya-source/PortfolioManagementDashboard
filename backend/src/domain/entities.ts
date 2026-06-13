export interface User {
  id: string;
  email: string;
  passwordHash: string;
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
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    createdAt: Date;
  };
}
