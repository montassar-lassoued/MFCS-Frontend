import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

export interface ViewSingleCommand {
  menu: string;
  action: any;
  payload?: any; // Ein einzelnes Objekt
}

export interface ViewListCommand {
  menu: string;
  action: any;
  payload?: any[]; // Ein Array von Objekten
}

@Injectable({ providedIn: 'root' })
export class ViewActionService {
  private apiUrl_single = 'http://localhost:8080/api/action/single/execute';
  private apiUrl_list = 'http://localhost:8080/api/action/list/execute';
  private apiUrl_details = 'http://localhost:8080/api/action/details';

  constructor(private http: HttpClient) {}

  // Für Einzelaktionen (EDIT, OPEN, oder Single-DELETE)
  executeSingle(cmd: ViewSingleCommand): Observable<any> {
    return this.http.post(this.apiUrl_single, cmd, { responseType: 'text' });
  }

  // Für Massenaktionen (DELETE von mehreren, CONNECT, DISCONNECT)
  executeList(cmd: ViewListCommand): Observable<any> {
    return this.http.post(this.apiUrl_list, cmd, { responseType: 'text' });
  }

  getData(cmd: ViewSingleCommand): Observable<any> {
    return this.http.post(this.apiUrl_details, cmd, { responseType: 'text' });
  }
}
