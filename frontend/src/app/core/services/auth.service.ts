import { Injectable, signal, computed } from '@angular/core';
import { ApiService } from './api.service';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthResponse, User } from '../models/portfolio.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userSignal = signal<User | null>(null);

  currentUser = this.userSignal.asReadonly();
  isAuthenticated = computed(() => this.userSignal() !== null);

  constructor(private api: ApiService, private router: Router) {
    this.checkSession();
  }

  private checkSession(): void {
    const token = this.getToken();
    if (token) {
      this.api.get<User>('/api/auth/profile').subscribe({
        next: (user) => {
          this.userSignal.set(user);
        },
        error: () => {
          this.clearSession();
        },
      });
    }
  }

  register(email: string, fullName: string, password: string): Observable<any> {
    return this.api.post<any>('/api/auth/register', { email, fullName, password });
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/api/auth/login', { email, password }).pipe(
      tap((res) => {
        localStorage.setItem('auth_token', res.token);
        const mappedUser: User = {
          id: res.user.id,
          email: res.user.email,
          fullName: res.user.fullName,
          createdAt: new Date(res.user.createdAt),
        };
        this.userSignal.set(mappedUser);
      })
    );
  }

  logout(): void {
    const token = this.getToken();
    if (token) {
      this.api.post('/api/auth/logout', {}).subscribe({
        next: () => this.clearSession(),
        error: () => this.clearSession(),
      });
    } else {
      this.clearSession();
    }
  }

  private clearSession(): void {
    localStorage.removeItem('auth_token');
    this.userSignal.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }
}
