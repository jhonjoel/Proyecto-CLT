import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
//import { API_URL } from '@config/config';
import { environment } from '@environment/environment'; // Ajusta la ruta según la ubicación del archivo de entorno
 import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { MatButtonModule } from '@angular/material/button'; 
     
@Component({
  selector: 'app-nuevo-rol',
  standalone: true,
  imports: [MatFormFieldModule,MatDatepickerModule,MatProgressSpinnerModule,MatIconModule,
    MatInputModule,FormsModule,CommonModule,BreadcrumbComponent,MatButtonModule],
  templateUrl: './nuevo-rol.component.html',
  styleUrl: './nuevo-rol.component.scss'
})
export class NuevoRolComponent implements OnInit {
  private endpoint = '/rolesCreate';
  rol =""
  isLoading = false;

  constructor( 
    private _snackBar: MatSnackBar,
    private http: HttpClient
  ) {}
  breadscrums = [
    {
      title: 'Administrativo',
      items: ['Home'],
      active: 'Creacion de rol',
    } ];
  ngOnInit(): void
  {
    throw new Error( 'Method not implemented.' );
  }

  RegistrarRol() {
    this.isLoading  = true;
    this.http
    .post<any>(`${environment.apiUrl}${this.endpoint}`, {
       descripcion: this.rol,
       })
      .subscribe(
        (response) => {
          this.isLoading  = false;
          const message = response.mensaje;
          // this.toastr.success('Acceso permitido', 'Éxito');
          console.log(this.rol)
          this._snackBar.open(message, 'Cerrar', {
            duration: 3000,
          });
          this.rol=""
        },
        (error) => {
          this.isLoading = false;
          this._snackBar.open(error, 'Cerrar', {
            duration: 3000,
          });
        }
      );
  }
}
