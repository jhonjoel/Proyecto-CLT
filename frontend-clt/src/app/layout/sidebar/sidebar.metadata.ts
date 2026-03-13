// Sidebar route metadata
export interface RouteInfo {
  ruta: string;
  name: string;
  iconType: string;
  icono: string;
  class: string;
  groupTitle: boolean;
  badge: string;
  badgeClass: string;
  children: RouteInfo[];
  /** Permiso requerido (del JWT). Si no se define, no se exige permiso para ver/acceder. */
  permiso?: string;
  /** Roles permitidos (ej. ['ADMIN']). Si se define, el usuario debe tener al menos uno para ver/acceder. */
  roles?: string[];
}

 