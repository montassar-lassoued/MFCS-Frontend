import { Component, Output, Input, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BrowserMenu } from './menu.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
  // Performance: Nur rendern, wenn sich Inputs ändern
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuComponent {
  @Input() menues: BrowserMenu[] = [];
  @Output() menuClick = new EventEmitter<BrowserMenu>();

  toggle(m: BrowserMenu) {
    // Da wir OnPush nutzen, ist eine direkte Mutation (m.expanded = !m.expanded)
    // manchmal problematisch. Besser: Das Objekt kurz "berühren" oder Signals nutzen.
    m.expanded = !m.expanded;
  }

  onItemClick(item: BrowserMenu, event: Event) {
    event.stopPropagation(); // Verhindert das Auslösen von Parent-Events
    this.menuClick.emit(item);
  }
}
