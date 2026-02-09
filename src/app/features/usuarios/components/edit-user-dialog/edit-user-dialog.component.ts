import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

import { User } from '../../models/user.model';
import { UserRole } from '../../../login/models/auth.model';

@Component({
    selector: 'app-edit-user-dialog',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule
    ],
    templateUrl: './edit-user-dialog.component.html',
    styleUrls: ['./edit-user-dialog.component.scss']
})
export class EditUserDialogComponent implements OnInit {
    editForm!: FormGroup;
    isLoading = false;

    constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<EditUserDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { user: User }
    ) { }

    ngOnInit(): void {
        this.initForm();
    }

    private initForm(): void {
        this.editForm = this.fb.group({
            name: [this.data.user.name, [Validators.required, Validators.minLength(2)]],
            email: [this.data.user.email, [Validators.required, Validators.email]],
            role: [this.data.user.role, Validators.required]
        });
    }

    onSave(): void {
        if (this.editForm.valid) {
            this.dialogRef.close(this.editForm.value);
        }
    }

    onCancel(): void {
        this.dialogRef.close();
    }
}
