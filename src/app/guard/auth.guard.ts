import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  canActivate(): boolean {
    const token = this.auth.getToken(); // prüft localStorage
    if (token) {
      console.log('in auth guard -> Token gefunden');
      return true;
    } else {
      console.log('in auth guard -> Token fehlt, navigiere zu login');
      this.router.navigate(['/login']);
      return false;
    }

    if (this.auth.isLoggedIn()) {
      console.log('in ath guard -> is Logged in');
      return true;
    } else {
      console.log('in ath guard -> navigiere zu login');
      this.router.navigate(['/login']);
      return false;
    }
  }
}
