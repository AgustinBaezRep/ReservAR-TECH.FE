import { Routes } from '@angular/router';

import { MainLayoutComponent } from '../../layout/main-layout/main-layout.component';

export const COMPLEJOS_ROUTES: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/complejos-page/complejos-page.component').then(m => m.ComplejosPageComponent)
      }
    ]
  }
];
