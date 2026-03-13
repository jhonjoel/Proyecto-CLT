import { Component, OnInit, ViewChild } from '@angular/core';
import { Usuario } from '@models/Usuario';
import * as moment from 'moment';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { TableUtil } from '@core/utils/tableUtil';
import { ActivityLogService } from '@services/comercial/getActivityLog.service';
import { ActivityLog } from '@models/ActivityLog';
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
  selector: 'app-log-activity',
  standalone: true,
  imports: [MatFormFieldModule,MatDatepickerModule,MatProgressSpinnerModule,MatIconModule,
    MatInputModule,FormsModule,CommonModule,BreadcrumbComponent,MatButtonModule,SelectUsuarioComponent
    ,MatTableModule,
    MatSnackBarModule,MatPaginatorModule],
  templateUrl: './log-activity.component.html',
  styleUrl: './log-activity.component.scss'
})
export class LogActivityComponent implements OnInit  {
  breadscrums = [
    {
      title: 'Informes',
      items: ['Home'],
      active: 'Informe de actividades',
    } ];
  idUsuario: number 
  isLoading = false ; 
  startDate: Date;
  endDate: Date;
  dataSource = new MatTableDataSource<ActivityLog>();
  noData=false
  usuarios: Usuario[] = [];
  displayedColumns: string[] =    [
    'Fecha' ,
    'Etiqueta',
    'Componente',
    'Bateria'  ];
  constructor ( private activityLogService: ActivityLogService, private _snackBar: MatSnackBar ) { }
  
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  ngOnInit() {
   }
   handleUsuarioSeleccionado(idUsuario: number) {
    console.log('ID de usuario seleccionado en OtroComponente:', idUsuario);
    this.idUsuario=idUsuario
 }
    ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

 
  exportArray() {
  const logArray: Partial<ActivityLog>[] = this.dataSource.data.map(item => ({
    Fecha: item.fecha.toString(),
    "Etiqueta": item.etiqueta.toString(),
    "Componente": item.componente.toString(),
    "bateria": item.bateria.toString()
   
    }));
  
  TableUtil.exportArrayToExcel(logArray, "Informe de actividades");
}


  buscar(){
      console.log(moment.utc(this.startDate).format('YYYY-MM-DD')+"   "+moment.utc(this.endDate).format('YYYY-MM-DD') )


      if (!this.idUsuario || !this.startDate || !this.endDate) {
        // Si el idUsuario o la fechaCalendario no tienen valores, muestra un mensaje de error al usuario.
         this._snackBar.open('Error: Usuario y fecha son obligatorios.', 'Cerrar', {
          duration: 3000,
        });
        return;
      }
      this.isLoading = true;
      try {
        this.activityLogService.getActivityLog(this.idUsuario.toString(), moment.utc(this.startDate).format('YYYY-MM-DD'),moment.utc(this.endDate).format('YYYY-MM-DD')).subscribe(inventario => {
        if (inventario.length > 0) {
       // Si hay datos, asignarlos a la tabla
      this.dataSource.data = inventario;
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
}
