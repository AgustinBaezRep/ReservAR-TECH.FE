import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { UsuariosService } from '../../services/usuarios.service';
import { AuthService } from '../../../login/services/auth.service';

@Component({
    selector: 'app-change-password',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule
    ],
    templateUrl: './change-password.component.html',
    styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit, OnDestroy {
    passwordForm!: FormGroup;
    isLoading = false;
    errorMessage = '';
    successMessage = '';
    currentUserEmail = '';

    private destroy$ = new Subject<void>();

    constructor(
        private fb: FormBuilder,
        private usuariosService: UsuariosService,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.initForm();
        this.loadCurrentUser();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private loadCurrentUser(): void {
        const user = this.authService.getUser();
        if (user) {
            this.currentUserEmail = user.email || 'johndoe@example.com';
        }
    }

    private initForm(): void {
        this.passwordForm = this.fb.group({
            currentPassword: ['', Validators.required],
            newPassword: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', Validators.required]
        }, { validators: this.passwordMatchValidator });
    }

    private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
        const newPassword = control.get('newPassword');
        const confirmPassword = control.get('confirmPassword');

        if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
            return { passwordMismatch: true };
        }
        return null;
    }

    onSubmit(): void {
        if (this.passwordForm.invalid) return;

        this.isLoading = true;
        this.errorMessage = '';
        this.successMessage = '';

        const { currentPassword, newPassword, confirmPassword } = this.passwordForm.value;

        this.usuariosService.changePassword({ currentPassword, newPassword, confirmPassword })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.isLoading = false;
                    if (response.success) {
                        this.successMessage = response.message || 'Contraseña actualizada exitosamente';
                        this.passwordForm.reset();
                    } else {
                        this.errorMessage = response.message || 'Error al cambiar contraseña';
                    }
                },
                error: (error) => {
                    this.isLoading = false;
                    this.errorMessage = 'Ocurrió un error al cambiar la contraseña';
                    console.error('Change password error:', error);
                }
            });
    }
}

