import { HttpClient } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
 import { environment } from '@environment/environment'; // Ajusta la ruta según la ubicación del archivo de entorno
import { DateFormatService } from '@core/utils/formatearFecha.service';
import { ListaMatrixByIdService } from './getMatrix.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
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
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import {NgxMatTimepickerModule} from 'ngx-mat-timepicker';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

interface DataSourceItem {
  dia: string;
  tiempo: any; // Idealmente, reemplaza any con un tipo más específico
  secuencia: any; // Idealmente, reemplaza any con un tipo más específico
  tipoAsignacion: any; // Idealmente, reemplaza any con un tipo más específico
  pedido: any; // Idealmente, reemplaza any con un tipo más específico
  entrega: any; // Idealmente, reemplaza any con un tipo más específico
}
@Component({
  selector: 'app-modal-matrix',
  standalone: true,
  imports: [MatFormFieldModule,MatDatepickerModule,MatProgressSpinnerModule,MatIconModule,
    MatInputModule,FormsModule,CommonModule,BreadcrumbComponent,MatButtonModule,SelectUsuarioComponent,MatChipsModule,
    MatButtonToggleModule,NgxMatTimepickerModule,MatTableModule
     ],
  templateUrl: './modal-matrix.component.html',
  styleUrl: './modal-matrix.component.scss'
})  
export class ModalMatrixComponent {
  displayedColumns: string[] = ['dia', 'tiempo','secuencia','pedido','entrega'];

  
  dataSource: DataSourceItem[] = [];  secuenciaOptions = Array.from({ length: 6 }, (_, i) => i);
  siNoOptions = ['SI', 'NO'];
  asignacionOptions = ['Predeterminado','Backup'];
  // Suponiendo que estas propiedades no estén inicializadas en otra parte
  
  
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;

  puntoVenta:String;
  promotor:String
  tipoAsignacion:String
  totalHora:String
  id:number
  constructor(
    private _snackBar: MatSnackBar,
    private http: HttpClient,
    public dialogRef: MatDialogRef<ModalMatrixComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dateFormatService: DateFormatService,
    private ListaMatrixByIdService:ListaMatrixByIdService,
    
 
  ) {}
  private endpoint = '/comercial/matrixUpdate';

  capturarFechaInicio(event: MatDatepickerInputEvent<Date>) {
    
    this.fechaInicio = event.value;
    this.fechaFin=null
    this.updateDias(this.formatStartDate(this.fechaInicio), this.id, 'fechaInicio')

  }
  formatDateRealInComponent(fecha: string | Date): string | null {
    return this.dateFormatService.formatDateRealYYYYMMDD(fecha);
  }

