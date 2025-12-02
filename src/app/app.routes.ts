import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'reservas',
    loadChildren: () => import('./features/reservas/reservas.routes').then(m => m.RESERVAS_ROUTES)
  },
  {
    path: 'login',
    loadChildren: () => import('./features/login/login.routes').then(m => m.LOGIN_ROUTES)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];

