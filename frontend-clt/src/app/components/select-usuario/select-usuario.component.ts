 import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Usuario } from '@models/Usuario';
import { UsuariosService } from '@services/main/listaUsuarios.services';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable, map, startWith } from 'rxjs';
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
import { TipoAsignacionUsuPvComponent } from '@components/tipo-asignacion-usu-pv/tipo-asignacion-usu-pv.component';
interface UsuarioSeleccionado {
  id: number;
  nombre: string;
}
@Component({
  selector: 'app-select-usuario',
  standalone: true,
  imports: [MatFormFieldModule,MatDatepickerModule,MatProgressSpinnerModule,MatIconModule,
    MatInputModule,FormsModule,CommonModule,BreadcrumbComponent,MatButtonModule,MatSelectModule,
    ReactiveFormsModule,NgxMatSelectSearchModule ],
  templateUrl: './select-usuario.component.html',
  styleUrl: './select-usuario.component.scss'
})
 
  export class SelectUsuarioComponent  {
 
    @Output() usuarioSeleccionado = new EventEmitter<UsuarioSeleccionado>(); 
    @Input() searchLabel: string = 'Buscar usuario';
    @Input() searchUser: string = 'Encuentra el usuario';
    @Input() defaultValue: UsuarioSeleccionado; // Añade esta línea
    @Input() selectedUserId: number | null;
  
    noData=false
    idUsuario: number 
    nameUsuario: string
    usuarios: Usuario[] = [];
    usuarioCtrl = new FormControl();
    usuarioFilterCtrl = new FormControl();
    filteredUsuarios: Observable<Usuario[]>;
     showLoading: boolean = true;
    constructor(private usuariosService: UsuariosService ) { }
  
    ngOnInit()  {
      this.getUsuarios();
      }
    
     
     onUsuarioSelected(usuario: Usuario) {
      if (usuario) {
        const { id, nombre, apellido } = usuario;
        this.idUsuario = id;
        this.nameUsuario = `${nombre} ${apellido}`;
    
        const usuarioSeleccionado = {
          id: this.idUsuario,
          nombre: this.nameUsuario
  
        };
    
        this.usuarioSeleccionado.emit(usuarioSeleccionado);
      }
    }
     /*
    getUsuarios() {
      this.usuariosService.getUsuarios().subscribe(data => {
        this.usuarios = data.usuarios;
        this.initializeFilteredUsuarios();
    
        // Establece el valor por defecto después de que los usuarios se hayan cargado
        if (this.defaultValue) {
          const usuarioPorDefecto = this.usuarios.find(u => u.id === this.defaultValue.id);
          if (usuarioPorDefecto) {
            this.onUsuarioSelected(usuarioPorDefecto);
          }
        }
      });
    }
  */
  
  getUsuarios() {
    this.usuariosService.getUsuarios().subscribe(data => {
      this.usuarios = data.usuarios;
      this.initializeFilteredUsuarios();
  
      if (this.selectedUserId) {
        const selectedUser = this.usuarios.find(user => user.id === this.selectedUserId);
        if (selectedUser) {
          this.usuarioCtrl.setValue(selectedUser);
          this.onUsuarioSelected(selectedUser);
        }
      }
    });
  }
  
    resetSearch() {
      // Resetear el valor del control del filtro
      this.usuarioFilterCtrl.setValue('');
      // Si también necesitas resetear el control que mantiene la selección actual, deberías hacerlo aquí
      this.usuarioCtrl.setValue(null);
      this.noData=false
    } 
   
    initializeFilteredUsuarios() {
      this.filteredUsuarios = this.usuarioFilterCtrl.valueChanges.pipe(
        startWith(''),
        map(value => {
          return this._filterUsuarios(value);
        })
      );
      this.showLoading = false;
    }
    
    private _filterUsuarios(value: string | Usuario): Usuario[] {
      const filterValue = typeof value === 'string' ? value.toLowerCase() : value.nombre.toLowerCase();
      if (!filterValue) {
        return this.usuarios;
      } else {
        return this.usuarios.filter(usuario => usuario.nombre.toLowerCase().includes(filterValue));
      }
    } 
  
  
    
  }
  