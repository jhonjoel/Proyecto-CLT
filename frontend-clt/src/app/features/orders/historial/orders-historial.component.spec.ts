import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { OrdersHistorialComponent } from './orders-historial.component';
import { OrderService } from '../../../core/services/order.service';
import { MatDialog } from '@angular/material/dialog';
import type { Order, CommandLogDto } from '@shared/models/order.model';

const mockOrder: Order = {
  id: 1,
  codigo: 'ORD-001',
  estado: 'PENDIENTE',
  clienteNombre: 'Cliente Test',
  items: [],
  total: 100.5,
  fechaCreacion: '2024-01-15T10:00:00Z',
  fechaActualizacion: '2024-01-15T10:00:00Z',
};

const mockHistory: CommandLogDto[] = [
  {
    id: 1,
    orderId: 1,
    commandType: 'CREATE_ORDER',
    executedBy: 1,
    executedAt: '2024-01-15T10:00:00Z',
    payload: {},
    status: 'SUCCESS',
  },
];

describe('OrdersHistorialComponent', () => {
  let component: OrdersHistorialComponent;
  let fixture: ComponentFixture<OrdersHistorialComponent>;
  let orderService: jasmine.SpyObj<Pick<OrderService, 'getById' | 'getHistory'>>;

  beforeEach(async () => {
    orderService = jasmine.createSpyObj('OrderService', ['getById', 'getHistory']);
    orderService.getById.and.returnValue(of(mockOrder));
    orderService.getHistory.and.returnValue(of(mockHistory));

    await TestBed.configureTestingModule({
      imports: [OrdersHistorialComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: OrderService, useValue: orderService },
        { provide: MatDialog, useValue: { open: jasmine.createSpy() } },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '1' }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrdersHistorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar orden e historial al iniciar', () => {
    expect(orderService.getById).toHaveBeenCalledWith('1');
    expect(orderService.getHistory).toHaveBeenCalledWith('1');
  });

  it('debe formatear la fecha correctamente', () => {
    const result = component.formatFecha('2024-01-15T14:30:00Z');
    expect(result).toContain('15');
    expect(result).toContain('01');
    expect(result).toContain('2024');
  });

  it('debe mostrar etiqueta de usuario', () => {
    const label = component.usuarioLabel(mockHistory[0]);
    expect(label).toBe('Usuario #1');
  });

  it('debe asignar clase badge según estado', () => {
    expect(component.badgeClass('SUCCESS')).toBe('success');
    expect(component.badgeClass('FAILED')).toBe('danger');
  });
});
