import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TableSelectionService {
  // Behält die aktuell ausgewählte Zeile
  private selectedRowSubject = new BehaviorSubject<any | null>(null);

  // Observable für alle Subscriber
  selectedRow$ = this.selectedRowSubject.asObservable();

  // Zeile auswählen
  selectRow(row: any) {
    this.selectedRowSubject.next(row);
  }

  // Auswahl löschen
  clear() {
    this.selectedRowSubject.next(null);
  }
}
