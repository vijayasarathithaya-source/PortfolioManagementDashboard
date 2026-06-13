import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PortfolioService } from '../../../../core/services/portfolio.service';
import { AssetService } from '../../../../core/services/asset.service';
import { DialogComponent } from '../../../../shared/ui/dialog/dialog.component';
import { InputComponent } from '../../../../shared/ui/input/input.component';
import { DropdownComponent, DropdownOption } from '../../../../shared/ui/dropdown/dropdown.component';

export interface BuyDialogData {
  investmentId?: string;
  assetId?: string;
  symbol?: string;
  name?: string;
  currentPrice?: number;
}

@Component({
  selector: 'app-buy-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    DialogComponent,
    InputComponent,
    DropdownComponent,
  ],
  templateUrl: './buy-dialog.component.html',
  styleUrl: './buy-dialog.component.scss',
})
export class BuyDialogComponent implements OnInit {
  isNew = true;
  assetName = '';
  assetSymbol = '';
  assetOptions: DropdownOption[] = [];
  loading = signal(false);
  errorMessage = signal('');

  buyForm = new FormGroup({
    assetId: new FormControl(''),
    quantity: new FormControl<number | null>(null, [Validators.required, Validators.min(0.00001)]),
    purchasePrice: new FormControl<number | null>(null, [Validators.required, Validators.min(0.00001)]),
  });

  constructor(
    public dialogRef: MatDialogRef<BuyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BuyDialogData | null,
    private portfolioService: PortfolioService,
    private assetService: AssetService
  ) {}

  ngOnInit(): void {
    this.buyForm.controls.assetId.valueChanges.subscribe((assetId) => {
      if (assetId) {
        const randomPrice = Math.round((50 + Math.random() * 300) * 100) / 100;
        this.buyForm.patchValue({
          purchasePrice: randomPrice,
        });
      }
    });

    if (this.data && this.data.investmentId) {
      this.isNew = false;
      this.assetName = this.data.name || '';
      this.assetSymbol = this.data.symbol || '';
      const randomPrice = Math.round((50 + Math.random() * 300) * 100) / 100;
      this.buyForm.patchValue({
        purchasePrice: randomPrice,
      });
    } else {
      this.isNew = true;
      this.buyForm.controls.assetId.setValidators([Validators.required]);
      this.buyForm.controls.assetId.updateValueAndValidity();
      this.loadAssets();
    }
  }

  loadAssets(): void {
    this.loading.set(true);
    this.assetService.getAssets().subscribe({
      next: (assets) => {
        this.assetOptions = assets.map((a) => ({
          value: a.id,
          label: `${a.symbol} - ${a.name}`,
        }));
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.error || 'Failed to load assets');
        this.loading.set(false);
      },
    });
  }

  onSubmit(): void {
    if (this.buyForm.invalid) {
      this.buyForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    const { assetId, quantity, purchasePrice } = this.buyForm.value;

    const request$ = this.isNew
      ? this.portfolioService.buyNewInvestment(
          assetId!,
          quantity!,
          purchasePrice!
        )
      : this.portfolioService.buyExistingHolding(
          this.data!.investmentId!,
          quantity!,
          purchasePrice!
        );

    request$.subscribe({
      next: () => {
        this.loading.set(false);
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.error || 'Transaction failed. Please try again.');
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
