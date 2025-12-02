import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { 
  LoginRequest, 
  RegisterRequest, 
  ForgotPasswordRequest, 
  ResetPasswordRequest, 
  AuthResponse 
} from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    // TODO: Replace with actual HTTP call to backend
    console.log('Login attempt:', credentials);
    return of({
      success: true,
      message: 'Login successful',
      token: 'mock-jwt-token',
      user: {
        id: '1',
        name: 'User Name',
        email: credentials.email
      }
    }).pipe(delay(1000));
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
        email: data.email
      }
    }).pipe(delay(1000));
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
    // TODO: Clear token and user data
    console.log('User logged out');
  }

  isAuthenticated(): boolean {
    // TODO: Check if user has valid token
    return false;
  }
}
