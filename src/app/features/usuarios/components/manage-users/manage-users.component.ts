import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';

import { UsuariosService } from '../../services/usuarios.service';
import { User } from '../../models/user.model';
import { EditUserDialogComponent } from '../edit-user-dialog/edit-user-dialog.component';
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog/confirm-delete-dialog.component';

@Component({
    selector: 'app-manage-users',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatIconModule,
        MatDialogModule,
        MatSnackBarModule
    ],
    templateUrl: './manage-users.component.html',
    styleUrls: ['./manage-users.component.scss']
})
export class ManageUsersComponent implements OnInit, OnDestroy {
    users: User[] = [];
    filteredUsers: User[] = [];
    filterEmail = '';

    private destroy$ = new Subject<void>();

    constructor(
        private usuariosService: UsuariosService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.usuariosService.users$
            .pipe(takeUntil(this.destroy$))
            .subscribe(users => {
                this.users = users;
                this.applyFilter();
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    applyFilter(): void {
        if (!this.filterEmail.trim()) {
            this.filteredUsers = [...this.users];
        } else {
            const filter = this.filterEmail.toLowerCase();
            this.filteredUsers = this.users.filter(user =>
                user.email.toLowerCase().includes(filter)
            );
        }
    }

    onEdit(user: User): void {
        const dialogRef = this.dialog.open(EditUserDialogComponent, {
            width: '500px',
            data: { user }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.usuariosService.updateUser(user.id, result)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe(response => {
                        if (response.success) {
                            this.snackBar.open('Usuario actualizado exitosamente', 'Cerrar', {
                                duration: 3000,
                                horizontalPosition: 'center',
                                verticalPosition: 'top',
                                panelClass: ['success-snackbar']
                            });
                        } else {
                            this.snackBar.open(response.message || 'Error al actualizar usuario', 'Cerrar', {
                                duration: 4000,
                                horizontalPosition: 'center',
                                verticalPosition: 'top',
                                panelClass: ['error-snackbar']
                            });
                        }
                    });
            }
        });
    }

    onDelete(user: User): void {
        const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
            width: '400px',
            data: { userName: user.name }
        });

        dialogRef.afterClosed().subscribe(confirmed => {
            if (confirmed) {
                this.usuariosService.deleteUser(user.id)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe(response => {
                        if (response.success) {
                            this.snackBar.open('Usuario eliminado exitosamente', 'Cerrar', {
                                duration: 3000,
                                horizontalPosition: 'center',
                                verticalPosition: 'top',
                                panelClass: ['success-snackbar']
                            });
                        } else {
                            this.snackBar.open(response.message || 'Error al eliminar usuario', 'Cerrar', {
                                duration: 4000,
                                horizontalPosition: 'center',
                                verticalPosition: 'top',
                                panelClass: ['error-snackbar']
                            });
                        }
                    });
            }
        });
    }
}

