import { TestBed } from '@angular/core/testing';
import { PortfolioService } from './portfolio.service';
import { ApiService } from './api.service';
import { of, throwError } from 'rxjs';
import { Holding, PortfolioSummary } from '../models/portfolio.models';

describe('PortfolioService', () => {
  let service: PortfolioService;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;

  const mockSummary: PortfolioSummary = {
    totalValue: 10000,
    totalCost: 8000,
    totalProfitLoss: 2000,
    totalAssetsCount: 2,
    returnPercentage: 25,
  };

  const mockHoldings: Holding[] = [
    {
      id: '1',
      assetId: 'asset-1',
      symbol: 'AAPL',
      name: 'Apple Inc.',
      assetType: 'Stocks',
      quantity: 10,
      purchasePrice: 150,
      currentPrice: 170,
      currentValue: 1700,
      profitLoss: 200,
      returnPercentage: 13.33,
    },
  ];

  beforeEach(() => {
    const spy = jasmine.createSpyObj('ApiService', ['get']);

    TestBed.configureTestingModule({
      providers: [
        PortfolioService,
        { provide: ApiService, useValue: spy },
      ],
    });

    service = TestBed.inject(PortfolioService);
    apiServiceSpy = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load portfolio summary and holdings data successfully', () => {
    apiServiceSpy.get.and.callFake(((path: string) => {
      if (path === '/api/portfolio/summary') {
        return of(mockSummary);
      } else if (path === '/api/portfolio') {
        return of(mockHoldings);
      }
      return throwError(() => new Error('Unknown path'));
    }) as any);

    service.loadPortfolioData().subscribe((data) => {
      expect(data.summary).toEqual(mockSummary);
      expect(data.holdings).toEqual(mockHoldings);
    });

    expect(service.loading()).toBeFalse();
    expect(service.summary()).toEqual(mockSummary);
    expect(service.holdings()).toEqual(mockHoldings);
    expect(service.totalValue()).toBe(10000);
    expect(service.totalCost()).toBe(8000);
    expect(service.totalProfitLoss()).toBe(2000);
    expect(service.returnPercentage()).toBe(25);
    expect(service.assetsCount()).toBe(2);
    expect(service.error()).toBeNull();
  });

  it('should handle API errors and set error signal', () => {
    const mockError = { error: { error: 'Unauthorized access' } };
    apiServiceSpy.get.and.returnValue(throwError(() => mockError));

    service.loadPortfolioData().subscribe({
      next: () => fail('should have failed'),
      error: (err) => {
        expect(err).toEqual(mockError);
      },
    });

    expect(service.loading()).toBeFalse();
    expect(service.summary()).toBeNull();
    expect(service.holdings()).toEqual([]);
    expect(service.error()).toBe('Unauthorized access');
  });

  it('should clear state on clearState()', () => {
    apiServiceSpy.get.and.callFake(((path: string) => {
      if (path === '/api/portfolio/summary') {
        return of(mockSummary);
      } else if (path === '/api/portfolio') {
        return of(mockHoldings);
      }
      return throwError(() => new Error('Unknown path'));
    }) as any);

    service.loadPortfolioData().subscribe();

    expect(service.summary()).toEqual(mockSummary);
    expect(service.holdings()).toEqual(mockHoldings);

    service.clearState();

    expect(service.summary()).toBeNull();
    expect(service.holdings()).toEqual([]);
    expect(service.loading()).toBeFalse();
    expect(service.error()).toBeNull();
  });
});
