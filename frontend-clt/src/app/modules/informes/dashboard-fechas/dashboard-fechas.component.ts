import { ChangeDetectorRef, Component } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TableUtil } from '@core/utils/tableUtil';
import { ListaUsuariosDashboardService } from './getListaVisitasUsuariosCab.service';
import { ListaUsuarios } from './listaUsuarios';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { ListaUsuariosDashboardDetalleService } from './getListaVisitasUsuariosDet.service';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
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
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-dashboard-fechas',
  standalone: true,
  imports: [MatFormFieldModule,MatDatepickerModule,MatProgressSpinnerModule,MatIconModule,
    MatInputModule,FormsModule,CommonModule,BreadcrumbComponent,MatButtonModule,MatTableModule,MatCardModule,
    MatSnackBarModule,MatPaginatorModule],
  templateUrl: './dashboard-fechas.component.html',
  styleUrl: './dashboard-fechas.component.scss'
})

export class DashboardFechasComponent {
  breadscrums = [
    {
      title: 'Informes',
      items: ['Home'],
      active: 'Dashboard por fechas',
    } ];

  fechaCalendario: Date| null; // Variable para almacenar la fecha seleccionada
  dataSource = new MatTableDataSource<ListaUsuarios>();
  usuarioIniciadosManana: number;
  usuarioIniciadosTarde: number;
  ausencias: number;
  llegadasTardiaManana: number;
  llegadasTardiaTarde: number;
  salidaFueraPunto: number;
  consultandoDatos: boolean = false; // Variable para mostrar el mensaje de "Consultando datos"
  consultandoDatosCab: boolean = false; // Variable para mostrar el mensaje de "Consultando datos"

  isInfoVisibleIniciadosManana: boolean = false;
  isInfoVisibleIniciadosTarde: boolean = false;
  isInfoVisibleAusencias: boolean = false;
  isInfoVisibleTardiaManana: boolean = false;
  isInfoVisibleFueraPunto: boolean = false;
  isInfoVisibleTardiaTarde: boolean = false;
  listaUsuarios: any[] | null; // Declaración de la propiedad para almacenar los datos

  constructor(private changeDetectorRef: ChangeDetectorRef,    private listaUsuariosDashboardService: ListaUsuariosDashboardService,
    private listaUsuariosDashboardDetalleService:ListaUsuariosDashboardDetalleService
    ) {}
  
  toggleInfo(tipo: String) {
    switch (tipo) {
      case 'IniciadosManana':
        this.isInfoVisibleIniciadosManana = !this.isInfoVisibleIniciadosManana;
        this.isInfoVisibleIniciadosTarde = false;
        this.isInfoVisibleAusencias = false;
        this.isInfoVisibleTardiaManana = false;
        this.isInfoVisibleFueraPunto = false;
        this.isInfoVisibleTardiaTarde = false;
         this.buscarDetalle("MANANA")
        break;
      case 'IniciadosTarde':
        this.isInfoVisibleIniciadosManana = false;
        this.isInfoVisibleIniciadosTarde = ! this.isInfoVisibleIniciadosTarde;
        this.isInfoVisibleAusencias = false;
        this.isInfoVisibleTardiaManana = false;
        this.isInfoVisibleFueraPunto = false;
        this.isInfoVisibleTardiaTarde = false;      
      this.buscarDetalle("TARDE")
  
        break;
      case 'Ausencias':
        this.isInfoVisibleIniciadosManana = false;
        this.isInfoVisibleIniciadosTarde = false;
        this.isInfoVisibleAusencias = !this.isInfoVisibleAusencias;
        this.isInfoVisibleTardiaManana = false;
        this.isInfoVisibleFueraPunto = false;
        this.isInfoVisibleTardiaTarde = false;     
       this.buscarDetalle("AUSENCIA")
   
        break;
      case 'TardiaManana':
        this.isInfoVisibleIniciadosManana = false;
        this.isInfoVisibleIniciadosTarde = false;
        this.isInfoVisibleAusencias = false;
        this.isInfoVisibleTardiaManana = !this.isInfoVisibleTardiaManana;
        this.isInfoVisibleFueraPunto = false;
        this.isInfoVisibleTardiaTarde = false;       
      this.buscarDetalle("MANANATARDIA")

         break;
      case 'FueraPunto':
        this.isInfoVisibleIniciadosManana = false;
        this.isInfoVisibleIniciadosTarde = false;
        this.isInfoVisibleAusencias = false;
        this.isInfoVisibleTardiaManana = false;
        this.isInfoVisibleFueraPunto = !this.isInfoVisibleFueraPunto;
        this.isInfoVisibleTardiaTarde = false;        
     this.buscarDetalle("FUERAPUNTO")

        break;
      case 'TardiaTarde':
        this.isInfoVisibleIniciadosManana = false;
        this.isInfoVisibleIniciadosTarde = false;
        this.isInfoVisibleAusencias = false;
        this.isInfoVisibleTardiaManana = false;
        this.isInfoVisibleFueraPunto = false;
        this.isInfoVisibleTardiaTarde = !this.isInfoVisibleTardiaTarde;       
       this.buscarDetalle("TARDETARDIA")

         break;
      default:
        // Si el tipo no coincide con ninguno de los casos anteriores, puedes manejarlo según tus necesidades.
        break;
    }
  }
 
  