  capturarFechaFin(event: MatDatepickerInputEvent<Date>) {
    this.fechaFin = event.value;
    
    this.updateDias(this.formatStartDate(this.fechaFin), this.id, 'fechaFin')

  }
 // Método para formatear la fecha startDate utilizando el servicio
 formatStartDate(fecha: string | Date | null): string | null {
  if (!fecha) {
    return null;
  }
  // Asegura que fecha sea un objeto Date
  const dateObject = fecha instanceof Date ? fecha : new Date(fecha);
  // Verifica si la fecha es válida
  if (isNaN(dateObject.getTime())) {
    return null;
  }

  return this.dateFormatService.formatDate(dateObject);
}

updateDias(newValue: string | null, id: number, tipo: string): void {
  if (newValue == null) {
    newValue = '';
  }
  console.log('Nuevo valor:', newValue, ' id:', id, ' tipo:', tipo);
  this.registrar(newValue, tipo);
}

/*
  updateDias(newValue: String, id: number,tipo:String): void {
    if(newValue==null){
      newValue=''
    }
    console.log('Nuevo valor:', newValue,' id:', id,' tipo:', tipo);
    this.registrar(newValue, tipo) ;
  }*/
    ngOnInit(): void {
      // Transformar la data 
             if (this.data.matrixData) {
                  
              const fechaStart = this.data.matrixData.fechaInicio; // 'YYYY-MM-DD'
              const fechaEnd = this.data.matrixData.fechaFin; // 'YYYY-MM-DD'
              let fechaUTC = null;
              let fechaUTCFin = null;
              
              if (fechaStart) {
                  const [year, month, day] = fechaStart.split('-').map((num:any) => parseInt(num));
                  fechaUTC = new Date(Date.UTC(year, month - 1, day + 1));
              }
              
              if (fechaEnd) {
                  const [years, months, days] = fechaEnd.split('-').map((num:any) => parseInt(num));
                  fechaUTCFin = new Date(Date.UTC(years, months - 1, days + 1));
              }
    
                  this.fechaInicio = this.data.matrixData.fechaInicio ?  fechaUTC : null;
                  this.fechaFin = this.data.matrixData.fechaFin ? fechaUTCFin : null;
                  this.promotor=this.data.matrixData.Usuario;
                  this.puntoVenta=this.data.matrixData.CardName;
                  this.tipoAsignacion=this.data.matrixData.nameTipoAsignacion;
                  this.id=this.data.matrixData.id;
                  //console.log(this.data.matrixData);
                  this.dataSource = [
                    { dia: 'Lunes', tiempo: this.data.matrixData.Lunes,         secuencia:this.data.matrixData.Lunes_S,  tipoAsignacion:this.data.matrixData.nameTipoAsignacion,   pedido:this.data.matrixData.Lunes_P, entrega:this.data.matrixData.Lunes_E   },
                    { dia: 'Martes', tiempo: this.data.matrixData.Martes,       secuencia:this.data.matrixData.Martes_S ,  tipoAsignacion:this.data.matrixData.nameTipoAsignacion,  pedido:this.data.matrixData.Martes_P,  entrega:this.data.matrixData.Martes_E },
                    { dia: 'Miercoles', tiempo: this.data.matrixData.Miercoles, secuencia:this.data.matrixData.Miercoles_S, tipoAsignacion:this.data.matrixData.nameTipoAsignacion,  pedido:this.data.matrixData.Miercoles_P, entrega:this.data.matrixData.Miercoles_E },
                    { dia: 'Jueves', tiempo: this.data.matrixData.Jueves,       secuencia:this.data.matrixData.Jueves_S,   tipoAsignacion:this.data.matrixData.nameTipoAsignacion,  pedido:this.data.matrixData.Jueves_P,  entrega:this.data.matrixData.Jueves_E  },
                    { dia: 'Viernes', tiempo: this.data.matrixData.Viernes,     secuencia:this.data.matrixData.Viernes_S,  tipoAsignacion:this.data.matrixData.nameTipoAsignacion,  pedido:this.data.matrixData.Viernes_P,  entrega:this.data.matrixData.Viernes_E  },
                    { dia: 'Sabado', tiempo: this.data.matrixData.Sabado,       secuencia:this.data.matrixData.Sabado_S,   tipoAsignacion:this.data.matrixData.nameTipoAsignacion,  pedido:this.data.matrixData.Sabado_P,  entrega:this.data.matrixData.Sabado_E },
                    { dia: 'Domingo', tiempo: this.data.matrixData.Domingo,     secuencia:this.data.matrixData.Domingo_S,  tipoAsignacion:this.data.matrixData.nameTipoAsignacion,  pedido:this.data.matrixData.Domingo_P,  entrega:this.data.matrixData.Domingo_E  },
                   ];
              
  
          this.totalHora=this.sumTimes(this.dataSource) ;
      }
    }
    extractTime(isoString: string): string {
      const date = new Date(isoString);
      return date.toISOString().substring(11, 16); // HH:MM
    }

      timeToMinutes(time: string): number {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    }
      minutesToTime(totalMinutes: number): string {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

      sumTimes(data: any[]): string {
      let totalMinutes = 0;
      console.log(data)
      data.forEach(item => {
        if (item.tiempo) {
          totalMinutes += this.timeToMinutes(item.tiempo);
        }
      });
    
      return  this.minutesToTime(totalMinutes);
    }
    
 
    

registrar(valores:String ,campos:String ) {
  
    this.http
    .post<any>(`${environment.apiUrl}${this.endpoint}`, {
      id:this.id,
      valor:valores,
      campo:campos
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
         
      }
        
      },
      (error) => {
      //  this.isLoading = false;
        this._snackBar.open(error, 'Cerrar', {
          duration: 3000,
        });
      }
    );
 

}
    
}
