import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, merge } from 'rxjs';
import { takeUntil, debounceTime, skip } from 'rxjs/operators';
import { ComplejosService, ComplexData } from '../../services/complejos.service';

export interface CanComponentDeactivate {
  canDeactivate: () => boolean;
}

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
export class ComplexDetailsComponent implements OnInit, OnDestroy, CanComponentDeactivate {
  generalInfoForm: FormGroup;
  operatingHoursForm: FormGroup;
  servicesForm: FormGroup;
  mercadoPagoForm: FormGroup;

  hasUnsavedChanges = false;
  weekDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  private destroy$ = new Subject<void>();
  private changeDetectionSetup = false;
  private isUpdatingFromService = false;

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

    // Load initial data only once using take(1)
    const initialData = this.complejosService.currentData;
    this.updateForms(initialData);

    // Setup change detection after a short delay to avoid initial form updates
    setTimeout(() => {
      this.setupChangeDetection();
    }, 200);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Prevent browser from closing/navigating away with unsaved changes
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this.hasUnsavedChanges) {
      $event.returnValue = true;
    }
  }

  // For route guard
  canDeactivate(): boolean {
    if (this.hasUnsavedChanges) {
      return confirm('Tienes cambios sin guardar. ¿Estás seguro de que deseas salir?');
    }
    return true;
  }

  private setupChangeDetection() {
    if (this.changeDetectionSetup) return;
    this.changeDetectionSetup = true;

    merge(
      this.generalInfoForm.valueChanges,
      this.operatingHoursForm.valueChanges,
      this.servicesForm.valueChanges,
      this.mercadoPagoForm.valueChanges
    )
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(100)
      )
      .subscribe(() => {
        if (!this.isUpdatingFromService) {
          this.hasUnsavedChanges = true;
        }
      });
  }

  get days() {
    return this.operatingHoursForm.get('days') as FormArray;
  }

  initOperatingHours() {
    this.weekDays.forEach(() => {
      const dayGroup = this.fb.group({
        isOpen: [true],
        openTime: ['10:00'],
        closeTime: ['22:00']
      });
      this.days.push(dayGroup);
    });
  }

  replicateToAllDays() {
    const mondayValues = this.days.at(0).value;
    this.days.controls.forEach((control, index) => {
      if (index !== 0) {
        control.patchValue(mondayValues);
      }
    });
  }

  updateForms(data: ComplexData) {
    this.isUpdatingFromService = true;

    this.generalInfoForm.patchValue(data.generalInfo, { emitEvent: false });

    // Update operating hours
    if (data.operatingHours.days.length === 7) {
      this.days.controls.forEach((control, index) => {
        control.patchValue(data.operatingHours.days[index], { emitEvent: false });
      });
    }

    this.servicesForm.patchValue(data.services, { emitEvent: false });
    this.mercadoPagoForm.patchValue(data.mercadoPago, { emitEvent: false });

    // Reset the flag after a short delay
    setTimeout(() => {
      this.isUpdatingFromService = false;
    }, 150);
  }

  getDayName(index: number): string {
    return this.weekDays[index];
  }

  saveAllChanges() {
    // Save all forms to service
    this.complejosService.updateGeneralInfo(this.generalInfoForm.value);
    this.complejosService.updateOperatingHours(this.operatingHoursForm.value);
    this.complejosService.updateServices(this.servicesForm.value);
    this.complejosService.updateMercadoPago(this.mercadoPagoForm.value);

    this.hasUnsavedChanges = false;

    this.snackBar.open('Cambios guardados con éxito', 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }
}
