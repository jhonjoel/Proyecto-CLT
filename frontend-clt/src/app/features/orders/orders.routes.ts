import { Route } from '@angular/router';
import { OrderListComponent } from './order-list/order-list.component';
import { OrdersDetalleComponent } from './detalle/orders-detalle.component';
import { OrdersFormularioComponent } from './formulario/orders-formulario.component';
import { OrdersHistorialComponent } from './historial/orders-historial.component';
import { OrdersHistorialSelectorComponent } from './historial-selector/orders-historial-selector.component';
import { RoleGuard } from '@core/guards/role.guard';

export const ORDERS_ROUTE: Route[] = [
  { path: '', component: OrderListComponent, canActivate: [RoleGuard] },
  { path: 'nueva', component: OrdersFormularioComponent, canActivate: [RoleGuard] },
  { path: 'historial', component: OrdersHistorialSelectorComponent, canActivate: [RoleGuard] },
  { path: ':id', component: OrdersDetalleComponent, canActivate: [RoleGuard] },
  { path: ':id/historial', component: OrdersHistorialComponent, canActivate: [RoleGuard] },
];
