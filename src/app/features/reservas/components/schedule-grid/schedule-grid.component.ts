import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Court, TimeSlot, Reservation } from '../../models/reservation.model';
import { ReservationStatus } from '../../models/reservation-status.enum';

export interface SlotClickEvent {
    court: Court;
    timeSlot: TimeSlot;
}

const RESERVATION_COLORS = [
    { bg: '#e8f5e9', border: '#4caf50', text: '#2e7d32' },
    { bg: '#fff3e0', border: '#ff9800', text: '#e65100' },
    { bg: '#e3f2fd', border: '#2196f3', text: '#1565c0' },
    { bg: '#fce4ec', border: '#e91e63', text: '#880e4f' },
    { bg: '#f3e5f5', border: '#9c27b0', text: '#6a1b9a' },
    { bg: '#e0f2f1', border: '#009688', text: '#00695c' },
    { bg: '#fff9c4', border: '#fbc02d', text: '#f57f17' },
    { bg: '#efebe9', border: '#795548', text: '#4e342e' },
];

@Component({
    selector: 'app-schedule-grid',
    imports: [
        CommonModule,
        MatIconModule,
        MatTooltipModule
    ],
    templateUrl: './schedule-grid.component.html',
    styleUrl: './schedule-grid.component.scss'
})
export class ScheduleGridComponent implements OnChanges {
    @Input() courts: Court[] = [];
    @Input() timeSlots: TimeSlot[] = [];
    @Input() reservations: Reservation[] = [];

    @Output() slotClicked = new EventEmitter<SlotClickEvent>();
    @Output() reservationClicked = new EventEmitter<Reservation>();

    private colorMap = new Map<string, typeof RESERVATION_COLORS[0]>();
    private colorIndex = 0;

    // Use a map to quickly find slot index for grid positioning
    private slotIndexMap = new Map<string, number>();

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['timeSlots'] && this.timeSlots) {
            this.slotIndexMap.clear();
            this.timeSlots.forEach((slot, index) => {
                this.slotIndexMap.set(slot.label, index);
            });
        }
    }

    getReservationsForCourt(courtId: string): Reservation[] {
        return this.reservations.filter(r =>
            r.courtId === courtId &&
            r.status !== ReservationStatus.Cancelled
        );
    }

    getGridRowStyle(reservation: Reservation): string {
        const startIndex = this.slotIndexMap.get(reservation.startTime);

        // If start time is not in grid (e.g. before open), hide it or handle it.
        // Returning empty string causes auto-placement which breaks layout.
        // We'll return a span of 0 or handled via *ngIf in template ideally, 
        // but here we can try to place it safely or hide it.
        if (startIndex === undefined) return '1 / span 0';

        const start = this.parseTime(reservation.startTime);
        // Use endTime or default
        let end = this.parseTime(reservation.endTime);
        if (end <= start) end = start + 60;

        const durationMinutes = end - start;
        // Ensure at least 1 slot
        const durationSlots = Math.max(1, Math.ceil(durationMinutes / 30));

        // Format: startRow / span duration
        return `${startIndex + 1} / span ${durationSlots}`;
    }

    private parseTime(timeStr: string): number {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }

    getReservationColor(reservation: Reservation): typeof RESERVATION_COLORS[0] {
        if (!this.colorMap.has(reservation.id)) {
            this.colorMap.set(reservation.id, RESERVATION_COLORS[this.colorIndex % RESERVATION_COLORS.length]);
            this.colorIndex++;
        }
        return this.colorMap.get(reservation.id)!;
    }

    onSlotClick(court: Court, timeSlot: TimeSlot): void {
        // Only emit if not clicking on an existing reservation (handled by z-index/stopPropagation usually, but good to check)
        // Since reservation div is on top, this click should be on the empty slot div underneath.
        this.slotClicked.emit({ court, timeSlot });
    }

    onReservationClick(event: MouseEvent, reservation: Reservation): void {
        event.stopPropagation();
        this.reservationClicked.emit(reservation);
    }

    getCourtIcon(type: string | undefined): string {
        if (!type) return 'sports_soccer';
        const lowerType = type.toLowerCase();
        if (lowerType.includes('padel') || lowerType.includes('tenis')) {
            return 'sports_tennis';
        }
        return 'sports_soccer';
    }

    getEndTime(slot: TimeSlot): string {
        // Assuming 30 min slots for display
        const [hours, minutes] = slot.label.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes + 30);
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
}
