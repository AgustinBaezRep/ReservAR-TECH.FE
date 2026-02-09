import { Routes } from '@angular/router';
import { MainLayoutComponent } from '../../layout/main-layout/main-layout.component';
import { authGuard } from '../../core/guards/auth.guard';

export const CAJA_ROUTES: Routes = [
    {
        path: '',
        component: MainLayoutComponent,
        canActivate: [authGuard],
        children: [
            {
                path: '',
                loadComponent: () => import('./pages/caja-page/caja-page.component').then(m => m.CajaPageComponent)
            }
        ]
    }
];
