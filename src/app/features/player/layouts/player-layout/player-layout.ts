import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-player-layout',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './player-layout.html',
  styleUrl: './player-layout.scss'
})
export class PlayerLayoutComponent { }
