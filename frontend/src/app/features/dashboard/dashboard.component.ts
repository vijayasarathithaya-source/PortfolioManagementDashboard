import { Component, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PortfolioService } from '../../core/services/portfolio.service';
import { CardComponent } from '../../shared/ui/card/card.component';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { LoadingStateComponent } from '../../shared/ui/loading-state/loading-state.component';
import { TableComponent, TableColumn } from '../../shared/ui/table/table.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CardComponent,
    PageHeaderComponent,
    EmptyStateComponent,
    LoadingStateComponent,
    TableComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  loading = computed(() => this.portfolioService.loading());
  error = computed(() => this.portfolioService.error());
  holdings = computed(() => this.portfolioService.holdings());
  summary = computed(() => this.portfolioService.summary());

  totalValue = computed(() => this.portfolioService.totalValue());
  totalCost = computed(() => this.portfolioService.totalCost());
  totalProfitLoss = computed(() => this.portfolioService.totalProfitLoss());
  returnPercentage = computed(() => this.portfolioService.returnPercentage());
  assetsCount = computed(() => this.portfolioService.assetsCount());

  // Define columns for a mini holdings list in the dashboard
  tableColumns: TableColumn[] = [
    { key: 'symbol', label: 'Symbol', type: 'text' },
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'assetType', label: 'Type', type: 'badge' },
    { key: 'quantity', label: 'Qty', type: 'number' },
    { key: 'currentValue', label: 'Value', type: 'currency' },
    { key: 'profitLoss', label: 'Profit/Loss', type: 'currency' },
    { key: 'returnPercentage', label: 'Return', type: 'percent' },
  ];

  assetAllocation = computed(() => {
    const holdingsList = this.holdings();
    const total = this.totalValue() || 1; // avoid division by zero

    const allocationMap = {
      'Stocks': 0,
      'Bonds': 0,
      'Mutual Funds': 0,
    };

    holdingsList.forEach((h) => {
      const type = h.assetType as 'Stocks' | 'Bonds' | 'Mutual Funds';
      if (allocationMap[type] !== undefined) {
        allocationMap[type] += h.currentValue;
      }
    });

    return Object.keys(allocationMap).map((key) => {
      const value = allocationMap[key as 'Stocks' | 'Bonds' | 'Mutual Funds'];
      return {
        type: key,
        value,
        percentage: total > 0 ? (value / total) * 100 : 0,
        color: key === 'Stocks' ? '#4f46e5' : key === 'Bonds' ? '#0d9488' : '#f59e0b',
      };
    });
  });

  assetDistribution = computed(() => {
    const holdingsList = this.holdings();
    const total = this.totalValue() || 1;

    const distributionMap: { [symbol: string]: { name: string; value: number } } = {};
    holdingsList.forEach((h) => {
      if (!distributionMap[h.symbol]) {
        distributionMap[h.symbol] = { name: h.name, value: 0 };
      }
      distributionMap[h.symbol].value += h.currentValue;
    });

    const colors = [
      '#4f46e5', // Indigo
      '#0d9488', // Teal
      '#f59e0b', // Amber
      '#10b981', // Emerald
      '#ec4899', // Pink
      '#8b5cf6', // Violet
      '#ef4444', // Red
      '#3b82f6', // Blue
    ];

    const items = Object.keys(distributionMap).map((symbol, idx) => {
      const { name, value } = distributionMap[symbol];
      return {
        symbol,
        name,
        value,
        percentage: total > 0 ? (value / total) * 100 : 0,
        color: colors[idx % colors.length]
      };
    });

    items.sort((a, b) => b.value - a.value);

    let cumulativePercentage = 0;
    const gradientSegments = items.map((item) => {
      const start = cumulativePercentage;
      cumulativePercentage += item.percentage;
      return `${item.color} ${start.toFixed(1)}% ${cumulativePercentage.toFixed(1)}%`;
    });

    const gradientStyle = gradientSegments.length > 0
      ? `conic-gradient(${gradientSegments.join(', ')})`
      : 'conic-gradient(#e2e8f0 0% 100%)';

    return {
      items,
      gradientStyle
    };
  });

  constructor(private portfolioService: PortfolioService, private router: Router) {}

  ngOnInit(): void {
    this.portfolioService.loadPortfolioData().subscribe();
  }

  onBuyInvestment(): void {
    // Navigate to holdings page where buying/selling can be executed
    this.router.navigate(['/portfolio']);
  }
}
