import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
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
  //changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableComponent extends BaseViewComponent  {

  // Nur Tabellen-spezifische Getter oder Methoden
  get columns() {
    const currentData = this.data();
        // Prüfen, ob meta vorhanden ist (das sind deine Spaltendefinitionen)
        return currentData?.meta?.filter((m: any) => m.visible) || [];
  }

  // Falls du eine Methode überschrieben werden solls :
  // override handleMainAction(event: any) { ... }
}
