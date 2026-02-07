import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
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
    displayedColumns: string[] = ['endTime', 'price', 'actions'];

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
                pricing.intervals.forEach(interval => {
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

    addInterval() {
        if (this.intervalForm.valid) {
            const interval = this.intervalForm.value;
            this.intervals.push(this.fb.group({
                endTime: [interval.endTime, Validators.required],
                price: [interval.price, [Validators.required, Validators.min(0)]]
            }));
            this.intervalForm.reset({ endTime: '', price: 0 });
        }
    }

    removeInterval(index: number) {
        this.intervals.removeAt(index);
    }

    editInterval(index: number) {
        const interval = this.intervals.at(index);
        this.intervalForm.patchValue({
            endTime: interval.get('endTime')?.value,
            price: interval.get('price')?.value
        });
        this.intervals.removeAt(index);
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
