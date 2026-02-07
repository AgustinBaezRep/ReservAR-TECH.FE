import { Component, Input, Output, EventEmitter, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { Reservation } from '../../models/reservation.model';
import { ReservationStatus } from '../../models/reservation-status.enum';

@Component({
  selector: 'app-reservations-table',
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSortModule,
    MatPaginatorModule
  ],
  templateUrl: './reservations-table.component.html',
  styleUrl: './reservations-table.component.scss'
})
export class ReservationsTableComponent implements AfterViewInit {
  @Input() set reservations(value: Reservation[]) {
    this.dataSource.data = value;
    this.updatePageSizeOptions(value.length);
  }

  @Output() editReservation = new EventEmitter<Reservation>();
  @Output() cancelReservation = new EventEmitter<Reservation>();

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = ['date', 'court', 'time', 'userName', 'userContact', 'status', 'price', 'actions'];
  dataSource = new MatTableDataSource<Reservation>([]);
  pageSizeOptions: number[] = [5, 10, 25, 50];

  private updatePageSizeOptions(totalRecords: number): void {
    // Base options
    const baseOptions = [5, 10, 25, 50];

    // Only add "All" option if there are records and it's different from existing options
    if (totalRecords > 0 && !baseOptions.includes(totalRecords)) {
      this.pageSizeOptions = [...baseOptions, totalRecords];
    } else {
      this.pageSizeOptions = baseOptions;
    }
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  onEdit(reservation: Reservation): void {
    this.editReservation.emit(reservation);
  }

  onCancel(reservation: Reservation): void {
    this.cancelReservation.emit(reservation);
  }

  getStatusClass(status: ReservationStatus): string {
    switch (status) {
      case ReservationStatus.Confirmed:
        return 'status-confirmed';
      case ReservationStatus.Cancelled:
        return 'status-cancelled';
      default:
        return '';
    }
  }

  getStatusLabel(status: ReservationStatus): string {
    switch (status) {
      case ReservationStatus.Confirmed:
        return 'Confirmada';
      case ReservationStatus.Cancelled:
        return 'Cancelada';
      default:
        return status;
    }
  }

  canEdit(reservation: Reservation): boolean {
    return reservation.status !== ReservationStatus.Cancelled;
  }

  canCancel(reservation: Reservation): boolean {
    return reservation.status !== ReservationStatus.Cancelled;
  }
}
