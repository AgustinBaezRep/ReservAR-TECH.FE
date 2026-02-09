import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Subject, takeUntil } from 'rxjs';

import { UsuariosService } from '../../services/usuarios.service';
import { UserRole } from '../../../login/models/auth.model';

@Component({
    selector: 'app-create-user',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDatepickerModule,
        MatNativeDateModule
    ],
    templateUrl: './create-user.component.html',
    styleUrls: ['./create-user.component.scss']
})
export class CreateUserComponent implements OnInit, OnDestroy {
    userForm!: FormGroup;
    isLoading = false;
    errorMessage = '';
    successMessage = '';

    private destroy$ = new Subject<void>();

    constructor(
        private fb: FormBuilder,
        private usuariosService: UsuariosService
    ) { }

    ngOnInit(): void {
        this.initForm();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private initForm(): void {
        this.userForm = this.fb.group({
            firstName: ['', [Validators.required, Validators.minLength(2)]],
            lastName: ['', [Validators.required, Validators.minLength(2)]],
            email: ['', [Validators.required, Validators.email]],
            dateOfBirth: [null],
            role: [UserRole.CLIENT, Validators.required]
        });
    }

    onSubmit(): void {
        if (this.userForm.invalid) return;

        this.isLoading = true;
        this.errorMessage = '';
        this.successMessage = '';

        const formValue = this.userForm.value;
        const createRequest = {
            name: `${formValue.firstName} ${formValue.lastName}`,
            email: formValue.email,
            role: formValue.role
        };

        this.usuariosService.createUser(createRequest)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.isLoading = false;
                    if (response.success) {
                        this.successMessage = response.message || 'User created successfully';
                        this.userForm.reset({
                            role: UserRole.CLIENT
                        });
                    } else {
                        this.errorMessage = response.message || 'Failed to create user';
                    }
                },
                error: (error) => {
                    this.isLoading = false;
                    this.errorMessage = 'An error occurred while creating the user';
                    console.error('Create user error:', error);
                }
            });
    }
}
