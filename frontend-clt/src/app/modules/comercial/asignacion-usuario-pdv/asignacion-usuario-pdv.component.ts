import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ParametrosEvento } from '@components/select-ocrd/ParametrosOcrd';
import { DateFormatService } from '@core/utils/formatearFecha.service';  
import { environment } from '@environment/environment'; // Ajusta la ruta según la ubicación del archivo de entorno
import { SelectOcrdComponent } from '@components/select-ocrd/select-ocrd.component';
import { SelectUsuarioComponent } from '@components/select-usuario/select-usuario.component';
import { ListaMatrixService } from './getMatrix.service';
import { ListaMatrix } from './matrix';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { MatButtonModule } from '@angular/material/button'; 
import { MatSelectModule } from '@angular/material/select';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { ModalMatrixComponent } from '@components/modal-matrix/modal-matrix.component';  // Asegúrate de que la ruta sea correcta.
import { ModalMatrixDuplicarComponent } from '@components/modal-matrix-duplicar/modal-matrix-duplicar.component';
import { MatAccordion } from '@angular/material/expansion';
import { MatExpansionModule } from '@angular/material/expansion';
import { TipoAsignacionUsuPvComponent } from '@components/tipo-asignacion-usu-pv/tipo-asignacion-usu-pv.component';
import {  MatTableModule } from '@angular/material/table';
 import { NgxDatable } from 'app/tables/ngx-datatable/ngx-datatable.model';
 import { TableUtil } from '@core/utils/tableUtil';

import { DatatableComponent, SortType, NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgxDatableMatrix } from './ngx-datatable.model';
import { MatTooltipModule } from '@angular/material/tooltip';


@Component({
  selector: 'app-asignacion-usuario-pdv',
  standalone: true,
  imports: [MatFormFieldModule,MatDatepickerModule,MatProgressSpinnerModule,MatIconModule,
    MatInputModule,FormsModule,CommonModule,BreadcrumbComponent,MatButtonModule,MatSelectModule,
    ReactiveFormsModule,NgxMatSelectSearchModule,MatAccordion,MatExpansionModule,SelectOcrdComponent,
    SelectUsuarioComponent,TipoAsignacionUsuPvComponent,MatTableModule,MatPaginatorModule,NgxDatatableModule,MatTooltipModule ],
  templateUrl: './asignacion-usuario-pdv.component.html',
  styleUrl: './asignacion-usuario-pdv.component.scss'
})
 

