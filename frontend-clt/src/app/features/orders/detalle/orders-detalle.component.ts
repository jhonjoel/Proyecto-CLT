import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  computed,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { OrderService } from '../../../core/services/order.service';
import type { Order, OrderItem, OrderStatus } from '@shared/models/order.model';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { OrdersFormularioComponent } from '../formulario/orders-formulario.component';
import { OrdersChangeStatusComponent } from '../change-status/orders-change-status.component';

@Component({
  selector: 'app-orders-detalle',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    RouterLink,
    BreadcrumbComponent,
  ],
  templateUrl: './orders-detalle.component.html',
  styleUrls: ['./orders-detalle.component.scss'],
})
export class OrdersDetalleComponent implements OnInit, OnDestroy {
  @ViewChild('printArea') printArea?: ElementRef<HTMLDivElement>;

  order = signal<Order | null>(null);
  loading = signal(true);
  errorMessage = signal('');
  itemColumns = ['descripcion', 'cantidad', 'precioUnitario', 'subtotal'];

  subtotalItems = computed(() => {
    const o = this.order();
    if (!o?.items?.length) return 0;
    return o.items.reduce((sum, it) => sum + this.getItemSubtotal(it), 0);
  });

  private id = '';

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((p) => {
      this.id = p['id'] ?? '';
      this.loadOrder();
    });
  }

  ngOnDestroy(): void {}

  loadOrder(): void {
    if (!this.id) {
      this.errorMessage.set('ID de orden no especificado.');
      this.loading.set(false);
      return;
    }
    this.loading.set(true);
    this.errorMessage.set('');
    this.order.set(null);
    this.orderService.getById(this.id).subscribe({
      next: (o) => {
        this.order.set(o);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message ?? 'Error al cargar el pedido.');
        this.loading.set(false);
      },
    });
  }

  getItemSubtotal(item: OrderItem): number {
    if (item.subtotal != null) return item.subtotal;
    return (item.cantidad ?? 0) * (item.precioUnitario ?? 0);
  }

  openEditar(): void {
    const o = this.order();
    if (!o) return;
    const ref = this.dialog.open(OrdersFormularioComponent, {
      width: '960px',
      maxWidth: '95vw',
      data: { isModal: true, order: o },
      panelClass: 'nuevo-pedido-dialog-panel',
    });
    ref.afterClosed().subscribe((updated: Order | undefined) => {
      if (updated) this.loadOrder();
    });
  }

  openCambiarEstado(): void {
    const o = this.order();
    if (!o) return;
    const ref = this.dialog.open(OrdersChangeStatusComponent, {
      width: '400px',
      data: { codigo: o.codigo, id: o.id, estadoActual: o.estado },
    });
    ref.afterClosed().subscribe((nuevoEstado: OrderStatus | undefined) => {
      if (nuevoEstado && nuevoEstado !== o.estado) {
        this.orderService.updateStatus(o.id, { estado: nuevoEstado }).subscribe({
          next: () => this.loadOrder(),
          error: () => this.errorMessage.set('Error al cambiar el estado.'),
        });
      }
    });
  }

  imprimir(): void {
    window.print();
  }
}
