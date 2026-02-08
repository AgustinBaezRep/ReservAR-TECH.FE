import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Product } from '../../models/caja.models';

@Component({
  selector: 'app-product-form-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data ? 'Edit' : 'New' }} Item</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline" class="w-full">
            <mat-label>Item Name</mat-label>
            <input matInput formControlName="name" placeholder="Ex. Water Bottle">
        </mat-form-field>

        <div class="row">
            <mat-form-field appearance="outline" class="w-half">
                <mat-label>Purchase Price</mat-label>
                <input matInput type="number" formControlName="purchasePrice">
                <span matTextPrefix>$&nbsp;</span>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-half">
                <mat-label>Sale Price</mat-label>
                <input matInput type="number" formControlName="price">
                <span matTextPrefix>$&nbsp;</span>
            </mat-form-field>
        </div>

        <div class="row">
            <mat-form-field appearance="outline" class="w-half">
                <mat-label>Stock</mat-label>
                <input matInput type="number" formControlName="stock">
            </mat-form-field>
            
            <div class="w-half checkbox-container">
                 <mat-checkbox formControlName="isActive">Active</mat-checkbox>
            </div>
        </div>
        
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="save()">Save</button>
    </mat-dialog-actions>
  `,
  styles: [`
    /* Dialog styling */
    .dialog-form { padding-top: 10px; }
    .w-full { width: 100%; margin-bottom: 16px; display: block; }
    .row { display: flex; gap: 24px; margin-bottom: 16px; align-items: flex-start; }
    .w-half { flex: 1; }
    .checkbox-container { display: flex; align-items: center; height: 56px; /* Align with input height */ }
    
    /* Ensure inputs have enough space */
    mat-form-field { width: 100%; }
    textarea { min-height: 80px; }
  `]
})
export class ProductFormDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ProductFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Product | null
  ) {
    this.form = this.fb.group({
      name: [data?.name || '', Validators.required],
      purchasePrice: [data?.purchasePrice || 0, [Validators.required, Validators.min(0)]],
      price: [data?.price || 0, [Validators.required, Validators.min(0)]],
      stock: [data?.stock || 0, [Validators.required, Validators.min(0)]],
      isActive: [data?.isActive ?? true],
      description: [data?.description || ''],
      category: [data?.category || 'Articulo']
    });
  }

  save() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
