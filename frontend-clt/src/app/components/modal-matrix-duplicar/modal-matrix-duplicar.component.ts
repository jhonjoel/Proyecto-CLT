import { HttpClient } from '@angular/common/http';
import { Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ParametrosEvento } from '@components/select-ocrd/ParametrosOcrd';
import { SelectOcrdComponent } from '@components/select-ocrd/select-ocrd.component';
 import { DateFormatService } from '@core/utils/formatearFecha.service';
import { environment } from '@environment/environment'; 
import { MatSnackBar } from '@angular/material/snack-bar';
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
import { TipoAsignacionUsuPvComponent } from '@components/tipo-asignacion-usu-pv/tipo-asignacion-usu-pv.component';

@Component({
  selector: 'app-modal-matrix-duplicar',
  standalone: true,
  imports: [MatFormFieldModule,MatDatepickerModule,MatProgressSpinnerModule,MatIconModule,
    MatInputModule,FormsModule,CommonModule,BreadcrumbComponent,MatButtonModule,SelectUsuarioComponent,MatChipsModule,
    MatButtonToggleModule,NgxMatTimepickerModule,SelectOcrdComponent,TipoAsignacionUsuPvComponent],
  templateUrl: './modal-matrix-duplicar.component.html',
  styleUrl: './modal-matrix-duplicar.component.scss'
})
export class ModalMatrixDuplicarComponent {
  @ViewChild(SelectOcrdComponent) selectOcrdComponent: SelectOcrdComponent; 
  //ESTA PARTE LLAMO DOS VECES AL MISMO COMPONENTE, ENTONCES TENGO QUE AGREGARLES ID PROPIO PARA QUE ME PUEDAN RESETEAR AMBOS.
  @ViewChild('selectorPromotor') selectPromotorComponent: SelectUsuarioComponent;
  @ViewChild('selectorSupervisor') selectSupervisorComponent: SelectUsuarioComponent;
  idPromotor :number| null;
  id :number| null;
  namePromotor :String| null;
  idOcrd: String| null
  nameOcrd: String| null
  idtipoAsignacion: number| null
  nameTipoAsignacion: String| null
  idSupervisor: number| null
  nameSupervisor: String| null
  /*startDate: Date| null;
  endDate: Date| null;*/
  isLoading = false;
  private endpoint = '/comercial/matrixDuplicate';
   
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;

  usuarioPorDefecto: any; // Este es el valor que deseas pasar al hijo

  constructor( 
    private _snackBar: MatSnackBar,
    private dateFormatService: DateFormatService,
     public dialog: MatDialog,
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: any,
    ) {}

   
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

             this.id=this.data.matrixData.id;
             this.fechaInicio = this.data.matrixData.fechaInicio ? fechaUTC : null;
             this.fechaFin = this.data.matrixData.fechaFin ? fechaUTCFin : null;
             this.idPromotor = this.data.matrixData.Id_Usuario;
             this.idSupervisor = this.data.matrixData.Id_Sup;
             this.idOcrd = this.data.matrixData.id_OCRD;
             this.idtipoAsignacion = this.data.matrixData.idTipoAsignacion;
            // console.log('tipos:'+this.idtipoAsignacion)
             
 
    }
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
  // console.log('asigna',this.idtipoAsignacion)
  // console.log(this.nameTipoAsignacion) 
 }
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
  // Método para formatear la fecha startDate utilizando el servicio
 /* formatStartDate(fecha: string | Date): string | null {
    if (!fecha) {
      return null;
    }
      // Asegura que fecha sea un objeto Date
    const dateObject = fecha instanceof Date ? fecha : new Date(fecha);
      // Verifica si la fecha es válida
    if (isNaN(dateObject.getTime())) {
      return null;
    }
  
    return this.dateFormatService.formatDateDdMmYYYY(dateObject);
  }*/
  

  duplicar() {
   // console.log(this.fechaInicio)
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
     else if(this.fechaInicio=== undefined){
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
        id:this.id,
        idPromotor:this.idPromotor,
        namePromotor:this.namePromotor,
        idOcrd:this.idOcrd,
        nameOcrd:this.nameOcrd,
        idtipoAsignacion:this.idtipoAsignacion,
        nameTipoAsignacion:this.nameTipoAsignacion,
        idSupervisor:this.idSupervisor,
        nameSupervisor:this.nameSupervisor,
        startDate:this.formatStartDate(this.fechaInicio),
        endDate:this.formatStartDate(this.fechaFin),
  
       })
      .subscribe(
        (response) => {
        // console.log(response)
        const message = response.msg;
        const tipo = response.tipo;
        // this.toastr.success('Acceso permitido', 'Éxito');
           this._snackBar.open(message, 'Cerrar', {
            duration: 3000,
          });
          if(tipo==-1){
            this.isLoading  = false;

          }
          if(response.tipo==0){
          this.idPromotor=null,
          this.namePromotor=null,
          this.idOcrd=null,
          this.nameOcrd=null,
          this.idtipoAsignacion=null,
          this.nameTipoAsignacion=null,
          this.idSupervisor=null,
          this.nameSupervisor=null,
          this.fechaInicio=null,
          this.fechaFin=null
          this.isLoading  = false;
          this.selectOcrdComponent.resetSearch();
          this.selectPromotorComponent.resetSearch();
          this.selectSupervisorComponent.resetSearch();
           
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
  
}
