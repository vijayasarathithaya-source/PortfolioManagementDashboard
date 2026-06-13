import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableComponent, TableColumn } from './table.component';
import { MatTableModule } from '@angular/material/table';

describe('TableComponent', () => {
  let component: TableComponent;
  let fixture: ComponentFixture<TableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableComponent, MatTableModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate displayed columns keys', () => {
    const cols: TableColumn[] = [
      { key: 'name', label: 'Asset Name' },
      { key: 'price', label: 'Price', type: 'currency' }
    ];
    fixture.componentRef.setInput('columns', cols);
    fixture.detectChanges();

    expect(component.displayedColumns()).toEqual(['name', 'price']);
  });

  it('should resolve primary, secondary, and details columns correctly', () => {
    const cols: TableColumn[] = [
      { key: 'symbol', label: 'Symbol', type: 'text' },
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'assetType', label: 'Type', type: 'badge' },
      { key: 'quantity', label: 'Qty', type: 'number' },
      { key: 'actions', label: 'Actions', type: 'actions' }
    ];
    fixture.componentRef.setInput('columns', cols);
    fixture.detectChanges();

    expect(component.primaryColumn()?.key).toBe('symbol');
    expect(component.secondaryColumn()?.key).toBe('name');
    expect(component.badgeColumn()?.key).toBe('assetType');
    expect(component.actionsColumn()?.key).toBe('actions');

    const detailKeys = component.detailColumns().map(c => c.key);
    expect(detailKeys).toEqual(['quantity']);
  });

  it('should fallback primary column when symbol is absent', () => {
    const cols: TableColumn[] = [
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'quantity', label: 'Qty', type: 'number' }
    ];
    fixture.componentRef.setInput('columns', cols);
    fixture.detectChanges();

    expect(component.primaryColumn()?.key).toBe('name');
    expect(component.secondaryColumn()).toBeNull();
  });
});
