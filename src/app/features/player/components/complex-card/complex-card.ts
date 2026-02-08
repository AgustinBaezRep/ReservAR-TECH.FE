import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { ComplexSearchResult } from '../../models/player.model';

@Component({
  selector: 'app-complex-card',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './complex-card.html',
  styleUrl: './complex-card.scss'
})
export class ComplexCardComponent {
  @Input() complex!: ComplexSearchResult;
}
