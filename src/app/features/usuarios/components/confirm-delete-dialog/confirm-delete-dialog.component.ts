import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDeleteDialogData {
    userName: string;
}

@Component({
    selector: 'app-confirm-delete-dialog',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule
    ],
    template: `
    <h2 mat-dialog-title class="dialog-title">
      <mat-icon color="warn">warning</mat-icon>
      Confirmar Eliminación
    </h2>
    <mat-dialog-content>
      <p class="confirm-message">
        ¿Está seguro que desea eliminar al usuario <strong>{{ data.userName }}</strong>?
      </p>
      <p class="warning-message">Esta acción no se puede deshacer.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="warn" [mat-dialog-close]="true">
        <mat-icon>delete</mat-icon>
        Eliminar
      </button>
    </mat-dialog-actions>
  `,
    styles: [`
    .dialog-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .confirm-message {
      font-size: 16px;
      margin-bottom: 8px;
    }
    .warning-message {
      color: #f44336;
      font-size: 14px;
    }
  `]
})
export class ConfirmDeleteDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<ConfirmDeleteDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: ConfirmDeleteDialogData
    ) { }
}
