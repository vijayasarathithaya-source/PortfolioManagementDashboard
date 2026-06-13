import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent, MatProgressSpinnerModule, MatIconModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the label', () => {
    fixture.componentRef.setInput('label', 'Click Me');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.btn-text')?.textContent).toContain('Click Me');
  });

  it('should emit click event when clicked', () => {
    let clicked = false;
    component.btnClick.subscribe(() => clicked = true);

    const button = fixture.nativeElement.querySelector('button');
    button.click();

    expect(clicked).toBeTrue();
  });

  it('should not emit click when disabled or loading', () => {
    let clicked = false;
    component.btnClick.subscribe(() => clicked = true);

    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    button.click();

    expect(clicked).toBeFalse();
  });
});
