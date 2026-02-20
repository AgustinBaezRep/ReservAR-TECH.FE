import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchFiltersComponent } from '../../components/search-filters/search-filters';
import { ComplexListComponent } from '../../components/complex-list/complex-list';
import { ComplexSearchResult } from '../../models/player.model';
import { PlayerService } from '../../services/player.service';

@Component({
  selector: 'app-marketplace-page',
  standalone: true,
  imports: [CommonModule, SearchFiltersComponent, ComplexListComponent],
  templateUrl: './marketplace-page.html',
  styleUrl: './marketplace-page.scss',
})
export class MarketplacePageComponent implements OnInit {
  private playerService = inject(PlayerService);

  complexes: ComplexSearchResult[] = [];
  filteredComplexes: ComplexSearchResult[] = [];

  ngOnInit() {
    this.playerService.getComplexes().subscribe(data => {
      this.complexes = data;
      this.filteredComplexes = data;
    });
  }

  onSearch(filters: any) {
    console.log('Filters:', filters);
    // Simple mock filter logic based on city and time slots if provided
    this.filteredComplexes = this.complexes.filter(c => {
      let match = true;
      if (filters.city) {
        // We simulate that the 'city' string matches part of 'location'
        const filterCity = filters.city.split(',')[0].trim().toLowerCase();
        if (!c.location.toLowerCase().includes(filterCity)) {
          match = false;
        }
      }

      if (filters.sport && match) {
        // Check if complex has the requested sport
        const hasSport = c.sports && c.sports.some(s => s.toLowerCase() === filters.sport.toLowerCase());
        if (!hasSport) {
          match = false;
        }
      }

      if (filters.time && match) {
        // Simulate checking if the requested time is within availableSlots
        if (!c.availableSlots.includes(filters.time)) {
          match = false;
        }
      }

      return match;
    });
  }
}
