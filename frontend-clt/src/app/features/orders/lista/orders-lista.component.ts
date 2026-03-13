import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { OrderService, type OrderListParams } from '../../../core/services/order.service';
import type { Order, OrderStatus, OrderPage } from '@shared/models/order.model';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { OrdersConfirmCancelComponent } from '../confirm-cancel/orders-confirm-cancel.component';

const ESTADOS: OrderStatus[] = ['PENDIENTE', 'EN_PROCESO', 'COMPLETADO', 'CANCELADO'];

@Component({
  selector: 'app-orders-lista',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    RouterLink,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule,
    BreadcrumbComponent,
  ],
  templateUrl: './orders-lista.component.html',
  styleUrls: ['./orders-lista.component.scss'],
})
export class OrdersListaComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = ['codigo', 'clienteNombre', 'estado', 'total', 'fechaCreacion', 'acciones'];
  dataSource = new MatTableDataSource<Order>([]);
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;
  sortField = 'fechaCreacion';
  sortDirection: 'asc' | 'desc' = 'desc';

  estados = ESTADOS;
  filtroEstado: OrderStatus | null = null;
  filtroFechaDesde: Date | null = null;
  filtroFechaHasta: Date | null = null;
  filtroCliente = '';
  loading = false;

  constructor(
    private orderService: OrderService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading = true;
    const params: OrderListParams = {
      page: this.pageIndex,
      size: this.pageSize,
      sort: `${this.sortField},${this.sortDirection}`,
      clienteNombre: this.filtroCliente?.trim() || undefined,
      estado: this.filtroEstado ?? undefined,
      fechaDesde: this.filtroFechaDesde ? this.filtroFechaDesde.toISOString() : undefined,
      fechaHasta: this.filtroFechaHasta ? this.filtroFechaHasta.toISOString() : undefined,
    };
    this.orderService.getList(params).subscribe({
      next: (page: OrderPage) => {
        this.dataSource.data = page.content;
        this.totalElements = page.totalElements;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  buscar(): void {
    this.pageIndex = 0;
    if (this.paginator) this.paginator.pageIndex = 0;
    this.cargar();
  }

  cambiarPagina(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.cargar();
  }

  ordenar(sort: Sort): void {
    if (sort.active && sort.direction) {
      this.sortField = sort.active;
      this.sortDirection = sort.direction as 'asc' | 'desc';
      this.cargar();
    }
  }

  badgeClass(estado: OrderStatus): string {
    return estado;
  }

  confirmarCancelar(order: Order): void {
    const ref = this.dialog.open(OrdersConfirmCancelComponent, {
      width: '400px',
      data: { codigo: order.codigo, id: order.id },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.orderService.cancel(order.id).subscribe({
          next: () => this.cargar(),
        });
      }
    });
  }
}
