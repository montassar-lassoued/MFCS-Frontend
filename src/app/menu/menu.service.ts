import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
//import { MenuItem } from './menu-item.model';

export interface BrowserMenu {
  id: string;
  name: string;
  color: string;
  menuTyp: string;
  viewTyp: string;
  children?: BrowserMenu[];
  expanded?: boolean; // für Frontend
}

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  private apiUrl = 'http://localhost:8080/home/menu'; // Spring Boot Endpoint

  constructor(private http: HttpClient) {}

  getMenu(): Observable<BrowserMenu[]> {
    console.log('menu.service getMenu');

    return this.http.get<BrowserMenu[]>(this.apiUrl);
  }
  callMenu(menuID: string): Observable<any> {
    if (!menuID) {
      throw new Error('callMenu: URL ist undefined oder leer');
    }

    const cleaned = menuID.startsWith('/') ? menuID.substring(1) : menuID;

    console.log('MenuService - callMenu - GET:', `${this.apiUrl}/${cleaned}`);

    return this.http.get(`${this.apiUrl}/${cleaned}`);
  }
}
