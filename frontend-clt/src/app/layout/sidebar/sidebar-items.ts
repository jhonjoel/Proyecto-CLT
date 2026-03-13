import { RouteInfo } from './sidebar.metadata';

/**
 * Ítems del sidebar por rol. Se muestran según roles del usuario (ADMIN, OPERADOR).
 * Filtrado en SidebarComponent por filterRoutesByPermisosYRoles (permisos y roles del JWT).
 */
export const ROUTES: RouteInfo[] = [
  {
    ruta: '',
    name: 'Order Management',
    iconType: 'material-icons-outlined',
    icono: 'shopping_cart',
    class: 'menu-toggle',
    groupTitle: false,
    badge: '',
    badgeClass: '',
    roles: ['ADMIN', 'OPERADOR'],
    children: [
      { ruta: '/orders', name: 'Lista de órdenes', iconType: '', icono: '', class: 'ml-menu', groupTitle: false, badge: '', badgeClass: '', roles: ['ADMIN', 'OPERADOR'], children: [] },
      { ruta: '/orders/historial', name: 'Historial de comandos', iconType: '', icono: '', class: 'ml-menu', groupTitle: false, badge: '', badgeClass: '', roles: ['ADMIN'], children: [] },
    ],
  },
];
