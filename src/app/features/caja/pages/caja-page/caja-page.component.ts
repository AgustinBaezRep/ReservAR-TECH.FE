import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { ConceptosListComponent } from '../../components/conceptos-list/conceptos-list.component';
import { RegistroConsumosComponent } from '../../components/registro-consumos/registro-consumos.component';
import { ReporteCajaComponent } from '../../components/reporte-caja/reporte-caja.component';

@Component({
    selector: 'app-caja-page',
    imports: [
        CommonModule,
        MatTabsModule,
        ConceptosListComponent,
        RegistroConsumosComponent,
        ReporteCajaComponent
    ],
    template: `
    <div class="page-container">
      <mat-tab-group animationDuration="0ms">
        <mat-tab label="Listado de Conceptos y Artículos">
          <div class="tab-content">
            <app-conceptos-list></app-conceptos-list>
          </div>
        </mat-tab>
        <mat-tab label="Registro de Consumos">
          <div class="tab-content">
            <app-registro-consumos></app-registro-consumos>
          </div>
        </mat-tab>
        <mat-tab label="Reporte de Caja">
          <div class="tab-content">
            <app-reporte-caja></app-reporte-caja>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
    styles: [`
    .page-container { padding: 20px; }
    .tab-content { padding-top: 20px; }
  `]
})
export class CajaPageComponent { }
