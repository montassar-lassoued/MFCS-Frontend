// data.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class DataService {
  private dataSubject = new BehaviorSubject<any[]>([]);
  data$: Observable<any[]> = this.dataSubject.asObservable();
  //private apiUrl = 'http://localhost:8080/home/menu'; // Spring Boot Endpoint
  constructor(private http: HttpClient) {}

  setData(data: any[]) {
    this.dataSubject.next(data);
  }
}
