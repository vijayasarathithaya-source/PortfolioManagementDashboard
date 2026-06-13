import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { TransactionService } from '../../core/services/transaction.service';
import { CardComponent } from '../../shared/ui/card/card.component';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { LoadingStateComponent } from '../../shared/ui/loading-state/loading-state.component';
import { TableComponent, TableColumn } from '../../shared/ui/table/table.component';
import { DropdownComponent, DropdownOption } from '../../shared/ui/dropdown/dropdown.component';
import { DatePickerComponent } from '../../shared/ui/datepicker/datepicker.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { Transaction } from '../../core/models/portfolio.models';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardComponent,
    PageHeaderComponent,
    EmptyStateComponent,
    LoadingStateComponent,
    TableComponent,
    DropdownComponent,
    DatePickerComponent,
    ButtonComponent,
  ],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss',
})
export class TransactionsComponent implements OnInit {
  transactionsList = signal<any[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  filterForm = new FormGroup({
    startDate: new FormControl<Date | null>(null),
    endDate: new FormControl<Date | null>(null),
    transactionType: new FormControl<string>(''),
    assetType: new FormControl<string>(''),
  });

  assetOptions: DropdownOption[] = [
    { value: '', label: 'All Assets' },
    { value: 'Stocks', label: 'Stocks' },
    { value: 'Bonds', label: 'Bonds' },
    { value: 'Mutual Funds', label: 'Mutual Funds' },
  ];

  typeOptions: DropdownOption[] = [
    { value: '', label: 'All Types' },
    { value: 'BUY', label: 'BUY' },
    { value: 'SELL', label: 'SELL' },
  ];

  tableColumns: TableColumn[] = [
    { key: 'transactionDate', label: 'Date', type: 'date' },
    { key: 'symbol', label: 'Symbol', type: 'text' },
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'transactionType', label: 'Type', type: 'badge' },
    { key: 'quantity', label: 'Quantity', type: 'number' },
    { key: 'price', label: 'Price', type: 'currency' },
    { key: 'totalAmount', label: 'Total Amount', type: 'currency' },
  ];

  constructor(private transactionService: TransactionService) {}

  ngOnInit(): void {
    this.loadTransactions();

    // Reload list reactively when filter criteria updates
    this.filterForm.valueChanges.subscribe(() => {
      this.loadTransactions();
    });
  }

  loadTransactions(): void {
    this.loading.set(true);
    this.error.set(null);

    const { startDate, endDate, transactionType, assetType } = this.filterForm.value;

    const filters: any = {};
    if (startDate) {
      filters.startDate = new Date(startDate).toISOString();
    }
    if (endDate) {
      // Set to end of day to make range query inclusive of the selected day
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filters.endDate = end.toISOString();
    }
    if (transactionType) {
      filters.transactionType = transactionType;
    }
    if (assetType) {
      filters.assetType = assetType;
    }

    this.transactionService.getTransactions(filters).subscribe({
      next: (txs) => {
        this.transactionsList.set(
          txs.map((tx) => ({
            ...tx,
            totalAmount: tx.quantity * tx.price,
          }))
        );
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.error || 'Failed to load transaction history');
        this.loading.set(false);
      },
    });
  }

  onResetFilters(): void {
    this.filterForm.reset({
      startDate: null,
      endDate: null,
      transactionType: '',
      assetType: '',
    });
  }
}
