import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { ListaUsuariosDashboardService } from './getListaVisitasUsuarios.service';
import { ListaUsuarios } from './listaUsuarios';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
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
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatFormFieldModule,MatDatepickerModule,MatProgressSpinnerModule,MatIconModule,
    MatInputModule,FormsModule,CommonModule,BreadcrumbComponent,MatButtonModule,MatTableModule,MatCardModule,
    MatSnackBarModule,MatPaginatorModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  private destroy$: Subject<void> = new Subject<void>();
  dataSource = new MatTableDataSource<ListaUsuarios>();
  usuarioIniciadosManana: number = 0;
  usuarioIniciadosTarde: number = 0;
  ausencias: number = 0;
  llegadasTardiaManana: number = 0;
  llegadasTardiaTarde: number = 0;
  salidaFueraPunto: number = 0;
  consultandoDatos: boolean = false;

  isInfoVisibleIniciadosManana: boolean = false;
  isInfoVisibleIniciadosTarde: boolean = false;
  isInfoVisibleAusencias: boolean = false;
  isInfoVisibleTardiaManana: boolean = false;
  isInfoVisibleFueraPunto: boolean = false;
  isInfoVisibleTardiaTarde: boolean = false;
  listaUsuarios: any[] |null; // Declaración de la propiedad para almacenar los datos
  breadscrums = [
    {
      title: 'Informes',
      items: ['Home'],
      active: 'Dashboard',
    } ];

  constructor(private changeDetectorRef: ChangeDetectorRef,    private listaUsuariosDashboardService: ListaUsuariosDashboardService,
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
        this.fetchListado("MANANA")
        break;
      case 'IniciadosTarde':
        this.isInfoVisibleIniciadosManana = false;
        this.isInfoVisibleIniciadosTarde = ! this.isInfoVisibleIniciadosTarde;
        this.isInfoVisibleAusencias = false;
        this.isInfoVisibleTardiaManana = false;
        this.isInfoVisibleFueraPunto = false;
        this.isInfoVisibleTardiaTarde = false;      
        this.fetchListado("TARDE")
  
        break;
      case 'Ausencias':
        this.isInfoVisibleIniciadosManana = false;
        this.isInfoVisibleIniciadosTarde = false;
        this.isInfoVisibleAusencias = !this.isInfoVisibleAusencias;
        this.isInfoVisibleTardiaManana = false;
        this.isInfoVisibleFueraPunto = false;
        this.isInfoVisibleTardiaTarde = false;     
        this.fetchListado("AUSENCIA")
   
        break;
      case 'TardiaManana':
        this.isInfoVisibleIniciadosManana = false;
        this.isInfoVisibleIniciadosTarde = false;
        this.isInfoVisibleAusencias = false;
        this.isInfoVisibleTardiaManana = !this.isInfoVisibleTardiaManana;
        this.isInfoVisibleFueraPunto = false;
        this.isInfoVisibleTardiaTarde = false;       
        this.fetchListado("MANANATARDIA")

         break;
      case 'FueraPunto':
        this.isInfoVisibleIniciadosManana = false;
        this.isInfoVisibleIniciadosTarde = false;
        this.isInfoVisibleAusencias = false;
        this.isInfoVisibleTardiaManana = false;
        this.isInfoVisibleFueraPunto = !this.isInfoVisibleFueraPunto;
        this.isInfoVisibleTardiaTarde = false;        
        this.fetchListado("FUERAPUNTO")

        break;
      case 'TardiaTarde':
        this.isInfoVisibleIniciadosManana = false;
        this.isInfoVisibleIniciadosTarde = false;
        this.isInfoVisibleAusencias = false;
        this.isInfoVisibleTardiaManana = false;
        this.isInfoVisibleFueraPunto = false;
        this.isInfoVisibleTardiaTarde = !this.isInfoVisibleTardiaTarde;       
        this.fetchListado("TARDETARDIA")

         break;
      default:
        // Si el tipo no coincide con ninguno de los casos anteriores, puedes manejarlo según tus necesidades.
        break;
    }
  }
 
  

  ngOnInit(): void {
    // Los totales (usuarioIniciadosManana, etc.) se pueden cargar por HTTP desde el backend si existe un endpoint de resumen.
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchListado(turno: string) {
    this.consultandoDatos = true; // Establece la variable como verdadera antes de realizar la solicitud
    this.listaUsuariosDashboardService.getListaVisitasUsuariosDashboard(turno).subscribe(
      (response) => {
        this.listaUsuarios=null
        this.dataSource.data = response;
        this.listaUsuarios = response; // Almacena los datos en la variable listadoUsuarios
       // console.log(this.listaUsuarios)
        this.consultandoDatos = false; // Establece la variable como falsa después de recibir los datos
      },
      (error) => {
        console.error('Error al consultar los usuarios:', error);
        this.consultandoDatos = false; // Establece la variable como falsa en caso de error también
      }
    );
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

 
}
