import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SellDialogComponent, SellDialogData } from './sell-dialog.component';
import { PortfolioService } from '../../../../core/services/portfolio.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('SellDialogComponent', () => {
  let component: SellDialogComponent;
  let fixture: ComponentFixture<SellDialogComponent>;
  let portfolioServiceSpy: jasmine.SpyObj<PortfolioService>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<SellDialogComponent>>;

  const mockData: SellDialogData = {
    investmentId: 'inv-123',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    quantity: 10,
    currentPrice: 150,
  };

  beforeEach(async () => {
    const portfolioSpy = jasmine.createSpyObj('PortfolioService', ['sellHolding']);
    const dialogSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [SellDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: PortfolioService, useValue: portfolioSpy },
        { provide: MatDialogRef, useValue: dialogSpy },
        { provide: MAT_DIALOG_DATA, useValue: mockData },
      ],
    }).compileComponents();

    portfolioServiceSpy = TestBed.inject(PortfolioService) as jasmine.SpyObj<PortfolioService>;
    dialogRefSpy = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<SellDialogComponent>>;

    fixture = TestBed.createComponent(SellDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and initialize values from injected dialog data', () => {
    expect(component).toBeTruthy();
    expect(component.assetName).toBe('Apple Inc.');
    expect(component.assetSymbol).toBe('AAPL');
    expect(component.maxQuantity).toBe(10);
    expect(component.sellForm.value.price).toBe(150);
  });

  it('should validate form bounds on quantity', () => {
    const form = component.sellForm;
    expect(form.valid).toBeFalse();

    form.patchValue({
      quantity: 5,
      price: 155,
    });
    expect(form.valid).toBeTrue();

    // Try to sell more than owned
    form.patchValue({ quantity: 15 });
    expect(form.valid).toBeFalse();

    // Try to sell zero
    form.patchValue({ quantity: 0 });
    expect(form.valid).toBeFalse();
  });

  it('should call sellHolding and close on successful submit', () => {
    portfolioServiceSpy.sellHolding.and.returnValue(of({}));
    component.sellForm.patchValue({
      quantity: 5,
      price: 155,
    });

    component.onSubmit();

    expect(portfolioServiceSpy.sellHolding).toHaveBeenCalledWith('inv-123', 5, 155);
    expect(dialogRefSpy.close).toHaveBeenCalledWith(true);
  });

  it('should show error message when sellHolding fails', () => {
    const mockError = { error: { error: 'Insufficient quantity' } };
    portfolioServiceSpy.sellHolding.and.returnValue(throwError(() => mockError));
    component.sellForm.patchValue({
      quantity: 5,
      price: 155,
    });

    component.onSubmit();

    expect(portfolioServiceSpy.sellHolding).toHaveBeenCalled();
    expect(component.errorMessage()).toBe('Insufficient quantity');
    expect(dialogRefSpy.close).not.toHaveBeenCalled();
  });
});
