import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Horarios } from '@models/Horarios';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable, map, startWith } from 'rxjs';
import { HorariosService } from './listaHorario.service';

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
  selector: 'app-select-horario',
  standalone: true,
  imports: [MatFormFieldModule,MatDatepickerModule,MatProgressSpinnerModule,MatIconModule,
    MatInputModule,FormsModule,CommonModule,BreadcrumbComponent,MatButtonModule,MatSelectModule,ReactiveFormsModule,NgxMatSelectSearchModule ],
  templateUrl: './select-horario.component.html',
  styleUrl: './select-horario.component.scss'
})
export class SelectHorarioComponent implements OnInit {
  
  @Output() idHorarioSeleccionadoEmitter = new EventEmitter<number>(); // Cambiado a número
  @Input() idHorarioSeleccionado: number; // Atributo de entrada para el idHorario

  ngOnInit()
  {
    this.getHorarios()
  }
  constructor(private horariosService: HorariosService ) { }

  horarios:any = [];
  noData=false
  idHorario: number = 3; // Establece el valor predeterminado en 3
  horariosCtrl = new FormControl();
  horariosFilterCtrl = new FormControl();
  filteredHorario: Observable<Horarios[]>;
  searchLabel = 'Buscar horario';
  showLoading: boolean = true;


  getHorarios() {
    this.horariosService.getHorarios().subscribe(data => {
      this.horarios = data;
      this.initializeFilteredHorarios();
    });
  }

  
  initializeFilteredHorarios() {
    this.filteredHorario = this.horariosFilterCtrl.valueChanges.pipe(
      startWith(''),
      map(value => {
        return this._filterHorarios(value);
      })
    );
    this.showLoading = false;
    if (this.horarios.length > 0) {
      this.horariosCtrl.setValue(this.horarios.find((horario:any) => horario.id === this.idHorarioSeleccionado));
    }
  }

  private _filterHorarios(value: string | Horarios): Horarios[] {
    const filterValue = typeof value === 'string' ? value.toLowerCase() : value.descripcion.toLowerCase();
    if (!filterValue) {
      return this.horarios;
    } else {
      return this.horarios.filter((horarios:any) => horarios.descripcion.toLowerCase().includes(filterValue));
    }
  }
  
  onSelected(horarios: Horarios) {
    if (horarios) {
      this.idHorario = horarios.id;
      this.idHorarioSeleccionadoEmitter.emit(horarios.id); // Emitir el evento con el id_usuario
      //console.log('idHorario seleccionado:', this.idHorario);
    }
  }
}
