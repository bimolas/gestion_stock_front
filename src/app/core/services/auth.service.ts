import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthResponseDto, LoginDto, RegisterDto } from '../models/api.models';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private tokenKey = 'vanguard_token';

  isAuthenticated = signal<boolean>(this.hasToken());

  login(credentials: LoginDto) {
    return this.http.post<AuthResponseDto>(`${environment.apiUrl}/Api/Auth/Login`, credentials).pipe(
      tap(res => {
        if (res.accessToken) {
          this.setToken(res.accessToken);
          this.isAuthenticated.set(true);
        }
      })
    );
  }

  register(userData: RegisterDto) {
    return this.http.post<AuthResponseDto>(`${environment.apiUrl}/Api/Auth/Register`, userData).pipe(
      tap(res => {
        if (res.accessToken) {
          this.setToken(res.accessToken);
          this.isAuthenticated.set(true);
        }
      })
    );
  }

  getToken(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  private setToken(token: string) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  logout() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
    }
    this.isAuthenticated.set(false);
    this.router.navigate(['/auth/login']);
  }

  private hasToken(): boolean {
    return !!this.getToken();
  }
}
