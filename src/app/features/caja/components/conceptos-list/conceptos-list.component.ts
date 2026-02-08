import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { CajaService } from '../../services/caja.service';
import { Product } from '../../models/caja.models';
import { Observable } from 'rxjs';
import { ProductFormDialogComponent } from '../product-form-dialog/product-form-dialog.component';

@Component({
  selector: 'app-conceptos-list',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatCardModule
  ],
  template: `
    <div class="container">
      
      <!-- Add New Item Form -->
      <mat-card class="form-card">
        <mat-card-header>
          <mat-card-title>Add New Item</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="form-container">
                <div class="form-row">
                <mat-form-field appearance="outline" class="w-half">
                    <mat-label>Item Name</mat-label>
                    <input matInput formControlName="name" placeholder="Enter item name">
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-half">
                    <mat-label>Purchase Price</mat-label>
                    <input matInput type="number" formControlName="purchasePrice">
                    <span matTextPrefix>$&nbsp;</span>
                </mat-form-field>
                </div>

                <div class="form-row">
                <mat-form-field appearance="outline" class="w-half">
                    <mat-label>Sale Price</mat-label>
                    <input matInput type="number" formControlName="price">
                    <span matTextPrefix>$&nbsp;</span>
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-half">
                    <mat-label>Stock</mat-label>
                    <input matInput type="number" formControlName="stock">
                </mat-form-field>
                </div>

                <div class="form-row checkbox-row">
                    <mat-checkbox formControlName="isActive">Active</mat-checkbox>
                </div>
            </div>
            
            <div class="form-actions">
                <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">
                    Add Item
                </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Item List -->
      <div class="list-section">
        <h3>Item List</h3>
        <div class="filter-actions">
            <mat-form-field appearance="outline" class="search-field">
                <mat-label>Filter by name</mat-label>
                <input matInput (keyup)="applyFilter($event)" placeholder="Search">
            </mat-form-field>

            <div class="right-actions">
                <input 
                    type="file" 
                    #fileInput 
                    style="display: none" 
                    (change)="onFileSelected($event)" 
                    accept=".xlsx, .xls"
                />
                <button mat-stroked-button (click)="downloadTemplate()">
                   <mat-icon>download</mat-icon> Template
                 </button>
                <button mat-raised-button color="primary" (click)="importClick(fileInput)">
                    <mat-icon>upload_file</mat-icon> Import Excel
                </button>
            </div>
        </div>

        <table mat-table [dataSource]="products$" class="mat-elevation-z8">
            <!-- Name Column -->
            <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef> Name </th>
            <td mat-cell *matCellDef="let element"> {{element.name}} </td>
            </ng-container>

            <!-- Purchase Price Column -->
            <ng-container matColumnDef="purchasePrice">
            <th mat-header-cell *matHeaderCellDef> Purchase Price </th>
            <td mat-cell *matCellDef="let element"> {{element.purchasePrice | currency}} </td>
            </ng-container>

            <!-- Sale Price Column -->
            <ng-container matColumnDef="price">
            <th mat-header-cell *matHeaderCellDef> Sale Price </th>
            <td mat-cell *matCellDef="let element"> {{element.price | currency}} </td>
            </ng-container>

            <!-- Stock Column -->
            <ng-container matColumnDef="stock">
            <th mat-header-cell *matHeaderCellDef> Stock </th>
            <td mat-cell *matCellDef="let element"> {{element.stock}} </td>
            </ng-container>

            <!-- Status Column -->
            <ng-container matColumnDef="isActive">
            <th mat-header-cell *matHeaderCellDef> Status </th>
            <td mat-cell *matCellDef="let element"> 
                <span [class.active-status]="element.isActive" [class.inactive-status]="!element.isActive">
                    {{element.isActive ? 'Active' : 'Inactive'}}
                </span>
            </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef> Actions </th>
            <td mat-cell *matCellDef="let element">
                <button mat-icon-button color="primary" (click)="openEditDialog(element)" matTooltip="Edit">
                <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="deleteProduct(element)" matTooltip="Delete">
                <mat-icon>delete</mat-icon>
                </button>
            </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .container { padding: 20px; }
    .form-card { margin-bottom: 30px; }
    .form-container { display: flex; flex-direction: column; }
    .form-row { display: flex; gap: 20px; margin-bottom: 10px; width: 100%; }
    .w-half { flex: 1; }
    .checkbox-row { margin-bottom: 10px; }
    .form-actions { display: flex; justify-content: flex-start; margin-top: 10px; }
    
    .list-section h3 { margin-bottom: 15px; }
    .filter-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .search-field { width: 300px; margin-bottom: -1.25em; }
    .right-actions { display: flex; gap: 10px; align-items: center; }

    table { width: 100%; }
    
    .active-status { color: green; font-weight: bold; }
    .inactive-status { color: gray; font-style: italic; }
  `]
})
export class ConceptosListComponent {
  products$: Observable<Product[]>;
  displayedColumns: string[] = ['name', 'purchasePrice', 'price', 'stock', 'isActive', 'actions'];
  form: FormGroup;

  constructor(
    private cajaService: CajaService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.products$ = this.cajaService.products$;
    this.form = this.fb.group({
      name: ['', Validators.required],
      purchasePrice: [0, [Validators.required, Validators.min(0)]],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      isActive: [true],
      category: ['Articulo']
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const newProduct: Product = {
        id: '',
        ...this.form.value
      };
      this.cajaService.addProduct(newProduct);
      this.form.reset({
        name: '', purchasePrice: 0, price: 0, stock: 0, isActive: true, category: 'Articulo'
      });
    }
  }

  openEditDialog(product: Product) {
    const dialogRef = this.dialog.open(ProductFormDialogComponent, {
      width: '600px',
      data: product ? { ...product } : null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cajaService.updateProduct({ ...product, ...result });
      }
    });
  }

  deleteProduct(product: Product) {
    if (confirm(`Are you sure you want to delete ${product.name}?`)) {
      this.cajaService.deleteProduct(product.id);
    }
  }

  importClick(fileInput: HTMLInputElement) {
    fileInput.click();
  }

  downloadTemplate() {
    this.cajaService.downloadImportTemplate();
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      // Using simple confirm for now as requested by user "darle al usuario una planilla básica" logic is handled by template download.
      // The confirmation dialog can be enhanced to a custom component if strictly required, but `confirm()` meets functional req.
      // Given the screenshot, a custom dialog is better UX. I will implement a basic custom confirmation dialog next.
      if (confirm(`You are about to import an Excel file containing article data. The file should have columns matching the fields in the system (Name, Purchase Price, Sale Price, Stock). Are you ready to proceed?`)) {
        this.cajaService.importProductsFromExcel(file).then(() => {
          alert('Success');
        }).catch(err => alert('Error: ' + err));
      }
      event.target.value = '';
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    // TODO: Implement filtering logic
    console.log(filterValue);
  }
}
