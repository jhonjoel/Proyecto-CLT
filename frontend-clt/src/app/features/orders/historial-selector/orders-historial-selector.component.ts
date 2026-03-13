import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../core/services/order.service';
import type { Order, OrderPage } from '@shared/models/order.model';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-orders-historial-selector',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    FormsModule,
    BreadcrumbComponent,
  ],
  template: `
    <section class="content">
      <div class="content-block">
        <div class="block-header">
          <app-breadcrumb
            title="Historial de Comandos - OMS"
            [items]="['Órdenes']"
            active_item="Seleccionar pedido"
          />
          <a mat-stroked-button routerLink="/orders">Volver a lista</a>
        </div>

        <div class="oms-historial-selector-card">
          <h2>Ver historial de comandos</h2>
          <p class="oms-selector-desc">
            Seleccione un pedido para ver su historial de comandos (acciones CREATE_ORDER, UPDATE_STATUS, CANCEL_ORDER, etc.).
          </p>

          @if (loading()) {
            <mat-spinner diameter="40" class="center-spinner"></mat-spinner>
          } @else {
            <mat-form-field appearance="outline" class="full-width oms-search-field">
              <mat-label>Buscar por código, cliente o estado</mat-label>
              <input
                matInput
                [ngModel]="searchText()"
                (ngModelChange)="searchText.set($event)"
                placeholder="Ej: ORD-2026, Grupo Maehara, PENDIENTE"
              />
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Pedido</mat-label>
              <mat-select [(ngModel)]="selectedOrderId" (selectionChange)="onOrderSelected()">
                <mat-option [value]="null">-- Seleccione un pedido --</mat-option>
                @for (o of filteredOrders(); track o.id) {
                  <mat-option [value]="o.id">
                    #{{ o.codigo }} - {{ o.clienteNombre }} ({{ o.estado }})
                  </mat-option>
                }
                @empty {
                  <mat-option [value]="null" disabled>Sin coincidencias</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <div class="oms-selector-actions">
              <button
                mat-raised-button
                color="primary"
                [disabled]="!selectedOrderId"
                (click)="verHistorial()"
              >
                Ver historial de comandos
              </button>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .oms-historial-selector-card {
        max-width: 560px;
        padding: 1.5rem;
        background: var(--card-bg, #fff);
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }
      .oms-historial-selector-card h2 {
        margin: 0 0 0.5rem;
        font-size: 1.25rem;
      }
      .oms-selector-desc {
        margin: 0 0 1.5rem;
        color: var(--text-muted, #666);
        font-size: 0.95rem;
      }
      .full-width {
        width: 100%;
      }
      .oms-search-field {
        margin-bottom: 0.5rem;
      }
      .oms-selector-actions {
        margin-top: 1rem;
      }
      .center-spinner {
        margin: 2rem auto;
        display: block;
      }
    `,
  ],
})
export class OrdersHistorialSelectorComponent implements OnInit {
  orders = signal<Order[]>([]);
  selectedOrderId: number | null = null;
  loading = signal(false);
  searchText = signal<string>('');

  filteredOrders = computed(() => {
    const term = (this.searchText() ?? '').trim().toLowerCase();
    const list = this.orders();
    if (!term) return list;
    return list.filter(
      (o) =>
        (o.codigo ?? '').toLowerCase().includes(term) ||
        (o.clienteNombre ?? '').toLowerCase().includes(term) ||
        (o.estado ?? '').toLowerCase().includes(term)
    );
  });

  constructor(
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loading.set(true);
    this.orderService
      .getList({ page: 0, size: 100, sort: 'fechaCreacion,desc' })
      .subscribe({
        next: (page: OrderPage) => {
          this.orders.set(page.content ?? []);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  onOrderSelected(): void {}

  verHistorial(): void {
    if (this.selectedOrderId != null) {
      this.router.navigate(['/orders', this.selectedOrderId, 'historial']);
    }
  }
}
