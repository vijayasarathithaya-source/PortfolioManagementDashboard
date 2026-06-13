import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogComponent } from './dialog.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('DialogComponent', () => {
  let component: DialogComponent;
  let fixture: ComponentFixture<DialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(DialogComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('title', 'Test Dialog');
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display confirm button with custom text', () => {
    fixture.componentRef.setInput('title', 'Save Changes');
    fixture.componentRef.setInput('confirmText', 'Save Now');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const actionsText = compiled.querySelector('.dialog-actions')?.textContent || '';
    expect(actionsText).toContain('Save Now');
  });
});
