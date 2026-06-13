export interface User {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

export type AssetType = 'Stocks' | 'Bonds' | 'Mutual Funds';

export interface Investment {
  id: string;
  userId: string;
  assetName: string;
  assetType: AssetType;
  quantity: number;
  purchasePrice: number;
  currentValue: number;
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
