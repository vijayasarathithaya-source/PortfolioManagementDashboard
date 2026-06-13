import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TransactionsComponent } from './transactions.component';
import { TransactionService } from '../../core/services/transaction.service';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { Transaction } from '../../core/models/portfolio.models';

class MockTransactionService {
  mockTransactions: Transaction[] = [
    {
      id: 'tx-1',
      investmentId: 'inv-1',
      transactionType: 'BUY',
      quantity: 10,
      price: 150,
      transactionDate: new Date('2026-06-10T10:00:00Z'),
      symbol: 'AAPL',
      name: 'Apple Inc.',
      assetType: 'Stocks',
    },
  ];

  getTransactions(filters?: any) {
    return of(this.mockTransactions);
  }
}

describe('TransactionsComponent', () => {
  let component: TransactionsComponent;
  let fixture: ComponentFixture<TransactionsComponent>;
  let transactionServiceSpy: MockTransactionService;

  beforeEach(async () => {
    transactionServiceSpy = new MockTransactionService();

    await TestBed.configureTestingModule({
      imports: [TransactionsComponent, NoopAnimationsModule],
      providers: [
        { provide: TransactionService, useValue: transactionServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TransactionsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load transactions list on init and map totalAmount', () => {
    fixture.detectChanges();

    expect(component.transactionsList().length).toBe(1);
    expect(component.transactionsList()[0].totalAmount).toBe(1500);
    
    const table = fixture.debugElement.query(By.css('app-table'));
    expect(table).toBeTruthy();
  });

  it('should reload transactions reactively when filter form values change', () => {
    fixture.detectChanges();
    spyOn(component, 'loadTransactions').and.callThrough();

    component.filterForm.patchValue({
      assetType: 'Stocks',
    });

    expect(component.loadTransactions).toHaveBeenCalled();
  });

  it('should pass correct query filters to service', () => {
    const getTxsSpy = spyOn(transactionServiceSpy, 'getTransactions').and.returnValue(of([]));
    fixture.detectChanges();

    component.filterForm.patchValue({
      startDate: new Date('2026-06-01'),
      endDate: new Date('2026-06-13'),
      transactionType: 'SELL',
      assetType: 'Bonds',
    });

    component.loadTransactions();

    const expectedEndDate = new Date('2026-06-13');
    expectedEndDate.setHours(23, 59, 59, 999);

    expect(getTxsSpy).toHaveBeenCalledWith({
      startDate: new Date('2026-06-01').toISOString(),
      endDate: expectedEndDate.toISOString(),
      transactionType: 'SELL',
      assetType: 'Bonds',
    });
  });

  it('should display empty state when transactions list is empty', () => {
    spyOn(transactionServiceSpy, 'getTransactions').and.returnValue(of([]));
    fixture.detectChanges();

    expect(component.transactionsList().length).toBe(0);
    const emptyState = fixture.debugElement.query(By.css('app-empty-state'));
    expect(emptyState).toBeTruthy();
  });

  it('should reset all filters and reload when onResetFilters is triggered', () => {
    fixture.detectChanges();
    component.filterForm.patchValue({
      assetType: 'Mutual Funds',
      transactionType: 'SELL',
    });

    component.onResetFilters();

    expect(component.filterForm.value.assetType).toBe('');
    expect(component.filterForm.value.transactionType).toBe('');
    expect(component.filterForm.value.startDate).toBeNull();
    expect(component.filterForm.value.endDate).toBeNull();
  });

  it('should display error message on service failure', () => {
    spyOn(transactionServiceSpy, 'getTransactions').and.returnValue(
      throwError(() => ({ error: { error: 'Network error details' } }))
    );
    fixture.detectChanges();

    expect(component.error()).toBe('Network error details');
    const errorAlert = fixture.debugElement.query(By.css('.error-alert-box'));
    expect(errorAlert).toBeTruthy();
  });
});
