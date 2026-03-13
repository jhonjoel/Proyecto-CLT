import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-historial-json-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Payload JSON - Comando #{{ data.commandId }}</h2>
    <mat-dialog-content>
      <pre class="json-content">{{ jsonStr }}</pre>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-raised-button color="primary" mat-dialog-close>Cerrar</button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .json-content {
        background: #1e1e1e;
        color: #d4d4d4;
        padding: 1rem;
        border-radius: 6px;
        font-size: 12px;
        max-height: 60vh;
        overflow: auto;
        margin: 0;
      }
    `,
  ],
})
export class HistorialJsonDialogComponent {
  jsonStr: string;

  constructor(
    public ref: MatDialogRef<HistorialJsonDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { commandId: number; payload: Record<string, unknown> }
  ) {
    this.jsonStr =
      Object.keys(data.payload || {}).length > 0
        ? JSON.stringify(data.payload, null, 2)
        : '{}';
  }
}
