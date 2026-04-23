import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export type DialogIcon = 'success' | 'error' | 'warning' | 'info' | 'question';

@Component({
  selector: 'app-message-box',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './message-box.component.html',
  styleUrl: './message-box.component.css',
})
export class MessageBoxComponent {
  iconMap: Record<DialogIcon, string> = {
    info: 'info',
    success: 'check_circle',
    warning: 'warning',
    error: 'error',
    question: 'help',
  };

  constructor(
    private dialogRef: MatDialogRef<MessageBoxComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      message: string;
      icon: DialogIcon;
      showCancel: boolean;
    },
  ) {}

  close(result: boolean) {
    this.dialogRef.close(result);
  }
}
