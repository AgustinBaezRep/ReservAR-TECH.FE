import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { ComplexDetailsComponent } from '../../components/complex-details/complex-details.component';
import { CourtManagerComponent } from '../../components/court-manager/court-manager.component';

@Component({
  selector: 'app-complejos-page',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    ComplexDetailsComponent,
    CourtManagerComponent
  ],
  templateUrl: './complejos-page.component.html',
  styleUrls: ['./complejos-page.component.scss']
})
export class ComplejosPageComponent {}
