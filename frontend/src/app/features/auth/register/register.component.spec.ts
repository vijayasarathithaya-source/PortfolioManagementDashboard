import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { of } from 'rxjs';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let mockAuthService: any;

  beforeEach(async () => {
    mockAuthService = {
      register: jasmine.createSpy('register').and.returnValue(of({ success: true })),
      getToken: () => null,
      isAuthenticated: () => false,
    };

    await TestBed.configureTestingModule({
      imports: [
        RegisterComponent,
        ReactiveFormsModule,
        NoopAnimationsModule,
      ],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be invalid when empty', () => {
    expect(component.registerForm.valid).toBeFalse();
  });

  it('should validate passwords match', () => {
    component.registerForm.patchValue({
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'differentpassword',
    });
    component.onSubmit();

    expect(component.registerForm.valid).toBeFalse();
    expect(component.registerForm.hasError('mismatch')).toBeTrue();
  });
});
