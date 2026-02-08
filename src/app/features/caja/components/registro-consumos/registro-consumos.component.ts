import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { CajaService } from '../../services/caja.service';
import { Product, Sale } from '../../models/caja.models';
import { Observable } from 'rxjs';

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
    MatRadioModule
  ],
  template: `
    <div class="container">
      <mat-card class="consumption-card">
        <mat-card-header>
          <mat-card-title>Consumption Record</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            
            <div class="form-section">
                <label class="field-label">Select Item</label>
                <mat-form-field appearance="outline" class="w-full no-label-field">
                    <mat-select formControlName="productId" (selectionChange)="onProductChange($event.value)" placeholder="Select an item">
                        <mat-option *ngFor="let product of products$ | async" [value]="product.id">
                        {{ product.name }}
                        </mat-option>
                    </mat-select>
                </mat-form-field>
            </div>

            <div class="form-section">
                <label class="field-label">Quantity</label>
                <div class="quantity-row">
                    <mat-form-field appearance="outline" class="w-full no-label-field">
                        <input matInput type="number" formControlName="quantity" min="1">
                    </mat-form-field>
                    <div class="stock-display" *ngIf="selectedProduct">
                        Available stock:<br>
                        <strong>{{ selectedProduct.stock }}</strong>
                    </div>
                </div>
            </div>

            <div class="price-display" *ngIf="selectedProduct">
                <div class="price-row">
                    Unit Price: <strong>{{ selectedProduct.price | currency }}</strong>
                </div>
                <div class="price-row">
                    Total Price: <strong>{{ calculateTotal() | currency }}</strong>
                </div>
            </div>

            <div class="form-section">
                <label class="field-label">Payment Method</label>
                <mat-radio-group formControlName="paymentMethod" class="payment-radio-group">
                    <mat-radio-button value="Mercado Pago">Mercado Pago</mat-radio-button>
                    <mat-radio-button value="Efectivo">Cash</mat-radio-button>
                </mat-radio-group>
            </div>

            <div class="actions">
              <button mat-flat-button class="record-btn" type="submit" [disabled]="form.invalid">
                Record Consumption
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .container { padding: 20px; width: 100%; box-sizing: border-box; }
    .consumption-card { padding: 20px; box-shadow: none !important; border: 1px solid #e0e0e0; }
    mat-card-title { font-size: 18px; font-weight: bold; margin-bottom: 20px; display: block; }
    
    .form-section { margin-bottom: 20px; }
    .field-label { display: block; font-weight: 500; margin-bottom: 8px; font-size: 14px; color: #333; }
    
    .w-full { width: 100%; }
    /* Hide default mat-form-field label spacer to match "clean" input look if wanted, 
       but standard appearance="outline" works well. 
       Class no-label-field is for semantic grouping if we need overrides */

    .quantity-row { display: flex; align-items: center; gap: 20px; }
    .stock-display { font-size: 12px; color: #666; line-height: 1.4; min-width: 100px; }
    .stock-display strong { font-size: 14px; color: #000; }

    .price-display { margin-bottom: 20px; }
    .price-row { font-size: 16px; margin-bottom: 5px; }

    .payment-radio-group { display: flex; flex-direction: column; gap: 10px; }

    .record-btn { 
        background-color: #000; 
        color: white; 
        padding: 0 24px; 
        height: 40px; 
        border-radius: 4px;
    }
  `]
})
export class RegistroConsumosComponent {
  form: FormGroup;
  products$: Observable<Product[]>;
  selectedProduct: Product | undefined;

  constructor(
    private fb: FormBuilder,
    private cajaService: CajaService
  ) {
    this.products$ = this.cajaService.products$;
    this.form = this.fb.group({
      productId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      paymentMethod: ['Mercado Pago', Validators.required]
    });
  }

  onProductChange(productId: string) {
    this.cajaService.products$.subscribe(products => {
      this.selectedProduct = products.find(p => p.id === productId);
    });
  }

  calculateTotal(): number {
    if (this.selectedProduct && this.form.get('quantity')?.value) {
      return this.selectedProduct.price * this.form.get('quantity')?.value;
    }
    return 0;
  }

  onSubmit() {
    if (this.form.valid && this.selectedProduct) {
      const sale: Sale = {
        id: '', // Generated in service
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
        alert('Venta registrada exitosamente');
        this.form.reset({ quantity: 1, paymentMethod: 'Mercado Pago' });
        this.selectedProduct = undefined;
      } catch (error: any) {
        alert(error.message);
      }
    }
  }
}
