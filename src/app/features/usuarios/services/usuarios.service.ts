import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, delay, map } from 'rxjs';
import { UserRole } from '../../login/models/auth.model';
import { AuthService } from '../../login/services/auth.service';
import {
    User,
    CreateUserRequest,
    UpdateUserRequest,
    ChangePasswordRequest,
    UserOperationResponse
} from '../models/user.model';

const MOCK_USERS: User[] = [
    {
        id: '1',
        name: 'Admin Principal',
        email: 'admin@test.com',
        role: UserRole.ADMIN,
        status: 'active',
        createdAt: new Date('2025-01-01')
    },
    {
        id: '2',
        name: 'Juan Pérez',
        email: 'juan@email.com',
        role: UserRole.CLIENT,
        status: 'active',
        createdAt: new Date('2025-02-15')
    },
    {
        id: '3',
        name: 'María García',
        email: 'maria@email.com',
        role: UserRole.CLIENT,
        status: 'pending',
        createdAt: new Date('2025-03-10')
    }
];

@Injectable({
    providedIn: 'root'
})
export class UsuariosService {
    private usersSubject = new BehaviorSubject<User[]>(MOCK_USERS);
    users$ = this.usersSubject.asObservable();

    constructor(private authService: AuthService) { }

    get currentUsers(): User[] {
        return this.usersSubject.value;
    }

    getUsers(): Observable<User[]> {
        return this.users$;
    }

    getUserById(id: string): User | undefined {
        return this.currentUsers.find(u => u.id === id);
    }

    isEmailUnique(email: string, excludeId?: string): boolean {
        return !this.currentUsers.some(u =>
            u.email.toLowerCase() === email.toLowerCase() && u.id !== excludeId
        );
    }

    createUser(request: CreateUserRequest): Observable<UserOperationResponse> {
        // Check email uniqueness
        if (!this.isEmailUnique(request.email)) {
            return of({
                success: false,
                message: 'El email ya está registrado en el sistema'
            }).pipe(delay(500));
        }

        const newUser: User = {
            id: Date.now().toString(),
            name: request.name,
            email: request.email,
            role: request.role,
            status: 'pending', // Pending until email confirmation
            createdAt: new Date()
        };

        const updatedUsers = [...this.currentUsers, newUser];
        this.usersSubject.next(updatedUsers);

        console.log('Usuario creado (Mock):', newUser);
        console.log('Email de confirmación enviado a:', request.email);

        return of({
            success: true,
            message: `Usuario creado exitosamente. Se ha enviado un email de confirmación a ${request.email}`,
            user: newUser
        }).pipe(delay(300));
    }

    updateUser(id: string, request: UpdateUserRequest): Observable<UserOperationResponse> {
        const userIndex = this.currentUsers.findIndex(u => u.id === id);

        if (userIndex === -1) {
            return of({
                success: false,
                message: 'Usuario no encontrado'
            }).pipe(delay(500));
        }

        // Check email uniqueness if email is being updated
        if (request.email && !this.isEmailUnique(request.email, id)) {
            return of({
                success: false,
                message: 'El email ya está registrado en el sistema'
            }).pipe(delay(500));
        }

        const updatedUser: User = {
            ...this.currentUsers[userIndex],
            ...request
        };

        const updatedUsers = [...this.currentUsers];
        updatedUsers[userIndex] = updatedUser;
        this.usersSubject.next(updatedUsers);

        console.log('Usuario actualizado (Mock):', updatedUser);

        return of({
            success: true,
            message: 'Usuario actualizado exitosamente',
            user: updatedUser
        }).pipe(delay(300));
    }

    deleteUser(id: string): Observable<UserOperationResponse> {
        const user = this.getUserById(id);

        if (!user) {
            return of({
                success: false,
                message: 'Usuario no encontrado'
            }).pipe(delay(500));
        }

        // Prevent deleting self
        const currentUser = this.authService.getUser();
        if (currentUser && currentUser.id === id) {
            return of({
                success: false,
                message: 'No puedes eliminar tu propia cuenta'
            }).pipe(delay(500));
        }

        const updatedUsers = this.currentUsers.filter(u => u.id !== id);
        this.usersSubject.next(updatedUsers);

        console.log('Usuario eliminado (Mock):', user);

        return of({
            success: true,
            message: 'Usuario eliminado exitosamente'
        }).pipe(delay(300));
    }

    changePassword(request: ChangePasswordRequest): Observable<UserOperationResponse> {
        // Validate current password (mock - accept "password123" as current)
        if (request.currentPassword !== 'password123') {
            return of({
                success: false,
                message: 'La contraseña actual es incorrecta'
            }).pipe(delay(500));
        }

        // Validate passwords match
        if (request.newPassword !== request.confirmPassword) {
            return of({
                success: false,
                message: 'Las contraseñas nuevas no coinciden'
            }).pipe(delay(500));
        }

        // Validate minimum length
        if (request.newPassword.length < 6) {
            return of({
                success: false,
                message: 'La nueva contraseña debe tener al menos 6 caracteres'
            }).pipe(delay(500));
        }

        console.log('Contraseña cambiada (Mock)');
        console.log('Email de notificación enviado a:', this.authService.getUser()?.email);

        return of({
            success: true,
            message: 'Contraseña actualizada exitosamente. Se ha enviado un email de confirmación.'
        }).pipe(delay(300));
    }
}
