
import { Routes } from '@angular/router';
import { PlayerLayoutComponent } from './layouts/player-layout/player-layout';

export const PLAYER_ROUTES: Routes = [
    {
        path: '',
        component: PlayerLayoutComponent,
        children: [
            {
                path: '',
                loadComponent: () => import('./pages/marketplace-page/marketplace-page').then(m => m.MarketplacePageComponent)
            },
            {
                path: ':id',
                loadComponent: () => import('./pages/complex-detail-page/complex-detail-page').then(m => m.ComplexDetailPageComponent)
            }
        ]
    }
];
