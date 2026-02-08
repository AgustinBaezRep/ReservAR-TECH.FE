import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'reservas',
    loadChildren: () => import('./features/reservas/reservas.routes').then(m => m.RESERVAS_ROUTES)
  },
  {
    path: 'player',
    loadChildren: () => import('./features/player/player.routes').then(m => m.PLAYER_ROUTES)
  },
  {
    path: 'login',
    loadChildren: () => import('./features/login/login.routes').then(m => m.LOGIN_ROUTES)
  },
  {
    path: 'complejos',
    loadChildren: () => import('./features/complejos/complejos.routes').then(m => m.COMPLEJOS_ROUTES)
  },
  {
    path: 'caja',
    loadChildren: () => import('./features/caja/caja.routes').then(m => m.CAJA_ROUTES)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/login/pages/forgot-password-page/forgot-password-page.component').then(m => m.ForgotPasswordPageComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./features/login/pages/reset-password-page/reset-password-page.component').then(m => m.ResetPasswordPageComponent)
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

