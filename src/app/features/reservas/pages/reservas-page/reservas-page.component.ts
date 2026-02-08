import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ReservationsTableComponent } from '../../components/reservations-table/reservations-table.component';
import { EditReservationDialogComponent } from '../../components/edit-reservation-dialog/edit-reservation-dialog.component';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { Court, TimeSlot, Reservation } from '../../models/reservation.model';
import { CourtsService } from '../../services/courts.service';
import { ReservationsService } from '../../services/reservations.service';
import { ReservationStatus } from '../../models/reservation-status.enum';

import { ComplejosService } from '../../../complejos/services/complejos.service';

@Component({
  selector: 'app-reservas-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatSnackBarModule,
    ReservationsTableComponent
  ],
  templateUrl: './reservas-page.component.html',
  styleUrl: './reservas-page.component.scss'
})
export class ReservasPageComponent implements OnInit {
  @ViewChild('stepper') stepper!: MatStepper;

  // Data
  courts: Court[] = [];
  timeSlots: TimeSlot[] = [];
  reservations: Reservation[] = [];
  allReservations: Reservation[] = [];

  // Wizard State
  selectedDateControl = new FormControl(new Date(), [Validators.required]);
  selectedCourt: Court | null = null;
  selectedTimeSlot: TimeSlot | null = null;

  minDate: Date = new Date();
  maxDate: Date = new Date();

  // Forms
  bookingForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private courtsService: CourtsService,
    private reservationsService: ReservationsService,
    private complejosService: ComplejosService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.bookingForm = this.fb.group({
      userName: ['', [Validators.required]],
      userContact: ['', [Validators.required]],
      notes: ['']
    });

