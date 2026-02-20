import { Component, Input, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { ComplexSearchResult } from '../../models/player.model';

@Component({
  selector: 'app-complex-card',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './complex-card.html',
  styleUrl: './complex-card.scss'
})
export class ComplexCardComponent implements OnInit {
  @Input() complex!: ComplexSearchResult;

  images: string[] = [];
  currentImageIndex = 0;

  private router = inject(Router);

  ngOnInit() {
    // Simulamos un arreglo de imágenes para el carrusel
    this.images = [
      this.complex.imageUrl,
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop', // canchas
      'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=1470&auto=format&fit=crop'
    ];
  }

  nextImage(event: Event) {
    event.stopPropagation();
    if (this.currentImageIndex < this.images.length - 1) {
      this.currentImageIndex++;
    } else {
      this.currentImageIndex = 0;
    }
  }

  prevImage(event: Event) {
    event.stopPropagation();
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
    } else {
      this.currentImageIndex = this.images.length - 1;
    }
  }

  goToImage(index: number, event: Event) {
    event.stopPropagation();
    this.currentImageIndex = index;
  }

  resetImage() {
    this.currentImageIndex = 0;
  }

  navigateToDetail(slot?: string, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });

    if (slot) {
      this.router.navigate(['/player', this.complex.id], { queryParams: { time: slot } });
    } else {
      this.router.navigate(['/player', this.complex.id]);
    }
  }
}
