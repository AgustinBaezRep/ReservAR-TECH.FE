import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, delay, tap } from 'rxjs/operators';
import { Reservation } from '../models/reservation.model';
import { ReservationStatus } from '../models/reservation-status.enum';
import { CajaService } from '../../caja/services/caja.service';
import { CreateReservationRequest } from '../models/reservation-request.model';
import { ReservationResponse } from '../models/reservation-response.model';

@Injectable({
  providedIn: 'root'
})
export class ReservationsService {
  private readonly apiUrl = 'https://localhost:7093/api/reserva';
  private reservationsSubject = new BehaviorSubject<Reservation[]>(this.getMockReservations());
  public reservations$ = this.reservationsSubject.asObservable();

  constructor(
    private cajaService: CajaService,
    private http: HttpClient
  ) { }

  private getMockReservations(): Reservation[] {
    const today = new Date().toISOString().split('T')[0];
    return [
      {
        id: '1',
        courtId: '1',
        courtName: 'Cancha 1',
        date: today,
        startTime: '10:00',
        endTime: '11:00',
        userName: 'Juan Pérez',
        userContact: '11 5555-1234',
        userEmail: 'JuanPerez@gmail.com',
        status: ReservationStatus.Confirmed,
        price: 5000,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        courtId: '2',
        courtName: 'Cancha 2',
        date: today,
        startTime: '14:00',
        endTime: '15:30',
        userName: 'María García',
        userContact: '11 5555-5678',
        userEmail: 'MariaGarcia@gmail.com',
        status: ReservationStatus.Confirmed,
        price: 10000,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        courtId: '3',
        courtName: 'Cancha 3',
        date: today,
        startTime: '18:00',
        endTime: '19:00',
        userName: 'Carlos López',
        userContact: '11 5555-9012',
        userEmail: 'CarlosLopez@gmail.com',
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

  createReservation(reservation: Partial<Reservation>): Observable<ReservationResponse> {
    const requestBody: CreateReservationRequest = {
      courtName: reservation.courtName!,
      date: reservation.date!,
      startTime: reservation.startTime!,
      endTime: reservation.endTime!,
      userName: reservation.userName!,
      userContact: reservation.userContact!,
      userEmail: reservation.userEmail,
      price: reservation.price || 0,
      status: reservation.status || ReservationStatus.Confirmed
    };

    return this.http.post<ReservationResponse>(this.apiUrl, requestBody).pipe(
      tap(response => {
        // Agregar la reserva al estado local con los datos del backend
        const newReservation: Reservation = {
          id: response.id,
          courtId: reservation.courtId || '',
          courtName: response.courtName,
          date: response.date,
          startTime: response.startTime,
          endTime: response.endTime,
          userName: response.userName,
          userContact: response.userContact,
          userEmail: response.userEmail,
          status: response.status as ReservationStatus,
          price: response.price,
          createdAt: new Date(response.createdAt),
          updatedAt: new Date(response.createdAt)
        };

        const currentReservations = this.reservationsSubject.value;
        this.reservationsSubject.next([...currentReservations, newReservation]);

        // Registrar en Caja
        this.cajaService.registerReservationMovement(newReservation, 'create');
      })
    );
  }

  updateReservation(id: string, updates: Partial<Reservation>): Observable<Reservation> {
    const currentReservations = this.reservationsSubject.value;
    const index = currentReservations.findIndex(r => r.id === id);

    if (index === -1) {
      throw new Error('Reserva no encontrada');
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

    // Registrar cambio de precio en Caja (si el precio cambió)
    if (updates.price !== undefined && updates.price !== previousPrice) {
      this.cajaService.registerReservationMovement(updatedReservation, 'update', previousPrice);
    }

    return of(updatedReservation).pipe(delay(200));
  }

  cancelReservation(id: string): Observable<void> {
    const currentReservations = this.reservationsSubject.value;
    const reservation = currentReservations.find(r => r.id === id);

    if (reservation) {
      // Registrar cancelación en Caja
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
      // Registrar restauración como nueva reserva en Caja
      this.cajaService.registerReservationMovement(reservation, 'create');
    }

    return this.updateReservation(id, { status: ReservationStatus.Confirmed }).pipe(
      map(() => void 0)
    );
  }

  deleteReservation(id: string): Observable<void> {
    const currentReservations = this.reservationsSubject.value;
    const reservation = currentReservations.find(r => r.id === id);

    // Registrar eliminación como cancelación en Caja (si no estaba ya cancelada)
    if (reservation && reservation.status !== ReservationStatus.Cancelled) {
      this.cajaService.registerReservationMovement(reservation, 'cancel');
    }

    const filtered = currentReservations.filter(r => r.id !== id);
    this.reservationsSubject.next(filtered);
    return of(void 0).pipe(delay(200));
  }
}
