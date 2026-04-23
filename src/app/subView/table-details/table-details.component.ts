import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { MatIconModule } from '@angular/material/icon'; // Neu für moderne Optik

@Component({
  selector: 'app-table-details',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './table-details.component.html',
  styleUrls: ['./table-details.component.css'],
  animations: [
    trigger('slideDown', [
      transition(':enter', [
        style({ height: 0, opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ height: '*', opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ height: 0, opacity: 0, transform: 'translateY(20px)' }))
      ]),
    ]),
  ],
})
export class TableDetailsComponent implements OnChanges {
  @Input() row!: any;
  fields: { key: string; value: any; isBool: boolean }[] = [];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['row'] && this.row) {
      this.fields = Object.keys(this.row)
        .filter((key) => !key.startsWith('_') && key !== 'actions') // Filtert interne Felder
        .map((key) => ({
          key,
          value: this.row[key],
          isBool: typeof this.row[key] === 'boolean' // Check für Icon-Darstellung
        }));
    }
  }
}
