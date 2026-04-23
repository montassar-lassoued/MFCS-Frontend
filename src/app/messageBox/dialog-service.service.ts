import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  MessageBoxComponent,
  DialogIcon,
} from '../messageBox/message-box.component';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DialogService {
  constructor(private dialog: MatDialog) {}

  async showMessage(
    title: string,
    message: string,
    icon: DialogIcon,
    showCancel: boolean,
  ): Promise<boolean> {
    const dialogRef = this.dialog.open(MessageBoxComponent, {
      width: '400px',
      data: { title, message, icon, showCancel },
      disableClose: true,
    });

    return await firstValueFrom(dialogRef.afterClosed());
  }
}
