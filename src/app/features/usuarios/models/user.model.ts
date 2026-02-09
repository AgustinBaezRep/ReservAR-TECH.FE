import { UserRole } from '../../login/models/auth.model';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    status: 'active' | 'pending' | 'inactive';
    createdAt: Date;
}

export interface CreateUserRequest {
    name: string;
    email: string;
    role: UserRole;
}

export interface UpdateUserRequest {
    name?: string;
    email?: string;
    role?: UserRole;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword?: string;
}

export interface UserOperationResponse {
    success: boolean;
    message: string;
    user?: User;
}
