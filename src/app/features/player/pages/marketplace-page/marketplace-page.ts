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
    // Simple mock filter logic
    this.filteredComplexes = this.complexes.filter(c => {
      return true;
    });
  }
}
