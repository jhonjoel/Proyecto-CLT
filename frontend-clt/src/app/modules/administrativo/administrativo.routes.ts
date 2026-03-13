import { Route } from "@angular/router";
import { NuevoUsuarioComponent } from "./nuevo-usuario/nuevo-usuario.component";
import { NuevoRolComponent } from "./nuevo-rol/nuevo-rol.component";
import { PermisosModulosComponent } from "./permisos-modulos/permisos-modulos.component";
import { ListaUsuariosComponent } from "./lista-usuarios/lista-usuarios.component";
import { RoleGuard } from "@core/guards/role.guard";
   
export const ADMINISTRATIVO_ROUTE: Route[] = [
  {
    path: "nuevoUsuario",
    component: NuevoUsuarioComponent,
    canActivate: [RoleGuard],

  },  
  
  {
    path: "nuevoRol",
    component: NuevoRolComponent,
    canActivate: [RoleGuard],

  },  
  {
    path: "permisos",
    component: PermisosModulosComponent,
    canActivate: [RoleGuard],

  },    {
    path: "listaUsuarios",
    component: ListaUsuariosComponent,
    canActivate: [RoleGuard],

  },  
  
  
 ];
