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

  // Restricciones de fecha
  minDate: Date = new Date();
  maxDate: Date = new Date();

  // Opciones disponibles
  availableCourts: Court[] = [];
  availableTimeSlots: AvailableTimeSlot[] = [];

  // Precio de cancha seleccionada para mostrar
  selectedCourtPrice: number = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditReservationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditReservationDialogData
  ) {
    // Establecer restricciones de fecha (hoy + 6 días)
    this.maxDate.setDate(this.minDate.getDate() + 6);

    // Parsear la fecha de la reserva
    const reservationDate = new Date(this.data.reservation.date + 'T00:00:00');

    // Inicializar formulario con valores actuales de la reserva
    this.form = this.fb.group({
      date: [reservationDate, [Validators.required]],
      courtId: [this.data.reservation.courtId, [Validators.required]],
      startTime: [this.data.reservation.startTime, [Validators.required]],
      userName: [this.data.reservation.userName, [Validators.required]],
      userContact: [this.data.reservation.userContact, [Validators.required]],
      userEmail: [this.data.reservation.userEmail, [Validators.email]]
    });

    // Inicializar precio
    this.selectedCourtPrice = this.data.reservation.price;
  }

  ngOnInit(): void {
    // Inicializar canchas disponibles (solo activas)
    this.availableCourts = this.data.courts.filter(c => c.isActive);

    // Recalcular precio inicial basado en configuración de precios de la cancha
    const currentCourt = this.availableCourts.find(c => c.id === this.data.reservation.courtId);
    const currentStartTime = this.data.reservation.startTime;
    this.selectedCourtPrice = this.getCourtPrice(currentCourt, currentStartTime);

    // Generar horarios iniciales
    this.generateTimeSlots();

    // Suscribirse a cambios de fecha
    this.form.get('date')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.generateTimeSlots();
      // Reiniciar horario cuando cambia la fecha
      const currentStartTime = this.form.get('startTime')?.value;
      const stillAvailable = this.availableTimeSlots.find(s => s.label === currentStartTime && s.available);
      if (!stillAvailable) {
        this.form.get('startTime')?.setValue('');
      }
    });

    // Suscribirse a cambios de cancha
    this.form.get('courtId')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((courtId) => {
      // Actualizar precio mostrado
      const court = this.availableCourts.find(c => c.id === courtId);
      const startTime = this.form.get('startTime')?.value;
      this.selectedCourtPrice = this.getCourtPrice(court, startTime);

      // Regenerar horarios para la nueva cancha
      this.generateTimeSlots();

      // Reiniciar horario cuando cambia la cancha
      const currentStartTime = this.form.get('startTime')?.value;
      const stillAvailable = this.availableTimeSlots.find(s => s.label === currentStartTime && s.available);
      if (!stillAvailable) {
        this.form.get('startTime')?.setValue('');
      }
    });

    // Suscribirse a cambios de horario para actualizar precio
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

    // Obtener día de la semana (0=Lun, 6=Dom para nuestro array)
    let dayIndex = selectedDate.getDay() - 1;
    if (dayIndex === -1) dayIndex = 6; // Domingo

    const operatingHours = this.data.operatingHours?.days[dayIndex];

    if (operatingHours && operatingHours.isOpen && operatingHours.openTime && operatingHours.closeTime) {
      const [startHour, startMinuteVal] = operatingHours.openTime.split(':').map(Number);
      const [endHour, endMinuteVal] = operatingHours.closeTime.split(':').map(Number);

      let currentHour = startHour;
      let currentMinute = startMinuteVal || 0;

      while (currentHour < endHour || (currentHour === endHour && currentMinute < (endMinuteVal || 0))) {
        const label = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
        const isAvailable = this.isSlotAvailable(label);

        this.availableTimeSlots.push({
          hour: currentHour,
          label: label,
          available: isAvailable
        });

        currentMinute += 30;
        if (currentMinute >= 60) {
          currentHour++;
          currentMinute = 0;
        }
      }
    }
  }

  private isSlotAvailable(slotLabel: string): boolean {
    const selectedDate = this.form.get('date')?.value;
    const selectedCourtId = this.form.get('courtId')?.value;

    if (!selectedDate || !selectedCourtId) return true;

    const dateStr = this.formatDateToISO(selectedDate);
    const court = this.availableCourts.find(c => c.id === selectedCourtId);

    // Determine duration of POTENTIAL new reservation
    const isPadel = court?.type?.toLowerCase().includes('padel');
    const newDurationInfo = isPadel ? 90 : 60;

    const newStartMinutes = this.parseTimeToMinutes(slotLabel);
    const newEndMinutes = newStartMinutes + newDurationInfo;

    // Verificar si el slot choca con INTERVALOS de otras reservas
    const hasOverlap = this.data.allReservations.some(r => {
      // Excluir misma reserva (comparación segura)
      if (String(r.id) === String(this.data.reservation.id)) return false;

      // Excluir otra fecha/cancha/cancelada
      if (String(r.courtId) !== String(selectedCourtId)) return false;
      if (r.date !== dateStr) return false;
      if (r.status === ReservationStatus.Cancelled) return false;

      const rStartMinutes = this.parseTimeToMinutes(r.startTime);
      // Confiar en endTime de la reserva, o calcular si es necesario (asumo endTime existe)
      let rEndMinutes = this.parseTimeToMinutes(r.endTime);

      // Fallback si endTime es inválido o igual a start (data corrupta)
      if (rEndMinutes <= rStartMinutes) {
        rEndMinutes = rStartMinutes + 60;
      }

      // Overlap logic: StartA < EndB && EndA > StartB
      return (newStartMinutes < rEndMinutes) && (newEndMinutes > rStartMinutes);
    });

    return !hasOverlap;
  }

  private parseTimeToMinutes(time: string): number {
    if (!time) return 0;
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  private formatDateToISO(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Obtener el precio de una cancha basado en su configuración de precios.
   * Usa precio único si está configurado, de lo contrario busca el intervalo aplicable.
   * Si no hay precios configurados, usa court.price como respaldo.
   * Método público para permitir uso en templates.
   */
  getCourtPrice(court: Court | undefined, startTime: string): number {
    if (!court) return 0;

    const pricing = court.pricing;

    // Si no hay precios configurados, usar precio base de la cancha
    if (!pricing) {
      return court.price;
    }

    // Si es modo precio único, usar precio único
    if (pricing.isSinglePrice && pricing.singlePrice != null) {
      return pricing.singlePrice;
    }

    // Si es modo intervalos, buscar el intervalo aplicable
    if (pricing.intervals && pricing.intervals.length > 0 && startTime) {
      // Ordenar intervalos por endTime
      const sortedIntervals = [...pricing.intervals].sort((a, b) =>
        a.endTime.localeCompare(b.endTime)
      );

      // Encontrar el primer intervalo donde startTime < endTime
      for (const interval of sortedIntervals) {
        if (startTime < interval.endTime) {
          return interval.price;
        }
      }

      // Si startTime es después de todos los intervalos, usar el precio del último intervalo
      return sortedIntervals[sortedIntervals.length - 1].price;
    }

    // Respaldo al precio base de la cancha
    return court.price;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onDelete(): void {
    this.dialogRef.close({ action: 'delete' });
  }

  onSave(): void {
    if (this.form.valid) {
      const formValue = this.form.value;
      const selectedCourt = this.availableCourts.find(c => c.id === formValue.courtId);

      // Calcular duración basada en el tipo de deporte
      // Padel: 1.5 horas (90 min), Fútbol/Otros: 1 hora (60 min)
      const isPadel = selectedCourt?.type?.toLowerCase().includes('padel');
      const durationMinutes = isPadel ? 90 : 60;

      const [hours, minutes] = formValue.startTime.split(':').map(Number);
      const startDate = new Date();
      startDate.setHours(hours, minutes + durationMinutes);
      const endHour = startDate.getHours().toString().padStart(2, '0');
      const endMinute = startDate.getMinutes().toString().padStart(2, '0');
      const endTime = `${endHour}:${endMinute}`;

      const updates: Partial<Reservation> = {
        date: this.formatDateToISO(formValue.date),
        courtId: formValue.courtId,
        courtName: selectedCourt?.name || this.data.reservation.courtName,
        startTime: formValue.startTime,
        endTime: endTime,
        userName: formValue.userName,
        userContact: formValue.userContact,
        userEmail: formValue.userEmail,
        price: this.getCourtPrice(selectedCourt, formValue.startTime)
      };

      this.dialogRef.close({ action: 'update', data: updates });
    }
  }
}
