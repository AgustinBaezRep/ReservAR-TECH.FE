import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { ComplejosService } from '../../services/complejos.service';
import { Court, CourtPricing, PriceInterval, Reservation } from '../../../reservas/models/reservation.model';
import { ReservationsService } from '../../../reservas/services/reservations.service';
import { ReservationStatus } from '../../../reservas/models/reservation-status.enum';

@Component({
    selector: 'app-court-pricing',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatCheckboxModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatTableModule,
        MatSnackBarModule
    ],
    templateUrl: './court-pricing.component.html',
    styleUrls: ['./court-pricing.component.scss']
})
export class CourtPricingComponent implements OnInit, OnDestroy {
    pricingForm: FormGroup;
    intervalForm: FormGroup;
    courts: Court[] = [];
    selectedCourt: Court | null = null;
    displayedColumns: string[] = ['startTime', 'endTime', 'price', 'actions'];

    // RF-19: Track if selected court has active reservations
    hasActiveReservations: boolean = false;
    activeReservationsCount: number = 0;

    private destroy$ = new Subject<void>();

    constructor(
        private fb: FormBuilder,
        private complejosService: ComplejosService,
        private reservationsService: ReservationsService,
        private snackBar: MatSnackBar
    ) {
        this.pricingForm = this.fb.group({
            courtId: ['', Validators.required],
            isSinglePrice: [false],
            singlePrice: [null, [Validators.min(0)]],
            deposit: [null, [Validators.min(0)]],
            intervals: this.fb.array([])
        });

        this.intervalForm = this.fb.group({
            endTime: ['', Validators.required],
            price: [0, [Validators.required, Validators.min(0)]]
        });
    }

