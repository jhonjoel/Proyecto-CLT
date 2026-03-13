import {
  Component,
  OnInit,
  signal,
  computed,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { OrderService } from '../../../core/services/order.service';
import type { Order, CommandLogDto } from '@shared/models/order.model';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { HistorialJsonDialogComponent } from './historial-json-dialog.component';

@Component({
  selector: 'app-orders-historial',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    RouterLink,
    BreadcrumbComponent,
  ],
  templateUrl: './orders-historial.component.html',
  styleUrls: ['./orders-historial.component.scss'],
})
export class OrdersHistorialComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  order = signal<Order | null>(null);
  loading = signal(true);
  errorMessage = signal('');
  orderId = '';

  displayedColumns: string[] = ['id', 'fecha', 'usuario', 'accion', 'estado', 'detalles'];
  dataSource = new MatTableDataSource<CommandLogDto>([]);
  allLogs = signal<CommandLogDto[]>([]);

  pageSize = signal(8);
  pageIndex = signal(0);
  pageSizeOptions = [5, 8, 15, 25];

  totalElements = computed(() => this.allLogs().length);

  paginationLabel = computed(() => {
    const total = this.totalElements();
    if (total === 0) return 'Sin resultados';
    const start = this.pageIndex() * this.pageSize() + 1;
    const end = Math.min((this.pageIndex() + 1) * this.pageSize(), total);
    return `Mostrando ${start} a ${end} de ${total} resultados`;
  });

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((p) => {
      this.orderId = p['id'] ?? '';
      this.loadData();
    });
  }

  loadData(): void {
    if (!this.orderId) {
      this.errorMessage.set('ID de pedido no especificado.');
      this.loading.set(false);
      return;
    }
    this.loading.set(true);
    this.errorMessage.set('');

    this.orderService.getById(this.orderId).subscribe({
      next: (o) => this.order.set(o),
      error: () => {},
    });

    this.orderService.getHistory(this.orderId).subscribe({
      next: (logs) => {
        this.allLogs.set(logs);
        this.dataSource.data = this.getPageSlice();
        this.loading.set(false);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message ?? 'Error al cargar el historial.');
        this.loading.set(false);
      },
    });
  }

  private getPageSlice(): CommandLogDto[] {
    const start = this.pageIndex() * this.pageSize();
    return this.allLogs().slice(start, start + this.pageSize());
  }

  cambiarPagina(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.dataSource.data = this.getPageSlice();
  }

  formatFecha(executedAt: string): string {
    if (!executedAt) return '-';
    try {
      const d = new Date(executedAt);
      return d.toLocaleString('es-CL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return executedAt;
    }
  }

  usuarioLabel(log: CommandLogDto): string {
    return `Usuario #${log.executedBy}`;
  }

  badgeClass(status: string): string {
    return status === 'SUCCESS' ? 'success' : 'danger';
  }

  verJson(log: CommandLogDto): void {
    this.dialog.open(HistorialJsonDialogComponent, {
      width: '560px',
      maxWidth: '95vw',
      data: {
        commandId: log.id,
        payload: log.payload ?? {},
      },
    });
  }
}
