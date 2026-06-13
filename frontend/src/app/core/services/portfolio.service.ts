import { Injectable, signal, computed } from '@angular/core';
import { ApiService } from './api.service';
import { forkJoin, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Holding, PortfolioSummary } from '../models/portfolio.models';

@Injectable({
  providedIn: 'root',
})
export class PortfolioService {
  private summarySignal = signal<PortfolioSummary | null>(null);
  private holdingsSignal = signal<Holding[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  summary = this.summarySignal.asReadonly();
  holdings = this.holdingsSignal.asReadonly();
  loading = this.loadingSignal.asReadonly();
  error = this.errorSignal.asReadonly();

  // Derived properties from signals
  totalValue = computed(() => this.summarySignal()?.totalValue ?? 0);
  totalCost = computed(() => this.summarySignal()?.totalCost ?? 0);
  totalProfitLoss = computed(() => this.summarySignal()?.totalProfitLoss ?? 0);
  returnPercentage = computed(() => this.summarySignal()?.returnPercentage ?? 0);
  assetsCount = computed(() => this.summarySignal()?.totalAssetsCount ?? 0);

  constructor(private api: ApiService) {}

  loadPortfolioData(): Observable<{ summary: PortfolioSummary; holdings: Holding[] }> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return forkJoin({
      summary: this.api.get<PortfolioSummary>('/api/portfolio/summary'),
      holdings: this.api.get<Holding[]>('/api/portfolio'),
    }).pipe(
      tap(({ summary, holdings }) => {
        this.summarySignal.set(summary);
        this.holdingsSignal.set(holdings);
        this.loadingSignal.set(false);
      }),
      catchError((err) => {
        this.errorSignal.set(err.error?.error || 'Failed to load portfolio data');
        this.loadingSignal.set(false);
        throw err;
      })
    );
  }

  buyNewInvestment(
    assetId: string,
    quantity: number,
    purchasePrice: number,
    purchaseDate?: Date
  ): Observable<any> {
    return this.api.post<any>('/api/investments', {
      assetId,
      quantity,
      purchasePrice,
      purchaseDate: purchaseDate || new Date(),
    });
  }

  buyExistingHolding(
    investmentId: string,
    quantity: number,
    price: number
  ): Observable<any> {
    return this.api.post<any>('/api/transactions', {
      investmentId,
      transactionType: 'BUY',
      quantity,
      price,
    });
  }

  sellHolding(
    investmentId: string,
    quantity: number,
    price: number
  ): Observable<any> {
    return this.api.post<any>('/api/transactions', {
      investmentId,
      transactionType: 'SELL',
      quantity,
      price,
    });
  }

  // Clear state when user logs out
  clearState(): void {
    this.summarySignal.set(null);
    this.holdingsSignal.set([]);
    this.errorSignal.set(null);
    this.loadingSignal.set(false);
  }
}
