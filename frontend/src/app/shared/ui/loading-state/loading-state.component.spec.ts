import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingStateComponent } from './loading-state.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

describe('LoadingStateComponent', () => {
  let component: LoadingStateComponent;
  let fixture: ComponentFixture<LoadingStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingStateComponent, MatProgressSpinnerModule],
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render correct skeleton panels based on mode input', () => {
    fixture.componentRef.setInput('mode', 'skeleton-table');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.skeleton-table')).toBeTruthy();
    expect(compiled.querySelector('.spinner-wrapper')).toBeFalsy();
  });
});
