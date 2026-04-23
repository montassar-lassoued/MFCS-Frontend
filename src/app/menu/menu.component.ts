import { Component, Output, Input, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BrowserMenu } from './menu.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
  // Das sorgt dafür, dass das Menü nur neu gerendert wird,
  // wenn sich die Referenz von [menues] ändert.
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuComponent {
  @Input() menues: BrowserMenu[] = [];
  @Output() menuClick = new EventEmitter<BrowserMenu>();

  toggle(m: BrowserMenu) {
    // Da wir OnPush nutzen, triggern wir die Änderung
    // durch eine einfache Zuweisung.
    m.expanded = !m.expanded;
  }

  onItemClick(item: BrowserMenu, event: Event) {
    event.stopPropagation(); // Wichtig, um das Parent-Toggle zu verhindern
    this.menuClick.emit(item);
  }
}
