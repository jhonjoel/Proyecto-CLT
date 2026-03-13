import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
//import { API_URL } from '@config/config';
import { environment } from '@environment/environment'; // Ajusta la ruta según la ubicación del archivo de entorno
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator'; 
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
import {  MatTableModule } from '@angular/material/table';
import { SelectRolComponent } from '@components/select-rol/select-rol.component';

@Component({
  selector: 'app-nuevo-usuario',
  standalone: true,
  imports: [MatFormFieldModule,MatDatepickerModule,MatProgressSpinnerModule,MatIconModule,
    MatInputModule,FormsModule,CommonModule,BreadcrumbComponent,MatButtonModule,MatSelectModule,
    ReactiveFormsModule,NgxMatSelectSearchModule,MatAccordion,MatExpansionModule,
    TipoAsignacionUsuPvComponent,MatTableModule,MatPaginatorModule,SelectRolComponent],
  templateUrl: './nuevo-usuario.component.html',
  styleUrl: './nuevo-usuario.component.scss'
})

export class NuevoUsuarioComponent implements OnInit{

  breadscrums = [
    {
      title: 'Administrativo',
      items: ['Home'],
      active: 'Creacion de usuario',
    } ];
  ngOnInit(): void
  {
    throw new Error( 'Method not implemented.' );
  }
  private endpoint = '/usuariosCreate';
  isLoading = false;
  idRol: number 
  nombre =""
  apellido =""
  username =""
  pass =""
  showPasswordWarning: boolean = false;

  constructor( 
    private _snackBar: MatSnackBar,
    private http: HttpClient
  ) {}
  
  
  handleRolSeleccionado(idRol: number) {
    console.log('ID de rol seleccionado en OtroComponente:', idRol);
    this.idRol=idRol
    console.log(this.idRol)
 }
  RegistrarUsuario() {
    if(this.showPasswordWarning){
      this._snackBar.open("La contraseña es debil.", 'Cerrar', {
        duration: 3000,
      });
      return
    }
    
    this.isLoading  = true;
    this.http
      .post<any>(`${environment.apiUrl}${this.endpoint}`, {
        idRol: this.idRol,
        nombre: this.nombre,
        apellido: this.apellido,
        username: this.username,
        pass: this.pass,
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
          this.nombre=""
          this.apellido=""
          this.username=""
          this.pass=""
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
  isWeakPassword(): boolean {
    // Verificar que la contraseña tenga al menos 6 caracteres y cumpla con otros criterios
    const hasUppercase = /[A-Z]/.test(this.pass);
    const hasNoConsecutiveNumbers = !/123|234|345|456|567|678|789/.test(this.pass);
    const hasMinLength = this.pass.length >= 6; // Mínimo 6 caracteres
    return !(hasUppercase && hasNoConsecutiveNumbers && hasMinLength);
  }
}
