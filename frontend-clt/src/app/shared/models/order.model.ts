/** Estados permitidos de un pedido (Order) */
export type OrderStatus = 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADO' | 'CANCELADO';

/** Item de línea de un pedido */
export interface OrderItem {
  id?: number;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal?: number;
}

/** Pedido (OrderDto del backend) */
export interface Order {
  id: number;
  codigo: string;
  estado: OrderStatus;
  clienteNombre: string;
  items: OrderItem[];
  total: number;
  fechaCreacion: string;
  fechaActualizacion: string;
  createdByUsuarioId?: number;
}

/** Request para crear/actualizar pedido (POST/PUT /api/orders). Alineado con backend CreateOrderRequest + OrderItemDto. */
export interface CreateOrderRequest {
  clienteNombre: string;
  items: Array<{
    id?: number;
    descripcion: string;
    cantidad: number;
    precioUnitario: number;
    subtotal?: number;
  }>;
}

/** Request para PATCH /api/orders/{id}/status */
export interface UpdateOrderStatusRequest {
  estado: OrderStatus;
}

/** Respuesta paginada de GET /api/orders (api_consumo_backend.md §4.2) */
export interface OrderPage {
  content: Order[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

/** Historial de comandos del pedido – GET /api/orders/{id}/history (api_consumo_backend.md §4.2) */
export interface CommandLogDto {
  id: number;
  orderId: number;
  commandType: string;
  executedBy: number;
  executedAt: string;
  payload: Record<string, unknown>;
  status: 'SUCCESS' | 'FAILED';
}
