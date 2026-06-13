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
});
