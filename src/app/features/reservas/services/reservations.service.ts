import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, delay, tap } from 'rxjs/operators';
import { Reservation } from '../models/reservation.model';
import { ReservationStatus } from '../models/reservation-status.enum';
import { CajaService } from '../../caja/services/caja.service';

@Injectable({
  providedIn: 'root'
})
export class ReservationsService {
  private reservationsSubject = new BehaviorSubject<Reservation[]>(this.getMockReservations());
  public reservations$ = this.reservationsSubject.asObservable();

  constructor(private cajaService: CajaService) { }

  private getMockReservations(): Reservation[] {
    const today = new Date().toISOString().split('T')[0];
    return [
      {
        id: '1',
        courtId: '1',
        courtName: 'Court 1',
        date: today,
        startTime: '10:00',
        endTime: '11:00',
        userName: 'Juan Pérez',
        userContact: 'JuanPérez@gmail.com',
        status: ReservationStatus.Confirmed,
        price: 5000,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        courtId: '2',
        courtName: 'Court 2',
        date: today,
        startTime: '14:00',
        endTime: '16:00',
        userName: 'María García',
        userContact: 'MaríaGarcía@gmail.com',
        status: ReservationStatus.Confirmed,
        price: 10000,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        courtId: '3',
        courtName: 'Court 3',
        date: today,
        startTime: '18:00',
        endTime: '19:00',
        userName: 'Carlos López',
        userContact: 'CarlosLópez@gmail.com',
        status: ReservationStatus.Confirmed,
        price: 6000,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  getReservations(date?: string): Observable<Reservation[]> {
    return this.reservations$.pipe(
      map(reservations => {
        if (date) {
          return reservations.filter(r => r.date === date && r.status !== ReservationStatus.Cancelled);
        }
        return reservations.filter(r => r.status !== ReservationStatus.Cancelled);
      })
    );
  }

  getAllReservations(): Observable<Reservation[]> {
    return this.reservations$;
  }

  createReservation(reservation: Partial<Reservation>): Observable<Reservation> {
    const newReservation: Reservation = {
      id: Date.now().toString(),
      courtId: reservation.courtId!,
      courtName: reservation.courtName!,
      date: reservation.date!,
      startTime: reservation.startTime!,
      endTime: reservation.endTime!,
      userName: reservation.userName!,
      userContact: reservation.userContact!,
      status: ReservationStatus.Confirmed,
      price: reservation.price || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const currentReservations = this.reservationsSubject.value;
    this.reservationsSubject.next([...currentReservations, newReservation]);

    // Register in Caja
    this.cajaService.registerReservationMovement(newReservation, 'create');

    return of(newReservation).pipe(delay(1000));
  }

  updateReservation(id: string, updates: Partial<Reservation>): Observable<Reservation> {
    const currentReservations = this.reservationsSubject.value;
    const index = currentReservations.findIndex(r => r.id === id);

    if (index === -1) {
      throw new Error('Reservation not found');
    }

    const originalReservation = currentReservations[index];
    const previousPrice = originalReservation.price;

    const updatedReservation: Reservation = {
      ...originalReservation,
      ...updates,
      updatedAt: new Date()
    };

    const newReservations = [...currentReservations];
    newReservations[index] = updatedReservation;
    this.reservationsSubject.next(newReservations);

    // Register price change in Caja (if price changed)
    if (updates.price !== undefined && updates.price !== previousPrice) {
      this.cajaService.registerReservationMovement(updatedReservation, 'update', previousPrice);
    }

    return of(updatedReservation).pipe(delay(1000));
  }

  cancelReservation(id: string): Observable<void> {
    const currentReservations = this.reservationsSubject.value;
    const reservation = currentReservations.find(r => r.id === id);

    if (reservation) {
      // Register cancellation in Caja
      this.cajaService.registerReservationMovement(reservation, 'cancel');
    }

    return this.updateReservation(id, { status: ReservationStatus.Cancelled }).pipe(
      map(() => void 0)
    );
  }

  restoreReservation(id: string): Observable<void> {
    const currentReservations = this.reservationsSubject.value;
    const reservation = currentReservations.find(r => r.id === id);

    if (reservation) {
      // Register restoration as new reservation in Caja
      this.cajaService.registerReservationMovement(reservation, 'create');
    }

    return this.updateReservation(id, { status: ReservationStatus.Confirmed }).pipe(
      map(() => void 0)
    );
  }

  deleteReservation(id: string): Observable<void> {
    const currentReservations = this.reservationsSubject.value;
    const reservation = currentReservations.find(r => r.id === id);

    // Register deletion as cancellation in Caja (if not already cancelled)
    if (reservation && reservation.status !== ReservationStatus.Cancelled) {
      this.cajaService.registerReservationMovement(reservation, 'cancel');
    }

    const filtered = currentReservations.filter(r => r.id !== id);
    this.reservationsSubject.next(filtered);
    return of(void 0).pipe(delay(1000));
  }
}

