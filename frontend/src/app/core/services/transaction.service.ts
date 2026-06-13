import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Transaction } from '../models/portfolio.models';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  constructor(private api: ApiService) {}

  getTransactions(filters?: {
    startDate?: string;
    endDate?: string;
    transactionType?: string;
    assetType?: string;
    page?: number;
    limit?: number;
  }): Observable<{ transactions: Transaction[]; total: number }> {
    // Clean up empty filters
    const params: any = {};
    if (filters) {
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.transactionType) params.transactionType = filters.transactionType;
      if (filters.assetType) params.assetType = filters.assetType;
      if (filters.page) params.page = filters.page;
      if (filters.limit) params.limit = filters.limit;
    }
    return this.api.get<{ transactions: Transaction[]; total: number }>('/api/transactions', params);
  }
}
