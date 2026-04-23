import { Routes } from '@angular/router';
import { AuthGuard } from './guard/auth.guard';
import { MenuResolver } from './menu/menu.resolver';

export const routes: Routes = [
  {
    path: 'login',
    // Login wird meistens als Erstes gebraucht, aber Lazy Loading schadet nie
    loadComponent: () =>
      import('./login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./home/home.component').then(m => m.HomeComponent),
    canActivate: [AuthGuard],
    resolve: { menues: MenuResolver },
    children: [
      {
        path: 'table/:menuName',
        loadComponent: () =>
          import('./table/table.component').then(m => m.TableComponent),
        children: [
          {
            path: ':id',
            loadComponent: () =>
              import('./subView/table-details/table-details.component').then(m => m.TableDetailsComponent),
          },
        ],
      },
      {
        path: 'card/:menuName',
        loadComponent: () =>
          import('./card/card.component').then(m => m.CardComponent)
      },
      {
        path: 'visualization/:menuName',
        loadComponent: () =>
          import('./visu-viewer/visu-viewer.component').then(m => m.VisuViewerComponent)
      },
    ],
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  // Ein Catch-all für 404 Fehler
  {
    path: '**',
    redirectTo: 'login'
  }
];
