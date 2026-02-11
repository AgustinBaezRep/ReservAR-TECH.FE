import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Court } from '../models/reservation.model';

@Injectable({
  providedIn: 'root'
})
export class CourtsService {
  private mockCourts: Court[] = [
    { id: '1', name: 'Cancha 1', type: 'Fútbol 5', price: 15000, isActive: true },
    { id: '2', name: 'Cancha 2', type: 'Fútbol 5', price: 15000, isActive: true },
    { id: '3', name: 'Cancha 3', type: 'Fútbol 7', price: 22000, isActive: true },
    { id: '4', name: 'Cancha 4', type: 'Fútbol 7', price: 22000, isActive: true }
  ];

  getCourts(): Observable<Court[]> {
    return of(this.mockCourts);
  }

  getCourtById(id: string): Observable<Court | undefined> {
    return of(this.mockCourts.find(court => court.id === id));
  }
}
