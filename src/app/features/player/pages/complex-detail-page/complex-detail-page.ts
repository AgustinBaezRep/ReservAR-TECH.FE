import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { PlayerService } from '../../services/player.service';
import { ComplexSearchResult } from '../../models/player.model';

@Component({
  selector: 'app-complex-detail-page',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTabsModule],
  templateUrl: './complex-detail-page.html',
  styleUrl: './complex-detail-page.scss'
})
export class ComplexDetailPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private playerService = inject(PlayerService);

  complex: ComplexSearchResult | undefined;

  // Mock courts for the detail view since complex model is simple
  courts = [
    { name: 'Cancha 1', type: 'Padel', surface: 'Cesped sintético', features: ['Con Iluminación', 'Cubierta'], slots: ['18:00', '19:30', '21:00'] },
    { name: 'Cancha 2', type: 'Padel', surface: 'Cesped sintético', features: ['Con Iluminación', 'Descubierta'], slots: ['17:00', '18:30', '20:00'] },
    { name: 'Cancha 3', type: 'Padel', surface: 'Cemento', features: ['Con Iluminación', 'Cubierta'], slots: ['18:00', '19:30', '21:00'] },
  ];

  selectedSlot: string | null = null;
  selectedCourt: string | null = null;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.playerService.getComplexById(id).subscribe(c => {
        this.complex = c;
      });
    }
  }

  selectSlot(courtName: string, slot: string) {
    this.selectedCourt = courtName;
    this.selectedSlot = slot;
  }

  confirmBooking() {
    if (this.selectedSlot && this.selectedCourt) {
      alert(`Reserva confirmada para ${this.complex?.name} - ${this.selectedCourt} a las ${this.selectedSlot}`);
      this.selectedSlot = null;
      this.selectedCourt = null;
    }
  }
}
