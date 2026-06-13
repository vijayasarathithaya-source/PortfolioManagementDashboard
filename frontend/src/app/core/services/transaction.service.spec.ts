import { TestBed } from '@angular/core/testing';
import { TransactionService } from './transaction.service';
import { ApiService } from './api.service';
import { of } from 'rxjs';
import { Transaction } from '../models/portfolio.models';

describe('TransactionService', () => {
  let service: TransactionService;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;

  const mockTransactions: Transaction[] = [
    {
      id: 'tx-1',
      investmentId: 'inv-1',
      transactionType: 'BUY',
      quantity: 10,
      price: 150,
      transactionDate: new Date(),
    },
  ];

  beforeEach(() => {
    const spy = jasmine.createSpyObj('ApiService', ['get']);

    TestBed.configureTestingModule({
      providers: [
        TransactionService,
        { provide: ApiService, useValue: spy },
      ],
    });

    service = TestBed.inject(TransactionService);
    apiServiceSpy = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get transactions list without filters', () => {
    apiServiceSpy.get.and.returnValue(of({ transactions: mockTransactions, total: 1 }));

    service.getTransactions().subscribe((res) => {
      expect(res.transactions).toEqual(mockTransactions);
      expect(res.total).toBe(1);
    });

    expect(apiServiceSpy.get).toHaveBeenCalledWith('/api/transactions', {});
  });

  it('should query transactions with filters', () => {
    apiServiceSpy.get.and.returnValue(of({ transactions: mockTransactions, total: 1 }));
    const filters = {
      startDate: '2026-06-01',
      endDate: '2026-06-13',
      transactionType: 'BUY',
      assetType: 'Stocks',
    };

    service.getTransactions(filters).subscribe();

    expect(apiServiceSpy.get).toHaveBeenCalledWith('/api/transactions', filters);
  });
});
