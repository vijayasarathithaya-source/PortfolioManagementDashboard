import { Component, input, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';

export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'currency' | 'number' | 'percent' | 'date' | 'badge' | 'actions';
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, MatTableModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class TableComponent {
  data = input<any[]>([]);
  columns = input<TableColumn[]>([]);

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

  rowClick = output<any>();
  actionClick = output<{ action: string; row: any }>();

  onRowClick(row: any): void {
    this.rowClick.emit(row);
  }

  onAction(actionName: string, row: any, event: MouseEvent): void {
    event.stopPropagation();
    this.actionClick.emit({ action: actionName, row });
  }
}
