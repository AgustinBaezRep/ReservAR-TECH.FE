import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  active: boolean;
}

@Component({
  selector: 'app-sidebar',
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  menuItems: MenuItem[] = [
    { label: 'Reservas', icon: 'event', route: '/reservas', active: true },
    { label: 'Canchas', icon: 'sports_soccer', route: '/canchas', active: false },
    { label: 'Usuarios', icon: 'people', route: '/usuarios', active: false },
    { label: 'Configuración', icon: 'settings', route: '/configuracion', active: false }
  ];
}
