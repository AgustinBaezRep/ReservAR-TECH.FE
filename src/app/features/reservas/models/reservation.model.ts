import { ReservationStatus } from './reservation-status.enum';

export interface Court {
  id: string;
  name: string;
  type?: string;
  price: number;
  isActive: boolean;
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
