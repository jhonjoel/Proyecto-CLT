import { Route } from "@angular/router";
 
 import { VisitasFechasComponent } from "./visitas-fechas/visitas-fechas.component";
import { PermisosVisitasComponent } from "./permisos-visitas/permisos-visitas.component";
import { AuditTrailComponent } from "./audit-trail/audit-trail.component";
import { AuditVisitasComponent } from "./audit-visitas/audit-visitas.component";
import { UltimaUbicacionComponent } from "./ultima-ubicacion/ultima-ubicacion.component";
import { AsignacionUsuarioPdvComponent } from "./asignacion-usuario-pdv/asignacion-usuario-pdv.component";
import { RoleGuard } from "@core/guards/role.guard";
import { ReubicacionPvComponent } from "./reubicacion-pv/reubicacion-pv.component";
export const COMERCIAL_ROUTE: Route[] = [
  {
    path: "visitasPorFecha",
    component: VisitasFechasComponent,
    canActivate: [RoleGuard],

  },
  {
    path: "permisosVisitas",
    component: PermisosVisitasComponent,
    canActivate: [RoleGuard],

  }
  ,
  {
    path: "AuditTrail",
    component: AuditTrailComponent,
    canActivate: [RoleGuard],

  },
  {
    path: "AuditVisitas",
    component: AuditVisitasComponent,
    canActivate: [RoleGuard],

  },
  {
    path: "lastLocation",
    component: UltimaUbicacionComponent,
    canActivate: [RoleGuard],

  },
  {
    path: "asignacionPvUsu",
    component: AsignacionUsuarioPdvComponent,
    canActivate: [RoleGuard],

  },
  

  {
    path: "asignacionUbicacion",
    component: ReubicacionPvComponent,
 
  },
  

  
 ];
