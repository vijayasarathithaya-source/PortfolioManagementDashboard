import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { of } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: any;

  beforeEach(async () => {
    mockAuthService = {
      login: jasmine.createSpy('login').and.returnValue(of({ token: 'abc', user: {} })),
      getToken: () => null,
      isAuthenticated: () => false,
    };

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        ReactiveFormsModule,
        NoopAnimationsModule,
      ],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be invalid when empty', () => {
    expect(component.loginForm.valid).toBeFalse();
  });

  it('should call authService login on submit when valid', () => {
    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'password123',
    });
    component.onSubmit();

    expect(mockAuthService.login).toHaveBeenCalledWith('test@example.com', 'password123');
  });
});
