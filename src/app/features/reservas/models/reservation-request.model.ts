export interface CreateReservationRequest {
  courtName: string;
  date: string;
  startTime: string;
  endTime: string;
  userName: string;
  userContact: string;
  userEmail?: string;
  price: number;
  status: string;
}
