import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { MenuService, BrowserMenu } from './menu.service';
import { Observable, catchError, of } from 'rxjs';

export const menuResolver: ResolveFn<BrowserMenu[]> = (): Observable<BrowserMenu[]> => {
  const menuService = inject(MenuService);

  return menuService.getMenu().pipe(
    catchError((error) => {
      console.error('Fehler beim Laden des Menüs:', error);
      // Im Fehlerfall geben wir ein leeres Array zurück,
      // damit die App nicht stehen bleibt (OnPush/@empty Support)
      return of([]);
    })
  );
};
