import { Component, OnInit, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, ActivatedRoute } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';

import { MenuService, BrowserMenu } from '../menu/menu.service';
import { MenuComponent } from '../menu/menu.component';
import { DataService } from '../services/data.service';
import { ViewActionsComponent } from '../view_action/view-action.component';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MenuComponent,
    MatDialogModule,
    ViewActionsComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  // Performance-Boost: Komponente wird nur bei Signal-Änderungen gerendert
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  private menuService = inject(MenuService);
  private dataService = inject(DataService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  // States als reaktive Signals
  menues = signal<BrowserMenu[]>([]);
  userMenuOpen = signal(false);
  errorMessage = signal<string | null>(null);

  ngOnInit() {
    // Daten aus dem Resolver beziehen statt neuem HTTP-Call
    const resolvedMenus = this.route.snapshot.data['menues'];

    if (resolvedMenus) {
      this.menues.set(resolvedMenus);
      this.checkInitialChildRoute();
    }
  }

  private checkInitialChildRoute() {
    const childRoute = this.route.firstChild;
    const menuID = childRoute?.snapshot.paramMap.get('menuName');

    if (menuID) {
      const menuItem = this.findMenuByID(menuID);
      if (menuItem) this.loadMenuDetails(menuItem);
    }
  }

  onMenuClick(m: BrowserMenu) {
    this.loadMenuDetails(m);
  }

  private loadMenuDetails(m: BrowserMenu) {
    this.menuService.callMenu(m.id).subscribe((data) => {
      this.dataService.setData(data);

      const routeMap: Record<string, string> = {
        'Table': 'table',
        'Card': 'card',
        'Visualization': 'visualization'
      };

      const target = routeMap[m.viewTyp];
      if (target) {
        this.router.navigate(['home', target, m.id]);
      }
    });
  }

  toggleUserMenu() {
    this.userMenuOpen.update(v => !v);
  }

  logout() {
    this.userMenuOpen.set(false);
    this.authService.logout().subscribe(() => {
      this.authService.removeToken();
      this.router.navigate(['/login']);
    });
  }

  changeLanguage(lang: string) {
    console.log('Sprache:', lang);
    this.userMenuOpen.set(false);
  }

  private findMenuByID(menuID: string): BrowserMenu | undefined {
    return this.flattenMenus(this.menues()).find((m) => m.id === menuID);
  }

  private flattenMenus(menus: BrowserMenu[]): BrowserMenu[] {
    return menus.reduce<BrowserMenu[]>((acc, m) => {
      acc.push(m);
      if (m.children?.length) acc.push(...this.flattenMenus(m.children));
      return acc;
    }, []);
  }
}
