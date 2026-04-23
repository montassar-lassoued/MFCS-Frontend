import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, ActivatedRoute } from '@angular/router';
import { MenuService, BrowserMenu } from '../menu/menu.service';
import { MenuComponent } from '../menu/menu.component';
import { DataService } from '../services/data.service';
import { MatDialogModule } from '@angular/material/dialog';
import { ViewActionsComponent } from '../view_action/view-action.component';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MenuComponent,MatDialogModule, ViewActionsComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  menues: BrowserMenu[] = [];
  errorMessage: string | null = null;
  userMenuOpen = false;

  constructor(
    private menuService: MenuService,
    private dataService: DataService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.menuService.getMenu().subscribe({
      next: (m) => {
        this.menues = m;

        // Prüfen, ob ein Menü über URL aufgerufen wurde (Child-Route)
        const childRoute = this.route.firstChild;
        const menuID = childRoute?.snapshot.paramMap.get('menuName');
        console.log('menu:', menuID);

        if (menuID) {
          const menuItem = this.findMenuByID(menuID);
          if (menuItem) {
            this.loadMenu(menuItem);
          }
        }
      },
      error: (err) => {
        console.error('Error loading menu:', err);
        this.errorMessage = 'Menü konnte nicht geladen werden.';
      },
    });
  }

  onMenuClick(m: BrowserMenu) {
    this.loadMenu(m);
  }

  private findMenuByID(menuID: string): BrowserMenu | undefined {
    const flatMenus = this.flattenMenus(this.menues);
    return flatMenus.find((m) => m.id === menuID);
  }

  private flattenMenus(menus: BrowserMenu[]): BrowserMenu[] {
    return menus.reduce<BrowserMenu[]>((acc, m) => {
      acc.push(m);
      if (m.children?.length) acc.push(...this.flattenMenus(m.children));
      return acc;
    }, []);
  }

  private loadMenu(m: BrowserMenu) {
    this.menuService.callMenu(m.id).subscribe((data) => {
      this.dataService.setData(data);
      console.log('HOME - LeadMenü: ', m);
      switch (m.viewTyp) {
        case 'Table':
          this.router.navigate(['home', 'table', m.id]);
          break;
        case 'Card':
          this.router.navigate(['home', 'card', m.id]);
          break;
        case 'Visualization':
           this.router.navigate(['home', 'visualization', m.id]);
           break;
      }
    });
  }


  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
  }

  changeLanguage(lang: string) {
    console.log('Sprache ändern:', lang);
    this.userMenuOpen = false;
    // Hier Logik zum Ändern der Sprache
  }


logout() {
  this.userMenuOpen = false;
  this.authService.logout().subscribe(() => {
    console.log('logout()--');
    this.router.navigate(['/login']);
  });
this.authService.removeToken();
}
}
