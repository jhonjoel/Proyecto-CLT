import { Route } from "@angular/router";
import { InformeInventarioComponent } from "./informe-inventario/informe-inventario.component";
import { LogActivityComponent } from "./log-activity/log-activity.component";
import { ConsumoBateriaUsuariosComponent } from "./consumo-bateria-usuarios/consumo-bateria-usuarios.component";
import { DashboardFechasComponent } from "./dashboard-fechas/dashboard-fechas.component";
import { MarcacionUsuariosComponent } from "./marcacion-usuarios/marcacion-usuarios.component";
import { InformePermisosVisitasComponent } from "./informe-permisos-visitas/informe-permisos-visitas.component";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { RoleGuard } from "@core/guards/role.guard";
  
export const INFORMES_ROUTE: Route[] = [
  {
    path: "informeInventario",
    component: InformeInventarioComponent,
    canActivate: [RoleGuard],

  }, 
  {
    path: "logActivity",
    component: LogActivityComponent,
    canActivate: [RoleGuard],

  }, 
  {
    path: "informeConsumoBateria",
    component: ConsumoBateriaUsuariosComponent,
    canActivate: [RoleGuard],

  }, 
  
  {
    path: "dashboardFecha",
    component: DashboardFechasComponent,
    canActivate: [RoleGuard],

  }, 
   
  {
    path: "marcacionesUsuarios",
    component: MarcacionUsuariosComponent,
    canActivate: [RoleGuard],

  }, 
  
     
  {
    path: "informePermisoVisitas",
    component: InformePermisosVisitasComponent,
    canActivate: [RoleGuard],

  }, 
  {
    path: "dashboard",
    component: DashboardComponent,
    canActivate: [RoleGuard],

  }, 
  

  
  
 ];
