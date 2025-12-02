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
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.bookingForm = this.fb.group({
      userName: ['', [Validators.required]],
      userContact: ['', [Validators.required]],
      notes: ['']
    });

    this.maxDate.setDate(this.minDate.getDate() + 6);
    this.generateTimeSlots();
  }

  ngOnInit(): void {
    this.loadCourts();
    this.loadAllReservations();
    
    // Reload reservations when date changes to check availability
    this.selectedDateControl.valueChanges.subscribe(() => {
      this.loadDayReservations();
      this.selectedCourt = null;
      this.selectedTimeSlot = null;
    });
  }

  private generateTimeSlots(): void {
    const startHour = 8;
    const endHour = 23;
    
    for (let hour = startHour; hour <= endHour; hour++) {
      this.timeSlots.push({
        hour,
        label: `${hour.toString().padStart(2, '0')}:00`
      });
    }
  }

  private loadCourts(): void {
    this.courtsService.getCourts().subscribe(courts => {
      this.courts = courts;
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
      width: '400px',
      data: { reservation }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateReservation(reservation.id, result);
      }
    });
  }

  private updateReservation(id: string, updates: Partial<Reservation>): void {
    this.reservationsService.updateReservation(id, updates).subscribe({
      next: () => {
        this.showMessage('Reserva actualizada exitosamente');
        this.loadAllReservations();
      },
      error: (error) => {
        this.showMessage('Error al actualizar la reserva', true);
      }
    });
  }

  onCancelReservation(reservation: Reservation): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmar eliminación',
        message: `¿Está seguro que desea cancelar la reserva de ${reservation.userName}?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.reservationsService.cancelReservation(reservation.id).subscribe({
          next: () => {
            this.showMessage('Reserva cancelada exitosamente');
            this.loadAllReservations();
            this.loadDayReservations(); // Refresh availability
          },
          error: (error) => {
            this.showMessage('Error al cancelar la reserva', true);
          }
        });
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
}
