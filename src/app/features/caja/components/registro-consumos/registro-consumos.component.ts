import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CajaService } from '../../services/caja.service';
import { Product, Sale } from '../../models/caja.models';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-registro-consumos',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatRadioModule,
    MatSnackBarModule
  ],
  template: `
    <div class="container">
      <mat-card class="consumption-card">
        <mat-card-header>
          <mat-card-title>Registro de Consumo</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            
            <div class="form-section">
                <label class="field-label">Seleccionar Producto</label>
                <mat-form-field appearance="outline" class="w-full">
                    <mat-select formControlName="productId" (selectionChange)="onProductChange($event.value)" placeholder="Seleccione un producto">
                        <mat-option *ngFor="let product of products$ | async" [value]="product.id">
                          {{ product.name }} 
                          <span class="stock-badge" *ngIf="product.stock <= 5">(Stock: {{product.stock}})</span>
                        </mat-option>
                    </mat-select>
                </mat-form-field>
            </div>

            <div class="form-section">
                <label class="field-label">Cantidad</label>
                <div class="quantity-row">
                    <mat-form-field appearance="outline" class="quantity-field">
                        <input matInput type="number" formControlName="quantity" min="1" [max]="selectedProduct?.stock || 999">
                        <mat-error *ngIf="form.get('quantity')?.hasError('max')">
                          Cantidad excede el stock disponible
                        </mat-error>
                    </mat-form-field>
                    <div class="stock-display" *ngIf="selectedProduct">
                        <div class="stock-label">Stock disponible:</div>
                        <div class="stock-value" [class.low-stock]="selectedProduct.stock <= 5">
                          {{ selectedProduct.stock }}
                        </div>
                    </div>
                </div>
                <div class="stock-warning" *ngIf="isQuantityExceedsStock()">
                    <mat-icon>warning</mat-icon>
                    La cantidad ingresada ({{form.get('quantity')?.value}}) supera el stock disponible ({{selectedProduct?.stock}})
                </div>
            </div>

            <div class="price-display" *ngIf="selectedProduct">
                <div class="price-row">
                    <span class="price-label">Precio Unitario:</span>
                    <strong>{{ selectedProduct.price | currency:'ARS':'symbol':'1.0-0' }}</strong>
                </div>
                <div class="price-row total">
                    <span class="price-label">Precio Total:</span>
                    <strong>{{ calculateTotal() | currency:'ARS':'symbol':'1.0-0' }}</strong>
                </div>
            </div>

            <div class="form-section">
                <label class="field-label">Medio de Pago</label>
                <mat-radio-group formControlName="paymentMethod" class="payment-radio-group">
                    <mat-radio-button value="Mercado Pago">Mercado Pago</mat-radio-button>
                    <mat-radio-button value="Efectivo">Efectivo</mat-radio-button>
                    <mat-radio-button value="Tarjeta">Tarjeta</mat-radio-button>
                    <mat-radio-button value="Transferencia">Transferencia</mat-radio-button>
                </mat-radio-group>
            </div>

            <div class="actions">
              <button mat-flat-button class="record-btn" type="submit" 
                      [disabled]="form.invalid || isQuantityExceedsStock()">
                Registrar Venta
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .container { padding: 20px; width: 100%; box-sizing: border-box; }
    .consumption-card { padding: 20px; box-shadow: none !important; border: 1px solid #e0e0e0; max-width: 600px; }
    mat-card-title { font-size: 18px; font-weight: bold; margin-bottom: 20px; display: block; }
    
    .form-section { margin-bottom: 20px; }
    .field-label { display: block; font-weight: 500; margin-bottom: 8px; font-size: 14px; color: #333; }
    
    .w-full { width: 100%; }
    .quantity-field { width: 150px; }

    .quantity-row { display: flex; align-items: flex-start; gap: 20px; }
    .stock-display { 
      background: #f5f5f5; 
      padding: 12px 16px; 
      border-radius: 8px; 
      text-align: center;
      min-width: 120px;
    }
    .stock-label { font-size: 12px; color: #666; margin-bottom: 4px; }
    .stock-value { font-size: 24px; font-weight: bold; color: #333; }
    .stock-value.low-stock { color: #f44336; }

    .stock-warning {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 8px;
      padding: 8px 12px;
      background: #fff3e0;
      border-radius: 4px;
      color: #e65100;
      font-size: 13px;
    }
    .stock-warning mat-icon { font-size: 18px; width: 18px; height: 18px; }

    .stock-badge { color: #f44336; font-size: 12px; }

    .price-display { 
      margin-bottom: 20px; 
      background: #e8f5e9;
      padding: 16px;
      border-radius: 8px;
    }
    .price-row { 
      display: flex; 
      justify-content: space-between;
      font-size: 16px; 
      margin-bottom: 8px; 
    }
    .price-row.total { 
      font-size: 18px;
      padding-top: 8px;
      border-top: 1px solid rgba(0,0,0,0.1);
      margin-bottom: 0;
    }
    .price-label { color: #666; }

    .payment-radio-group { display: flex; flex-direction: column; gap: 10px; }

    .record-btn { 
        background-color: #000; 
        color: white; 
        padding: 0 24px; 
        height: 44px; 
        border-radius: 4px;
        font-size: 16px;
    }
    .record-btn:disabled {
      background-color: #ccc;
    }
  `]
})
export class RegistroConsumosComponent implements OnDestroy {
  form: FormGroup;
  products$: Observable<Product[]>;
  selectedProduct: Product | undefined;
  private subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private cajaService: CajaService,
    private snackBar: MatSnackBar
  ) {
    this.products$ = this.cajaService.products$;
    this.form = this.fb.group({
      productId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      paymentMethod: ['Mercado Pago', Validators.required]
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onProductChange(productId: string) {
    const sub = this.cajaService.products$.subscribe(products => {
      this.selectedProduct = products.find(p => p.id === productId);
      // Update max validator based on selected product's stock
      if (this.selectedProduct) {
        this.form.get('quantity')?.setValidators([
          Validators.required,
          Validators.min(1),
          Validators.max(this.selectedProduct.stock)
        ]);
        this.form.get('quantity')?.updateValueAndValidity();
      }
    });
    this.subscription.add(sub);
  }

  isQuantityExceedsStock(): boolean {
    if (!this.selectedProduct) return false;
    const quantity = this.form.get('quantity')?.value || 0;
    return quantity > this.selectedProduct.stock;
  }

  calculateTotal(): number {
    if (this.selectedProduct && this.form.get('quantity')?.value) {
      return this.selectedProduct.price * this.form.get('quantity')?.value;
    }
    return 0;
  }

  onSubmit() {
    if (this.form.valid && this.selectedProduct) {
      // Double check stock
      if (this.isQuantityExceedsStock()) {
        this.snackBar.open(
          `Stock insuficiente. Disponible: ${this.selectedProduct.stock}`,
          'Cerrar',
          { duration: 5000, horizontalPosition: 'end', verticalPosition: 'top' }
        );
        return;
      }

      const sale: Sale = {
        id: '',
        productId: this.selectedProduct.id,
        productName: this.selectedProduct.name,
        quantity: this.form.value.quantity,
        unitPrice: this.selectedProduct.price,
        totalPrice: this.calculateTotal(),
        paymentMethod: this.form.value.paymentMethod,
        date: new Date()
      };

      try {
        this.cajaService.registerSale(sale);
        this.snackBar.open('Venta registrada exitosamente', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
        this.form.reset({ quantity: 1, paymentMethod: 'Mercado Pago' });
        this.selectedProduct = undefined;
      } catch (error: any) {
        this.snackBar.open('Error: ' + error.message, 'Cerrar', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      }
    }
  }
}

