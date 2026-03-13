import { Component, OnInit } from '@angular/core';
//import { data } from './archivo';
import { FormulariosRolesService } from '@services/main/listaFormulariosRoles.services';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
//import { API_URL } from '@config/config';
import { ModulosService } from '@services/administrativo/getModulos.service'; // Asegúrate de importar correctamente
import { environment } from '@environment/environment'; // Ajusta la ruta según la ubicación del archivo de entorno
import { SelectRolComponent } from '@components/select-rol/select-rol.component';
 import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { MatButtonModule } from '@angular/material/button'; 
import { MatSelectModule } from '@angular/material/select';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
  import { MatAccordion } from '@angular/material/expansion';
import { MatExpansionModule } from '@angular/material/expansion';
import { TipoAsignacionUsuPvComponent } from '@components/tipo-asignacion-usu-pv/tipo-asignacion-usu-pv.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
 
@Component({
  selector: 'app-permisos-modulos',
  standalone: true,
  imports: [SelectRolComponent,MatFormFieldModule,MatDatepickerModule,MatProgressSpinnerModule,MatIconModule,
    MatInputModule,FormsModule,CommonModule,BreadcrumbComponent,MatButtonModule,MatSelectModule,
    ReactiveFormsModule,NgxMatSelectSearchModule,MatAccordion,MatExpansionModule,MatCheckboxModule , 
    TipoAsignacionUsuPvComponent],
  templateUrl: './permisos-modulos.component.html',
  styleUrl: './permisos-modulos.component.scss'
})
export class PermisosModulosComponent implements OnInit {
  constructor( private    formulariosRolesService: FormulariosRolesService ,
    private _snackBar: MatSnackBar,
    private http: HttpClient,
    private modulosService: ModulosService // Inyecta el servicio de módulos aquí
    ) {}
    breadscrums = [
      {
        title: 'Administrativo',
        items: ['Home'],
        active: 'Permisos de usuario',
      } ];
  ngOnInit(): void
  {
    this.getModulos()
  }
  modulos :any = [] ; // Aquí almacenarás los módulos obtenidos
  idRol: number 
  idsASeleccionar: number[]  = []; // IDs que deseas seleccionar
  isLoading = false;
  isLoadingAcordion = false;
  private endpoint = '/crearPermisosUsuarios';

  handleRolSeleccionado(idRol: number) {
    this.idRol = idRol;
    this.isLoadingAcordion=true
    this.formulariosRolesService.getFormulariosRoles(this.idRol).subscribe(formularios => {
    this.idsASeleccionar = formularios.formulariosRoles.map(formulario => formulario.idFormulario);
     });
     this.isLoadingAcordion=false
  }

registrarPermisos() {
  this.isLoading  = true;
  this.http
    .post<any>(`${environment.apiUrl}${this.endpoint}`, {
      idRol: this.idRol,
      idsFormulario: this.idsASeleccionar.join(',')     
     })
    .subscribe(
      (response) => {
        this.isLoading  = false;
        const message = response.mensaje;
        // this.toastr.success('Acceso permitido', 'Éxito');
         this._snackBar.open(message, 'Cerrar', {
          duration: 3000,
        });

        if(response.tipo==0){
          this._snackBar.open(response.mensaje, 'Cerrar', {
            duration: 3000,
          });
        }
      },
      (error) => {
        this.isLoading = false;
        this._snackBar.open(error, 'Cerrar', {
          duration: 3000,
        });
      }
    );
}

actualizarVariable(idFormulario: number, isChecked: boolean) {
  console.log(isChecked)
  if (isChecked) {
    // Agregar el ID del formulario a idsASeleccionar si se marca el checkbox
    this.idsASeleccionar.push(idFormulario);
  } else {
    // Remover el ID del formulario de idsASeleccionar si se desmarca el checkbox
    this.idsASeleccionar = this.idsASeleccionar.filter(id => id !== idFormulario);
  }
}

getModulos() {
  this.modulosService.getModulos().subscribe((modulos) => {
    this.modulos = modulos;
  });
}

}