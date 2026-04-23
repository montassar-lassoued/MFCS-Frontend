import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { MenuService, BrowserMenu } from './menu.service';

@Injectable({ providedIn: 'root' })
export class MenuResolver implements Resolve<BrowserMenu[]> {
  constructor(private menuService: MenuService) {}

  resolve(): Observable<BrowserMenu[]> {
    return this.menuService.getMenu();
  }
}
