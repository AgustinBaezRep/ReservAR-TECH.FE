import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-access-denied-page',
    standalone: true,
    imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule],
    template: `
    <div class="access-denied-container">
      <div class="access-denied-card">
        <mat-icon class="lock-icon">lock</mat-icon>
        <h1>Acceso Denegado</h1>
        <p>No tenés permisos para acceder a esta sección.</p>
        <p class="hint">Esta área está restringida solo para administradores.</p>
        <button mat-raised-button color="primary" routerLink="/reservas">
          <mat-icon>arrow_back</mat-icon>
          Volver a Reservas
        </button>
      </div>
    </div>
  `,
    styles: [`
    .access-denied-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .access-denied-card {
      background: white;
      border-radius: 16px;
      padding: 48px;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-width: 400px;
    }

    .lock-icon {
      font-size: 72px;
      width: 72px;
      height: 72px;
      color: #e74c3c;
      margin-bottom: 16px;
    }

    h1 {
      margin: 0 0 16px 0;
      color: #333;
      font-size: 28px;
    }

    p {
      color: #666;
      margin: 0 0 8px 0;
      font-size: 16px;
    }

    .hint {
      color: #999;
      font-size: 14px;
      margin-bottom: 24px;
    }

    button {
      mat-icon {
        margin-right: 8px;
      }
    }
  `]
})
export class AccessDeniedPageComponent { }
