import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject, debounceTime, switchMap } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import {
  MatPaginatorModule,
  MatPaginator,
  PageEvent,
} from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  OrderService,
  type OrderListParams,
} from '../../../core/services/order.service';
import type {
  Order,
  OrderStatus,
  OrderPage,
} from '@shared/models/order.model';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { OrdersConfirmCancelComponent } from '../confirm-cancel/orders-confirm-cancel.component';
import { OrdersFormularioComponent } from '../formulario/orders-formulario.component';

const ESTADOS: OrderStatus[] = [
  'PENDIENTE',
  'EN_PROCESO',
  'COMPLETADO',
  'CANCELADO',
];

@Component({
  selector: 'app-order-list',
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
    MatProgressSpinnerModule,
    MatIconModule,
    MatTooltipModule,
    BreadcrumbComponent,
  ],
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss'],
})
export class OrderListComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = [
    'id',
    'codigo',
    'clienteNombre',
    'fechaCreacion',
    'estado',
    'total',
    'acciones',
  ];
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

  loading = signal(false);
  private filter$ = new Subject<void>();

  constructor(
    private orderService: OrderService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.filter$
      .pipe(
        debounceTime(300),
        switchMap(() => {
          this.loading.set(true);
          return this.orderService.getList(this.buildParams());
        })
      )
      .subscribe({
        next: (page: OrderPage) => {
          this.dataSource.data = page.content;
          this.totalElements = page.totalElements;
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });

    this.filter$.next();
  }

  ngOnDestroy(): void {
    this.filter$.complete();
  }

  private buildParams(): OrderListParams {
    return {
      page: this.pageIndex,
      size: this.pageSize,
      sort: `${this.sortField},${this.sortDirection}`,
      clienteNombre: this.filtroCliente?.trim() || undefined,
      estado: this.filtroEstado ?? undefined,
      fechaDesde: this.filtroFechaDesde
        ? this.filtroFechaDesde.toISOString()
        : undefined,
      fechaHasta: this.filtroFechaHasta
        ? this.filtroFechaHasta.toISOString()
        : undefined,
    };
  }

  applyFilters(): void {
    this.pageIndex = 0;
    if (this.paginator) this.paginator.pageIndex = 0;
    this.filter$.next();
  }

  onFilterChange(): void {
    this.pageIndex = 0;
    if (this.paginator) this.paginator.pageIndex = 0;
    this.filter$.next();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.filter$.next();
  }

  onSortChange(sort: Sort): void {
    if (sort.active && sort.direction) {
      this.sortField = sort.active;
      this.sortDirection = sort.direction as 'asc' | 'desc';
      this.filter$.next();
    }
  }

  badgeClass(estado: OrderStatus): string {
    return estado;
  }

  openNuevaOrdenModal(): void {
    const ref = this.dialog.open(OrdersFormularioComponent, {
      width: '960px',
      maxWidth: '95vw',
      disableClose: false,
      data: { isModal: true },
      panelClass: 'nuevo-pedido-dialog-panel',
    });
    ref.afterClosed().subscribe((createdOrder: Order | undefined) => {
      if (createdOrder) {
        this.filter$.next();
      }
    });
  }

  confirmarCancelar(order: Order): void {
    const ref = this.dialog.open(OrdersConfirmCancelComponent, {
      width: '400px',
      data: { codigo: order.codigo, id: order.id },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.orderService.cancel(order.id).subscribe({
          next: () => this.filter$.next(),
        });
      }
    });
  }
}
