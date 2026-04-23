import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { MenuService, BrowserMenu } from './menu.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
})
export class MenuComponent {
  @Input() menues: BrowserMenu[] = [];
  @Output() menuClick = new EventEmitter<BrowserMenu>();

  toggle(m: BrowserMenu) {
    m.expanded = !m.expanded;
  }

  onItemClick(item: BrowserMenu, event: Event) {
    event.stopPropagation();
    this.menuClick.emit(item);
  }
}
