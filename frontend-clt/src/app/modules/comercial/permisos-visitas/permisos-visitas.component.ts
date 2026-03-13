import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Usuario } from '@core/models/Usuario';
import { UsuariosService } from '@core/services/main/listaUsuarios.services';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { environment } from '@environment/environment'; // Ajusta la ruta según la ubicación del archivo de entorno
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
 
  datos: [{id:any}];
 
}
@Component({
  selector: 'app-permisos-visitas',
  standalone: true,
  imports: [MatFormFieldModule,MatDatepickerModule,MatProgressSpinnerModule,MatIconModule,
    MatInputModule,FormsModule,CommonModule,MatTableModule ,MatPaginatorModule,BreadcrumbComponent,MatButtonModule],
  templateUrl: './permisos-visitas.component.html',
  styleUrl: './permisos-visitas.component.scss'
})
export class PermisosVisitasComponent implements OnInit, AfterViewInit{
  ngAfterViewInit(): void
  {
     this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  ngOnInit(): void
  {
    this.fetchUsuarios();
    const token = localStorage.getItem("token");

    if (token) {
    
      const decodedToken: any = jwtDecode(token);
      this.idUsuario= decodedToken.datos[0].id;
      console.log(this.idUsuario)
      
    }
    /*const decodedToken: DecodedToken = jwt_decode(
      localStorage.getItem('token')
    ) as DecodedToken;
   *//*
  
    const usuario: number = decodedToken.datos[0].id;
    this.idUsuario=usuario
    console.log(this.idUsuario)*/
   }
   breadscrums = [
    {
      title: 'Comercial',
      items: ['Home'],
      active: 'Permisos de visitas usuarios',
    },
  ];
   displayedColumns: string[] = [
    'id',
    'nombre',
    'apellido',
    'usuario',
    'area',
    'createdAt',
    'acciones',
    'permisosTarde',
  ];
  dataSource = new MatTableDataSource<Usuario>();
  procesando: { [key: number]: boolean } = {};
  procesandoFP: { [key: number]: boolean } = {};
  idUsuario : number 
  consultandoDatos: boolean = false; // Variable para mostrar el mensaje de "Consultando datos"
  private endpoint = '/permisosVisitasInsert';
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private usuariosService: UsuariosService,
    private _snackBar: MatSnackBar,
    private http: HttpClient
  ) {}


  fetchUsuarios() {
    this.consultandoDatos = true; // Establece la variable como verdadera antes de realizar la solicitud
    this.usuariosService.getUsuarios().subscribe(
      (response) => {
        this.dataSource.data = response.usuarios;
        this.consultandoDatos = false; // Establece la variable como falsa después de recibir los datos
      },
      (error) => {
        console.error('Error al consultar los usuarios:', error);
        this.consultandoDatos = false; // Establece la variable como falsa en caso de error también
      }
    );
  }

  
  permitirAcceso(id: number) {
    this.procesando[id] = true;
   // console.log('Permitir acceso al usuario con ID:', id);
    const accessToken = localStorage.getItem('token');
    // Crear el encabezado con el token
    const options = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };

    this.http
      .post<any>(`${environment.apiUrl}${this.endpoint}`, {
        idUsuario: id,
        tipoPermiso: 'INICIOVISITA',
        idUsuarioGenerado:this.idUsuario
      }, options)
      .subscribe(
        (response) => {
          this.procesando[id] = false;
          const message = response.message;
          // this.toastr.success('Acceso permitido', 'Éxito');
          this._snackBar.open(message, 'Cerrar', {
            duration: 3000,
          });
        },
        (error) => {
          this.procesando[id] = false;
          this._snackBar.open(error, 'Cerrar', {
            duration: 3000,
          });
        }
      );
  }
  permitirSalidaFueraPunto(id: number) {
    this.procesandoFP[id] = true;
    const accessToken = localStorage.getItem('token');

    // Crear el encabezado con el token
    const options = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };

    this.http
      .post<any>(`${environment.apiUrl}${this.endpoint}`, {
        idUsuario: id,
        tipoPermiso: 'SALIDA_FUERA_PUNTO',
        idUsuarioGenerado:this.idUsuario
      },options)
      .subscribe(
        (response) => {
          this.procesandoFP[id] = false;
          const message = response.message;
           this._snackBar.open("Permiso de finalizacion de visita fuera del punto correcto. ", 'Cerrar', {
            duration: 3000,
          });
        },
        (error) => {
          this.procesandoFP[id] = false;
          this._snackBar.open(error, 'Cerrar', {
            duration: 3000,
          });
        }
      );
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
