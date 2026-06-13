import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BuyDialogComponent, BuyDialogData } from './buy-dialog.component';
import { PortfolioService } from '../../../../core/services/portfolio.service';
import { AssetService } from '../../../../core/services/asset.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Asset } from '../../../../core/models/portfolio.models';

describe('BuyDialogComponent', () => {
  let component: BuyDialogComponent;
  let fixture: ComponentFixture<BuyDialogComponent>;
  let portfolioServiceSpy: jasmine.SpyObj<PortfolioService>;
  let assetServiceSpy: jasmine.SpyObj<AssetService>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<BuyDialogComponent>>;

  const mockAssets: Asset[] = [
    {
      id: 'asset-1',
      symbol: 'AAPL',
      name: 'Apple Inc.',
      assetType: 'Stocks',
      currentPrice: 150,
      updatedAt: new Date(),
    },
  ];

  beforeEach(async () => {
    const portfolioSpy = jasmine.createSpyObj('PortfolioService', ['buyNewInvestment', 'buyExistingHolding']);
    const assetSpy = jasmine.createSpyObj('AssetService', ['getAssets']);
    const dialogSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [BuyDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: PortfolioService, useValue: portfolioSpy },
        { provide: AssetService, useValue: assetSpy },
        { provide: MatDialogRef, useValue: dialogSpy },
        { provide: MAT_DIALOG_DATA, useValue: null },
      ],
    }).compileComponents();

    portfolioServiceSpy = TestBed.inject(PortfolioService) as jasmine.SpyObj<PortfolioService>;
    assetServiceSpy = TestBed.inject(AssetService) as jasmine.SpyObj<AssetService>;
    dialogRefSpy = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<BuyDialogComponent>>;
  });

  describe('New Investment Mode', () => {
    beforeEach(() => {
      assetServiceSpy.getAssets.and.returnValue(of(mockAssets));
      fixture = TestBed.createComponent(BuyDialogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should initialize in new mode and load available assets', () => {
      expect(component.isNew).toBeTrue();
      expect(assetServiceSpy.getAssets).toHaveBeenCalled();
      expect(component.assetOptions().length).toBe(1);
      expect(component.assetOptions()[0].value).toBe('asset-1');
    });

    it('should filter assets by type correctly', () => {
      const multipleAssets: Asset[] = [
        { id: 'asset-s', symbol: 'S1', name: 'Stock 1', assetType: 'Stocks', currentPrice: 10, updatedAt: new Date() },
        { id: 'asset-b', symbol: 'B1', name: 'Bond 1', assetType: 'Bonds', currentPrice: 20, updatedAt: new Date() },
        { id: 'asset-m', symbol: 'M1', name: 'Mutual Fund 1', assetType: 'Mutual Funds', currentPrice: 30, updatedAt: new Date() }
      ];
      component.allAssets.set(multipleAssets);
      fixture.detectChanges();

      component.selectType('ALL');
      expect(component.assetOptions().length).toBe(3);

      component.selectType('Stocks');
      expect(component.assetOptions().length).toBe(1);
      expect(component.assetOptions()[0].value).toBe('asset-s');

      component.selectType('Bonds');
      expect(component.assetOptions().length).toBe(1);
      expect(component.assetOptions()[0].value).toBe('asset-b');

      component.selectType('Mutual Funds');
      expect(component.assetOptions().length).toBe(1);
      expect(component.assetOptions()[0].value).toBe('asset-m');
    });

    it('should reset assetId and price on filter change if current asset does not match new type', () => {
      const multipleAssets: Asset[] = [
        { id: 'asset-s', symbol: 'S1', name: 'Stock 1', assetType: 'Stocks', currentPrice: 10, updatedAt: new Date() },
        { id: 'asset-b', symbol: 'B1', name: 'Bond 1', assetType: 'Bonds', currentPrice: 20, updatedAt: new Date() }
      ];
      component.allAssets.set(multipleAssets);
      component.buyForm.patchValue({
        assetId: 'asset-s',
        purchasePrice: 10
      });
      fixture.detectChanges();

      component.selectType('Bonds');
      expect(component.buyForm.controls.assetId.value).toBe('');
      expect(component.buyForm.controls.purchasePrice.value).toBeNull();
    });

    it('should validate form fields correctly', () => {
      const form = component.buyForm;
      expect(form.valid).toBeFalse();

      form.patchValue({
        assetId: 'asset-1',
        quantity: 10,
        purchasePrice: 150,
      });

      expect(form.valid).toBeTrue();

      form.patchValue({ quantity: 0 });
      expect(form.valid).toBeFalse();
    });

    it('should call buyNewInvestment and close on submit', () => {
      portfolioServiceSpy.buyNewInvestment.and.returnValue(of({}));
      component.buyForm.patchValue({ assetId: 'asset-1' });
      component.buyForm.patchValue({
        quantity: 10,
        purchasePrice: 150,
      });

      component.onSubmit();

      expect(portfolioServiceSpy.buyNewInvestment).toHaveBeenCalledWith('asset-1', 10, 150);
      expect(dialogRefSpy.close).toHaveBeenCalledWith(true);
    });
  });

  describe('Existing Holding Mode', () => {
    beforeEach(() => {
      TestBed.resetTestingModule();
      const portfolioSpy = jasmine.createSpyObj('PortfolioService', ['buyNewInvestment', 'buyExistingHolding']);
      const assetSpy = jasmine.createSpyObj('AssetService', ['getAssets']);
      const dialogSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
      const mockData: BuyDialogData = {
        investmentId: 'inv-123',
        assetId: 'asset-1',
        symbol: 'AAPL',
        name: 'Apple Inc.',
        currentPrice: 170,
      };

      TestBed.configureTestingModule({
        imports: [BuyDialogComponent, NoopAnimationsModule],
        providers: [
          { provide: PortfolioService, useValue: portfolioSpy },
          { provide: AssetService, useValue: assetSpy },
          { provide: MatDialogRef, useValue: dialogSpy },
          { provide: MAT_DIALOG_DATA, useValue: mockData },
        ],
      }).compileComponents();

      portfolioServiceSpy = TestBed.inject(PortfolioService) as jasmine.SpyObj<PortfolioService>;
      assetServiceSpy = TestBed.inject(AssetService) as jasmine.SpyObj<AssetService>;
      dialogRefSpy = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<BuyDialogComponent>>;

      fixture = TestBed.createComponent(BuyDialogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should initialize in existing mode with readonly prefilled values', () => {
      expect(component.isNew).toBeFalse();
      expect(component.assetName).toBe('Apple Inc.');
      expect(component.assetSymbol).toBe('AAPL');
      expect(component.buyForm.value.purchasePrice).toBeGreaterThan(0);
      expect(assetServiceSpy.getAssets).not.toHaveBeenCalled();
    });

    it('should call buyExistingHolding and close on submit', () => {
      portfolioServiceSpy.buyExistingHolding.and.returnValue(of({}));
      component.buyForm.patchValue({
        quantity: 5,
        purchasePrice: 175,
      });

      component.onSubmit();

      expect(portfolioServiceSpy.buyExistingHolding).toHaveBeenCalledWith('inv-123', 5, 175);
      expect(dialogRefSpy.close).toHaveBeenCalledWith(true);
    });
  });
});
