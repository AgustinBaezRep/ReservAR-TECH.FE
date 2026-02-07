import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { ComplexDetailsComponent } from '../../components/complex-details/complex-details.component';
import { CourtManagerComponent } from '../../components/court-manager/court-manager.component';
import { CourtPricingComponent } from '../../components/court-pricing/court-pricing.component';

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
export class ComplejosPageComponent { }
