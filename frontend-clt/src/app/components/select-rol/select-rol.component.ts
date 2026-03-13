import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Roles } from '@models/Roles';
import { RolesService } from '@services/main/listaRoles.services';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable, map, startWith } from 'rxjs';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { MatSelectModule } from '@angular/material/select';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
@Component({
  selector: 'app-select-rol',
  standalone: true,
  imports: [MatFormFieldModule,MatProgressSpinnerModule,MatIconModule,
    MatInputModule,FormsModule,CommonModule,BreadcrumbComponent,MatSelectModule,ReactiveFormsModule,NgxMatSelectSearchModule ],
  templateUrl: './select-rol.component.html',
  styleUrl: './select-rol.component.scss'
})

export class SelectRolComponent implements OnInit{
  @Output() rolSeleccionado = new EventEmitter<number>(); // Cambiado a número
 
  noData=false
  idRol: number 
  roles: Roles[] = [];
  rolesCtrl = new FormControl();
  rolesFilterCtrl = new FormControl();
  filteredRoles: Observable<Roles[]>;
  searchLabel = 'Buscar rol';
  showLoading: boolean = true;
  constructor(private rolesService: RolesService ) { }

  ngOnInit()  {
    this.getRoles();
   }
  
  getRoles() {
    this.rolesService.getRoles().subscribe(data => {
      this.roles = data.roles;
      console.log(data)
      this.initializeFilteredRoles();
    });
  }
  
  initializeFilteredRoles() {
    this.filteredRoles = this.rolesFilterCtrl.valueChanges.pipe(
      startWith(''),
      map(value => {
        return this._filterRoles(value);
      })
    );
    this.showLoading = false;
  }
  
  private _filterRoles(value: string | Roles): Roles[] {
    const filterValue = typeof value === 'string' ? value.toLowerCase() : value.descripcion.toLowerCase();
    if (!filterValue) {
      return this.roles;
    } else {
      return this.roles.filter(roles => roles.descripcion.toLowerCase().includes(filterValue));
    }
  }
  
  onRolSelected(roles: Roles) {
    if (roles) {
      this.idRol = roles.id;
      this.rolSeleccionado.emit(this.idRol); // Emitir el evento con el id_usuario
     }
  }
}
