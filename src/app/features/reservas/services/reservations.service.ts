import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, delay, tap } from 'rxjs/operators';
import { Reservation } from '../models/reservation.model';
import { ReservationStatus } from '../models/reservation-status.enum';
import { CajaService } from '../../caja/services/caja.service';
import { CreateReservationRequest } from '../models/reservation-request.model';
import { ReservationResponse } from '../models/reservation-response.model';

// ID del usuario seed para testing
const SEED_USER_ID = '7B9BDE9E-E2BD-4D81-AF0C-684669A78376'; // Se reemplazará con el ID real del seed

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
        courtId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
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
        courtId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
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
        courtId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        courtName: 'Cancha 1',
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
    debugger;
    const startHour = reservation.startTime ? parseInt(reservation.startTime.split(':')[0], 10) : 0;

    const requestBody: CreateReservationRequest = {
      idCancha: reservation.courtId!,
      idUsuario: SEED_USER_ID,
      dia: reservation.date!,
      hora: startHour,
      pago: 'Efectivo',
      fijo: false
    };

    return this.http.post<ReservationResponse>(this.apiUrl, requestBody).pipe(
      tap(response => {
        // Agregar la reserva al estado local con los datos del backend
        const newReservation: Reservation = {
          id: response.id,
          courtId: response.idCancha,
          courtName: response.nombreCancha,
          date: response.dia,
          startTime: reservation.startTime || `${response.hora}:00`,
          endTime: reservation.endTime || `${response.hora + 1}:00`,
          userName: response.nombreUsuario,
          userContact: String(response.telefonoUsuario),
          userEmail: response.emailUsuario,
          status: ReservationStatus.Confirmed,
          price: reservation.price || 0,
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
