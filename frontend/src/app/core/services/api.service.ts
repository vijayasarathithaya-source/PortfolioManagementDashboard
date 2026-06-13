import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private get baseUrl(): string {
    return window.location.origin.includes('localhost:4200')
      ? 'http://localhost:3000'
      : window.location.origin;
  }

  constructor(private http: HttpClient) {}

  get<T>(path: string, params?: any): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${path}`, { params });
  }

  post<T>(path: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${path}`, body);
  }

  put<T>(path: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${path}`, body);
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${path}`);
  }
}
