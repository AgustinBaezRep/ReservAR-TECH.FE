import { Component, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PlayerService } from '../../services/player.service';
import { ComplexSearchResult } from '../../models/player.model';
import { AuthService } from '../../../login/services/auth.service';

@Component({
  selector: 'app-complex-detail-page',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTabsModule, MatSnackBarModule],
  templateUrl: './complex-detail-page.html',
  styleUrl: './complex-detail-page.scss'
})
export class ComplexDetailPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private playerService = inject(PlayerService);
  private sanitizer = inject(DomSanitizer);
  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);

  complex: ComplexSearchResult | undefined;
  mapUrlSafe!: SafeResourceUrl;

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
  allCourts = [
    { name: 'Cancha 1', type: 'Padel', surface: 'Cesped sintético', features: ['Con Iluminación', 'Cubierta'], slots: ['18:00', '19:30', '21:00'] },
    { name: 'Cancha 2', type: 'Padel', surface: 'Cesped sintético', features: ['Con Iluminación', 'Descubierta'], slots: ['17:00', '18:30', '20:00'] },
    { name: 'Cancha 3', type: 'Padel', surface: 'Cemento', features: ['Con Iluminación', 'Cubierta'], slots: ['18:00', '19:30', '21:00'] },
    { name: 'Cancha 4', type: 'Futbol', surface: 'Sintético', features: ['Con Iluminación', 'Descubierta'], slots: ['18:00', '19:00', '20:00', '21:00'] },
    { name: 'Cancha 5', type: 'Futbol', surface: 'Sintético', features: ['Con Iluminación', 'Cubierta'], slots: ['17:00', '18:00', '19:00', '22:00'] },
    { name: 'Cancha 6', type: 'Tenis', surface: 'Polvo de Ladrillo', features: ['Con Iluminación', 'Descubierta'], slots: ['09:00', '10:30', '16:00'] },
  ];

  selectedSlot: string | null = null;
  selectedCourt: string | null = null;

  selectedSportFilter: string = 'Padel';
  selectedDayFilter: string = 'Hoy';

  availableDays: { name: string, num: string, fullDate: Date }[] = [];

  showGallery: boolean = false;
  galleryPhotos: string[] = [];
  currentPhotoIndex: number = 0;

  constructor() {
    this.generateAvailableDays();
  }

  generateAvailableDays() {
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);

      let name = '';
      if (i === 0) name = 'Hoy';
      else if (i === 1) name = 'Mañ';
      else name = dayNames[d.getDay()];

      this.availableDays.push({
        name: name,
        num: d.getDate().toString(),
        fullDate: d
      });
    }
  }

  get filteredCourts() {
    return this.allCourts.filter(c => c.type.toLowerCase() === this.selectedSportFilter.toLowerCase());
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.playerService.getComplexById(id).subscribe(c => {
        this.complex = c;
        if (this.complex) {
          const locationQ = encodeURIComponent(this.complex.location || this.complex.name);
          const url = `https://maps.google.com/maps?q=${locationQ}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
          this.mapUrlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        }
      });
    }

    // Handle automatically selecting a slot if passed through queryParams
    this.route.queryParams.subscribe(params => {
      if (params['time']) {
        const timeSlot = params['time'];
        let courtWithSlot = this.allCourts.find(c => c.slots.includes(timeSlot));

        // Mock fallback: If the slot isn't in our hardcoded mock data, add it to Cancha 1 for seamless flow
        if (!courtWithSlot && this.allCourts.length > 0) {
          this.allCourts[0].slots.push(timeSlot);
          this.allCourts[0].slots.sort(); // Keep slots sorted visually
          courtWithSlot = this.allCourts[0];
        }

        if (courtWithSlot) {
          this.selectedSportFilter = courtWithSlot.type;
          this.selectedCourt = courtWithSlot.name;
          this.selectedSlot = timeSlot;
        }
      }
    });
  }

  selectSlot(courtName: string, slot: string) {
    this.selectedCourt = courtName;
    this.selectedSlot = slot;
  }

  selectDay(dayName: string) {
    this.selectedDayFilter = dayName;
    this.selectedSlot = null;
    this.selectedCourt = null;
  }

  selectSport(sport: string) {
    this.selectedSportFilter = sport;
    this.selectedSlot = null;
    this.selectedCourt = null;
  }

  confirmBooking() {
    if (!this.authService.isAuthenticated()) {
      // Redirect to login if user is not authenticated
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    if (this.selectedSlot && this.selectedCourt) {
      this.snackBar.open(`¡Reserva confirmada en ${this.complex?.name} - ${this.selectedCourt} a las ${this.selectedSlot}!`, 'Cerrar', {
        duration: 4000,
        panelClass: ['success-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
      this.selectedSlot = null;
      this.selectedCourt = null;
    }
  }

  openGallery(index: number = 0) {
    if (this.galleryPhotos.length === 0) {
      if (this.complex?.imageUrl) {
        this.galleryPhotos.push(this.complex.imageUrl);
      }
      this.galleryPhotos.push('https://images.unsplash.com/photo-1646649853703-7645147474ba?q=80&w=1470&auto=format&fit=crop');
      this.galleryPhotos.push('https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1470&auto=format&fit=crop');
    }
    this.currentPhotoIndex = index;
    // ensure index bounds
    if (this.currentPhotoIndex >= this.galleryPhotos.length) {
      this.currentPhotoIndex = 0;
    }
    this.showGallery = true;
    document.body.style.overflow = 'hidden';
  }

  closeGallery() {
    this.showGallery = false;
    document.body.style.overflow = '';
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (!this.showGallery) return;

    if (event.key === 'ArrowRight') {
      this.nextPhoto();
    } else if (event.key === 'ArrowLeft') {
      this.prevPhoto();
    } else if (event.key === 'Escape') {
      this.closeGallery();
    }
  }

  nextPhoto() {
    if (this.currentPhotoIndex < this.galleryPhotos.length - 1) {
      this.currentPhotoIndex++;
    } else {
      this.currentPhotoIndex = 0;
    }
  }

  prevPhoto() {
    if (this.currentPhotoIndex > 0) {
      this.currentPhotoIndex--;
    } else {
      this.currentPhotoIndex = this.galleryPhotos.length - 1;
    }
  }
}
