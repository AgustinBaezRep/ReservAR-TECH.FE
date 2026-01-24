import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { Court } from '../../../reservas/models/reservation.model';

@Component({
  selector: 'app-court-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule
  ],
  templateUrl: './court-form-dialog.component.html',
  styleUrls: ['./court-form-dialog.component.scss']
})
export class CourtFormDialogComponent {
  courtForm: FormGroup;
  sportTypes = ['Fútbol 5', 'Fútbol 7', 'Fútbol 9', 'Fútbol 11', 'Padel', 'Tenis', 'Basket'];
  floorTypes = ['Césped Sintético', 'Césped Natural', 'Cemento', 'Parquet', 'Polvo de Ladrillo'];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CourtFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Court
  ) {
    this.courtForm = this.fb.group({
      name: [data.name, Validators.required],
      type: [data.type, Validators.required],
      floorType: [''], // Assuming we might add this to the model later
      price: [data.price, [Validators.required, Validators.min(0)]],
      hasLighting: [false], // Assuming we might add this to the model later
      hasRoof: [false] // Assuming we might add this to the model later
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.courtForm.valid) {
      const updatedCourt: Court = {
        ...this.data,
        ...this.courtForm.value
      };
      this.dialogRef.close(updatedCourt);
    }
  }
}
