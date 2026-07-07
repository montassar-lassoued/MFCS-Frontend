import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { FieldDefinition } from '../interface/field-Meta-definition';
import { ViewActionService } from '../services/view-action.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { DialogService } from '../messageBox/dialog-service.service';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatIconModule
  ],
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css'],
})
export class DialogComponent implements OnInit {
  form!: FormGroup;
  hide = true;


  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DialogComponent, string>,
    private viewActionService: ViewActionService,
    private snackBar: MatSnackBar, // Inject Snackbar
    private dialogService: DialogService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      menu: string;
      action: any;
      fields: FieldDefinition[];
      row: any;
    },
  ) {}

  ngOnInit(): void {
    // Falls fields als String kommt, parsen wir es hier
    if (typeof this.data.fields === 'string') {
        this.data.fields = JSON.parse(this.data.fields);
      }

    this.form = this.fb.group({});
    this.data?.fields?.forEach((field) => {

      const key = field.field.toUpperCase();
      let value = this.data.row?.[key] ?? field.meta.defaultValue ?? null;

       console.log('DialogComponent - Field:',key, ' Sichtbar', field.meta?.visible);
        if (!field.meta?.visible) {
          return;
        }

      if (field.meta.type === 'CHECKBOX') {
        value = !!value;
      }

      this.form.addControl(
        field.field,
        this.fb.control({ value, disabled: !field.meta.editable }),
      );
    });
  }

get Fields(): FieldDefinition[] {
  // Sicherstellen, dass fields existiert UND ein Array ist
  if (Array.isArray(this.data?.fields)) {
    return this.data.fields.filter((f: FieldDefinition) => f.meta?.visible);
  }

  console.error('fields ist kein Array:', this.data?.fields);
  return [];
}

 save(): void {
   if (this.form.valid) {
     const formData = this.form.getRawValue();
     const cmd = {
       menu: this.data.menu,
       action: this.data.action,
       payload: { ...formData, ID: this.data?.row?.ID },
     };

     this.viewActionService.executeSingle(cmd).subscribe({
       next: (res: any) => {
         // Dieser Zweig wird nur bei Status 200-299 ausgeführt
         this.snackBar.open('✓ Daten erfolgreich gespeichert!', 'Schließen', {
           duration: 4000,
           panelClass: ['success-snackbar'],
         });
         this.dialogRef.close('OK');
       },
       error: (err: any) => {

         const message = this.getServerErrorMessage(err);
         this.dialogService.showMessage(
                        'Fehler',
                        message, // Hier steht jetzt z.B. "Aktion für diesen Datensatz nicht erlaubt."
                        'error',
                        false
                      );
       }
     });
   }
 }

  cancel(): void {
    this.dialogRef.close('CANCEL');
  }
// für Passwörter
  mask(value: string): string {
      return value ? '•'.repeat(value.length) : '';
    }

   protected getServerErrorMessage(err: any): string {
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
