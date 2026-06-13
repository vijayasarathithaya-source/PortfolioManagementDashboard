import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { PortfolioService } from '../../core/services/portfolio.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';

class MockPortfolioService {
  summarySignal = signal<any>(null);
  holdingsSignal = signal<any[]>([]);
  loadingSignal = signal<boolean>(false);
  errorSignal = signal<string | null>(null);

  summary = this.summarySignal.asReadonly();
  holdings = this.holdingsSignal.asReadonly();
  loading = this.loadingSignal.asReadonly();
  error = this.errorSignal.asReadonly();

  totalValue = signal(10000);
  totalCost = signal(8000);
  totalProfitLoss = signal(2000);
  returnPercentage = signal(25);
  assetsCount = signal(2);

  loadPortfolioData() {
    return of({ summary: this.summarySignal(), holdings: this.holdingsSignal() });
  }
}

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockPortfolioService: MockPortfolioService;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockPortfolioService = new MockPortfolioService();
    const routerMock = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: PortfolioService, useValue: mockPortfolioService },
        { provide: Router, useValue: routerMock },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load data and render stats cards when data is loaded', () => {
    mockPortfolioService.summarySignal.set({
      totalValue: 10000,
      totalCost: 8000,
      totalProfitLoss: 2000,
      totalAssetsCount: 2,
      returnPercentage: 25,
    });
    mockPortfolioService.holdingsSignal.set([
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
    ]);

    fixture.detectChanges();

    expect(component.totalValue()).toBe(10000);
    expect(component.totalCost()).toBe(8000);
    expect(component.totalProfitLoss()).toBe(2000);
    expect(component.returnPercentage()).toBe(25);
    expect(component.assetsCount()).toBe(2);

    // Verify stats cards are rendered in HTML
    const statValues = fixture.debugElement.queryAll(By.css('.stat-value'));
    expect(statValues.length).toBe(4);
    expect(statValues[0].nativeElement.textContent).toContain('$10,000.00');
    expect(statValues[1].nativeElement.textContent).toContain('$8,000.00');
    expect(statValues[2].nativeElement.textContent).toContain('$2,000.00');
    expect(statValues[3].nativeElement.textContent).toContain('25.00%');
  });

  it('should display loading state when loading signal is active', () => {
    mockPortfolioService.loadingSignal.set(true);
    fixture.detectChanges();

    const loadingState = fixture.debugElement.query(By.css('app-loading-state'));
    expect(loadingState).toBeTruthy();
  });

  it('should display error alert when error signal is active', () => {
    mockPortfolioService.errorSignal.set('Failed to fetch stats');
    fixture.detectChanges();

    const errorAlert = fixture.debugElement.query(By.css('.error-alert-box'));
    expect(errorAlert).toBeTruthy();
    expect(errorAlert.nativeElement.textContent).toContain('Failed to fetch stats');
  });

  it('should render empty state when no holdings are available', () => {
    mockPortfolioService.summarySignal.set({
      totalValue: 0,
      totalCost: 0,
      totalProfitLoss: 0,
      totalAssetsCount: 0,
      returnPercentage: 0,
    });
    mockPortfolioService.holdingsSignal.set([]);

    fixture.detectChanges();

    const emptyState = fixture.debugElement.query(By.css('app-empty-state'));
    expect(emptyState).toBeTruthy();
  });

  it('should navigate to portfolio holdings on buy investment trigger', () => {
    component.onBuyInvestment();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/portfolio']);
  });

  it('should calculate asset allocation correctly', () => {
    mockPortfolioService.totalValue.set(10000);
    mockPortfolioService.holdingsSignal.set([
      {
        assetType: 'Stocks',
        currentValue: 6000,
      },
      {
        assetType: 'Bonds',
        currentValue: 4000,
      },
    ]);

    fixture.detectChanges();

    const allocation = component.assetAllocation();
    const stocksAlloc = allocation.find((a) => a.type === 'Stocks');
    const bondsAlloc = allocation.find((a) => a.type === 'Bonds');

    expect(stocksAlloc?.percentage).toBe(60);
    expect(bondsAlloc?.percentage).toBe(40);
  });

  it('should calculate asset distribution correctly', () => {
    mockPortfolioService.totalValue.set(10000);
    mockPortfolioService.holdingsSignal.set([
      {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        currentValue: 6000,
        assetType: 'Stocks',
      },
      {
        symbol: 'MSFT',
        name: 'Microsoft Corp.',
        currentValue: 4000,
        assetType: 'Stocks',
      },
    ]);

    fixture.detectChanges();

    const distribution = component.assetDistribution();
    expect(distribution.items.length).toBe(2);
    expect(distribution.items[0].symbol).toBe('AAPL');
    expect(distribution.items[0].percentage).toBe(60);
    expect(distribution.items[1].symbol).toBe('MSFT');
    expect(distribution.items[1].percentage).toBe(40);
    expect(distribution.gradientStyle).toContain('conic-gradient');
  });
});
