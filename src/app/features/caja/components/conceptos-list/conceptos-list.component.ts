import { Component, OnDestroy } from '@angular/core';
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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CajaService } from '../../services/caja.service';
import { Product } from '../../models/caja.models';
import { Observable, BehaviorSubject, combineLatest, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProductFormDialogComponent } from '../product-form-dialog/product-form-dialog.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../reservas/components/confirm-dialog/confirm-dialog.component';

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
    MatCardModule,
    MatSnackBarModule
  ],
  template: `
    <div class="container">
      
      <!-- Formulario de Productos -->
      <mat-card class="form-card">
        <mat-card-header>
          <mat-card-title>Agregar Nuevo Producto</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="form-container">
                <div class="form-row">
                  <mat-form-field appearance="outline" class="w-half">
                      <mat-label>Nombre del Producto</mat-label>
                      <input matInput formControlName="name" placeholder="Ej: Agua Mineral">
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="w-half">
                      <mat-label>Categoría</mat-label>
                      <mat-select formControlName="category">
                        <mat-option value="Articulo">Artículo</mat-option>
                        <mat-option value="Concepto">Concepto</mat-option>
                      </mat-select>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline" class="w-half">
                      <mat-label>Precio de Compra</mat-label>
                      <input matInput type="number" formControlName="purchasePrice">
                      <span matTextPrefix>$&nbsp;</span>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="w-half">
                      <mat-label>Precio de Venta</mat-label>
                      <input matInput type="number" formControlName="price">
                      <span matTextPrefix>$&nbsp;</span>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline" class="w-half">
                      <mat-label>Stock</mat-label>
                      <input matInput type="number" formControlName="stock">
                  </mat-form-field>

                  <div class="w-half checkbox-container">
                      <mat-checkbox formControlName="isActive">Activo</mat-checkbox>
                  </div>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline" class="w-full">
                      <mat-label>Descripción (opcional)</mat-label>
                      <textarea matInput formControlName="description" rows="2" placeholder="Ej: 500ml"></textarea>
                  </mat-form-field>
                </div>
            </div>
            
            <div class="form-actions">
                <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">
                    Guardar Producto
                </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Listado de Productos -->
      <div class="list-section">
        <h3>Listado de Productos</h3>
        <div class="filter-actions">
            <mat-form-field appearance="outline" class="search-field">
                <mat-label>Filtrar por nombre</mat-label>
                <input matInput (keyup)="applyFilter($event)" placeholder="Buscar..." #filterInput>
                <mat-icon matSuffix>search</mat-icon>
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
                   <mat-icon>download</mat-icon> Plantilla
                 </button>
                <button mat-raised-button color="primary" (click)="importClick(fileInput)">
                    <mat-icon>upload_file</mat-icon> Importar Excel
                </button>
            </div>
        </div>

        <table mat-table [dataSource]="filteredProducts$" class="mat-elevation-z8">
            <!-- Nombre Column -->
            <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef> Nombre </th>
            <td mat-cell *matCellDef="let element"> {{element.name}} </td>
            </ng-container>

            <!-- Categoría Column -->
            <ng-container matColumnDef="category">
            <th mat-header-cell *matHeaderCellDef> Categoría </th>
            <td mat-cell *matCellDef="let element">
                <span class="category-badge" [class.concepto]="element.category === 'Concepto'">
                  {{element.category}}
                </span>
            </td>
            </ng-container>

            <!-- Precio Compra Column -->
            <ng-container matColumnDef="purchasePrice">
            <th mat-header-cell *matHeaderCellDef> Precio Compra </th>
            <td mat-cell *matCellDef="let element"> {{element.purchasePrice | currency:'ARS':'symbol':'1.0-0'}} </td>
            </ng-container>

            <!-- Precio Venta Column -->
            <ng-container matColumnDef="price">
            <th mat-header-cell *matHeaderCellDef> Precio Venta </th>
            <td mat-cell *matCellDef="let element"> {{element.price | currency:'ARS':'symbol':'1.0-0'}} </td>
            </ng-container>

            <!-- Stock Column -->
            <ng-container matColumnDef="stock">
            <th mat-header-cell *matHeaderCellDef> Stock </th>
            <td mat-cell *matCellDef="let element"> {{element.stock}} </td>
            </ng-container>

            <!-- Estado Column -->
            <ng-container matColumnDef="isActive">
            <th mat-header-cell *matHeaderCellDef> Estado </th>
            <td mat-cell *matCellDef="let element"> 
                <span [class.active-status]="element.isActive" [class.inactive-status]="!element.isActive">
                    {{element.isActive ? 'Activo' : 'Inactivo'}}
                </span>
            </td>
            </ng-container>

            <!-- Acciones Column -->
            <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef> Acciones </th>
            <td mat-cell *matCellDef="let element">
                <button mat-icon-button color="primary" (click)="openEditDialog(element)" matTooltip="Editar">
                <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="deleteProduct(element)" matTooltip="Eliminar">
                <mat-icon>delete</mat-icon>
                </button>
            </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

            <!-- Empty state -->
            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell empty-row" [attr.colspan]="displayedColumns.length">
                No se encontraron productos
              </td>
            </tr>
        </table>
      </div>
    </div>

    <!-- Toast Container for Undo -->
    <div class="toast-container">
      <div class="toast" *ngFor="let toast of toasts">
        <span class="toast-message">{{ toast.message }}</span>
        <button class="toast-action" (click)="onUndo(toast)">DESHACER</button>
      </div>
    </div>
  `,
  styles: [`
    .container { padding: 20px; }
    .form-card { margin-bottom: 30px; }
    .form-container { display: flex; flex-direction: column; }
    .form-row { display: flex; gap: 20px; margin-bottom: 10px; width: 100%; }
    .w-half { flex: 1; }
    .w-full { width: 100%; }
    .checkbox-container { display: flex; align-items: center; }
    .form-actions { display: flex; justify-content: flex-start; margin-top: 10px; }
    
    .list-section h3 { margin-bottom: 15px; }
    .filter-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .search-field { width: 300px; margin-bottom: -1.25em; }
    .right-actions { display: flex; gap: 10px; align-items: center; }

    table { width: 100%; }
    
    .active-status { color: #4caf50; font-weight: 500; }
    .inactive-status { color: #9e9e9e; font-style: italic; }

    .category-badge {
      background: #e8e8e8;
      color: #333;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }
    .category-badge.concepto {
      background: #d0d0d0;
      color: #555;
    }

    .empty-row {
      text-align: center;
      padding: 20px;
      color: #666;
      font-style: italic;
    }

    /* Solo mostrar errores de validación cuando el campo ha sido modificado (dirty), no solo tocado (touched) */
    :host ::ng-deep .mat-mdc-form-field:not(.ng-dirty) .mdc-notched-outline__notch,
    :host ::ng-deep .mat-mdc-form-field:not(.ng-dirty) .mdc-notched-outline__leading,
    :host ::ng-deep .mat-mdc-form-field:not(.ng-dirty) .mdc-notched-outline__trailing {
      border-color: rgba(0, 0, 0, 0.38) !important;
    }
    :host ::ng-deep .mat-mdc-form-field:not(.ng-dirty) .mat-mdc-form-field-error {
      display: none !important;
    }
    :host ::ng-deep .mat-mdc-form-field:not(.ng-dirty) .mdc-text-field--invalid .mdc-floating-label {
      color: rgba(0, 0, 0, 0.6) !important;
    }

    /* Toast Styles */
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .toast {
      background-color: #323232;
      color: white;
      padding: 14px 16px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
      animation: slideIn 0.3s ease-out;
    }
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    .toast-message {
      flex: 1;
      font-size: 14px;
    }
    .toast-action {
      background: none;
      border: none;
      color: #4caf50;
      font-weight: 600;
      cursor: pointer;
      padding: 4px 8px;
      font-size: 14px;
    }
    .toast-action:hover {
      background: rgba(76, 175, 80, 0.1);
      border-radius: 4px;
    }
  `]
})
export class ConceptosListComponent implements OnDestroy {
  displayedColumns: string[] = ['name', 'category', 'purchasePrice', 'price', 'stock', 'isActive', 'actions'];
  form: FormGroup;

