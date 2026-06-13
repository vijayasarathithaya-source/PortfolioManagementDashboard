import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InputComponent } from './input.component';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('InputComponent', () => {
  let component: InputComponent;
  let fixture: ComponentFixture<InputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputComponent, ReactiveFormsModule, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(InputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should propagate form value changes', () => {
    let value = '';
    component.registerOnChange((val: any) => value = val);

    const input = fixture.nativeElement.querySelector('input');
    input.value = 'Google stock';
    input.dispatchEvent(new Event('input'));

    expect(value).toBe('Google stock');
  });

  it('should display error if control is invalid and touched', () => {
    const control = new FormControl('', Validators.required);
    control.markAsTouched();

    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('errorMsg', 'This field is required');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('mat-error')?.textContent).toContain('This field is required');
  });

  it('should not show password toggle button if type is not password', () => {
    fixture.componentRef.setInput('type', 'text');
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('.password-toggle-btn');
    expect(button).toBeNull();
  });

  it('should show password toggle button and toggle input type when clicked', () => {
    fixture.componentRef.setInput('type', 'password');
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('.password-toggle-btn');
    expect(button).toBeTruthy();

    const input = fixture.nativeElement.querySelector('input');
    expect(input.type).toBe('password');

    // Click toggle button
    button.click();
    fixture.detectChanges();
    expect(input.type).toBe('text');

    // Click toggle button again
    button.click();
    fixture.detectChanges();
    expect(input.type).toBe('password');
  });
});

