import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import type { OrderStatus } from '@shared/models/order.model';

const ESTADOS: OrderStatus[] = [
  'PENDIENTE',
  'EN_PROCESO',
  'COMPLETADO',
  'CANCELADO',
];

export interface OrdersChangeStatusData {
  codigo: string;
  id: number;
  estadoActual: OrderStatus;
}

@Component({
  selector: 'app-orders-change-status',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule,
  ],
  template: `
    <h2 mat-dialog-title>Cambiar Estado del Pedido</h2>
    <mat-dialog-content>
      <p class="mb-2">Orden <strong>{{ data.codigo }}</strong></p>
      <p class="mb-3">Estado actual: <strong>{{ data.estadoActual }}</strong></p>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Nuevo estado</mat-label>
        <mat-select [(ngModel)]="nuevoEstado" name="estado">
          @for (e of estados; track e) {
            <mat-option [value]="e" [disabled]="e === data.estadoActual">{{ e }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="primary" [mat-dialog-close]="nuevoEstado" [disabled]="!nuevoEstado || nuevoEstado === data.estadoActual">
        Guardar
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .mb-2 { margin-bottom: 0.5rem; }
      .mb-3 { margin-bottom: 1rem; }
      .full-width { width: 100%; min-width: 200px; }
    `,
  ],
})
export class OrdersChangeStatusComponent {
  estados = ESTADOS;
  nuevoEstado: OrderStatus | null = null;

  constructor(
    public ref: MatDialogRef<OrdersChangeStatusComponent>,
    @Inject(MAT_DIALOG_DATA) public data: OrdersChangeStatusData
  ) {}
}
