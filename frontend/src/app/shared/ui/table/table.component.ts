import { Component, input, computed, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';

export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'currency' | 'number' | 'percent' | 'date' | 'badge' | 'actions';
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class TableComponent {
  data = input<any[]>([]);
  columns = input<TableColumn[]>([]);
  
  pagination = input<boolean>(true);
  totalElements = input<number>(0);
  pageSize = input<number>(10);
  pageIndex = input<number>(0);
  pageChange = output<{ pageIndex: number; pageSize: number }>();

  localPageIndex = signal<number>(0);
  localPageSize = signal<number>(10);

  constructor() {
    effect(() => {
      this.localPageIndex.set(this.pageIndex());
    });

    effect(() => {
      this.localPageSize.set(this.pageSize());
    });
  }

  displayedColumns = computed(() => this.columns().map((c) => c.key));

  symbolColumn = computed(() => this.columns().find(c => c.key === 'symbol'));
  nameColumn = computed(() => this.columns().find(c => c.key === 'name'));
  badgeColumn = computed(() => this.columns().find(c => c.type === 'badge'));
  actionsColumn = computed(() => this.columns().find(c => c.type === 'actions'));

  primaryColumn = computed(() => {
    return this.symbolColumn() || this.nameColumn() || this.columns()[0];
  });

  secondaryColumn = computed(() => {
    const primary = this.primaryColumn();
    if (primary?.key === 'symbol') {
      return this.nameColumn();
    }
    return null;
  });

  detailColumns = computed(() => {
    const primary = this.primaryColumn();
    const secondary = this.secondaryColumn();
    const badge = this.badgeColumn();
    const actions = this.actionsColumn();

    return this.columns().filter(c => 
      c.key !== primary?.key && 
      c.key !== secondary?.key && 
      c.type !== 'badge' && 
      c.type !== 'actions'
    );
  });

  isServerSide = computed(() => this.totalElements() > 0);

  paginatedData = computed(() => {
    const rawData = this.data();
    if (!this.pagination() || this.isServerSide()) {
      return rawData;
    }
    const start = this.localPageIndex() * this.localPageSize();
    const end = start + this.localPageSize();
    return rawData.slice(start, end);
  });

  rowClick = output<any>();
  actionClick = output<{ action: string; row: any }>();

  onRowClick(row: any): void {
    this.rowClick.emit(row);
  }

  onAction(actionName: string, row: any, event: MouseEvent): void {
    event.stopPropagation();
    this.actionClick.emit({ action: actionName, row });
  }

  onPage(event: any): void {
    this.localPageIndex.set(event.pageIndex);
    this.localPageSize.set(event.pageSize);
    this.pageChange.emit({ pageIndex: event.pageIndex, pageSize: event.pageSize });
  }
}
