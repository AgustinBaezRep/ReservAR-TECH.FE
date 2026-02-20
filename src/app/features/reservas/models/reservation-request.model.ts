export interface CreateReservationRequest {
  idCancha: string;
  idUsuario: string;
  dia: string;
  hora: number;
  pago: string;
  fijo: boolean;
}
