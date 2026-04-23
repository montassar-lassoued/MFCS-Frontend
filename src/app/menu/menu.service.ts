import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface BrowserMenu {
  id: string;
  name: string;
  color: string;
  menuTyp: string;
  viewTyp: string;
  children?: BrowserMenu[];
  expanded?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  private http = inject(HttpClient); // Modernes inject() statt Constructor
  private apiUrl = 'http://localhost:8080/home/menu';

  getMenu(): Observable<BrowserMenu[]> {
    return this.http.get<BrowserMenu[]>(this.apiUrl);
  }

  callMenu(menuID: string): Observable<any> {
    const cleaned = menuID.startsWith('/') ? menuID.substring(1) : menuID;
    return this.http.get(`${this.apiUrl}/${cleaned}`);
  }
}
