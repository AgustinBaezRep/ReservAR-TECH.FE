import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ScheduleGridComponent, SlotClickEvent } from '../../components/schedule-grid/schedule-grid.component';
import { CreateReservationDialogComponent } from '../../components/create-reservation-dialog/create-reservation-dialog.component';
import { EditReservationDialogComponent } from '../../components/edit-reservation-dialog/edit-reservation-dialog.component';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { Court, TimeSlot, Reservation } from '../../models/reservation.model';
import { ReservationsService } from '../../services/reservations.service';
import { ReservationStatus } from '../../models/reservation-status.enum';
import { ReservationResponse } from '../../models/reservation-response.model';
import { ComplejosService } from '../../../complejos/services/complejos.service';

@Component({
  selector: 'app-reservas-page',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    ScheduleGridComponent
  ],
  templateUrl: './reservas-page.component.html',
  styleUrl: './reservas-page.component.scss'
})
export class ReservasPageComponent implements OnInit, OnDestroy {
  // Datos
  courts: Court[] = [];
  timeSlots: TimeSlot[] = [];
  dayReservations: Reservation[] = [];
  allReservations: Reservation[] = [];
  isComplexOnline: boolean = true;
  lastBackendResponse: ReservationResponse | null = null;
  private destroy$ = new Subject<void>();

  // Fecha seleccionada
  selectedDate: Date = new Date();
  minDate: Date = new Date();
  maxDate: Date = new Date();

  constructor(
    private reservationsService: ReservationsService,
    private complejosService: ComplejosService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {
    this.maxDate.setDate(this.minDate.getDate() + 14);
  }

  ngOnInit(): void {
    this.complejosService.complexData$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.isComplexOnline = data.generalInfo.isOnline;
        this.courts = data.courts.filter(c => c.isActive);
      });

    this.loadDataForDate();
    this.loadAllReservations();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // --- Navegación de fecha ---
  goToToday(): void {
    this.selectedDate = new Date();
    this.loadDataForDate();
  }

  prevDay(): void {
    const newDate = new Date(this.selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    if (newDate >= this.minDate) {
      this.selectedDate = newDate;
      this.loadDataForDate();
    }
  }

  nextDay(): void {
    const newDate = new Date(this.selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    if (newDate <= this.maxDate) {
      this.selectedDate = newDate;
      this.loadDataForDate();
    }
  }

  private loadDataForDate(): void {
    this.generateTimeSlots();
    this.loadDayReservations();
  }

  private generateTimeSlots(): void {
    this.timeSlots = [];
    let dayIndex = this.selectedDate.getDay() - 1;
    if (dayIndex === -1) dayIndex = 6; // Domingo

    const operatingHours = this.complejosService.currentData.operatingHours.days[dayIndex];

    if (operatingHours && operatingHours.isOpen && operatingHours.openTime && operatingHours.closeTime) {
      const [startHour, startMinuteVal] = operatingHours.openTime.split(':').map(Number);
      const [endHour, endMinuteVal] = operatingHours.closeTime.split(':').map(Number);

      let currentHour = startHour;
      let currentMinute = startMinuteVal || 0;

      while (currentHour < endHour || (currentHour === endHour && currentMinute < (endMinuteVal || 0))) {
        this.timeSlots.push({
          hour: currentHour,
          label: `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`
        });

        currentMinute += 30;
        if (currentMinute >= 60) {
          currentHour++;
          currentMinute = 0;
        }
      }
    }
  }

  private getDateString(): string {
    return this.selectedDate.toISOString().split('T')[0];
  }

  private loadDayReservations(): void {
    const dateStr = this.getDateString();
    this.reservationsService.getReservations(dateStr).subscribe(reservations => {
      this.dayReservations = reservations;
    });
  }

  private loadAllReservations(): void {
    this.reservationsService.getAllReservations().subscribe(reservations => {
      this.allReservations = reservations;
    });
  }

  // --- Handlers de la grilla ---
  onSlotClicked(event: SlotClickEvent): void {
    // Check overlap first
    // Determine duration based on court type
    const isPadel = event.court.type?.toLowerCase().includes('padel');
    const newDuration = isPadel ? 90 : 60; // 90 min or 60 min

    const newStart = this.parseTimeToMinutes(event.timeSlot.label);
    const newEnd = newStart + newDuration;
    const dateStr = this.getDateString();

    const hasOverlap = this.allReservations.some(r => {
      if (r.courtId !== event.court.id) return false;
      if (r.date !== dateStr) return false;
      if (r.status === ReservationStatus.Cancelled) return false;

      const rStart = this.parseTimeToMinutes(r.startTime);
      // Fallback or use endTime
      let rEnd = this.parseTimeToMinutes(r.endTime);
      if (rEnd <= rStart) rEnd = rStart + 60; // Assume 1 hour default if invalid

      // Overlap: StartA < EndB && EndA > StartB
      return (newStart < rEnd) && (newEnd > rStart);
    });

    if (hasOverlap) {
      this.showMessage('No hay disponibilidad suficiente para este turno', true);
      return;
    }

    const price = this.getCourtPrice(event.court, event.timeSlot.label);

    const dialogRef = this.dialog.open(CreateReservationDialogComponent, {
      width: '480px',
      data: {
        court: event.court,
        timeSlot: event.timeSlot,
        date: this.selectedDate,
        price: price
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createReservation(event.court, event.timeSlot, result);
      }
    });
  }

  private parseTimeToMinutes(time: string): number {
    if (!time) return 0;
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  onReservationClicked(reservation: Reservation): void {
    // Abrir diálogo de edición
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
      if (!result) return;

      if (result.action === 'delete') {
        this.onCancelReservation(reservation);
      } else if (result.action === 'update' && result.data) {
        this.updateReservation(reservation.id, result.data);
      }
    });
  }

  private createReservation(court: Court, timeSlot: TimeSlot, formData: { userName: string; userContact: string; userEmail?: string; notes: string }): void {
    const startTime = timeSlot.label;

    // Calcular duración basada en el tipo de deporte
    const isPadel = court.type?.toLowerCase().includes('padel');
    const durationMinutes = isPadel ? 90 : 60;

    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes + durationMinutes);
    const endHourStr = startDate.getHours().toString().padStart(2, '0');
    const endMinuteStr = startDate.getMinutes().toString().padStart(2, '0');
    const endTime = `${endHourStr}:${endMinuteStr}`;

    const tempId = `temp-${Date.now()}`;
    const newReservation: Reservation = {
      id: tempId,
      courtId: court.id,
      courtName: court.name,
      date: this.getDateString(),
      startTime: startTime,
      endTime: endTime,
      userName: formData.userName,
      userContact: formData.userContact,
      userEmail: formData.userEmail,
      price: this.getCourtPrice(court, startTime),
      status: ReservationStatus.Confirmed,
      type: court.type // Asignar tipo si existe en modelo
    } as Reservation;

    // Optimistic Update
    this.dayReservations = [...this.dayReservations, newReservation];
    this.allReservations = [...this.allReservations, newReservation];
    this.cdr.detectChanges();

    // remove ID from Partial for creation if needed, or service ignores it
    const { id, ...reservationData } = newReservation;
    debugger;

    this.reservationsService.createReservation(reservationData).subscribe({
      next: (response) => {
        debugger;
        this.lastBackendResponse = response;
        this.cdr.detectChanges();
        this.showMessage('Reserva creada exitosamente');
        this.loadDayReservations();
        this.loadAllReservations();
      },
      error: (error) => {
        // Rollback
        this.dayReservations = this.dayReservations.filter(r => r.id !== tempId);
        this.allReservations = this.allReservations.filter(r => r.id !== tempId);
        this.cdr.detectChanges();
        this.showMessage('Error al crear la reserva', true);
        console.error('Error al crear reserva:', error);
      }
    });
  }

