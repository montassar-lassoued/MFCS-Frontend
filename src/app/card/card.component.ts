import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { TableMeta } from '../interface/field-Meta-definition';
import { ViewActionsComponent } from '../view_action/view-action.component';
import { BaseViewComponent } from '../base-view-table-card/base-view.component';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    ViewActionsComponent
  ],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css'],
  // Performance-Optimierung: Reagiert nur auf Signal-Änderungen
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardComponent extends BaseViewComponent {

  get cardColumns(): TableMeta[] {
      const currentData = this.data();
      if (!currentData || !currentData.meta) return [];
      return currentData.meta.filter((m: TableMeta) => m.visible);
    }

  // Beispiel für eine card-spezifische Methode, die in der Base nichts zu suchen hat
  getCardTitle(card: any): string {
    if (!this.cardColumns.length) return 'Kein Titel';
    // Nimmt den Wert der ersten definierten Spalte als Titel
    const firstCol = this.cardColumns[0].field;
    return card[firstCol] || 'Unbenannt';
  }
}
