import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CajaService } from '../../services/caja.service';
import { BoxReport, Movement } from '../../models/caja.models';
import { Observable, combineLatest, startWith, map } from 'rxjs';

@Component({
  selector: 'app-reporte-caja',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <div class="container">
      <div class="header">
        <h2>Box Management</h2>
      </div>

      <!-- Top Metrics -->
      <div class="metrics-row" *ngIf="report$ | async as report">
        <mat-card class="metric-card">
            <mat-card-content>
                <div class="metric-label">Total Revenue</div>
                <div class="metric-value green">{{ report.totalRevenue | currency }}</div>
            </mat-card-content>
        </mat-card>
        <mat-card class="metric-card">
            <mat-card-content>
                <div class="metric-label">Total Costs</div>
                <div class="metric-value red">{{ report.totalCost | currency }}</div>
            </mat-card-content>
        </mat-card>
        <mat-card class="metric-card">
            <mat-card-content>
                <div class="metric-label">Net Profit</div>
                <div class="metric-value green">{{ report.netProfit | currency }}</div>
            </mat-card-content>
        </mat-card>
        <mat-card class="metric-card">
            <mat-card-content>
                <div class="metric-label">Profit Margin</div>
                <div class="metric-value green">{{ getProfitMargin(report.totalRevenue, report.netProfit) }}%</div>
            </mat-card-content>
        </mat-card>
      </div>

      <!-- Category Metrics -->
       <div class="metrics-row" *ngIf="report$ | async as report">
         <mat-card class="category-card">
            <mat-card-header>
                <mat-card-title>Product Sales</mat-card-title>
            </mat-card-header>
            <mat-card-content>
                <div class="sub-metric">Transactions: {{ getCategoryStats(report.movements, 'Venta').count }}</div>
                <div class="sub-metric">Revenue: {{ getCategoryStats(report.movements, 'Venta').revenue | currency }}</div>
                <div class="sub-metric">Profit: {{ getCategoryStats(report.movements, 'Venta').profit | currency }}</div>
            </mat-card-content>
         </mat-card>

         <mat-card class="category-card">
            <mat-card-header>
                <mat-card-title>Court Reservations</mat-card-title>
            </mat-card-header>
            <mat-card-content>
                <div class="sub-metric">Transactions: {{ getCategoryStats(report.movements, 'Reserva').count }}</div>
                <div class="sub-metric">Revenue: {{ getCategoryStats(report.movements, 'Reserva').revenue | currency }}</div>
                <div class="sub-metric">Profit: {{ getCategoryStats(report.movements, 'Reserva').profit | currency }}</div>
            </mat-card-content>
         </mat-card>
       </div>

      <!-- Filters -->
      <mat-card class="filters-card">
         <mat-card-header>
            <mat-card-title>Transaction Filters</mat-card-title>
         </mat-card-header>
         <mat-card-content>
            <form [formGroup]="filterForm" class="filters-form">
                <mat-form-field appearance="outline">
                    <mat-label>Transaction Type</mat-label>
                    <mat-select formControlName="type">
                        <mat-option value="All">All Transactions</mat-option>
                        <mat-option value="Venta">Venta</mat-option>
                        <mat-option value="Reserva">Reserva</mat-option>
                        <mat-option value="Gasto">Gasto</mat-option>
                    </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline">
                    <mat-label>From Date</mat-label>
                    <input matInput [matDatepicker]="picker1" formControlName="fromDate">
                    <mat-datepicker-toggle matIconSuffix [for]="picker1"></mat-datepicker-toggle>
                    <mat-datepicker #picker1></mat-datepicker>
                </mat-form-field>

                <mat-form-field appearance="outline">
                    <mat-label>To Date</mat-label>
                    <input matInput [matDatepicker]="picker2" formControlName="toDate">
                    <mat-datepicker-toggle matIconSuffix [for]="picker2"></mat-datepicker-toggle>
                    <mat-datepicker #picker2></mat-datepicker>
                </mat-form-field>

                <button mat-button (click)="clearFilters()">Clear Filters</button>
            </form>
         </mat-card-content>
      </mat-card>

      <!-- History Table -->
      <div class="table-container" *ngIf="report$ | async as report">
        <h3>Transaction History</h3>
        <table mat-table [dataSource]="report.movements" class="mat-elevation-z8">
            <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef> Date </th>
            <td mat-cell *matCellDef="let element"> {{element.date | date:'d/M/yyyy'}} </td>
            </ng-container>

            <ng-container matColumnDef="type">
            <th mat-header-cell *matHeaderCellDef> Type </th>
            <td mat-cell *matCellDef="let element"> 
                <span class="badge" [class]="getBadgeClass(element.type)">{{element.type}}</span>
            </td>
            </ng-container>

            <ng-container matColumnDef="description">
            <th mat-header-cell *matHeaderCellDef> Description </th>
            <td mat-cell *matCellDef="let element"> {{element.description}} </td>
            </ng-container>

            <ng-container matColumnDef="amount">
            <th mat-header-cell *matHeaderCellDef> Amount </th>
            <td mat-cell *matCellDef="let element"> {{element.amount | currency}} </td>
            </ng-container>

            <ng-container matColumnDef="cost">
            <th mat-header-cell *matHeaderCellDef> Cost </th>
            <td mat-cell *matCellDef="let element"> {{element.cost | currency}} </td>
            </ng-container>

            <ng-container matColumnDef="profit">
            <th mat-header-cell *matHeaderCellDef> Profit </th>
            <td mat-cell *matCellDef="let element" [class.positive]="element.profit > 0" [class.negative]="element.profit < 0"> 
                {{element.profit | currency}} 
            </td>
            </ng-container>

            <ng-container matColumnDef="paymentMethod">
            <th mat-header-cell *matHeaderCellDef> Payment </th>
            <td mat-cell *matCellDef="let element"> 
                <span class="payment-badge" 
                      [class.payment-mp]="element.paymentMethod === 'Mercado Pago'"
                      [class.payment-cash]="element.paymentMethod === 'Efectivo' || element.paymentMethod === 'Cash'">
                    {{element.paymentMethod || '-'}}
                </span>
            </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .container { padding: 32px; background-color: #f8f9fa; min-height: 100vh; font-family: 'Inter', sans-serif; }
    .header { margin-bottom: 32px; }
    .header h2 { font-size: 24px; font-weight: 600; color: #1a1a1a; margin: 0; }
    
    /* Metrics Rows */
    .metrics-row { display: flex; gap: 24px; margin-bottom: 32px; flex-wrap: wrap; }
    .metric-card { flex: 1; min-width: 240px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); border: 1px solid #edf2f7; padding: 16px; transition: transform 0.2s; }
    .metric-card:hover { transform: translateY(-2px); }
    .metric-label { color: #64748b; font-size: 14px; font-weight: 500; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
    .metric-value { font-size: 32px; font-weight: 700; letter-spacing: -0.5px; }
    .green { color: #22c55e; } /* Tailwind green-500 equivalent */
    .red { color: #ef4444; }   /* Tailwind red-500 equivalent */

    /* Category Cards */
    .category-card { flex: 1; min-width: 350px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); border: 1px solid #edf2f7; }
    mat-card-header { padding: 20px 24px 10px; }
    mat-card-title { font-size: 18px; font-weight: 600; color: #334155; margin-bottom: 0; }
    mat-card-content { padding: 0 24px 24px; }
    .sub-metric { font-size: 15px; margin-bottom: 8px; color: #475569; display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }
    .sub-metric:last-child { border-bottom: none; }

    /* Filters */
    .filters-card { margin-bottom: 32px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); border: 1px solid #edf2f7; }
    .filters-form { display: flex; gap: 24px; align-items: center; flex-wrap: wrap; padding: 10px 0; }
    mat-form-field { margin-bottom: 0; width: 220px; }
    
    /* Table */
    .table-container { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); border: 1px solid #edf2f7; }
    .table-container h3 { font-size: 18px; font-weight: 600; color: #334155; margin-bottom: 24px; }
    table { width: 100%; box-shadow: none !important; }
    th.mat-header-cell { font-size: 13px; font-weight: 600; color: #64748b; text-transform: uppercase; padding: 16px; border-bottom: 1px solid #e2e8f0; }
    td.mat-cell { padding: 16px; color: #334155; font-size: 14px; border-bottom: 1px solid #f1f5f9; }
    
    /* Badges */
    .badge { padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; letter-spacing: 0.3px; }
    .badge-venta { background-color: #eff6ff; color: #3b82f6; } /* Blue */
    .badge-reserva { background-color: #f0fdf4; color: #22c55e; } /* Green */
    .badge-gasto { background-color: #fef2f2; color: #ef4444; }   /* Red */
    
    .payment-badge { padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; }
    .payment-mp { background-color: #f3e8ff; color: #a855f7; } /* Purple for Mercado Pago */
    .payment-cash { background-color: #f3f4f6; color: #6b7280; } /* Gray for Cash */

    .positive { color: #22c55e; font-weight: 600; }
    .negative { color: #ef4444; font-weight: 600; }

    /* Material Overrides for cleaner look */
    ::ng-deep .mat-mdc-form-field-subscript-wrapper { display: none; } /* Hide hint space if unused to align filters */
    ::ng-deep .mat-mdc-card { background: white; }
  `]
})
export class ReporteCajaComponent implements OnInit {
  report$: Observable<BoxReport>;
  filterForm: FormGroup;
  displayedColumns: string[] = ['date', 'type', 'description', 'amount', 'cost', 'profit', 'paymentMethod'];

  constructor(
    private cajaService: CajaService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      type: ['All'],
      fromDate: [null],
      toDate: [null]
    });

    // Combine filters with report data
    this.report$ = combineLatest([
      this.cajaService.getReport(), // Get base report (could also pass params here if backend filtered)
      this.filterForm.valueChanges.pipe(startWith(this.filterForm.value))
    ]).pipe(
      map(([baseReport, filters]) => {
        let filteredMovements = baseReport.movements;

        // Type Filter
        if (filters.type && filters.type !== 'All') {
          filteredMovements = filteredMovements.filter(m => m.type === filters.type);
        }

        // Date Filter
        if (filters.fromDate) {
          filteredMovements = filteredMovements.filter(m => new Date(m.date) >= filters.fromDate);
        }
        if (filters.toDate) {
          // Add one day to include the end date fully or set time to end of day
          const end = new Date(filters.toDate);
          end.setHours(23, 59, 59);
          filteredMovements = filteredMovements.filter(m => new Date(m.date) <= end);
        }

        // Recalculate metrics based on filtered movements
        const totalRevenue = filteredMovements.reduce((acc, m) => acc + m.amount, 0);
        const totalCost = filteredMovements.reduce((acc, m) => acc + (m.cost || 0), 0);
        const netProfit = filteredMovements.reduce((acc, m) => acc + (m.profit || 0), 0);
        const totalSales = filteredMovements.filter(m => m.type === 'Venta').reduce((acc, m) => acc + m.amount, 0);
        const totalReservations = filteredMovements.filter(m => m.type === 'Reserva').reduce((acc, m) => acc + m.amount, 0);

        return {
          ...baseReport,
          movements: filteredMovements,
          totalRevenue,
          totalCost,
          netProfit,
          totalSales,
          totalReservations
        };
      })
    );
  }

  ngOnInit() { }

  getProfitMargin(revenue: number, profit: number): string {
    if (!revenue) return '0.0';
    return ((profit / revenue) * 100).toFixed(1);
  }

  getCategoryStats(movements: Movement[], type: string) {
    const categoryMovements = movements.filter(m => m.type === type);
    return {
      count: categoryMovements.length,
      revenue: categoryMovements.reduce((acc, m) => acc + m.amount, 0),
      profit: categoryMovements.reduce((acc, m) => acc + (m.profit || 0), 0)
    };
  }

  getBadgeClass(type: string): string {
    switch (type) {
      case 'Venta': return 'badge-venta';
      case 'Reserva': return 'badge-reserva';
      case 'Gasto': return 'badge-gasto';
      default: return '';
    }
  }

  clearFilters() {
    this.filterForm.reset({ type: 'All', fromDate: null, toDate: null });
  }

  exportReport() {
    this.cajaService.exportReportToExcel();
  }
}
