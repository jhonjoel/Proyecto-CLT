import { Component, ViewChild } from '@angular/core';
import { PermisosVisitas } from './PermisosVisitas';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { PermisosVisistasService } from './permisosVisitas.service';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import * as moment from 'moment';
import { TableUtil } from '@core/utils/tableUtil';
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
@Component({
  selector: 'app-informe-permisos-visitas',
  standalone: true,
  imports: [MatFormFieldModule,MatDatepickerModule,MatProgressSpinnerModule,MatIconModule,
    MatInputModule,FormsModule,CommonModule,BreadcrumbComponent,MatButtonModule,SelectUsuarioComponent,MatTableModule,
    MatSnackBarModule,MatPaginatorModule],
  templateUrl: './informe-permisos-visitas.component.html',
  styleUrl: './informe-permisos-visitas.component.scss'
})
export class InformePermisosVisitasComponent {

  constructor( private marcacionUsuariosService:PermisosVisistasService,    private _snackBar: MatSnackBar) { }
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  showLoading: boolean = true;
  isLoading = false;
  startDate: Date;
  endDate: Date;
  dataSource = new MatTableDataSource<PermisosVisitas>();
  noData=false
  
  breadscrums = [
    {
      title: 'Informes',
      items: ['Home'],
      active: 'Informe de permisos otorgados a usuarios',
    } ];
  displayedColumns: string[] = [
    'Tipo de permiso', 
    'Usuario',
    'Autorizado Por',
    'Dia',
    'Fecha',
    'Hora'  ];
  obtenerDatos(){
 //  console.log(moment.utc(this.startDate).format('YYYY-MM-DD')+"   "+moment.utc(this.endDate).format('YYYY-MM-DD') )
if (  !this.startDate || !this.endDate) {
      // Si el idUsuario o la fechaCalendario no tienen valores, muestra un mensaje de error al usuario.
       this._snackBar.open('Error: Usuario y fecha son obligatorios.', 'Cerrar', {
        duration: 3000,
      });
      return;
    }
    this.isLoading = true;
    try {
      this.marcacionUsuariosService.buscar( moment.utc(this.startDate).format('YYYY-MM-DD'),moment.utc(this.endDate).format('YYYY-MM-DD')).subscribe(marcaciones => {
      if (marcaciones.length > 0) {
     // Si hay datos, asignarlos a la tabla
    this.dataSource.data = marcaciones;
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


  
applyFilter(event: Event) {
  const filterValue = (event.target as HTMLInputElement).value;
  this.dataSource.filter = filterValue.trim().toLowerCase();

  if (this.dataSource.paginator) {
    this.dataSource.paginator.firstPage();
  }
}

exportArray() {
  const ListadoArray:  Partial<PermisosVisitas>[] = this.dataSource.data.map(item => ({
    "usuario": item.usuario,
    "Autorizado por": item.autorizadoPor,
    "Dia": item.diaSemana,
    "Fecha": item.createdAt,
    "Hora": item.createdAtHour,
    "Tipo de permiso": item.tipoPermiso,
    
 }));
  
  TableUtil.exportArrayToExcel(ListadoArray, "Informe permisos de usuarios");
}

}