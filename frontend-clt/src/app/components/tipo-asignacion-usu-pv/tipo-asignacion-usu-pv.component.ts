import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { MatButtonModule } from '@angular/material/button';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

import { MatSelectModule } from '@angular/material/select';
interface tiposAsignacioneseleccionado {
  id: number;
  nombre: string;
}
@Component({
  selector: 'app-tipo-asignacion-usu-pv',
  standalone: true,
  imports: [MatFormFieldModule,MatDatepickerModule,MatProgressSpinnerModule,MatIconModule,
    MatInputModule,FormsModule,CommonModule,BreadcrumbComponent,MatButtonModule,MatSelectModule,ReactiveFormsModule,NgxMatSelectSearchModule ],
  templateUrl: './tipo-asignacion-usu-pv.component.html',
  styleUrl: './tipo-asignacion-usu-pv.component.scss'
})

export class TipoAsignacionUsuPvComponent implements OnInit {
  @Output() tipoSeleccionado = new EventEmitter<tiposAsignacioneseleccionado>(); // Cambiado a número
  @Input() selectedAsignacionId: number|null;

  tiposAsignaciones: any[] = [
    { id: 1, nombre: 'Predeterminado' },
    { id: 2, nombre: 'Backup' },
   ];
   usuarioCtrl = new FormControl();
  tiposFilterCtrl = new FormControl();
  filteredTipos: any;
  idTipoAsignacion: number;
  nameTipoAsignacion: string;
  constructor() {}

  ngOnInit() {
    this.filteredTipos = this.tiposFilterCtrl.valueChanges;
    console.log('tipoAsignacion',this.selectedAsignacionId)
    if (this.selectedAsignacionId) {
      const selectedOcrd = this.tiposAsignaciones.find(asignacion => asignacion.id === this.selectedAsignacionId);
 
       if (selectedOcrd) {
        this.usuarioCtrl.setValue(selectedOcrd);
 
      }
    }
  }

  onUsuarioSelected(tipo: any) {
    if (tipo) {
      this.idTipoAsignacion = tipo.id;
      this.nameTipoAsignacion = tipo.nombre;

      const tipoSeleccionado = {
        id: this.idTipoAsignacion,
        nombre: this.nameTipoAsignacion

      };
      this.tipoSeleccionado.emit(tipoSeleccionado); // Emitir el evento con el id_usuario
    // console.log(tipoSeleccionado);
    }
  }
}
