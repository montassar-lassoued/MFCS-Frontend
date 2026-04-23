import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MenuService } from '../menu/menu.service';
import { DataService } from '../services/data.service';
import { ViewActionService } from '../services/view-action.service';
import { DialogComponent } from '../dialog/dialog.component';

@Component({ template: '' })
export abstract class BaseViewComponent implements OnInit {
  // Shared Services per Inject (spart Boilerplate in Subklassen)
  protected route = inject(ActivatedRoute);
  protected router = inject(Router);
  protected menuService = inject(MenuService);
  protected dataService = inject(DataService);
  protected viewActionService = inject(ViewActionService);
  protected dialog = inject(MatDialog);

  // Gemeinsame States
  menuName = '';
  data = signal<any>({ rows: [] });
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.menuName = params.get('menuName') || '';
      this.loadData();
    });
  }

  protected loadData(): void {
    this.menuService.callMenu(this.menuName).subscribe({
      next: (res) => {
        this.data.set(res);
        this.dataService.setData(res);
      },
      error: (err) => this.errorMessage.set(this.getServerErrorMessage(err))
    });
  }

  // Gemeinsame Dialog-Logik
  openDialog(action: any, payload: any): void {
    this.viewActionService.getData({ menu: this.menuName, action, payload }).subscribe(definition => {
      const dialogRef = this.dialog.open(DialogComponent, {
        data: { menu: this.menuName, action, fields: definition, row: payload }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result === 'OK') this.loadData();
      });
    });
  }

  protected getServerErrorMessage(err: any): string {
    if (err.status === 200) return 'OK';
    return err.error || 'Ein Fehler ist aufgetreten';
  }

  /* setzt / nimmt weg, alle Häkchen in der Tabelle  */
    toggleAll(event: MatCheckboxChange): void {
      const checked = event.checked;
      this.data.rows.forEach((r: any) => (r._selected = checked));
    }

    getSelectRows(): any[] {
      const selectedRows: any[] = [];
      this.data.rows.forEach((r: any) => {
        if (r._selected === true) {
          const { actions, ...rest } = r; // actions ausschließen
          selectedRows.push(rest);
        }
      });
      return selectedRows;
    }
   /* Main-Aktionen: Kommen von der Toolbar oben (betreffen meist Selektion) */
   async handleMainAction(action: any) {
     const selectedRows = this.getSelectRows();
     console.log('handleMainAction: ', action.id, selectedRows);

     const actionHandlers: Record<string, () => void> = {
       CREATE: () => this.handleCreateAction(action, null),
       // EDIT & OPEN brauchen zwingend ein einzelnes Objekt
       EDIT: () => this.handleEditAction(action, selectedRows),
       OPEN: () => this.handleViewAction(action, selectedRows),
       // DELETE, CONNECT, DISCONNECT sind Listen-Operationen
       DELETE: () => this.executeAsList(action, selectedRows, true), // mit Bestätigung
       CONNECT: () => this.executeAsList(action, selectedRows),
       DISCONNECT: () => this.executeAsList(action, selectedRows),
       CUSTOM: () => this.executeAsList(action, selectedRows),
     };

     const handler = actionHandlers[action.id] || (() => this.handleUnknownAction(action.id));
     handler();
   }

    /* Details-Aktionen die in jeder Zeile in der Tabelle sich befinden werden hier abgefangen */
    async handleDetailsAction(action: any, row: any) {
      const actionHandlers: Record<string, () => void> = {
        CREATE: () => this.handleCreateAction(action, row),
        EDIT: () => this.handleEditAction(action, row),
        OPEN: () => this.handleViewAction(action, row),
        DELETE: () => this.executeAsSingle(action, row, true),
        CONNECT: () => this.executeAsSingle(action, row),
        DISCONNECT: () => this.executeAsSingle(action, row),
        CUSTOM: () => this.executeAsSingle(action, row),
      };
      const handler = actionHandlers[action.id];

      if (!handler) {
        this.handleUnknownAction(action.id);
        return;
      }

      handler();
    }

    async handleCreateAction(action: any, selectedRow: any) {
      this.openDialog(action, selectedRow);
    }

    async handleEditAction(action: any, selectedRow: any) {
      if (!(await this.oneRowIsSelected(selectedRow))) {
        return;
      }
      this.openDialog(action, selectedRow);
    }

    async handleViewAction(action: any, selectedRow: any) {
      if (!(await this.oneRowIsSelected(selectedRow))) {
        return;
      }
      // SUBVIEW-> Toggle: gleicher Row → schließen
      this.selectedRow = this.selectedRow === selectedRow ? null : selectedRow;
    }

  /**
   * Hilfsmethode für Listen-Aktionen (Backend: handleListRequest)
   */
  async executeAsList(action: any, rows: any[], askConfirmation = false) {
    if (!(await this.rowsSelected(rows))) return;
    if (askConfirmation && !(await this.confirmed())) return;

    const cmd: ViewListCommand = {
      menu: this.menuName,
      action: action,
      payload: rows
    };

    this.viewActionService.executeList(cmd).subscribe({
      next: (res: any) => {
            // Erfolgspfad
            if (res === 'OK') {
              this.loadData();
            } else {
              // Falls Backend 200 OK schickt, aber im Body "ERROR" steht
              this.dialogService.showMessage('Info', 'Aktion nicht erlaubt (Berechtigungsfehler).', 'error', false);
            }
          },
          error: async (err: HttpErrorResponse) => {
            // FEHLERPFAD: Hier rufen wir die neue Methode auf
            const message = this.getServerErrorMessage(err);

            await this.dialogService.showMessage(
              'Fehler',
              message, // Hier steht jetzt z.B. "Aktion für diesen Datensatz nicht erlaubt."
              'error',
              false
            );
          }
    });
  }

  /**
   * Hilfsmethode für Einzel-Aktionen (Backend: handleSingleRequest)
   */
  async executeAsSingle(action: any, row: any, askConfirmation = false) {
    if (!(await this.rowsSelected(row ? [row] : []))) return;
    if (askConfirmation && !(await this.confirmed())) return;

    const cmd: ViewSingleCommand = {
      menu: this.menuName,
      action: action,
      payload: row
    };

    this.viewActionService.executeSingle(cmd).subscribe({
     next: (res: any) => {
           // Erfolgspfad
           if (res === 'OK') {
             this.loadData();
           } else {
             // Falls Backend 200 OK schickt, aber im Body "ERROR" steht
             this.dialogService.showMessage('Info', 'Aktion nicht erlaubt (Berechtigungsfehler).', 'error', false);
           }
         },
         error: async (err: HttpErrorResponse) => {
           // FEHLERPFAD: Hier rufen wir die neue Methode auf
           const message = this.getServerErrorMessage(err);

           await this.dialogService.showMessage(
             'Fehler',
             message, // Hier steht jetzt z.B. "Aktion für diesen Datensatz nicht erlaubt."
             'error',
             false
           );
         }
    });
  }


    async handleUnknownAction(action: any) {
      await this.dialogService.showMessage(
        'Error',
        'Unbekannte Aktion: ' + `${action}`,
        'error',
        true,
      );
    }

    async rowsSelected(selected: any): Promise<boolean> {
      if (selected.length < 1) {
        const confirmed = await this.dialogService.showMessage(
          'Info',
          'Es sind Keine Daten ausgewählt!',
          'error',
          false,
        );

        return false;
      }
      return true;
    }

    async confirmed(): Promise<boolean> {
      return await this.dialogService.showMessage(
        'Info',
        'Datensatz endgültig löschen?',
        'question',
        true,
      );
    }

    async oneRowIsSelected(selected: any): Promise<boolean> {
      if (selected.length > 1 || selected.length < 1) {
        let message: string;
        if (selected.length > 1) {
          message = 'Bitte nur einen Datensatz auswählen!';
        } else {
          message = 'Bitte einen Datensatz auswählen!';
        }
        const confirmed = await this.dialogService.showMessage(
          'Info',
          message,
          'error',
          false,
        );

        return false;
      }
      return true;
    }

    //****************DIALOG************* */
    openDialog(action: any, card: any): void {
      console.log('Card -> openDialog', JSON.stringify(card));
      this.viewActionService
        .getData({
          menu: this.menuName,
          action: action,
          payload: card,
        })
        .subscribe((definition) => {
          console.log('definition -> openDialog', JSON.stringify(definition));
          const dialogRef: MatDialogRef<DialogComponent, string> =
            this.dialog.open(DialogComponent, {
              data: {
                menu: this.menuName,
                action: action,
                fields: definition, // JSON-Struktur
                row: card, // vor-gelieferte Daten
              },
            });
          dialogRef.afterClosed().subscribe((result) => {
            if (result === 'OK') {
              this.loadData();
            }
          });
        });
    }


  private getServerErrorMessage(err: any): string {
    if (err.status === 200 && err.name === 'HttpErrorResponse') {
      return 'OK'; // Wir behandeln den Parsing-Fehler von "OK" als Erfolg
    }

    if (typeof err.error === 'string' && err.error.length > 0) {
      return err.error;
    }

    switch (err.status) {
      case 403: return 'Aktion nicht erlaubt (Berechtigungsfehler).';
      case 500: return 'Interner Serverfehler.';
      case 0:   return 'Server nicht erreichbar.';
      default:  return `Fehler (${err.status}): ${err.statusText || 'Unbekannt'}`;
    }
  }
}
