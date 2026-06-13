import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DropdownComponent } from './dropdown.component';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('DropdownComponent', () => {
  let component: DropdownComponent;
  let fixture: ComponentFixture<DropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropdownComponent, ReactiveFormsModule, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(DropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should accept options input', () => {
    const opts = [
      { value: 'STOCKS', label: 'Stocks' },
      { value: 'BONDS', label: 'Bonds' },
    ];
    fixture.componentRef.setInput('options', opts);
    fixture.detectChanges();

    expect(component.options().length).toBe(2);
    expect(component.options()[0].value).toBe('STOCKS');
  });
});
