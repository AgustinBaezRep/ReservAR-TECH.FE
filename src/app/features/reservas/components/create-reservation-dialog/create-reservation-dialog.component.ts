import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Court, TimeSlot } from '../../models/reservation.model';

export interface CreateReservationDialogData {
    court: Court;
    timeSlot: TimeSlot;
    date: Date;
    price: number;
}

@Component({
    selector: 'app-create-reservation-dialog',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule
    ],
    templateUrl: './create-reservation-dialog.component.html',
    styleUrl: './create-reservation-dialog.component.scss'
})
export class CreateReservationDialogComponent {
    form: FormGroup;

    constructor(
        private fb: FormBuilder,
        public dialogRef: MatDialogRef<CreateReservationDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: CreateReservationDialogData
    ) {
        this.form = this.fb.group({
            userName: ['', [Validators.required]],
            userContact: ['', [Validators.required]], // Teléfono (obligatorio)
            userEmail: ['', [Validators.email]], // Email (opcional)
            notes: ['']
        });
    }

    getEndTime(): string {
        const isPadel = this.data.court.type?.toLowerCase().includes('padel');
        const durationMinutes = isPadel ? 90 : 60;

        const [hours, minutes] = this.data.timeSlot.label.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes + durationMinutes);
        const endHour = date.getHours().toString().padStart(2, '0');
        const endMinute = date.getMinutes().toString().padStart(2, '0');
        return `${endHour}:${endMinute}`;
    }

    onCancel(): void {
        this.dialogRef.close();
    }

    onConfirm(): void {
        if (this.form.valid) {
            this.dialogRef.close(this.form.value);
        } else {
            this.form.markAllAsTouched();
        }
    }
}
