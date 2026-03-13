import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { ConsumoBateriaUsuario } from './consumoBateriaUsuario';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ListaConsumoBateriaUsuarioService } from './getConsumoBateriaUsuario.service';
import { TableUtil } from '@core/utils/tableUtil';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
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
import { MatSnackBarModule } from '@angular/material/snack-bar';
@Component({
  selector: 'app-consumo-bateria-usuarios',
  standalone: true,
  imports: [MatFormFieldModule,MatDatepickerModule,MatProgressSpinnerModule,MatIconModule,
    MatInputModule,FormsModule,CommonModule,BreadcrumbComponent,MatButtonModule,MatTableModule,
    MatSnackBarModule,MatPaginatorModule],
  templateUrl: './consumo-bateria-usuarios.component.html',
  styleUrl: './consumo-bateria-usuarios.component.scss'
})
export class ConsumoBateriaUsuariosComponent implements OnInit {
  constructor(
    private listaConsumoBateriaUsuarioService: ListaConsumoBateriaUsuarioService
    ) {}
    @ViewChild(MatPaginator) paginator: MatPaginator;
   @ViewChild(MatSort, { static: true }) sort: MatSort;
   breadscrums = [
    {
      title: 'Informes',
      items: ['Home'],
      active: 'Informe de consumo de bateria por usuarios',
    } ];
  displayedColumns: string[] = [
    'Usuario',
    'Rol',
    'NombreDia',
    'fecha',
    'Hora6',
    'Hora7',
    'Hora8',
    'Hora9',
    'Hora10',
    'Hora11',
    'Hora12',
    'Hora13',
    'Hora14',
    'Hora15',
    'Hora16',
    'Hora17',
    'Hora18',
    'Hora19',
    ];

  ngOnInit(): void
  {
   }

   fechaCalendario: Date; // Variable para almacenar la fecha seleccionada
   fechaCalendario2: Date; // Variable para almacenar la fecha seleccionada

  
  isLoading = false;
  noData=false
  consumoBateriaUsuario: any[] = [];
  dataSource = new MatTableDataSource<ConsumoBateriaUsuario>();

/*
  onDateChange(event: MatDatepickerInputEvent<Date>) {
    this.fechaCalendario = event.value;
  }*/

  
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  fetchListado() 
  {
/*
    const fecha = new Date(this.fechaCalendario);
    // Obtener el día, mes y año
    const dia = fecha.getUTCDate();
    const mes = fecha.getUTCMonth() + 1; // Sumamos 1 ya que los meses en JavaScript comienzan desde 0
    const anio = fecha.getUTCFullYear();

    const fechaFormateada = `${dia.toString().padStart(2, '0')}/${mes.toString().padStart(2, '0')}/${anio}`;
*/
    this.isLoading = true; // Establece la variable como verdadera antes de realizar la solicitud
   // this.listaConsumoBateriaUsuarioService.getListaConsumoBateriaUsuario(fechaFormateada.toString() ).subscribe(
      this.listaConsumoBateriaUsuarioService.getListaConsumoBateriaUsuario(this.fechaCalendario,this.fechaCalendario2 ).subscribe(
        (response) => {
        this.dataSource.data = response;
        this.dataSource.sort = this.sort;
          this.isLoading = false; // Establece la variable como falsa después de recibir los datos
      },
      (error) => {
        console.error('Error al consultar los usuarios:', error);
        this.isLoading = false; // Establece la variable como falsa en caso de error también
      }
    ) 
  }
  
  exportArray() {
    const ListadoArray:  Partial<ConsumoBateriaUsuario>[] = this.dataSource.data.map(item => ({
      "Usuario": item.Usuario, 
      "Rol": item.Rol, 
      "Dia": item.NombreDia, 
      "Fecha": item.fecha, 
      
    "06:00": item.Hora6, 
    "07:00": item.Hora7, 
    "08:00": item.Hora8, 
    "09:00": item.Hora9, 
    "10:00": item.Hora10, 
    "11:00": item.Hora11, 
    "12:00": item.Hora12, 
      "13:00": item.Hora13, 
      "14:00": item.Hora14, 
      "15:00": item.Hora15, 
      "16:00": item.Hora16, 
      "17:00": item.Hora17, 
      "18:00": item.Hora18, 
      "19:00": item.Hora19 
}));
    
    TableUtil.exportArrayToExcel(ListadoArray, "Informe consumo bateria");
  }

}
