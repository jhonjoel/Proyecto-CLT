import { Component, OnInit, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { InventarioService } from '@services/comercial/getInventarioPromotora.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Inventario } from '@core/models/Inventario';
import { MatTableDataSource } from '@angular/material/table';
import { TableUtil } from '@core/utils/tableUtil';
 import {  MatTableModule } from '@angular/material/table';
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
 import { NgxDatable } from './ngx-datatable.model';
import { DatatableComponent, SortType, NgxDatatableModule } from '@swimlane/ngx-datatable';

@Component({
  selector: 'app-informe-inventario',
  standalone: true,
  imports: [MatFormFieldModule,MatDatepickerModule,MatProgressSpinnerModule,MatIconModule,
    MatInputModule,FormsModule,CommonModule,BreadcrumbComponent,MatButtonModule,SelectUsuarioComponent,GoogleMapsModule
    ,MatTableModule,
    MatSnackBarModule,  
      NgxDatatableModule,
  ],
  templateUrl: './informe-inventario.component.html',
  styleUrl: './informe-inventario.component.scss'
})

export class InformeInventarioComponent implements OnInit {
  @ViewChild(DatatableComponent, { static: false }) table!: DatatableComponent;
  
  constructor( private inventarioService:InventarioService,    private _snackBar: MatSnackBar ) { }

  breadscrums = [
    {
      title: 'Informes',
      items: ['Home'],
      active: 'Inventario por rango de fecha',
    } ];

  showLoading: boolean = true;
  isLoading = false;
  startDate: Date;
  endDate: Date;
  dataSource = new MatTableDataSource<Inventario>();
  noData=false
  data: NgxDatable[] = [];
  filteredData: NgxDatable[] = [];
  SortType = SortType;
  columns = [
    { name: 'secuencia' },
    { name: 'ocrdName' },
    { name: 'itemCode' },
    { name: 'itemName' },
    { name: 'codbarra' },
    { name: 'cantidad' },
    { name: 'lote' },
    { name: 'createdAt' },
    { name: 'ubicacion' },
    { name: 'userName' },
  ];
  
  ngOnInit() {
  }
  ngAfterViewInit() {
 
  }
  exportArray() {
  const inventarioArray: Partial<Inventario>[] = this.dataSource.data.map(item => ({
    idVisita:item.idVisitas,
    Secuencia: item.secuencia,
    "Punto Venta": item.ocrdName,
    itemCode:item.itemCode,
    Producto: item.itemName,
    "Cod Barra": item.codebar,
    "Lote": item.lote.slice(-15).slice(0,-11),
    Cantidad: item.cantidad,
    "FCP": item.lote.slice(-10),
    "Ubicacion": item.ubicacion,
    Fecha:   moment.utc(item.createdAt).format('YYYY-MM-DD HH:mm'),
    Usuario: item.userName,
  }));
  
  TableUtil.exportArrayToExcel(inventarioArray, "Inventario");
  }
  buscar(){
     // console.log(moment.utc(this.startDate).format('YYYY-MM-DD')+"   "+moment.utc(this.endDate).format('YYYY-MM-DD') )

      if (  !this.startDate || !this.endDate) {
        // Si el idUsuario o la fechaCalendario no tienen valores, muestra un mensaje de error al usuario.
         this._snackBar.open('Error: Usuario y fecha son obligatorios.', 'Cerrar', {
          duration: 3000,
        });
        return;
      }
      this.isLoading = true;
      try {
        this.inventarioService.getInventarioPromotora( moment.utc(this.startDate).format('YYYY-MM-DD'),moment.utc(this.endDate).format('YYYY-MM-DD')).subscribe(inventario => {
        if (inventario.length > 0) {
       // Si hay datos, asignarlos a la tabla
      this.dataSource.data = inventario;
      // this.noData=false
      this.fetch((data: NgxDatable[]) => {
      this.data = data;
      this.filteredData = data;

    });    } 
    else {
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
 
 


fetch(cb: (i: NgxDatable[]) => void) {
  if (this.dataSource && this.dataSource.data.length > 0) {
    // Transformando cada Inventario en NgxDatable.
    const ngxDatables: NgxDatable[] = this.dataSource.data.map((inventario) => ({
      // Aquí debes mapear todas las propiedades necesarias de Inventario a NgxDatable
        secuencia:inventario.secuencia,
        ocrdName: inventario.ocrdName,
        codigo: inventario.itemCode,
        itemName: inventario.itemName,
        codbarra:inventario.codebar ,
        cantidad: inventario.cantidad,
        lote: inventario.lote,
        createdAt: inventario.createdAt,
        ubicacion: inventario.ubicacion,
        userName: inventario.userName,
        }));
    cb(ngxDatables);
  } else {
    console.log('No hay datos disponibles en dataSource');
    cb([]);
  }
}
filterDatatable(event: Event) {
  const val = (event.target as HTMLInputElement).value.toLowerCase();

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
}

  
  
 
 
}