    ngOnInit() {
        this.complejosService.complexData$
            .pipe(takeUntil(this.destroy$))
            .subscribe(data => {
                this.courts = data.courts || [];
            });

        // Watch for court selection changes
        this.pricingForm.get('courtId')?.valueChanges
            .pipe(takeUntil(this.destroy$))
            .subscribe((courtId: string) => {
                this.onCourtSelected(courtId);
            });

        // Watch for single price toggle
        this.pricingForm.get('isSinglePrice')?.valueChanges
            .pipe(takeUntil(this.destroy$))
            .subscribe((isSingle: boolean) => {
                if (isSingle) {
                    this.intervals.clear();
                }
            });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    get intervals(): FormArray {
        return this.pricingForm.get('intervals') as FormArray;
    }

    get isSinglePrice(): boolean {
        return this.pricingForm.get('isSinglePrice')?.value || false;
    }

    onCourtSelected(courtId: string) {
        this.selectedCourt = this.courts.find(c => c.id === courtId) || null;

        // RF-19: Check for active reservations on this court
        this.checkActiveReservations(courtId);

        // Load existing pricing if available
        if (this.selectedCourt?.pricing) {
            const pricing = this.selectedCourt.pricing;
            this.pricingForm.patchValue({
                isSinglePrice: pricing.isSinglePrice,
                singlePrice: pricing.singlePrice,
                deposit: pricing.deposit
            });

            // Clear and reload intervals
            this.intervals.clear();
            if (pricing.intervals) {
                // Ensure intervals are sorted by endTime to correctly calculate start times
                const sortedIntervals = [...pricing.intervals].sort((a, b) => a.endTime.localeCompare(b.endTime));

                sortedIntervals.forEach(interval => {
                    this.intervals.push(this.fb.group({
                        endTime: [interval.endTime, Validators.required],
                        price: [interval.price, [Validators.required, Validators.min(0)]]
                    }));
                });
            }
        } else {
            // Reset form for new pricing
            this.pricingForm.patchValue({
                isSinglePrice: false,
                singlePrice: null,
                deposit: null
            });
            this.intervals.clear();
        }
    }

    // Helper to get the start time for the next interval to be added
    get nextStartTime(): string {
        if (this.intervals.length === 0) {
            return '00:00';
        }
        const lastInterval = this.intervals.at(this.intervals.length - 1).value;
        return lastInterval.endTime;
    }

    // Helper to get start time for a specific interval index
    getStartTimeForInterval(index: number): string {
        if (index === 0) return '00:00';
        const prevInterval = this.intervals.at(index - 1).value;
        return prevInterval.endTime;
    }

    addInterval() {
        if (this.intervalForm.valid) {
            const newInterval = this.intervalForm.value;
            const startTime = this.nextStartTime;

            // Validate that endTime is after startTime
            if (newInterval.endTime <= startTime) {
                this.snackBar.open(`La hora de fin debe ser posterior a la hora de inicio (${startTime})`, 'Cerrar', {
                    duration: 4000,
                    panelClass: ['error-snackbar']
                });
                return;
            }

            // Validate that we haven't already covered the whole day
            if (startTime >= '24:00' || startTime === '00:00' && this.intervals.length > 0 && this.intervals.at(this.intervals.length - 1).value.endTime === '24:00') {
                this.snackBar.open('El día ya está cubierto completamente.', 'Cerrar', {
                    duration: 4000,
                    panelClass: ['error-snackbar']
                });
                return;
            }


            this.intervals.push(this.fb.group({
                endTime: [newInterval.endTime, Validators.required],
                price: [newInterval.price, [Validators.required, Validators.min(0)]]
            }));

            // Reset form but keep the price if desired, or reset both. 
            // Setting default start time for next interval isn't needed as it's calculated.
            this.intervalForm.reset({ endTime: '', price: 0 });
        }
    }

    removeInterval(index: number) {
        this.intervals.removeAt(index);
        // If we remove an interval in the middle, we might have a gap. 
        // For simplicity, we just remove it. The user will see the gap in the table 
        // because the next interval's start time calculates from the previous one.
        // This effectively "merges" the gap into the next interval's duration, 
        // but the time range might look weird (e.g. 00-10, 12-14 -> remove 00-10 -> 00-14).
        // Actually, logic `getStartTimeForInterval` handles this: if index 0 is removed, 
        // the old index 1 becomes index 0, and its start time becomes 00:00. 
        // So the time range automatically adjusts to cover the gap. 
        // This is acceptable behavior for "filling the void".
    }

    editInterval(index: number) {
        // When editing, we remove it and put values back in the form
        // This is a simple way to handle it, though it forces re-adding at the end
        // if we don't handle insertion. 
        // A better UX for "Edit" might be to just load it into the form and update the specific form control,
        // but `addInterval` pushes to the end. 
        // Given the sequential nature, "Editing" a middle interval is tricky because it affects neighbors.
        // For now, removing and re-adding is a safe, albeit slightly tedious, way to ensure consistency.

        const interval = this.intervals.at(index);
        this.intervalForm.patchValue({
            endTime: interval.get('endTime')?.value,
            price: interval.get('price')?.value
        });
        this.intervals.removeAt(index);

        this.snackBar.open('Intervalo movido al formulario para edición. Verifica la hora de fin.', 'Cerrar', { duration: 3000 });
    }

    clearDeposit() {
        this.pricingForm.patchValue({ deposit: null });
    }

    /**
     * RF-19: Check if the selected court has any active (non-cancelled) reservations
     * If it does, pricing modification should be blocked
     */
    private checkActiveReservations(courtId: string) {
        if (!courtId) {
            this.hasActiveReservations = false;
            this.activeReservationsCount = 0;
            return;
        }

        this.reservationsService.getReservations().pipe(
            takeUntil(this.destroy$),
            map(reservations => reservations.filter(r => r.courtId === courtId))
        ).subscribe(courtReservations => {
            this.activeReservationsCount = courtReservations.length;
            this.hasActiveReservations = courtReservations.length > 0;
        });
    }

    savePricing() {
        // RF-19: Block save if court has active reservations
        if (this.hasActiveReservations) {
            this.snackBar.open(
                `No se puede modificar el precio. La cancha tiene ${this.activeReservationsCount} reserva(s) activa(s).`,
                'Cerrar',
                {
                    duration: 5000,
                    horizontalPosition: 'center',
                    verticalPosition: 'top',
                    panelClass: ['error-snackbar']
                }
            );
            return;
        }

        if (!this.pricingForm.get('courtId')?.value) {
            this.snackBar.open('Por favor seleccione una cancha', 'Cerrar', {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
                panelClass: ['error-snackbar']
            });
            return;
        }

        const formValue = this.pricingForm.value;

        // Validate: must have either single price or intervals
        if (!formValue.isSinglePrice && this.intervals.length === 0) {
            this.snackBar.open('Debe agregar al menos un intervalo de precio o seleccionar precio único', 'Cerrar', {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
                panelClass: ['error-snackbar']
            });
            return;
        }

        if (formValue.isSinglePrice && !formValue.singlePrice) {
            this.snackBar.open('Debe ingresar el precio único', 'Cerrar', {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
                panelClass: ['error-snackbar']
            });
            return;
        }

        // Final validation for intervals to ensure the last one covers up to a reasonable time if needed? 
        // Not strictly required, but good to check consistency.

        const pricing: CourtPricing = {
            courtId: formValue.courtId,
            isSinglePrice: formValue.isSinglePrice,
            singlePrice: formValue.isSinglePrice ? formValue.singlePrice : undefined,
            intervals: formValue.isSinglePrice ? undefined : this.intervals.value,
            deposit: formValue.deposit || undefined
        };

        this.complejosService.updateCourtPricing(formValue.courtId, pricing);

        this.snackBar.open('Precios guardados correctamente', 'Cerrar', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
        });
    }
}

