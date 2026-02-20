import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

import { Court, CourtPricing } from '../../reservas/models/reservation.model';

export interface ComplexData {
  generalInfo: {
    name: string;
    address: string;
    latitude: string;
    longitude: string;
    adminPhone: string;
    isOnline: boolean;
  };
  operatingHours: {
    days: Array<{
      isOpen: boolean;
      openTime: string;
      closeTime: string;
    }>;
  };
  services: {
    wifi: boolean;
    parking: boolean;
    buffet: boolean;
    showers: boolean;
    lighting: boolean;
    roofing: boolean;
    lockers: boolean;
  };
  mercadoPago: {
    clientId: string;
    clientSecret: string;
  };
  courts: Court[];
}

const INITIAL_STATE: ComplexData = {
  generalInfo: {
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    adminPhone: '',
    isOnline: true
  },
  operatingHours: {
    days: Array(7).fill({
      isOpen: true,
      openTime: '10:00',
      closeTime: '22:00'
    })
  },
  services: {
    wifi: false,
    parking: false,
    buffet: false,
    showers: false,
    lighting: false,
    roofing: false,
    lockers: false
  },
  mercadoPago: {
    clientId: '',
    clientSecret: ''
  },
  courts: []
};

@Injectable({
  providedIn: 'root'
})
export class ComplejosService {
  private complexDataSubject = new BehaviorSubject<ComplexData>(INITIAL_STATE);
  complexData$ = this.complexDataSubject.asObservable();

  get currentData(): ComplexData {
    return this.complexDataSubject.value;
  }

  constructor() {
    // Simulate loading initial data from API
    this.loadComplexData();
  }

  private loadComplexData() {
    // Simulate loading data from backend
    console.log('Loading complex data from mock backend...');
    // We can initialize with some default data if needed, or just keep INITIAL_STATE
    // For now, let's just ensure we have the structure.
    // Since we are mocking, we can just leave it as INITIAL_STATE or set some dummy values.
    this.complexDataSubject.next({
      ...INITIAL_STATE,
      generalInfo: {
        ...INITIAL_STATE.generalInfo,
        name: 'Complejo Deportivo Demo',
        address: 'Av. Siempre Viva 123'
      },
      courts: [
        { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', name: 'Cancha 1', type: 'Fútbol 5', price: 15000, isActive: true },
        { id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901', name: 'Cancha 2', type: 'Padel', price: 20000, isActive: true }
      ]
    });
  }

  // ... (existing update methods)

  updateGeneralInfo(info: ComplexData['generalInfo']) {
    const current = this.complexDataSubject.value;
    this.complexDataSubject.next({
      ...current,
      generalInfo: info
    });
    this.saveToApi();
  }

  updateOperatingHours(hours: ComplexData['operatingHours']) {
    const current = this.complexDataSubject.value;
    this.complexDataSubject.next({
      ...current,
      operatingHours: hours
    });
    this.saveToApi();
  }

  updateServices(services: ComplexData['services']) {
    const current = this.complexDataSubject.value;
    this.complexDataSubject.next({
      ...current,
      services: services
    });
    this.saveToApi();
  }

  updateMercadoPago(mp: ComplexData['mercadoPago']) {
    const current = this.complexDataSubject.value;
    this.complexDataSubject.next({
      ...current,
      mercadoPago: mp
    });
    this.saveToApi();
  }

  // Court Management Methods
  addCourt(court: Court) {
    const current = this.complexDataSubject.value;
    const updatedCourts = [...current.courts, court];
    this.complexDataSubject.next({
      ...current,
      courts: updatedCourts
    });
    this.saveToApi();
  }

  updateCourt(updatedCourt: Court) {
    const current = this.complexDataSubject.value;
    const updatedCourts = current.courts.map(c =>
      c.id === updatedCourt.id ? updatedCourt : c
    );
    this.complexDataSubject.next({
      ...current,
      courts: updatedCourts
    });
    this.saveToApi();
  }

  deleteCourt(courtId: string) {
    const current = this.complexDataSubject.value;
    const updatedCourts = current.courts.filter(c => c.id !== courtId);
    this.complexDataSubject.next({
      ...current,
      courts: updatedCourts
    });
    this.saveToApi();
  }

  toggleCourtStatus(courtId: string) {
    const current = this.complexDataSubject.value;
    const updatedCourts = current.courts.map(c => {
      if (c.id === courtId) {
        return { ...c, isActive: !c.isActive };
      }
      return c;
    });
    this.complexDataSubject.next({
      ...current,
      courts: updatedCourts
    });
    this.saveToApi();
  }

  updateCourtPricing(courtId: string, pricing: CourtPricing) {
    const current = this.complexDataSubject.value;
    const updatedCourts = current.courts.map(c => {
      if (c.id === courtId) {
        return { ...c, pricing };
      }
      return c;
    });
    this.complexDataSubject.next({
      ...current,
      courts: updatedCourts
    });
    this.saveToApi();
  }

  private saveToApi() {
    // Simulate API save
    console.log('Saving to API (Mock):', this.complexDataSubject.value);
    // No localStorage saving
  }
}
