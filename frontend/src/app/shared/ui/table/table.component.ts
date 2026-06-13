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