    this.maxDate.setDate(this.minDate.getDate() + 14);
    this.generateTimeSlots();
  }

  ngOnInit(): void {
    this.loadCourts();
    this.loadAllReservations();

    // Reload reservations when date changes to check availability
    this.selectedDateControl.valueChanges.subscribe(() => {
      this.loadDayReservations();
      this.generateTimeSlots();
      this.selectedCourt = null;
      this.selectedTimeSlot = null;
    });
  }

  onDateSelected(date: Date): void {
    this.selectedDateControl.setValue(date);
    this.stepper.next();
  }

  onCalendarClick(event: MouseEvent): void {
    // Check if clicked on the already selected date cell (today has 'mat-calendar-body-active' class)
    const target = event.target as HTMLElement;
    const dateCell = target.closest('.mat-calendar-body-cell');

    if (dateCell && dateCell.classList.contains('mat-calendar-body-active')) {
      // Clicked on the already selected date (today), advance to next step
      this.stepper.next();
    }
  }

  private generateTimeSlots(): void {
    this.timeSlots = [];
    const selectedDate = this.selectedDateControl.value || new Date();
    // getDay() returns 0 for Sunday, 1 for Monday, etc.
    // Our array is 0-indexed starting from Monday (0=Mon, 6=Sun)
    let dayIndex = selectedDate.getDay() - 1;
    if (dayIndex === -1) dayIndex = 6; // Sunday

    const operatingHours = this.complejosService.currentData.operatingHours.days[dayIndex];

    if (operatingHours && operatingHours.isOpen && operatingHours.openTime && operatingHours.closeTime) {
      const [startHour, startMinute] = operatingHours.openTime.split(':').map(Number);
      const [endHour, endMinute] = operatingHours.closeTime.split(':').map(Number);

      let currentHour = startHour;

      // Generate slots from startHour to endHour - 1 (assuming 1 hour slots)
      // If closeTime is 23:00, last slot is 22:00-23:00
      while (currentHour < endHour) {
        this.timeSlots.push({
          hour: currentHour,
          label: `${currentHour.toString().padStart(2, '0')}:00`
        });
        currentHour++;
      }
    }
  }

  private loadCourts(): void {
    // Subscribe to complexData to get active courts
    this.complejosService.complexData$.subscribe(data => {
      // Filter only active courts
      this.courts = data.courts.filter(c => c.isActive);
    });
  }

  private loadDayReservations(): void {
    const dateStr = this.getSelectedDateString();
    this.reservationsService.getReservations(dateStr).subscribe(reservations => {
      this.reservations = reservations;
    });
  }

  private loadAllReservations(): void {
    this.reservationsService.getAllReservations().subscribe(reservations => {
      this.allReservations = reservations;
    });
  }

  getSelectedDateString(): string {
    const date = this.selectedDateControl.value || new Date();
    return date.toISOString().split('T')[0];
  }

  // Step 2 Logic
  selectCourt(court: Court): void {
    this.selectedCourt = court;
    this.selectedTimeSlot = null;
  }

  selectTimeSlot(slot: TimeSlot): void {
    this.selectedTimeSlot = slot;
  }

  isSlotAvailable(court: Court, slot: TimeSlot): boolean {
    const dateStr = this.getSelectedDateString();
    // Check if there is any reservation for this court and time on the selected date
    // Note: In a real app, we'd check against this.reservations which is already filtered by date
    return !this.reservations.some(r =>
      r.courtId === court.id &&
      r.startTime === slot.label &&
      r.status !== ReservationStatus.Cancelled
    );
  }

  // Step 3 Logic
  onSubmitBooking(): void {
    if (this.bookingForm.valid && this.selectedCourt && this.selectedTimeSlot) {
      const formValue = this.bookingForm.value;
      const startTime = this.selectedTimeSlot.label;

      // Calculate end time (assuming 1 hour duration for now)
      const [hours, minutes] = startTime.split(':').map(Number);
      const endHour = hours + 1;
      const endTime = `${endHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

      const newReservation: Partial<Reservation> = {
        courtId: this.selectedCourt.id,
        courtName: this.selectedCourt.name,
        date: this.getSelectedDateString(),
        startTime: startTime,
        endTime: endTime,
        userName: formValue.userName,
        userContact: formValue.userContact,
        price: this.selectedCourt.price,
        status: ReservationStatus.Confirmed
      };

      this.reservationsService.createReservation(newReservation).subscribe({
        next: () => {
          this.showMessage('Reserva creada exitosamente');
          this.loadAllReservations();
          this.resetWizard();
        },
        error: (error) => {
          this.showMessage('Error al crear la reserva', true);
          console.error('Error creating reservation:', error);
        }
      });
    } else {
      this.bookingForm.markAllAsTouched();
    }
  }

  resetWizard(): void {
    this.stepper.reset();
    this.selectedDateControl.setValue(new Date());
    this.selectedCourt = null;
    this.selectedTimeSlot = null;
    this.bookingForm.reset();
  }

  // Table Actions
  onEditReservation(reservation: Reservation): void {
    const dialogRef = this.dialog.open(EditReservationDialogComponent, {
      width: '450px',
      data: {
        reservation,
        allReservations: this.allReservations,
        courts: this.courts,
        operatingHours: this.complejosService.currentData.operatingHours
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateReservation(reservation.id, result);
      }
    });
  }

  private updateReservation(id: string, updates: Partial<Reservation>): void {
    // Optimistic update: update local array immediately for instant UI feedback
    const index = this.allReservations.findIndex(r => r.id === id);
    if (index !== -1) {
      this.allReservations = [
        ...this.allReservations.slice(0, index),
        { ...this.allReservations[index], ...updates },
        ...this.allReservations.slice(index + 1)
      ];
    }

    this.reservationsService.updateReservation(id, updates).subscribe({
      next: () => {
        this.showMessage('Reserva actualizada exitosamente');
      },
      error: (error) => {
        // Revert on error - reload from service
        this.loadAllReservations();
        this.showMessage('Error al actualizar la reserva', true);
      }
    });
  }

  // Custom Toasts Logic
  toasts: Toast[] = [];

  onCancelReservation(reservation: Reservation): void {
    // Show confirmation dialog before cancelling
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmar eliminación',
        message: `¿Estás seguro de que deseas eliminar la reserva de ${reservation.userName} para el ${reservation.date} a las ${reservation.startTime}?`
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;

      // Optimistic update: change status immediately for smooth CSS transition
      const index = this.allReservations.findIndex(r => r.id === reservation.id);
      if (index !== -1) {
        this.allReservations = [
          ...this.allReservations.slice(0, index),
          { ...this.allReservations[index], status: ReservationStatus.Cancelled },
          ...this.allReservations.slice(index + 1)
        ];
      }

      this.reservationsService.cancelReservation(reservation.id).subscribe({
        next: () => {
          this.loadDayReservations(); // Refresh availability
          this.showUndoToast(reservation);
        },
        error: () => {
          // Revert on error
          this.loadAllReservations();
          this.showMessage('Error al cancelar la reserva', true);
        }
      });
    });
  }

  showUndoToast(reservation: Reservation): void {
    const toastId = Date.now() + Math.random();
    const toast: Toast = {
      id: toastId,
      message: `Reserva de ${reservation.userName} eliminada`,
      reservationId: reservation.id
    };

    // Auto-dismiss after 10 seconds
    toast.timeoutId = setTimeout(() => {
      this.removeToast(toastId);
    }, 10000);

    this.toasts.push(toast);
  }

  removeToast(id: number): void {
    const index = this.toasts.findIndex(t => t.id === id);
    if (index !== -1) {
      clearTimeout(this.toasts[index].timeoutId);
      this.toasts.splice(index, 1);
    }
  }

  onUndo(toast: Toast): void {
    this.removeToast(toast.id);

    // Optimistic update: restore status immediately
    const restoreIndex = this.allReservations.findIndex(r => r.id === toast.reservationId);
    if (restoreIndex !== -1) {
      this.allReservations = [
        ...this.allReservations.slice(0, restoreIndex),
        { ...this.allReservations[restoreIndex], status: ReservationStatus.Confirmed },
        ...this.allReservations.slice(restoreIndex + 1)
      ];
    }

    this.reservationsService.restoreReservation(toast.reservationId).subscribe({
      next: () => {
        this.loadDayReservations();
        this.showMessage('Reserva restaurada');
      },
      error: () => {
        // Revert on error
        this.loadAllReservations();
        this.showMessage('Error al restaurar la reserva', true);
      }
    });
  }

  private showMessage(message: string, isError: boolean = false): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: isError ? ['error-snackbar'] : ['success-snackbar']
    });
  }

  goToToday(): void {
    this.selectedDateControl.setValue(new Date());
  }

  getCourtIcon(type: string | undefined): string {
    if (!type) return 'sports_soccer';
    const lowerType = type.toLowerCase();
    if (lowerType.includes('padel') || lowerType.includes('tenis')) {
      return 'sports_tennis';
    }
    return 'sports_soccer';
  }
}

interface Toast {
  id: number;
  message: string;
  reservationId: string;
  timeoutId?: any;
}
