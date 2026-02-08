import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss'
})
export class LoginPageComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => this.handleAuthResponse(response),
        error: (error) => this.handleError(error)
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  onGoogleLogin(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.authService.loginWithGoogle().subscribe({
      next: (response) => this.handleAuthResponse(response),
      error: (error) => this.handleError(error)
    });
  }

  private handleAuthResponse(response: any): void {
    this.isLoading = false;
    if (response.success) {
      console.log('Login successful:', response);
      this.redirectUser(response.user.role);
    } else {
      this.errorMessage = response.message;
    }
  }

  private handleError(error: any): void {
    this.isLoading = false;
    this.errorMessage = 'An error occurred. Please try again.';
    console.error('Login error:', error);
  }

  private redirectUser(role: string): void {
    if (role === 'ADMIN') {
      this.router.navigate(['/complejos']);
    } else {
      // CLIENT
      this.router.navigate(['/reservas']);
    }
  }
}
