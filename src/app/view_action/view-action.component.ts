import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-view-actions',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './view-action.component.html',
  styleUrls: ['./view-action.component.css'],
})
export class ViewActionsComponent {
  @Input() actions: any[] | null = [];
  @Output() actionClick = new EventEmitter<any>();

  onClick(action: any) {
    this.actionClick.emit(action);
  }
}
