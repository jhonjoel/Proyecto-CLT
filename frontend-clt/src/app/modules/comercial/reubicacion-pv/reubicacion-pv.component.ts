import { Component, OnInit } from '@angular/core';
import { ParametrosEvento } from '../../../components/select-ocrd/ParametrosOcrd';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
//import { API_URL } from '@config/config';
import { environment } from '@environment/environment'; // Ajusta la ruta según la ubicación del archivo de entorno
import { SelectOcrdComponent } from '@components/select-ocrd/select-ocrd.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { GoogleMapsModule } from '@angular/google-maps';
import { SelectUsuarioComponent } from '@components/select-usuario/select-usuario.component';
import { MatButtonModule } from '@angular/material/button';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-reubicacion-pv',
  standalone: true,
  imports: [SelectOcrdComponent,MatFormFieldModule,MatDatepickerModule,MatProgressSpinnerModule,MatIconModule,
    MatInputModule,FormsModule,CommonModule,BreadcrumbComponent,MatButtonModule,SelectUsuarioComponent,GoogleMapsModule
    ,MatTableModule,
    MatSnackBarModule],
  templateUrl: './reubicacion-pv.component.html',
  styleUrl: './reubicacion-pv.component.scss'
})

export class ReubicacionPvComponent  implements OnInit
{
  breadscrums = [
    {
      title: 'Comercial',
      items: ['Home'],
      active: 'Actualizacion de ubicaciones',
    },
  ];
  constructor( 
    private _snackBar: MatSnackBar,
    private http: HttpClient,
     ) {}
  ngOnInit(): void
  {
    throw new Error( 'Method not implemented.' );
  }

  latitudLongitud: String
  idOcrd: String
  isLoading = false;
  private endpoint = '/updateUbicacionOcrd';

   Seleccionado(parametrosEvento: ParametrosEvento) {
    this.latitudLongitud = parametrosEvento.latitudLongitud;
    this.idOcrd = parametrosEvento.idOcrd;

   console.log(this.idOcrd)
  }

  registrar() {
if(this.latitudLongitud==null || this.latitudLongitud==""){

}
else {

  const coordenadasSinEspacios = this.latitudLongitud.trim();
  const partes = coordenadasSinEspacios.split(',');
  const latitud = partes[0];
  const longitud = partes[1];

  console.log(latitud)
  console.log(longitud)
  this.isLoading  = true;
  this.http
    .post<any>(`${environment.apiUrl}${this.endpoint}`, {
      id: this.idOcrd,
      latitud:latitud,
      longitud:longitud     
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
}

}