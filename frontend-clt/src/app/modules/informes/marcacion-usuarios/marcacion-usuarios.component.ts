import { Component, ViewChild } from '@angular/core';
import { MarcacionUsuarios } from './MarcacionUsuarios';
import { MatTableDataSource } from '@angular/material/table';
import { MarcacionUsuariosService } from './marcacionUsuarios.service';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import * as moment from 'moment';
import { TableUtil } from '@core/utils/tableUtil';
  import {  MatTableModule } from '@angular/material/table';
import { Visitas } from '@models/Visitas';
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
  selector: 'app-marcacion-usuarios',
  standalone: true,
  imports: [MatFormFieldModule,MatDatepickerModule,MatProgressSpinnerModule,MatIconModule,
    MatInputModule,FormsModule,CommonModule,BreadcrumbComponent,MatButtonModule,SelectUsuarioComponent,MatTableModule,
    MatSnackBarModule,MatPaginatorModule],
  templateUrl: './marcacion-usuarios.component.html',
  styleUrl: './marcacion-usuarios.component.scss'
})

export class MarcacionUsuariosComponent {
  breadscrums = [
    {
      title: 'Informes',
      items: ['Home'],
      active: 'Informe de entrada y salida de usuarios',
    } ];

  constructor( private marcacionUsuariosService:MarcacionUsuariosService,    private _snackBar: MatSnackBar) { }
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  showLoading: boolean = true;
  isLoading = false;
  startDate: Date;
  endDate: Date;
  dataSource = new MatTableDataSource<MarcacionUsuarios>();
  noData=false
  displayedColumns: string[] = [
    'Usuario',
    'diaSemana',
    'fecha',
    'primerRegistroManana',
    'ultimoRegistroManana',
    'primerRegistroTarde',
    'ultimoRegistroTarde',
    'tiempoDespuesDeSalida',
  ];
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
  const ListadoArray:  Partial<MarcacionUsuarios>[] = this.dataSource.data.map(item => ({
    "usuario": item.usuario,
    "Dia": item.diaSemana,
    "Fecha": item.fecha,
    "Entrada Mañana	": item.primerRegistroManana,
    "Salida Mañana": item.ultimoRegistroManana,
    "Entrada Tarde	": item.primerRegistroTarde,
    "Salida Tarde": item.ultimoRegistroTarde,
    "Tiempo despues de Salida (Minutos)": item.tiempoDespuesDeSalida
 }));
  
  TableUtil.exportArrayToExcel(ListadoArray, "Informe marcacion de usuarios");
}

}