  ngOnInit(): void {
  }

  ngOnDestroy() {
  }
  onDateChange(event: MatDatepickerInputEvent<Date>) {
    this.fechaCalendario = event.value;
    console.log(this.fechaCalendario)
    this.buscarCabecera()
  }
 
   
 exportArray() {
  let i = 1; // Inicializa el contador en 1
  const inventarioArray: Partial<ListaUsuarios>[] = this.dataSource.data.map(item => ({
    id: (i++).toString(), // Incrementa i y conviértelo a cadena
    Usuario: item.usuario,
   }));
    TableUtil.exportArrayToExcel(inventarioArray, "Informe de presencias");
  }

  exportArrayLlegadaTardia() {
    let i = 1; // Inicializa el contador en 1
    const inventarioArray: Partial<ListaUsuarios>[] = this.dataSource.data.map(item => ({
      id: (i++).toString(), // Incrementa i y conviértelo a cadena
      Usuario: item.usuario.slice(0, -9),
      Hora:item.usuario.slice(-7).slice(0, -2)
    }));
      TableUtil.exportArrayToExcel(inventarioArray, "Informe de Llegada tardia");
    }

 buscarCabecera(){
  this.consultandoDatosCab=true
  this.listaUsuariosDashboardService.getListaVisitasUsuariosDashboard(this.fechaCalendario!).subscribe(visitas => {
     
     this.usuarioIniciadosManana = visitas[0].MANANA;
            this.usuarioIniciadosTarde = visitas[0].TARDE;
            this.ausencias = visitas[0].AUSENCIA;
            this.llegadasTardiaManana = visitas[0].MANANATARDIA;
            this.llegadasTardiaTarde = visitas[0].TARDETARDIA;
            this.salidaFueraPunto = visitas[0].FUERAPUNTO;
            this.consultandoDatosCab=false
          },
          (error) => {
            console.error('Error al consultar los usuarios:', error);
            this.consultandoDatosCab = false; // Establece la variable como falsa en caso de error también
          } )
    }
    buscarDetalle(turno:String){
      this.consultandoDatos = true; // Establece la variable como verdadera antes de realizar la solicitud
      this.listaUsuariosDashboardDetalleService.getListaVisitasUsuariosDashboardDet(this.fechaCalendario!,turno).subscribe(response => {
      this.listaUsuarios=null
      this.dataSource.data = response;
      this.listaUsuarios = response; // Almacena los datos en la variable listadoUsuarios
      this.consultandoDatos = false; // Establece la variable como falsa después de recibir los datos
      },
      (error) => {
        console.error('Error al consultar los usuarios:', error);
        this.consultandoDatos = false; // Establece la variable como falsa en caso de error también
      } 
)
        }
}
