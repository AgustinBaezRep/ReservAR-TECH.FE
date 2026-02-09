import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { ComplexDetailsComponent, CanComponentDeactivate } from '../../components/complex-details/complex-details.component';
import { CourtManagerComponent } from '../../components/court-manager/court-manager.component';
import { CourtPricingComponent } from '../../components/court-pricing/court-pricing.component';
import { ComplexToastService } from '../../services/complex-toast.service';

@Component({
  selector: 'app-complejos-page',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    ComplexDetailsComponent,
    CourtManagerComponent,
    CourtPricingComponent
  ],
  templateUrl: './complejos-page.component.html',
  styleUrls: ['./complejos-page.component.scss']
})
export class ComplejosPageComponent implements CanComponentDeactivate {
  @ViewChild(ComplexDetailsComponent) complexDetails!: ComplexDetailsComponent;
  toasts$;

  constructor(private toastService: ComplexToastService) {
    this.toasts$ = this.toastService.toasts$;
  }

  onUndo(id: number) {
    this.toastService.undo(id);
  }

  canDeactivate(): boolean {
    if (this.complexDetails && this.complexDetails.hasUnsavedChanges) {
      return confirm('Tienes cambios sin guardar. ¿Estás seguro de que deseas salir?');
    }
    return true;
  }
}
