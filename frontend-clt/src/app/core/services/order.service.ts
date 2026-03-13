import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environment/environment';
import type {
  Order,
  OrderPage,
  OrderStatus,
  CreateOrderRequest,
  UpdateOrderStatusRequest,
  CommandLogDto,
} from '@shared/models/order.model';

export interface OrderListParams {
  page?: number;
  size?: number;
  sort?: string;
  estado?: OrderStatus;
  fechaDesde?: string;
  fechaHasta?: string;
  clienteNombre?: string;
}

/**
 * Servicio de órdenes de compra. Consume GET/POST/PUT/PATCH/DELETE según api_consumo_backend.
 */
@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly baseUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  getList(params: OrderListParams = {}): Observable<OrderPage> {
    let httpParams = new HttpParams();
    if (params.page != null) httpParams = httpParams.set('page', params.page);
    if (params.size != null) httpParams = httpParams.set('size', params.size);
    if (params.sort) httpParams = httpParams.set('sort', params.sort);
    if (params.estado) httpParams = httpParams.set('estado', params.estado);
    if (params.fechaDesde) httpParams = httpParams.set('fechaDesde', params.fechaDesde);
    if (params.fechaHasta) httpParams = httpParams.set('fechaHasta', params.fechaHasta);
    if (params.clienteNombre) httpParams = httpParams.set('clienteNombre', params.clienteNombre);

    return this.http.get<OrderPage>(this.baseUrl, { params: httpParams });
  }

  getById(id: string | number): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/${id}`);
  }

  create(order: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(this.baseUrl, order);
  }

  update(id: number, order: CreateOrderRequest): Observable<Order> {
    return this.http.put<Order>(`${this.baseUrl}/${id}`, order);
  }

  updateStatus(id: number, body: UpdateOrderStatusRequest): Observable<Order> {
    return this.http.patch<Order>(`${this.baseUrl}/${id}/status`, body);
  }

  cancel(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getHistory(id: string | number): Observable<CommandLogDto[]> {
    return this.http.get<CommandLogDto[]>(`${this.baseUrl}/${id}/history`);
  }
}