  private filterSubject = new BehaviorSubject<string>('');
  filteredProducts$: Observable<Product[]>;
  private subscription = new Subscription();

  // Toasts for undo
  toasts: ProductToast[] = [];

  constructor(
    private cajaService: CajaService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      purchasePrice: [0, [Validators.required, Validators.min(0)]],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      isActive: [true],
      category: ['Articulo'],
      description: ['']
    });

    // Filtro funcional combinando productos con el término de búsqueda
    this.filteredProducts$ = combineLatest([
      this.cajaService.products$,
      this.filterSubject
    ]).pipe(
      map(([products, filterTerm]) => {
        if (!filterTerm.trim()) {
          return products;
        }
        const term = filterTerm.toLowerCase().trim();
        return products.filter(p =>
          p.name.toLowerCase().includes(term) ||
          p.category.toLowerCase().includes(term) ||
          (p.description?.toLowerCase().includes(term))
        );
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onSubmit() {
    if (this.form.valid) {
      const newProduct: Product = {
        id: '',
        ...this.form.value
      };
      this.cajaService.addProduct(newProduct);
      this.snackBar.open('Producto agregado exitosamente', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
      this.form.reset({
        name: '', purchasePrice: 0, price: 0, stock: 0, isActive: true, category: 'Articulo', description: ''
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
        this.snackBar.open('Producto actualizado', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      }
    });
  }

  deleteProduct(product: Product) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmar eliminación',
        message: `¿Estás seguro de que deseas eliminar el producto "${product.name}"?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
      } as ConfirmDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Store product for potential undo
        const deletedProduct = { ...product };

        // Delete product
        this.cajaService.deleteProduct(product.id);

        // Show undo toast
        this.showUndoToast(deletedProduct);
      }
    });
  }

  showUndoToast(product: Product): void {
    const toastId = Date.now() + Math.random();
    const toast: ProductToast = {
      id: toastId,
      message: `Producto "${product.name}" eliminado`,
      product: product
    };

    // Auto-dismiss after 10 seconds
    toast.timeoutId = setTimeout(() => {
      this.removeToast(toastId);
    }, 10000);

    this.toasts.push(toast);
  }

  removeToast(id: number): void {
    const index = this.toasts.findIndex(t => t.id === id);
    if (index !== -1) {
      clearTimeout(this.toasts[index].timeoutId);
      this.toasts.splice(index, 1);
    }
  }

  onUndo(toast: ProductToast): void {
    this.removeToast(toast.id);

    // Restore the product
    this.cajaService.addProduct(toast.product);

    this.snackBar.open('Producto restaurado', 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  importClick(fileInput: HTMLInputElement) {
    fileInput.click();
  }

  downloadTemplate() {
    this.cajaService.downloadImportTemplate();
    this.snackBar.open('Plantilla descargada', 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '450px',
        data: {
          title: 'Importar productos',
          message: `Vas a importar el archivo "${file.name}". El archivo debe tener columnas: Nombre, PrecioCompra, PrecioVenta, Stock. ¿Continuar?`,
          confirmText: 'Importar',
          cancelText: 'Cancelar'
        } as ConfirmDialogData
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.cajaService.importProductsFromExcel(file).then(() => {
            this.snackBar.open('Productos importados exitosamente', 'Cerrar', {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top'
            });
          }).catch(err => {
            this.snackBar.open('Error: ' + err, 'Cerrar', {
              duration: 5000,
              horizontalPosition: 'end',
              verticalPosition: 'top'
            });
          });
        }
        event.target.value = '';
      });
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filterSubject.next(filterValue);
  }
}

interface ProductToast {
  id: number;
  message: string;
  product: Product;
  timeoutId?: any;
}
