
import { Component, OnInit } from '@angular/core';
import { Usuario } from '@models/Usuario';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { Observable, of } from 'rxjs';
import { VisitasService } from '@services/comercial/getListaVisitas.service';
import * as moment from 'moment';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Visitas } from '@models/Visitas';
import { ListaVisitasByUsuarioService } from './getListaVisitasByUsuario.service';
import { ListaVisitas } from './visitasFecha';
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
  selector: 'app-audit-visitas',
  standalone: true,
  imports: [MatFormFieldModule,MatDatepickerModule,MatProgressSpinnerModule,MatIconModule,
    MatInputModule,FormsModule,CommonModule,BreadcrumbComponent,MatButtonModule,SelectUsuarioComponent,GoogleMapsModule
    ,MatTableModule,
    MatSnackBarModule],
  templateUrl: './audit-visitas.component.html',
  styleUrl: './audit-visitas.component.scss'
})

export class AuditVisitasComponent implements OnInit {
  displayedColumns: string[] = [
    'Orden visita',
    'Inicio',
    'Fin',
    'Permanencia',
    'Punto venta',
    'Tipo cierre',
    'llegadaTardiaInicio',
    'BateriaInicio',
    'BateriaFin'
  
  ];
    dataSource = new MatTableDataSource<Visitas>();

    dataSourceGrilla = new MatTableDataSource<ListaVisitas>();
    breadscrums = [
      {
        title: 'Comercial',
        items: ['Home'],
        active: 'Visitas por promotoras',
      },
    ];
  visitas: any[] = [];
  isLoading = false;
  noData=false
  fechaCalendario: Date; // Variable para almacenar la fecha seleccionada
  selectedUser: string; // Variable para almacenar el valor del buscador
  idUsuario: number 
  usuarios: Usuario[] = [];
  apiLoaded: Observable<boolean>;
  center: google.maps.LatLngLiteral = { lat: -25.348158333333334, lng: -57.461571666666664 };
  zoom = 12;
  display: any;
  markerPositions: google.maps.LatLngLiteral[] = [];
  labels: { color: string; fontWeight: string, fontSize: string, text: string, sucursal: string }[] = [];

  constructor( private visitasService: VisitasService,    private _snackBar: MatSnackBar, private listaVisitasByUsuarioService:ListaVisitasByUsuarioService) { }

  handleUsuarioSeleccionado(idUsuario: number) {
    console.log('ID de usuario seleccionado en OtroComponente:', idUsuario);
    this.idUsuario=idUsuario
 }


  ngOnInit() {
   }
 
  lineOptions: google.maps.PolylineOptions = {
    strokeOpacity: 0,  // Establece la opacidad de la línea a cero para que no se vea la línea continua
    icons: [
      {
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 3,       // Escala del ícono (puedes ajustar este valor según tus necesidades)
          fillColor: 'blue',  // Color de relleno del ícono (puedes cambiarlo a cualquier color válido)
          fillOpacity: 1, // Opacidad del relleno del ícono (1 = opaco, 0 = transparente)
          strokeWeight: 0 // Grosor del borde del ícono (0 = sin borde)
        },
        offset: '0%',    // Offset inicial del ícono (0% significa que se ubicará al principio del segmento)
        repeat: '18px'   // Espacio entre los íconos (puedes ajustar este valor según tus necesidades)
      }
    ]
  };
  markerOptions: google.maps.MarkerOptions = {
    draggable: false };//CUANDO ESTA EN FALSE NO SE MUEVEN LOS GLOBOS
 
 
  onDateChange(event: MatDatepickerInputEvent<Date>) {
    console.log(event.value);
    if (event.value) {
      //this.fechaCalendario = event.value;
      this.fechaCalendario = new Date(event.value);
    } 
  
     
    
    }
  rastrear() {
    this.noData=true
    this.dataSourceGrilla.data=[]
    console.log(this.fechaCalendario)
    console.log(this.idUsuario)
    if (!this.idUsuario || !this.fechaCalendario) {
      // Si el idUsuario o la fechaCalendario no tienen valores, muestra un mensaje de error al usuario.
       this._snackBar.open('Error: Usuario y fecha son obligatorios.', 'Cerrar', {
        duration: 3000,
      });
      return;
    }
    this.isLoading = true;
    try {
      this.visitasService.getVisitas(this.idUsuario, this.fechaCalendario).subscribe(visitas => {
      if (visitas.length > 0) {
     // Si hay datos, asignarlos a la tabla
    this.dataSource.data = visitas;
   // this.noData=false
   
   } else {
    // Si no hay datos, mostrar la fila sin datos
    //this.noData=true
  }
        this.markerPositions = visitas.map(visita => ({
          lat: parseFloat(visita.latitudUsuario),
          lng: parseFloat(visita.longitudUsuario)
        }));
        this.labels = visitas.map(visita => {
        return {
            color: 'white',
            fontSize: '10px',
            text: '' + visita.secuencia,
            sucursal: (visita.ocrdName + ' - ' + moment.utc(visita.createdAt).format('HH:mm') + ' Hs.'),
            fontWeight: 'bold'
          };
        });
 
        this.isLoading = false;
      });

      this.listaVisitasByUsuarioService.getListaVisitasByUsuario(this.fechaCalendario,this.idUsuario).subscribe(visitasGrilla => {
        if (visitasGrilla.length > 0) {
       // Si hay datos, asignarlos a la tabla
      this.dataSourceGrilla.data = visitasGrilla;
      this.noData=false
     
     } else {
      // Si no hay datos, mostrar la fila sin datos
      this.noData=true
      }
      this.isLoading = false;
      });

      
    } catch (error) {
      console.log(error);
      this.isLoading = false;
    }
  }
  
 abrirInfoWindow(index: number) {
  const label = this.labels[index]; // Obtener la etiqueta del marcador seleccionado
    this._snackBar.open(label.sucursal, 'Cerrar', {
      duration: 10000,
    });
  }

}
