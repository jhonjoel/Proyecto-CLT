import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { OcrdService } from './listaOcrd.service';
import { Ocrd } from './Ocrd';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable, map, startWith } from 'rxjs';
import { ParametrosEvento } from './ParametrosOcrd';
 import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { MatButtonModule } from '@angular/material/button'; 
import { MatSelectModule } from '@angular/material/select';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
@Component({
  selector: 'app-select-ocrd',
  standalone: true,
  imports: [MatFormFieldModule,MatDatepickerModule,MatProgressSpinnerModule,MatIconModule,
    MatInputModule,FormsModule,CommonModule,BreadcrumbComponent,MatButtonModule,MatSelectModule,ReactiveFormsModule,NgxMatSelectSearchModule ],
  templateUrl: './select-ocrd.component.html',
  styleUrl: './select-ocrd.component.scss'
})
export class SelectOcrdComponent  implements OnInit {
  ngOnInit(): void
  {
    this.getOcrd()
  }
  constructor(private ocrdService: OcrdService ) { }
  @Output() OcrdSeleccionado = new EventEmitter<ParametrosEvento>(); // Cambiado a número
  @Input() selectedOcrdId: String|null;

  
  ocrds:any = [];
  noData=false
  idOcrd: any 
  nameOcrd: any 
  ocrdCtrl = new FormControl();
  ocrdFilterCtrl = new FormControl();
  filteredOcrd: Observable<Ocrd[]>;
  searchLabel = 'Buscar punto de venta';
  showLoading: boolean = true;

  getOcrd() {
    this.ocrdService.getOcrd().subscribe(data => {
      this.ocrds = data;
     // console.log('OCRDID:',this.ocrds)
    //  console.log('id:',this.selectedOcrdId)

      this.initializeFilteredOcrd();
    if (this.selectedOcrdId) {
      const selectedOcrd = this.ocrds.find((ocrd:any) => ocrd.id.toString().trim() === this.selectedOcrdId!.toString().trim());
    //  console.log('encontrado',selectedOcrd)

       if (selectedOcrd) {
        this.ocrdCtrl.setValue(selectedOcrd);

       // console.log('id:',this.selectedOcrdId)
        this.onSelected(selectedOcrd);
      }
    }
    });

  }
 
  resetSearch() {
    // Resetear el valor del control del filtro
    this.ocrdFilterCtrl.setValue('');
    // Si también necesitas resetear el control que mantiene la selección actual, deberías hacerlo aquí
    this.ocrdCtrl.setValue(null);
    // Además, si necesitas limpiar cualquier otro estado relacionado con la selección, hazlo aquí
    this.idOcrd = null;
    this.nameOcrd = null; 
    this.noData=false
  }


  initializeFilteredOcrd() {
    this.filteredOcrd = this.ocrdFilterCtrl.valueChanges.pipe(
      startWith(''),
      map(value => {
        return this._filterOcrd(value);
      })
    );
    this.showLoading = false;
  }

  private _filterOcrd(value: string | Ocrd): Ocrd[] {
    const filterValue = typeof value === 'string' ? value.toLowerCase() : value.Address.toLowerCase();
    if (!filterValue) {
      return this.ocrds;
    } else {
      return this.ocrds.filter((ocrds:any) => ocrds.Address.toLowerCase().includes(filterValue));
    }
  }

    
  onSelected(ocrd: Ocrd) {
    if (ocrd) {
       const parametros: ParametrosEvento = {
        idOcrd: ocrd.id,
        latitudLongitud: ocrd.latitud+","+ocrd.longitud,   
        nameOcrd: ocrd.Address
      };
    //  console.log(parametros)
      this.OcrdSeleccionado.emit(parametros); // Emitir el evento con el id_usuario

     }

  }
  
}