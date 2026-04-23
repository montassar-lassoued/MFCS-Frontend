import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './guard/auth.guard';
import { TableComponent } from './table/table.component';
import { CardComponent } from './card/card.component';
import { MenuResolver } from './menu/menu.resolver';
import { TableDetailsComponent } from './subView/table-details/table-details.component';
import { VisuViewerComponent } from './visu-viewer/visu-viewer.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard],
    resolve: { menues: MenuResolver },
    children: [
      {
        path: 'table/:menuName',
        component: TableComponent,
        children: [
          {
            path: ':id',
            component: TableDetailsComponent, // SubView
          },
        ],
      },
      { path: 'card/:menuName', component: CardComponent },
      { path: 'visualization/:menuName', component: VisuViewerComponent },
    ],
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
