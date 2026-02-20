export interface ReservationResponse {
  id: string;
  dia: string;
  hora: number;
  pago: string;
  fijo: boolean;
  // Cancha data
  idCancha: string;
  nombreCancha: string;
  // Usuario data
  idUsuario: string;
  nombreUsuario: string;
  emailUsuario: string;
  telefonoUsuario: number;
  // Audit
  createdAt: string;
}
