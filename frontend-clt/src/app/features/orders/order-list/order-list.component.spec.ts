import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { OrderListComponent } from './order-list.component';
import { OrderService } from '../../../core/services/order.service';
import { MatDialog } from '@angular/material/dialog';
import type { OrderPage } from '@shared/models/order.model';

@Component({
  selector: 'app-breadcrumb',
  template: '',
  standalone: true,
})
class StubBreadcrumbComponent {
  @Input() title!: string;
  @Input() items!: string[];
  @Input() active_item!: string;
}

const mockOrderPage: OrderPage = {
  content: [
    {
      id: 1,
      codigo: 'ORD-001',
      estado: 'PENDIENTE',
      clienteNombre: 'Cliente Test',
      items: [],
      total: 100.5,
      fechaCreacion: '2024-01-15T10:00:00Z',
      fechaActualizacion: '2024-01-15T10:00:00Z',
    },
  ],
  totalElements: 1,
  totalPages: 1,
  size: 10,
  number: 0,
  first: true,
  last: true,
};

describe('OrderListComponent', () => {
  let component: OrderListComponent;
  let fixture: ComponentFixture<OrderListComponent>;
  let orderService: jasmine.SpyObj<Pick<OrderService, 'getList'>>;

  beforeEach(async () => {
    orderService = jasmine.createSpyObj('OrderService', ['getList']);
    orderService.getList.and.returnValue(of(mockOrderPage));

    await TestBed.configureTestingModule({
      imports: [OrderListComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: OrderService, useValue: orderService },
        { provide: MatDialog, useValue: { open: jasmine.createSpy() } },
      ],
    })
      .overrideComponent(OrderListComponent, {
        set: {
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
            StubBreadcrumbComponent,
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(OrderListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load orders when filters are applied', async () => {
    component.applyFilters();
    await new Promise((r) => setTimeout(r, 400));
    fixture.detectChanges();
    expect(orderService.getList).toHaveBeenCalled();
    expect(component.dataSource.data.length).toBe(1);
    expect(component.dataSource.data[0].codigo).toBe('ORD-001');
    expect(component.dataSource.data[0].clienteNombre).toBe('Cliente Test');
    expect(component.totalElements).toBe(1);
  });
});
