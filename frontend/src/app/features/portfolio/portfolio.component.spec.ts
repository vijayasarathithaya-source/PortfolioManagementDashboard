import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PortfolioComponent } from './portfolio.component';
import { PortfolioService } from '../../core/services/portfolio.service';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { signal } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { BuyDialogComponent } from './components/buy-dialog/buy-dialog.component';
import { SellDialogComponent } from './components/sell-dialog/sell-dialog.component';

class MockPortfolioService {
  holdingsSignal = signal<any[]>([]);
  loadingSignal = signal<boolean>(false);
  errorSignal = signal<string | null>(null);

  holdings = this.holdingsSignal.asReadonly();
  loading = this.loadingSignal.asReadonly();
  error = this.errorSignal.asReadonly();

  loadPortfolioData() {
    return of({ summary: {}, holdings: this.holdingsSignal() });
  }
}

describe('PortfolioComponent', () => {
  let component: PortfolioComponent;
  let fixture: ComponentFixture<PortfolioComponent>;
  let mockPortfolioService: MockPortfolioService;
  let dialog: MatDialog;

  const mockHoldings = [
    {
      id: 'inv-123',
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

  beforeEach(async () => {
    mockPortfolioService = new MockPortfolioService();

    await TestBed.configureTestingModule({
      imports: [PortfolioComponent, NoopAnimationsModule],
      providers: [
        { provide: PortfolioService, useValue: mockPortfolioService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PortfolioComponent);
    component = fixture.componentInstance;
    dialog = (component as any).dialog;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render holdings table when data is available', () => {
    mockPortfolioService.holdingsSignal.set(mockHoldings);
    fixture.detectChanges();

    const table = fixture.debugElement.query(By.css('app-table'));
    expect(table).toBeTruthy();

    const emptyState = fixture.debugElement.query(By.css('app-empty-state'));
    expect(emptyState).toBeNull();
  });

  it('should render empty state when no positions are available', () => {
    mockPortfolioService.holdingsSignal.set([]);
    fixture.detectChanges();

    const emptyState = fixture.debugElement.query(By.css('app-empty-state'));
    expect(emptyState).toBeTruthy();

    const table = fixture.debugElement.query(By.css('app-table'));
    expect(table).toBeNull();
  });

  it('should open BuyDialogComponent on onBuyNew trigger', () => {
    const openSpy = spyOn(dialog, 'open').and.returnValue({
      afterClosed: () => of(true),
    } as any);

    component.onBuyNew();

    expect(openSpy).toHaveBeenCalledWith(BuyDialogComponent, {
      width: '500px',
      maxWidth: '90vw',
      data: null,
    });
  });

  it('should open BuyDialogComponent prefilled when table triggers buy action', () => {
    const openSpy = spyOn(dialog, 'open').and.returnValue({
      afterClosed: () => of(true),
    } as any);

    component.onTableAction({
      action: 'buy',
      row: mockHoldings[0],
    });

    expect(openSpy).toHaveBeenCalledWith(BuyDialogComponent, {
      width: '500px',
      maxWidth: '90vw',
      data: {
        investmentId: 'inv-123',
        assetId: 'asset-1',
        symbol: 'AAPL',
        name: 'Apple Inc.',
        currentPrice: 170,
      },
    });
  });

  it('should open SellDialogComponent prefilled when table triggers sell action', () => {
    const openSpy = spyOn(dialog, 'open').and.returnValue({
      afterClosed: () => of(true),
    } as any);

    component.onTableAction({
      action: 'sell',
      row: mockHoldings[0],
    });

    expect(openSpy).toHaveBeenCalledWith(SellDialogComponent, {
      width: '500px',
      maxWidth: '90vw',
      data: {
        investmentId: 'inv-123',
        symbol: 'AAPL',
        name: 'Apple Inc.',
        quantity: 10,
        currentPrice: 170,
      },
    });
  });
});