  private updateReservation(id: string, updates: Partial<Reservation>): void {
    // Optimistic Snapshot
    const originalReservation = this.dayReservations.find(r => r.id === id);
    if (!originalReservation) return;

    const updatedPrediction = { ...originalReservation, ...updates };

    // Optimistic Update
    this.dayReservations = this.dayReservations.map(r => r.id === id ? updatedPrediction : r);
    this.allReservations = this.allReservations.map(r => r.id === id ? updatedPrediction : r);
    this.cdr.detectChanges();

    this.reservationsService.updateReservation(id, updates).subscribe({
      next: () => {
        this.showMessage('Reserva actualizada exitosamente');
        this.loadDayReservations();
        this.loadAllReservations();
      },
      error: () => {
        // Rollback
        if (originalReservation) {
          this.dayReservations = this.dayReservations.map(r => r.id === id ? originalReservation : r);
          this.allReservations = this.allReservations.map(r => r.id === id ? originalReservation : r);
          this.cdr.detectChanges();
        }
        this.showMessage('Error al actualizar la reserva', true);
      }
    });
  }

  // --- Lógica de Toasts Personalizados ---
  toasts: Toast[] = [];

  onCancelReservation(reservation: Reservation): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmar eliminación',
        message: `¿Estás seguro de que deseas eliminar la reserva de ${reservation.userName} para el ${reservation.date} a las ${reservation.startTime}?`
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;

      this.showUndoToast(reservation);

      // Optimistic update
      this.dayReservations = this.dayReservations.filter(r => r.id !== reservation.id);
      this.allReservations = this.allReservations.filter(r => r.id !== reservation.id);
      this.cdr.detectChanges();

      this.reservationsService.cancelReservation(reservation.id).subscribe({
        next: () => {
          // Confirm state from backend
          this.loadDayReservations();
          this.loadAllReservations();
        },
        error: () => {
          // Revert on error
          this.loadDayReservations();
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

    toast.timeoutId = setTimeout(() => {
      this.removeToast(toastId);
    }, 5000);

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

    this.reservationsService.restoreReservation(toast.reservationId).subscribe({
      next: () => {
        this.loadDayReservations();
        this.loadAllReservations();
        this.showMessage('Reserva restaurada');
      },
      error: () => {
        this.loadDayReservations();
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

  private getCourtPrice(court: Court, startTime: string): number {
    const pricing = court.pricing;
    if (!pricing) return court.price;
    if (pricing.isSinglePrice && pricing.singlePrice != null) return pricing.singlePrice;
    if (pricing.intervals && pricing.intervals.length > 0 && startTime) {
      const sortedIntervals = [...pricing.intervals].sort((a, b) => a.endTime.localeCompare(b.endTime));
      for (const interval of sortedIntervals) {
        if (startTime < interval.endTime) return interval.price;
      }
      return sortedIntervals[sortedIntervals.length - 1].price;
    }
    return court.price;
  }
}

interface Toast {
  id: number;
  message: string;
  reservationId: string;
  timeoutId?: any;
}
