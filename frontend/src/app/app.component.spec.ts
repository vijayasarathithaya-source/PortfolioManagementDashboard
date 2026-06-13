import { TestBed } from '@angular/core/testing';
import { App } from './app.component';
import { AuthService } from './core/services/auth.service';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';

class MockAuthService {
  userSignal = signal<any>(null);
  isAuthenticated = signal<boolean>(false);
  currentUser = this.userSignal.asReadonly();
  getToken() { return null; }
  logout() { }
}

describe('App', () => {
  let mockAuthService: MockAuthService;

  beforeEach(async () => {
    mockAuthService = new MockAuthService();

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        provideRouter([]),
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render auth outlet when not authenticated', () => {
    mockAuthService.isAuthenticated.set(false);
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    // Header should not exist when not authenticated
    expect(compiled.querySelector('.app-layout')).toBeNull();
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });

  it('should render sidebar brand when authenticated', () => {
    mockAuthService.isAuthenticated.set(true);
    mockAuthService.userSignal.set({ email: 'investor@example.com', fullName: 'John Doe' });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.brand-title')?.textContent).toContain('Portfolio');
    expect(compiled.querySelector('.user-name')?.textContent).toContain('John Doe');
    expect(compiled.querySelector('.user-email')?.textContent).toContain('investor@example.com');
  });
});
