import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// Die Logik-Zentrale
import { BaseViewComponent } from '../base-view-table-card/base-view.component';
import { ViewActionsComponent } from '../view_action/view-action.component';
import { TableDetailsComponent } from '../subView/table-details/table-details.component';

@Component({
  selector: 'app-table',
  standalone: true,
  // Diese Imports sind weiterhin nötig für das HTML!
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    ViewActionsComponent,
    TableDetailsComponent
  ],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableComponent extends BaseViewComponent {
  // KEIN Konstruktor nötig
  // KEIN inject() für MenuService etc. nötig (kommt aus BaseViewComponent)

  // Nur Tabellen-spezifische Getter oder Methoden
  get columns() {
    return this.data().columns || [];
  }

  // Falls du eine Methode überschrieben werden solls :
  // override handleMainAction(event: any) { ... }
}
