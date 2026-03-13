import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface OrdersConfirmCancelData {
  codigo: string;
  id: number;
}

@Component({
  selector: 'app-orders-confirm-cancel',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Cancelar orden</h2>
    <mat-dialog-content>
      <p>¿Está seguro que desea cancelar la orden <strong>{{ data.codigo }}</strong>?</p>
      <p class="text-warn">Esta acción no se puede deshacer.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>No</button>
      <button mat-raised-button color="warn" [mat-dialog-close]="true">Sí, cancelar orden</button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .text-warn {
        color: #f44336;
        font-size: 0.9rem;
      }
    `,
  ],
})
export class OrdersConfirmCancelComponent {
  constructor(
    public ref: MatDialogRef<OrdersConfirmCancelComponent>,
    @Inject(MAT_DIALOG_DATA) public data: OrdersConfirmCancelData
  ) {}
}
