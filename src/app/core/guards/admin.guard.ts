import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../features/login/services/auth.service';
import { UserRole } from '../../features/login/models/auth.model';

export const adminGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // First check if authenticated
    if (!authService.isAuthenticated()) {
        return router.createUrlTree(['/login'], {
            queryParams: { returnUrl: state.url }
        });
    }

    // Then check if user has admin role
    const user = authService.getUser();
    if (user && user.role === UserRole.ADMIN) {
        return true;
    }

    // Redirect to access-denied page if authenticated but not admin
    console.warn('Access denied: Admin role required');
    return router.createUrlTree(['/access-denied']);

};