export class AsignacionUsuarioPdvComponent implements OnInit{
  ngOnInit(): void
  {
    this.listarMatrix()
  }
  ngAfterViewInit(): void
  {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  constructor( 
    private _snackBar: MatSnackBar,
    private dateFormatService: DateFormatService,
    private listaMatrixService:ListaMatrixService,
    public dialog: MatDialog,
    private http: HttpClient,
 
  
   ) {}
   @ViewChild(SelectOcrdComponent) selectOcrdComponent: SelectOcrdComponent; 
   //ESTA PARTE LLAMO DOS VECES AL MISMO COMPONENTE, ENTONCES TENGO QUE AGREGARLES ID PROPIO PARA QUE ME PUEDAN RESETEAR AMBOS.
   @ViewChild('selectorPromotor') selectPromotorComponent: SelectUsuarioComponent;
   @ViewChild('selectorSupervisor') selectSupervisorComponent: SelectUsuarioComponent;
   @ViewChild(DatatableComponent, { static: false }) table!: DatatableComponent;

   displayedColumns: string[] = [
    
    "CardName",
    "Supervisora",
    "Usuario",
    "Vigencia",
    "nameTipoAsignacion",
    "Accion"
  ];
  breadscrums = [
    {
      title: 'Comercial',
      items: ['Home'],
      active: 'Asignacion de puntos de ventas a usuarios',
    } ];
  private endpoint = '/comercial/matrixInsert';
  private endpointDelete = '/comercial/matrixDelete';
  idPromotor :number | null;
  namePromotor :String| null;
  idOcrd: String| null;
  nameOcrd: String| null;
  idtipoAsignacion: number| null;
  nameTipoAsignacion: String| null;
  idSupervisor: number| null;
  nameSupervisor: String| null
  startDate: Date| null
  endDate: Date| null
  valorFiltro:String| null;
  isLoading = false;
  private matrixData: any;
  dataSource = new MatTableDataSource<ListaMatrix>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  timePickerEnabled = false; 
  isLoadingTabla=false;

  data: NgxDatableMatrix[] = [];
  filteredData: NgxDatableMatrix[] = [];
  SortType = SortType;
  columns = [
    { name: 'ocrdName' },
    { name: 'supervisora' },
    { name: 'promotor' },
    { name: 'vigencia' },
    { name: 'tipoAsignacion' } 
  ];
 /*
applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
}*/
extractTime(isoString: string): string {
    const date = new Date(isoString);
    return date.toISOString().substring(11, 16); // HH:MM
  }
toggleTimePicker() {
    this.timePickerEnabled = !this.timePickerEnabled;
   }
  // Función para exponer formatDateReal en la plantilla
    formatDateRealInComponent(fecha: string | Date| null): string | null {
    return this.dateFormatService.formatDateReal(fecha);
  }

listarMatrix() {
  this.isLoadingTabla=true;
    this.listaMatrixService.getMatrix().subscribe(
      (response) => {
         this.dataSource.data = response;
     
         this.fetch((data: NgxDatableMatrix[]) => {
          this.data = data;
          this.filteredData = data;
    
        }); 
        this.dataSource.sort = this.sort;
        this.matrixData = response; // Almacenar los datos para usarlos más tarde
        //console.log(this.valorFiltro)
         this.applyFilter()

       },
      (error) => {
        console.error('Error al consultar los usuarios:', error);
      }
    );
  }
  
  actualizarDesdeHijo() {
    this.listarMatrix();
  }

  exportArray() {
    const inventarioArray: Partial<ListaMatrix>[] = this.dataSource.data.map(item => ({
   
      id: item.id,
      createdAt:  item.createdAt,
      id_OCRD:  item.id_OCRD,
      CardName:  item.CardName,
      Id_Sup:  item.Id_Sup,
      Supervisora:  item.Supervisora,
      Id_Usuario:  item.Id_Usuario,
      Usuario:  item.Usuario,
      Lunes:  item.Lunes,
      Lunes_E:  item.Lunes_E,
      Lunes_S:  item.Lunes_S,
      Lunes_P:  item.Lunes_P,
      Martes:  item.Martes,
      Martes_E:  item.Martes_E,
      Martes_S:  item.Martes_S,
      Martes_P:  item.Martes_P,
      Miercoles:  item.Miercoles,
      Miercoles_E: item.Miercoles_E,
      Miercoles_S:  item.Miercoles_S,
      Miercoles_P: item.Miercoles_P,
      Jueves:  item.Jueves,
      Jueves_E:  item.Jueves_E,
      Jueves_S:  item.Jueves_S,
      Jueves_P:  item.Jueves_P,
      Viernes:  item.Viernes,
      Viernes_E:  item.Viernes_E,
      Viernes_S:  item.Viernes_S,
      Viernes_P:  item.Viernes_P,
      Sabado:  item.Sabado,
      Sabado_E:  item.Sabado_E,
      Sabado_S:  item.Sabado_S,
      Sabado_P:  item.Sabado_P,
      Domingo:  item.Domingo,
      Domingo_E:  item.Domingo_E,
      Domingo_S:  item.Domingo_S,
      Domingo_P:  item.Domingo_P,
      fechaInicio:  item.fechaInicio,
      fechaFin:  item.fechaFin,
      idTipoAsignacion:  item.idTipoAsignacion,
      nameTipoAsignacion: item.nameTipoAsignacion
    }));
    
    TableUtil.exportArrayToExcel(inventarioArray, "Matrix"); 
    }
  
idPromotorSeleccionado(promotor: any) {
   // console.log( promotor.id);
   // console.log( promotor.nombre);
    this.idPromotor=promotor.id;
    this.namePromotor=promotor.nombre;
}
idSupervisorSeleccionado(supervisor :any) {
  //console.log( supervisor.id);
 // console.log( supervisor.nombre);
 this.idSupervisor=supervisor.id
 this.nameSupervisor=supervisor.nombre
}

idOcrdSeleccionado(parametrosEvento: ParametrosEvento) {
  this.idOcrd = parametrosEvento.idOcrd;
  this.nameOcrd =parametrosEvento.nameOcrd

  //console.log(this.idOcrd)
 // console.log(this.nameOcrd) 
}

tipoSeleccionado(parametrosEvento: any) {
  this.idtipoAsignacion = parametrosEvento.id;
  this.nameTipoAsignacion=parametrosEvento.nombre
 // console.log(this.idtipoAsignacion)
 // console.log(this.nameTipoAsignacion) 
}
  
registrar() {
 
  this.isLoading=true

  if(this.idOcrd==null){
    this._snackBar.open("Seleccione el punto de venta", 'Cerrar', {
      duration: 3000,
      
    });
    this.isLoading  = false;

   } 
  else if(this.idPromotor==null){
    this._snackBar.open("Seleccione el promotor", 'Cerrar', {
      duration: 3000,
    });
    this.isLoading  = false;

   } 
   else if(this.idSupervisor==null){
    this._snackBar.open("Seleccione el supervisor", 'Cerrar', {
      duration: 3000,
    });
    this.isLoading  = false;

   } 
   else if(this.startDate=== undefined){
    this._snackBar.open("Seleccione fecha de inicio", 'Cerrar', {
      duration: 3000,
    }
    );
    this.isLoading  = false;

   } 
   
   
   else {
    //console.log(this.formatStartDate(this.startDate)+'  '+this.formatStartDate(this.endDate))
    this.http
    .post<any>(`${environment.apiUrl}${this.endpoint}`, {
      idPromotor:this.idPromotor,
      namePromotor:this.namePromotor,
      idOcrd:this.idOcrd,
      nameOcrd:this.nameOcrd,
      idtipoAsignacion:this.idtipoAsignacion,
      nameTipoAsignacion:this.nameTipoAsignacion,
      idSupervisor:this.idSupervisor,
      nameSupervisor:this.nameSupervisor,
      startDate: (this.startDate),
      endDate: (this.endDate),

     })
    .subscribe(
      (response) => {
      //  console.log(response)
        const message = response.msg;
        // this.toastr.success('Acceso permitido', 'Éxito');
         this._snackBar.open(message, 'Cerrar', {
          duration: 3000,
        });

        if(response.tipo==0){
        this.idPromotor=null,
        this.namePromotor=null,
        this.idOcrd=null,
        this.nameOcrd=null,
        this.idtipoAsignacion=null,
        this.nameTipoAsignacion=null,
        this.idSupervisor=null,
        this.nameSupervisor=null,
        this.startDate=null,
        this.endDate=null
        this.isLoading  = false;
        this.selectOcrdComponent.resetSearch();
        this.selectPromotorComponent.resetSearch();
        this.selectSupervisorComponent.resetSearch();
        this.listarMatrix() 
      }
      else {
        this.isLoading  = false;

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


eliminar(id:number) {
  
    //console.log(this.formatStartDate(this.startDate)+'  '+this.formatStartDate(this.endDate))
    this.http
    .post<any>(`${environment.apiUrl}${this.endpointDelete}`, {
      id:id

     })
    .subscribe(
      (response) => {
      //  console.log(response)
        const message = response.msg;
        // this.toastr.success('Acceso permitido', 'Éxito');
         this._snackBar.open(message, 'Cerrar', {
          duration: 3000,
        });

      this.listarMatrix()   
        
      },
      (error) => {
        this.isLoading = false;
        this._snackBar.open(error, 'Cerrar', {
          duration: 3000,
        });
      }
    );

 

}


openModalMatrixDuplicate(id: any): void {
  const item = this.matrixData.find((element: any) => element.id === id);
  //console.log(id)
  const dialogRef = this.dialog.open(ModalMatrixDuplicarComponent, {
    width: '1000px',
    data: { matrixData: item }
  });

  dialogRef.afterClosed().subscribe(result => {
    // Aquí result contiene los datos enviados desde el modal si los hay
    // Ejecuta la función que deseas al cerrar el modal
    this.listarMatrix()
  });
}
openModalMatrix(id: number): void {
  const item = this.matrixData.find((element: any) => element.id === id);

  const dialogRef = this.dialog.open(ModalMatrixComponent, {
    width: '1000px',
    data: { matrixData: item }
  });

  dialogRef.afterClosed().subscribe(result => {
    // Aquí result contiene los datos enviados desde el modal si los hay
    // Ejecuta la función que deseas al cerrar el modal
    this.listarMatrix()
  });
}



fetch(cb: (i: NgxDatableMatrix[]) => void) {
  if (this.dataSource && this.dataSource.data.length > 0) {
    // Transformando cada Inventario en NgxDatable.
    const ngxDatables: NgxDatableMatrix[] = this.dataSource.data.map((matrix) => ({
      // Aquí debes mapear todas las propiedades necesarias de Inventario a NgxDatable
      ocrdName: matrix.CardName,
      supervisora: matrix.Supervisora,
      promotor: matrix.Usuario,
      vigencia: this.formatDateRealInComponent(matrix.fechaInicio)  +'-'+this.formatDateRealInComponent(matrix.fechaFin)  ,
      tipoAsignacion: matrix.nameTipoAsignacion,
      id: matrix.id
        
        }));
    cb(ngxDatables);
  } else {
    console.log('No hay datos disponibles en dataSource');
    cb([]);
  }
}/*
filterDatatable(event: Event) {
  const val = (event.target as HTMLInputElement).value.toLowerCase();
  console.log(val);
  this.valorFiltro=val
  this.data = this.filteredData.filter(function (item: any) {

    // Revisa cada propiedad del objeto
    for (let key in item) {
      if (item.hasOwnProperty(key)) {
        // Si el valor es una cadena y contiene la cadena de búsqueda, retorna verdadero.
        if (typeof item[key] === 'string' && item[key].toLowerCase().includes(val)) {
          return true;
        }
        // Si el valor no es una cadena, puede convertirlo a una cadena y verificarlo.
        else if (item[key] !== null && item[key] !== undefined && item[key].toString().toLowerCase().includes(val)) {
          return true;
        }
      }
    }
    // Si ninguna propiedad coincide con la cadena de búsqueda, retorna falso.
    return false;
  });

  // Siempre regresa a la primera página cuando se filtra.
  this.table.offset = 0;
}*/
filterDatatable(event: Event) {
  this.valorFiltro = (event.target as HTMLInputElement).value.toLowerCase();
  this.applyFilter();
}
/*applyFilter() {
  this.data = this.filteredData.filter((item: any) => {
    for (let key in item) {
      if (item.hasOwnProperty(key)) {
        if (typeof item[key] === 'string' && item[key].toLowerCase().includes(this.valorFiltro)) {
          return true;
        } else if (item[key] !== null && item[key] !== undefined && item[key].toString().toLowerCase().includes(this.valorFiltro)) {
          return true;
        }
      }
    }
    return false;
  });

  this.table.offset = 0;
}*/
applyFilter() {
  // Verifica si this.valorFiltro no es undefined antes de aplicar el filtro.
  if (this.valorFiltro !== undefined) {
    // Aquí puedes agregar la lógica que quieras ejecutar cuando this.valorFiltro no sea undefined.
    // Por ejemplo, imprimir en consola o realizar alguna acción específica.
   // console.log('Filtrando con:', this.valorFiltro);

    this.data = this.filteredData.filter((item: any) => {
      for (let key in item) {
        if (item.hasOwnProperty(key)) {
          if (typeof item[key] === 'string' && item[key].toLowerCase().includes(this.valorFiltro)) {
            return true;
          } else if (item[key] !== null && item[key] !== undefined && item[key].toString().toLowerCase().includes(this.valorFiltro)) {
            return true;
          }
        }
      }
      return false;
    });

    this.table.offset = 0;
  } else {
    // Si this.valorFiltro es undefined, puedes decidir qué hacer aquí.
    // Por ejemplo, podrías querer mostrar todos los datos sin filtrar.
    this.data = this.filteredData;
  }
  this.isLoadingTabla=false
}

}

