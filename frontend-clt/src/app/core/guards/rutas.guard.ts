import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ROUTES } from '../../layout/sidebar/sidebar-items';
import { RouteInfo } from '../../layout/sidebar/sidebar.metadata';

export interface PathRequirement {
  permiso?: string;
  roles?: string[];
}

function buildPathRequirementsMap(routes: RouteInfo[], basePath = ''): Map<string, PathRequirement> {
  const map = new Map<string, PathRequirement>();
  for (const item of routes) {
    const path = (basePath || item.ruta || '').replace(/^\//, '');
    if (path && (item.permiso || item.roles?.length)) {
      map.set(path, { permiso: item.permiso, roles: item.roles });
    }
    if (item.children?.length) {
      for (const child of item.children) {
        const childPath = (child.ruta || '').replace(/^\//, '');
        if (childPath && (child.permiso || child.roles?.length)) {
          map.set(childPath, { permiso: child.permiso, roles: child.roles });
        }
        if (child.children?.length) {
          buildPathRequirementsMap(child.children, childPath).forEach((req, p) => map.set(p, req));
        }
      }
    }
  }
  return map;
}

const pathRequirements = buildPathRequirementsMap(ROUTES);

@Injectable({
  providedIn: 'root',
})
export class RutasGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(next: ActivatedRouteSnapshot): boolean {
    const token = localStorage.getItem('token');
    if (!token || !this.authService.tokenIsValid(token)) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    const rutaSolicitada = next.url.length ? next.url.map((s) => s.path).join('/') : '';
    const requisitos = pathRequirements.get(rutaSolicitada);

    if (!requisitos) return true;

    const permisos = this.authService.getPermisos();
    const roles = this.authService.getRoles();
    const cumplePermiso = !requisitos.permiso || permisos.includes(requisitos.permiso);
    const cumpleRol = !requisitos.roles?.length || requisitos.roles.some((r) => roles.includes(r));

    if (cumplePermiso && cumpleRol) return true;

    this.router.navigate(['/denied']);
    return false;
  }
}
