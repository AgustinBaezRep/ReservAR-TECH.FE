import { ReservationStatus } from './reservation-status.enum';

export interface PriceInterval {
  endTime: string;  // HH:mm format
  price: number;
}

export interface CourtPricing {
  courtId: string;
  isSinglePrice: boolean;
  singlePrice?: number;
  intervals?: PriceInterval[];
  deposit?: number;
}

export interface Court {
  id: string;
  name: string;
  type?: string;
  price: number;
  isActive: boolean;
  pricing?: CourtPricing;
}

export interface TimeSlot {
  hour: number;
  label: string;
}

export interface Reservation {
  id: string;
  courtId: string;
  courtName: string;
  date: string; // ISO date string (YYYY-MM-DD)
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  userName: string;
  userContact: string;
  status: ReservationStatus;
  price: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ReservationDialogData {
  reservation?: Reservation;
  court?: Court;
  date?: string;
  startTime?: string;
  mode: 'create' | 'edit';
}
