import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComplexCardComponent } from '../complex-card/complex-card';
import { ComplexSearchResult } from '../../models/player.model';

@Component({
  selector: 'app-complex-list',
  standalone: true,
  imports: [CommonModule, ComplexCardComponent],
  templateUrl: './complex-list.html',
  styleUrl: './complex-list.scss'
})
export class ComplexListComponent {
  @Input() complexes: ComplexSearchResult[] = [];
}
