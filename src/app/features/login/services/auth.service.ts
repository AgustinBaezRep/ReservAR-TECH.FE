import { Injectable } from '@angular/core';
import { Observable, of, delay, tap } from 'rxjs';
import {
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AuthResponse,
  UserRole
} from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  constructor() { }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    // TODO: Replace with actual HTTP call to backend
    console.log('Login attempt:', credentials);

    // Simulate Admin role for specific email
    const role = credentials.email === 'admin@test.com' ? UserRole.ADMIN : UserRole.CLIENT;

    return of({
      success: true,
      message: 'Login successful',
      token: 'mock-jwt-token',
      user: {
        id: '1',
        name: 'User Name',
        email: credentials.email,
        role: role
      }
    }).pipe(
      delay(1000),
      tap(response => {
        if (response.success && response.token) {
          this.storeToken(response.token);
          if (response.user) {
            this.storeUser(response.user);
          }
        }
      })
    );
  }

  loginWithGoogle(): Observable<AuthResponse> {
    console.log('Google Login attempt');
    return of({
      success: true,
      message: 'Google Login successful',
      token: 'mock-google-token',
      user: {
        id: 'google-user-id',
        name: 'Google User',
        email: 'google@test.com',
        role: UserRole.CLIENT
      }
    }).pipe(
      delay(1000),
      tap(response => {
        if (response.success && response.token) {
          this.storeToken(response.token);
          if (response.user) {
            this.storeUser(response.user);
          }
        }
      })
    );
  }



  register(data: RegisterRequest): Observable<AuthResponse> {
    // TODO: Replace with actual HTTP call to backend
    console.log('Register attempt:', data);
    return of({
      success: true,
      message: 'Registration successful',
      token: 'mock-jwt-token',
      user: {
        id: '1',
        name: data.name,
        email: data.email,
        role: UserRole.CLIENT
      }
    }).pipe(
      delay(1000),
      tap(response => {
        if (response.success && response.token) {
          this.storeToken(response.token);
          if (response.user) {
            this.storeUser(response.user);
          }
        }
      })
    );
  }

  forgotPassword(data: ForgotPasswordRequest): Observable<AuthResponse> {
    // TODO: Replace with actual HTTP call to backend
    console.log('Forgot password request:', data);
    return of({
      success: true,
      message: 'Password reset email sent'
    }).pipe(delay(1000));
  }

  resetPassword(data: ResetPasswordRequest): Observable<AuthResponse> {
    // TODO: Replace with actual HTTP call to backend
    console.log('Reset password attempt:', data);
    return of({
      success: true,
      message: 'Password reset successful'
    }).pipe(delay(1000));
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    console.log('User logged out');
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);
    return !!token;
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private storeToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private storeUser(user: any): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  getUser(): any {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }
}

