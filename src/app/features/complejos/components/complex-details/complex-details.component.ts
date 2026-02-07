import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ComplejosService, ComplexData } from '../../services/complejos.service';

@Component({
  selector: 'app-complex-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule
  ],
  templateUrl: './complex-details.component.html',
  styleUrls: ['./complex-details.component.scss']
})
export class ComplexDetailsComponent implements OnInit, OnDestroy {
  generalInfoForm: FormGroup;
  operatingHoursForm: FormGroup;
  servicesForm: FormGroup;
  mercadoPagoForm: FormGroup;

  weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private complejosService: ComplejosService,
    private snackBar: MatSnackBar
  ) {
    this.generalInfoForm = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      latitude: [''],
      longitude: [''],
      adminPhone: [''],
      isOnline: [true]
    });

    this.operatingHoursForm = this.fb.group({
      days: this.fb.array([])
    });

    this.servicesForm = this.fb.group({
      wifi: [false],
      parking: [false],
      buffet: [false],
      showers: [false],
      lighting: [false],
      roofing: [false],
      lockers: [false]
    });

    this.mercadoPagoForm = this.fb.group({
      clientId: ['', Validators.required],
      clientSecret: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.initOperatingHours();
    
    this.complejosService.complexData$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.updateForms(data);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get days() {
    return this.operatingHoursForm.get('days') as FormArray;
  }

  initOperatingHours() {
    this.weekDays.forEach(() => {
      const dayGroup = this.fb.group({
        isOpen: [false],
        openTime: [''],
        closeTime: ['']
      });
      this.days.push(dayGroup);
    });
  }

  updateForms(data: ComplexData) {
    this.generalInfoForm.patchValue(data.generalInfo, { emitEvent: false });
    
    // Update operating hours
    if (data.operatingHours.days.length === 7) {
      this.days.controls.forEach((control, index) => {
        control.patchValue(data.operatingHours.days[index], { emitEvent: false });
      });
    }

    this.servicesForm.patchValue(data.services, { emitEvent: false });
    this.mercadoPagoForm.patchValue(data.mercadoPago, { emitEvent: false });
  }

  getDayName(index: number): string {
    return this.weekDays[index];
  }

  saveGeneralInfo() {
    if (this.generalInfoForm.valid) {
      this.complejosService.updateGeneralInfo(this.generalInfoForm.value);
    }
  }

  saveOperatingHours() {
    this.complejosService.updateOperatingHours(this.operatingHoursForm.value);
  }

  saveServices() {
    this.complejosService.updateServices(this.servicesForm.value);
  }

  saveMercadoPago() {
    if (this.mercadoPagoForm.valid) {
      this.complejosService.updateMercadoPago(this.mercadoPagoForm.value);
      this.snackBar.open('Credenciales de Mercado Pago guardadas correctamente', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['success-snackbar']
      });
    }
  }
}
