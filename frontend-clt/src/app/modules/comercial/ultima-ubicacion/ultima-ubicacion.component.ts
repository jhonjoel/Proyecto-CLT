import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Usuario } from '@models/Usuario';
import { Observable, Subject } from 'rxjs';
import moment from 'moment';
import { UsuarioUbicacion } from './UsuarioUbicacion';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
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
  selector: 'app-ultima-ubicacion',
  standalone: true,
  imports: [MatFormFieldModule,MatDatepickerModule,MatProgressSpinnerModule,MatIconModule,
    MatInputModule,FormsModule,CommonModule,BreadcrumbComponent,MatButtonModule,SelectUsuarioComponent,GoogleMapsModule
    ,MatTableModule,
    MatSnackBarModule],
  templateUrl: './ultima-ubicacion.component.html',
  styleUrl: './ultima-ubicacion.component.scss'
})

export class UltimaUbicacionComponent implements OnInit{
  private destroy$: Subject<void> = new Subject<void>();
  constructor(  private changeDetectorRef: ChangeDetectorRef,  private _snackBar: MatSnackBar) { }
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  breadscrums = [
    {
      title: 'Comercial',
      items: ['Home'],
      active: 'Ultima ubicacion por usuario',
    },
  ];
  visitas: any[] = [];
  rolesFiltrados: number[] = [];

  isLoading = false;
  noData=false
  fechaCalendario: Date; // Variable para almacenar la fecha seleccionada
  idUsuario: number 
  idRol: number 
  usuarios: Usuario[] = [];
  listaUsuarios: UsuarioUbicacion [] = [];
  listaUsuariosFiltrados: UsuarioUbicacion [] = [];
  dataSource = new MatTableDataSource<UsuarioUbicacion>();
  contadorFiltro : number =0
  displayedColumns: string[] = [
    'Id',
    'Usuario',
    'UltimaConexion'];

  apiLoaded: Observable<boolean>;
  center: google.maps.LatLngLiteral = { lat: -25.348158333333334, lng: -57.461571666666664 };
  zoom = 12;
  display: any;
  markerPositions: google.maps.LatLngLiteral[] = [];
  labels: { color: string; fontWeight: string, fontSize: string, text: string,ultimoUbicacion: string,userName:String, hora: string, estado: boolean }[] = [];
  iconoFinal = {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: 'red',  // Color de relleno
    fillOpacity: 5,  // Opacidad del relleno
    scale: 12,  // Tamaño del icono
    strokeColor: 'black',  // Color del borde
    strokeWeight:1  // Ancho del borde
  };

  iconoRojo = {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: 'green',  // Color de relleno
    fillOpacity: 1,  // Opacidad del relleno
    scale: 12,  // Tamaño del icono
    strokeColor: 'black',  // Color del borde
    strokeWeight:1  // Ancho del borde
};
  markerOptions: google.maps.MarkerOptions = {
    draggable: false, icon: this.iconoRojo}
  
  markerOptionsFinal: google.maps.MarkerOptions = {
    draggable: false, icon: this.iconoFinal}
     
  ngOnInit() {
    // Cargar listaUsuarios desde el backend por HTTP cuando exista el endpoint (ej. última ubicación por usuario).
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  ngAfterViewInit() {
  
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  rastrear() {
    this.isLoading = true;
    try { 

      
 
         this.markerPositions = this.listaUsuariosFiltrados.map(visita => ({
          lat: parseFloat(visita.latitud),
          lng: parseFloat(visita.longitud)
        }));

        this.labels = this.listaUsuariosFiltrados.map(visita => {
          const createdAt = moment(visita.ultimaActualizacion); // Agrega 4 horas a la fecha de visita
          return {
            color: 'white',
            ultimoUbicacion:"1",
            fontSize: '10px',
            text: visita.id.toString() ,
            hora: ( createdAt.format('HH:mm') + ' Hs.'),
            userName: visita.username,
            fontWeight: 'bold',
            estado:visita.estado
          };
        });
        this.isLoading = false;
        this.dataSource.data = this.listaUsuarios;
        this.dataSource.sort = this.sort;


    } catch (error) {
      console.log(error);
      this.isLoading = false;
    }
 
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase().trim();
    this.dataSource.filter = filterValue; // Filtra la tabla de datos
    this.listaUsuariosFiltrados=this.dataSource.filteredData
     this.rastrear()

  
   }
  
  
  handleUsuarioSeleccionado(idUsuario: number) {
  //  console.log('ID de usuario seleccionado en OtroComponente:', idUsuario);
    this.idUsuario=idUsuario
 }
  abrirInfoWindow(index: number) {
  const label = this.labels[index]; // Obtener la etiqueta del marcador seleccionado
    this._snackBar.open(label.hora +': '+label.userName, 'Cerrar', {
      duration: 10000,panelClass: ['my-snack-bar']
    });
  }
}

