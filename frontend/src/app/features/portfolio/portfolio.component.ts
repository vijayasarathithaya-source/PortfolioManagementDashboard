import { Component, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PortfolioService } from '../../core/services/portfolio.service';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { CardComponent } from '../../shared/ui/card/card.component';
import { LoadingStateComponent } from '../../shared/ui/loading-state/loading-state.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { TableComponent, TableColumn } from '../../shared/ui/table/table.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { BuyDialogComponent } from './components/buy-dialog/buy-dialog.component';
import { SellDialogComponent } from './components/sell-dialog/sell-dialog.component';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    PageHeaderComponent,
    CardComponent,
    LoadingStateComponent,
    EmptyStateComponent,
    TableComponent,
    ButtonComponent,
  ],
  templateUrl: './portfolio.component.html',
  styleUrl: './portfolio.component.scss',
})
export class PortfolioComponent implements OnInit {
  loading = computed(() => this.portfolioService.loading());
  error = computed(() => this.portfolioService.error());
  holdings = computed(() => this.portfolioService.holdings());

  tableColumns: TableColumn[] = [
    { key: 'symbol', label: 'Symbol', type: 'text' },
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'assetType', label: 'Type', type: 'badge' },
    { key: 'quantity', label: 'Qty', type: 'number' },
    { key: 'purchasePrice', label: 'Purchase Price', type: 'currency' },
    { key: 'currentPrice', label: 'Current Price', type: 'currency' },
    { key: 'currentValue', label: 'Current Value', type: 'currency' },
    { key: 'profitLoss', label: 'Profit/Loss', type: 'currency' },
    { key: 'returnPercentage', label: 'Return', type: 'percent' },
    { key: 'actions', label: 'Actions', type: 'actions' },
  ];

  constructor(
    private portfolioService: PortfolioService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.portfolioService.loadPortfolioData().subscribe();
  }

  onBuyNew(): void {
    const dialogRef = this.dialog.open(BuyDialogComponent, {
      width: '500px',
      maxWidth: '90vw',
      data: null,
    });

    dialogRef.afterClosed().subscribe((success) => {
      if (success) {
        this.portfolioService.loadPortfolioData().subscribe();
      }
    });
  }

  onTableAction(event: { action: string; row: any }): void {
    if (event.action === 'buy') {
      const dialogRef = this.dialog.open(BuyDialogComponent, {
        width: '500px',
        maxWidth: '90vw',
        data: {
          investmentId: event.row.id,
          assetId: event.row.assetId,
          symbol: event.row.symbol,
          name: event.row.name,
          currentPrice: event.row.currentPrice,
        },
      });

      dialogRef.afterClosed().subscribe((success) => {
        if (success) {
          this.portfolioService.loadPortfolioData().subscribe();
        }
      });
    } else if (event.action === 'sell') {
      const dialogRef = this.dialog.open(SellDialogComponent, {
        width: '500px',
        maxWidth: '90vw',
        data: {
          investmentId: event.row.id,
          symbol: event.row.symbol,
          name: event.row.name,
          quantity: event.row.quantity,
          currentPrice: event.row.currentPrice,
        },
      });

      dialogRef.afterClosed().subscribe((success) => {
        if (success) {
          this.portfolioService.loadPortfolioData().subscribe();
        }
      });
    }
  }
}
