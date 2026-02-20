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

  // Extended mock data for the complex profile
  complexDetails = {
    description: 'El mejor complejo deportivo de la ciudad. Contamos con canchas de última generación y un ambiente ideal para disfrutar del deporte con amigos.',
    rating: 4.8,
    reviewCount: 124,
    amenities: [
      { icon: 'wifi', name: 'Wi-Fi' },
      { icon: 'local_parking', name: 'Estacionamiento' },
      { icon: 'checkroom', name: 'Vestuario' },
      { icon: 'local_bar', name: 'Bar / Buffet' },
      { icon: 'security', name: 'Seguridad' }
    ],
    openingHours: [
      { day: 'Lunes a Viernes', hours: '08:00 - 24:00' },
      { day: 'Sábados', hours: '09:00 - 24:00' },
      { day: 'Domingos', hours: '09:00 - 22:00' }
    ],
    locationUrl: 'https://maps.google.com/?q=' // Mock URL
  };

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
