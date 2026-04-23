import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-table-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table-details.component.html',
  styleUrls: ['./table-details.component.css'],
  animations: [
    trigger('slideDown', [
      transition(':enter', [
        style({
          height: 0,
          opacity: 0,
          overflow: 'hidden',
        }),
        animate(
          '250ms ease-out',
          style({
            height: '*',
            opacity: 1,
          }),
        ),
      ]),
      transition(':leave', [
        style({
          overflow: 'hidden',
        }),
        animate(
          '200ms ease-in',
          style({
            height: 0,
            opacity: 0,
          }),
        ),
      ]),
    ]),
  ],
})
export class TableDetailsComponent implements OnChanges {
  @Input() row!: any;

  fields: { key: string; value: any }[] = [];

  ngOnChanges() {
    if (!this.row) {
      this.fields = [];
      return;
    }

    this.fields = Object.keys(this.row)
      .filter((key) => key !== 'actions' && key !== '_selected')
      .map((key) => ({
        key,
        value: this.row[key],
      }));
  }
}
