import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loginUrl = 'http://localhost:8080/user/login';
  private logoutUrl = 'http://localhost:8080/user/logout';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(this.loginUrl, {
      email,
      password,
    });
  }
  setToken(token: string) {
    localStorage.setItem('token', token);
  }
  getToken(): string | null {
    return localStorage.getItem('token');
  }
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
 removeToken() {
    localStorage.removeItem('token');
  }

logout(): Observable<void> {
  //localStorage.removeItem('token');
  return this.http.post<void>(this.logoutUrl, {}, {
    withCredentials: true
  });
}
}
