import { Component, OnInit } from '@angular/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Usuario } from '@core/models/Usuario';
import { AuditTrailService } from '@core/services/comercial/getAuditTrail.service';
import * as moment from 'moment';
import { Observable } from 'rxjs';
  import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { MatButtonModule } from '@angular/material/button';
import { SelectUsuarioComponent } from 'app/components/select-usuario/select-usuario.component';
import { GoogleMapsModule } from '@angular/google-maps';

@Component({
  selector: 'app-audit-trail',
  standalone: true,
  imports: [MatFormFieldModule,MatDatepickerModule,MatProgressSpinnerModule,MatIconModule,
    MatInputModule,FormsModule,CommonModule,BreadcrumbComponent,MatButtonModule,SelectUsuarioComponent,GoogleMapsModule],
  templateUrl: './audit-trail.component.html',
  styleUrl: './audit-trail.component.scss'
})
 

  export class AuditTrailComponent implements OnInit {
    constructor(private auditTrailService: AuditTrailService,    private _snackBar: MatSnackBar) { }
    ngOnInit() {}
    breadscrums = [
      {
        title: 'Comercial',
        items: ['Home'],
        active: 'Auditoria de rastreo',
      },
    ];
    visitas: any[] = [];
    isLoading = false;
    noData=false
    fechaCalendario: Date; // Variable para almacenar la fecha seleccionada
    idUsuario: number 
    usuarios: Usuario[] = [];
    apiLoaded: Observable<boolean>;
    center: google.maps.LatLngLiteral = { lat: -25.348158333333334, lng: -57.461571666666664 };
    zoom = 12;
    display: any;
    markerPositions: google.maps.LatLngLiteral[] = [];
    labels: { color: string; fontWeight: string, fontSize: string, text: string,ultimoUbicacion: string, hora: string }[] = [];
  
    lineOptions: google.maps.PolylineOptions = {
      strokeOpacity: 0,  // Establece la opacidad de la línea a cero para que no se vea la línea continua
      icons: [
        {
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 1,       // Escala del ícono (puedes ajustar este valor según tus necesidades)
            fillColor: 'blue',  // Color de relleno del ícono (puedes cambiarlo a cualquier color válido)
            fillOpacity: 1, // Opacidad del relleno del ícono (1 = opaco, 0 = transparente)
            strokeWeight: 0 // Grosor del borde del ícono (0 = sin borde)
          },
          offset: '0%',    // Offset inicial del ícono (0% significa que se ubicará al principio del segmento)
          repeat: '18px'   // Espacio entre los íconos (puedes ajustar este valor según tus necesidades)
        }
      ]
    };
    iconoRojo = {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: 'green',  // Color de relleno
      fillOpacity: 1,  // Opacidad del relleno
      scale: 12,  // Tamaño del icono
      strokeColor: 'black',  // Color del borde
      strokeWeight:1  // Ancho del borde
    };
    iconoFinal = {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: 'red',  // Color de relleno
    fillOpacity: 5,  // Opacidad del relleno
    scale: 12,  // Tamaño del icono
    strokeColor: 'black',  // Color del borde
    strokeWeight:1  // Ancho del borde
    };
  ///CUANDO ESTA EN FALSE NO SE MUEVEN LOS GLOBOS
    markerOptions: google.maps.MarkerOptions = {
    draggable: false, icon: this.iconoRojo}
  
    markerOptionsFinal: google.maps.MarkerOptions = {
      draggable: false, icon: this.iconoFinal
    }
       
    rastrear() {
      if (!this.idUsuario || !this.fechaCalendario) {
        // Si el idUsuario o la fechaCalendario no tienen valores, muestra un mensaje de error al usuario.
        this._snackBar.open('Error: Usuario y fecha son obligatorios.', 'Cerrar', {
          duration: 3000
        });
        return;
      }
      this.isLoading = true;
      try {
        console.log(this.idUsuario,this.fechaCalendario)
        this.auditTrailService.getAuditTrail(this.idUsuario, this.fechaCalendario).subscribe(visitas => {
        if (visitas.length > 0) 
        {// Si hay datos, asignarlos a la tabla
          this.noData=false
        } 
        else 
        {
          // Si no hay datos, mostrar la fila sin datos
          this.noData=true
        }
      //  console.log(visitas)
        this.markerPositions = visitas.map(visita => ({
        lat: parseFloat(visita.latitud),
        lng: parseFloat(visita.longitud) }));
  
        this.labels = visitas.map(visita => {
            const createdAt = moment(visita.fecha).add(3, 'hours'); // Agrega 4 horas a la fecha de visita
            return {
              color: 'white',
              ultimoUbicacion:visita.secuencia,
              fontSize: '10px',
              text: visita.secuenciaMap ,
              hora: ( createdAt.format('HH:mm') + ' Hs.'),
              fontWeight: 'bold'
            };
          });
          this.isLoading = false;
        });
      } catch (error) {
        console.log(error);
        this.isLoading = false;
      }
   
    }
    getAdjustedPosition(originalPosition :any, index:any) {
      // Ajusta las coordenadas para evitar la superposición
      const latitudAjustada = originalPosition.lat + index * 0.0001; // Puedes ajustar el valor según tus necesidades
      const longitudAjustada = originalPosition.lng + index * 0.0001; // Puedes ajustar el valor según tus necesidades
      return { lat: latitudAjustada, lng: longitudAjustada };
    }
    
   
    handleUsuarioSeleccionado(idUsuario: any) {
      console.log('ID de usuario seleccionado en OtroComponente:', idUsuario.id);
      this.idUsuario=idUsuario.id
   }
   onDateChange(event: MatDatepickerInputEvent<Date>) {
    if (event.value) {
      //this.fechaCalendario = event.value;
      this.fechaCalendario = new Date(event.value);
     
       

    } else {
      // Maneja el caso en que event.value sea null, por ejemplo, asignando una fecha por defecto o dejando la fecha actual.
      this.fechaCalendario = new Date(); // o cualquier otra lógica de manejo
      console.log("entra 2")

    }
  }
  
    abrirInfoWindow(index: number) {
    const label = this.labels[index]; // Obtener la etiqueta del marcador seleccionado
      this._snackBar.open(label.hora +' Secuencia '+label.text, 'Cerrar', {
        duration: 10000,panelClass: ['my-snack-bar']
      });
    }
  }
  
