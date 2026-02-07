import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Reservation, Court, TimeSlot } from '../../models/reservation.model';
import { ReservationStatus } from '../../models/reservation-status.enum';

export interface EditReservationDialogData {
  reservation: Reservation;
  allReservations: Reservation[];
  courts: Court[];
  operatingHours: {
    days: Array<{
      isOpen: boolean;
      openTime: string;
      closeTime: string;
    }>;
  };
}

interface AvailableTimeSlot extends TimeSlot {
  available: boolean;
}

@Component({
  selector: 'app-edit-reservation-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './edit-reservation-dialog.component.html',
  styleUrl: './edit-reservation-dialog.component.scss'
})
export class EditReservationDialogComponent implements OnInit, OnDestroy {
  form: FormGroup;

  // Date constraints
  minDate: Date = new Date();
  maxDate: Date = new Date();

  // Available options
  availableCourts: Court[] = [];
  availableTimeSlots: AvailableTimeSlot[] = [];

  // Selected court price for display
  selectedCourtPrice: number = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditReservationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditReservationDialogData
  ) {
    // Set date constraints (today + 6 days)
    this.maxDate.setDate(this.minDate.getDate() + 6);

    // Parse the reservation date
    const reservationDate = new Date(this.data.reservation.date + 'T00:00:00');

    // Initialize form with current reservation values
    this.form = this.fb.group({
      date: [reservationDate, [Validators.required]],
      courtId: [this.data.reservation.courtId, [Validators.required]],
      startTime: [this.data.reservation.startTime, [Validators.required]],
      userName: [this.data.reservation.userName, [Validators.required]],
      userContact: [this.data.reservation.userContact, [Validators.required, Validators.email]]
    });

    // Initialize price
    this.selectedCourtPrice = this.data.reservation.price;
  }

  ngOnInit(): void {
    // Initialize available courts (active only)
    this.availableCourts = this.data.courts.filter(c => c.isActive);

    // Recalculate initial price based on court pricing configuration
    const currentCourt = this.availableCourts.find(c => c.id === this.data.reservation.courtId);
    const currentStartTime = this.data.reservation.startTime;
    this.selectedCourtPrice = this.getCourtPrice(currentCourt, currentStartTime);

    // Generate initial time slots
    this.generateTimeSlots();

    // Subscribe to date changes
    this.form.get('date')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.generateTimeSlots();
      // Reset time slot when date changes
      const currentStartTime = this.form.get('startTime')?.value;
      const stillAvailable = this.availableTimeSlots.find(s => s.label === currentStartTime && s.available);
      if (!stillAvailable) {
        this.form.get('startTime')?.setValue('');
      }
    });

    // Subscribe to court changes
    this.form.get('courtId')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((courtId) => {
      // Update price display
      const court = this.availableCourts.find(c => c.id === courtId);
      const startTime = this.form.get('startTime')?.value;
      this.selectedCourtPrice = this.getCourtPrice(court, startTime);

      // Regenerate time slots for new court
      this.generateTimeSlots();

      // Reset time slot when court changes
      const currentStartTime = this.form.get('startTime')?.value;
      const stillAvailable = this.availableTimeSlots.find(s => s.label === currentStartTime && s.available);
      if (!stillAvailable) {
        this.form.get('startTime')?.setValue('');
      }
    });

    // Subscribe to start time changes to update price
    this.form.get('startTime')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((startTime) => {
      const courtId = this.form.get('courtId')?.value;
      const court = this.availableCourts.find(c => c.id === courtId);
      this.selectedCourtPrice = this.getCourtPrice(court, startTime);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private generateTimeSlots(): void {
    this.availableTimeSlots = [];

    const selectedDate = this.form.get('date')?.value;
    if (!selectedDate) return;

    // Get day of week (0=Mon, 6=Sun for our array)
    let dayIndex = selectedDate.getDay() - 1;
    if (dayIndex === -1) dayIndex = 6; // Sunday

    const operatingHours = this.data.operatingHours?.days[dayIndex];

    if (operatingHours && operatingHours.isOpen && operatingHours.openTime && operatingHours.closeTime) {
      const [startHour] = operatingHours.openTime.split(':').map(Number);
      const [endHour] = operatingHours.closeTime.split(':').map(Number);

      let currentHour = startHour;

      while (currentHour < endHour) {
        const label = `${currentHour.toString().padStart(2, '0')}:00`;
        const isAvailable = this.isSlotAvailable(label);

        this.availableTimeSlots.push({
          hour: currentHour,
          label: label,
          available: isAvailable
        });
        currentHour++;
      }
    }
  }

  private isSlotAvailable(slotLabel: string): boolean {
    const selectedDate = this.form.get('date')?.value;
    const selectedCourtId = this.form.get('courtId')?.value;

    if (!selectedDate || !selectedCourtId) return true;

    const dateStr = this.formatDateToISO(selectedDate);

    // Check if slot is already reserved by another reservation
    const isReserved = this.data.allReservations.some(r =>
      r.id !== this.data.reservation.id && // Exclude current reservation
      r.courtId === selectedCourtId &&
      r.date === dateStr &&
      r.startTime === slotLabel &&
      r.status !== ReservationStatus.Cancelled
    );

    return !isReserved;
  }

  private formatDateToISO(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Get the price for a court based on its pricing configuration.
   * Uses single price if configured, otherwise finds the applicable interval.
   * Falls back to court.price if no pricing is configured.
   * Public method to allow usage in templates.
   */
  getCourtPrice(court: Court | undefined, startTime: string): number {
    if (!court) return 0;

    const pricing = court.pricing;

    // If no pricing configured, use base court price
    if (!pricing) {
      return court.price;
    }

    // If single price mode, use single price
    if (pricing.isSinglePrice && pricing.singlePrice != null) {
      return pricing.singlePrice;
    }

    // If interval mode, find the applicable interval
    if (pricing.intervals && pricing.intervals.length > 0 && startTime) {
      // Sort intervals by endTime
      const sortedIntervals = [...pricing.intervals].sort((a, b) =>
        a.endTime.localeCompare(b.endTime)
      );

      // Find the first interval where startTime < endTime
      for (const interval of sortedIntervals) {
        if (startTime < interval.endTime) {
          return interval.price;
        }
      }

      // If startTime is after all intervals, use the last interval's price
      return sortedIntervals[sortedIntervals.length - 1].price;
    }

    // Fallback to base court price
    return court.price;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.form.valid) {
      const formValue = this.form.value;
      const selectedCourt = this.availableCourts.find(c => c.id === formValue.courtId);

      // Calculate end time (1 hour duration)
      const [hours, minutes] = formValue.startTime.split(':').map(Number);
      const endHour = hours + 1;
      const endTime = `${endHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

      const updates: Partial<Reservation> = {
        date: this.formatDateToISO(formValue.date),
        courtId: formValue.courtId,
        courtName: selectedCourt?.name || this.data.reservation.courtName,
        startTime: formValue.startTime,
        endTime: endTime,
        userName: formValue.userName,
        userContact: formValue.userContact,
        price: this.getCourtPrice(selectedCourt, formValue.startTime)
      };

      this.dialogRef.close(updates);
    }
  }
}
