import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ListaVisitas } from './visitasFecha';
import { ListaVisitasService } from './getListaVisitas.service';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TableUtil } from '@shared/utilities/tableUtil';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { MatButtonModule } from '@angular/material/button';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-visitas-fechas',
  standalone: true,
  imports: [MatFormFieldModule,MatDatepickerModule,MatProgressSpinnerModule,MatIconModule,
    MatInputModule,FormsModule,CommonModule,MatTableModule ,MatPaginatorModule,BreadcrumbComponent,MatButtonModule ],
  templateUrl: './visitas-fechas.component.html',
  styleUrl: './visitas-fechas.component.scss'
})
export class VisitasFechasComponent implements OnInit, AfterViewInit {
  breadscrums = [
    {
      title: 'Informes',
      items: ['Home'],
      active: 'Visitas por fecha',
    },
  ];
  ngAfterViewInit(): void
  {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  ngOnInit(): void
  {
  }
  constructor(
    private listaVisitasService: ListaVisitasService,
  ) {}
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  displayedColumns: string[] = [
    'secuencia',
    'rol',
    'usuarioLogin',
    'usuario',
    'ocrdName',
    'NombreDia',
    'fecha',
    'inicio',
    'fin',
    'permanencia',
    'llegadaTardiaInicio',
    'tipoCierre',
    'bateriaInicio',
    'bateriaFin',
    'versionAPP'
   ];
  dataSource = new MatTableDataSource<ListaVisitas>();
  procesando: { [key: number]: boolean } = {};
  consultandoDatos: boolean = false; // Variable para mostrar el mensaje de "Consultando datos"
  isLoading: boolean = false; // Variable para mostrar el mensaje de "Consultando datos"
  fechaCalendario: Date ; // Variable para almacenar la fecha seleccionada
  fechaCalendario2: Date; // Variable para almacenar la fecha seleccionada
  noData=false

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
 

  fetchListado() {
    this.consultandoDatos = true; // Establece la variable como verdadera antes de realizar la solicitud
    this.isLoading = true; // Establece la variable como verdadera antes de realizar la solicitud
    this.listaVisitasService.getListaVisitas(this.fechaCalendario,this.fechaCalendario2 ).subscribe(
      (response) => {
        this.dataSource.data = response;
        this.dataSource.sort = this.sort;
        this.consultandoDatos = false; // Establece la variable como falsa después de recibir los datos
        this.isLoading = false; // Establece la variable como falsa después de recibir los datos
      },
      (error) => {
        console.error('Error al consultar los usuarios:', error);
        this.consultandoDatos = false; // Establece la variable como falsa en caso de error también
      }
    );
  }

  exportArray() {
    const inventarioArray:  Partial<ListaVisitas>[] = this.dataSource.data.map(item => ({
      
       //Secuencia: item.secuencia,
        Rol: item.rol ,
        usuarioLogin: item.usuarioLogin ,
        Usuario: item.usuario ,
        PuntoVenta: item.ocrdName ,
        Dia:item.NombreDia,
        Fecha: item.fecha ,
        Inicio: item.inicio ,
        Cierre: item.fin ,
        Permanencia: item.permanencia ,
        LlegadaTardia: item.llegadaTardiaInicio ,
        TipoFinalizacion: item.tipoCierre ,
    }));
    
    TableUtil.exportArrayToExcel(inventarioArray, "Informe de visitas");
  }

 
 
  exportToExcel(): void {
    const groupedData = this.groupDataByUser();
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
      // Crear una hoja con todos los datos
    const allUserData: any[] = this.generateAllDataSheet(groupedData);
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(allUserData, { skipHeader: true });
      // Agregar la hoja al libro
    XLSX.utils.book_append_sheet(workbook, worksheet, 'data');
      // Crear el buffer y descargar el archivo
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, 'output.xlsx');
  } 
   
  
  private groupDataByUser(): any[] {
    const inventarioArray: Partial<ListaVisitas>[] = this.dataSource.data;
    
    const groupedDataMap = new Map<string, any>(); // Usamos un mapa para agrupar por usuario
  
    inventarioArray.forEach(item => {
      const key = item.usuario;

      if (typeof key === 'string') {
        if (!groupedDataMap.has(key)) {
          groupedDataMap.set(key, { usuario: key, horaPermanenciaTotal: 0, detalle: [] });
          const existingUser = groupedDataMap.get(key);
          existingUser.detalle.push({ fecha: item.fecha, horaPermanencia: item.permanenciaMinutos,horaInicio: item.inicio,horaFin: item.fin,permanenciaHoras:item.permanencia ,tipoCierre:item.tipoCierre });
      
          // Sumar los minutos utilizando reduce
          const minutosACumular = existingUser.detalle.map((detalle: any) => parseInt(detalle.horaPermanencia));
          existingUser.horaPermanenciaTotal = this.sumarMinutos(minutosACumular);
        }
    }  
  
    
    });
  
    // Convertimos el mapa de nuevo a un array de objetos
    const groupedData: any[] = Array.from(groupedDataMap.values());
    return groupedData;
  }
 
  private generateAllDataSheet(groupedData: any[]): any[] {
    const result: any[] = [];
  
    // Agregamos una entrada para la cabecera
    result.push({ columna1: 'Usuario/Fechas', columna2: 'Total Permanencia/ permanencias',   columna3: 'Hora Inicio', columna4: 'Hora Fin', columna5: 'Tipo Cierre' });
  
    groupedData.forEach(usuario => {
      // Agregamos una entrada para el usuario con la hora total de permanencia
      result.push({ columna1: usuario.usuario, columna2: usuario.horaPermanenciaTotal });
  
      // Agregamos entradas para fecha y hora de permanencia
      usuario.detalle.forEach((detalle:any) => {
        result.push({ columna1: detalle.fecha, columna2: detalle.permanenciaHoras, columna3: detalle.horaInicio, columna4: detalle.horaFin , columna5: detalle.tipoCierre    });
      });
    });
  
    return result;
  } 
  
  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url: string = window.URL.createObjectURL(data);
    const a: HTMLAnchorElement = document.createElement('a');
  
    document.body.appendChild(a);
    a.href = url;
    a.download = fileName;
    a.click();
  
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } 
  sumarMinutos(minutosArray: number[]): string {
    const totalMinutos = minutosArray.reduce((acumulado, actual) => acumulado + actual, 0);
  
    const horasResultantes = Math.floor(totalMinutos / 60);
    const minutosResultantes = totalMinutos % 60;
  
    const horasFormateadas = horasResultantes.toString().padStart(2, '0');
    const minutosFormateados = minutosResultantes.toString().padStart(2, '0');
  
    return `${horasFormateadas}:${minutosFormateados}`;
  }  }