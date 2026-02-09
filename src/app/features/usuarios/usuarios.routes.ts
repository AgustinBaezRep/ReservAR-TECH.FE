import { Routes } from '@angular/router';

import { MainLayoutComponent } from '../../layout/main-layout/main-layout.component';
import { adminGuard } from '../../core/guards/admin.guard';

export const USUARIOS_ROUTES: Routes = [
    {
        path: '',
        component: MainLayoutComponent,
        canActivate: [adminGuard],
        children: [
            {
                path: '',
                loadComponent: () => import('./pages/usuarios-page/usuarios-page.component').then(m => m.UsuariosPageComponent)
            }
        ]
    }
];
