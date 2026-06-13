import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PortfolioService } from '../../../../core/services/portfolio.service';
import { DialogComponent } from '../../../../shared/ui/dialog/dialog.component';
import { InputComponent } from '../../../../shared/ui/input/input.component';

export interface SellDialogData {
  investmentId: string;
  symbol: string;
  name: string;
  quantity: number; // Current quantity owned
  currentPrice: number; // Prefilled sell price
}

@Component({
  selector: 'app-sell-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    DialogComponent,
    InputComponent,
  ],
  templateUrl: './sell-dialog.component.html',
  styleUrl: './sell-dialog.component.scss',
})
export class SellDialogComponent implements OnInit {
  assetName = '';
  assetSymbol = '';
  maxQuantity = 0;
  loading = false;
  errorMessage = '';

  sellForm = new FormGroup({
    quantity: new FormControl<number | null>(null, [Validators.required, Validators.min(0.00001)]),
    price: new FormControl<number | null>(null, [Validators.required, Validators.min(0.00001)]),
  });

  constructor(
    public dialogRef: MatDialogRef<SellDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SellDialogData,
    private portfolioService: PortfolioService
  ) {}

  ngOnInit(): void {
    this.assetName = this.data.name;
    this.assetSymbol = this.data.symbol;
    this.maxQuantity = this.data.quantity;

    // Apply the max validation dynamically based on current holding quantity
    this.sellForm.controls.quantity.setValidators([
      Validators.required,
      Validators.min(0.00001),
      Validators.max(this.maxQuantity),
    ]);
    this.sellForm.controls.quantity.updateValueAndValidity();

    this.sellForm.patchValue({
      price: this.data.currentPrice || null,
    });
  }

  onSubmit(): void {
    if (this.sellForm.invalid) {
      this.sellForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    const { quantity, price } = this.sellForm.value;

    this.portfolioService
      .sellHolding(this.data.investmentId, quantity!, price!)
      .subscribe({
        next: () => {
          this.loading = false;
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.error || 'Transaction failed. Please try again.';
        },
      });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
