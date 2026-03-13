import { AfterViewInit, Component,  OnInit, Output, ViewChild,Inject, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
 import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { EditarUsuarioModalComponent } from '@components/editar-usuario-modal/editar-usuario-modal.component';
import { ListaUsuariosService } from '@services/administrativo/lista-usuarios.service';
import { Usuario } from '@models/Usuario';
 
import {  MatPaginatorModule } from '@angular/material/paginator';
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
@Component({
  selector: 'app-lista-usuarios',
  standalone: true,
  imports: [MatFormFieldModule,MatDatepickerModule,MatProgressSpinnerModule,MatIconModule,
    MatInputModule,FormsModule,CommonModule,BreadcrumbComponent,MatButtonModule,MatTableModule,
    MatSnackBarModule,MatPaginatorModule],
  templateUrl: './lista-usuarios.component.html',
  styleUrl: './lista-usuarios.component.scss'
})
export class ListaUsuariosComponent implements OnInit, AfterViewInit  {
  breadscrums = [
    {
      title: 'Administrativo',
      items: ['Home'],
      active: 'Listado de usuarios',
    } ];
  
  ngAfterViewInit(): void
  {
    
  }
  ngOnInit(): void
  {
    this.fetchUsuarios()
  }
 
  constructor(
     private usuariosService: ListaUsuariosService,private dialog: MatDialog
    ) {}
 
 
  displayedColumns: string[] = [
    'id',
    'usuario',
    'usuarioLogin',
    'telefono',
    'createdAt',
    'editar'
  ];


  idUsuario: number
  idHorario:number
  nombreUsuario:string
  consultandoDatos: boolean = false; // Variable para mostrar el mensaje de "Consultando datos"
   @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  dataSource = new MatTableDataSource<Usuario>();

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  fetchUsuarios() :void {
    this.consultandoDatos = true; // Establece la variable como verdadera antes de realizar la solicitud
    this.usuariosService.getListaUsuarios().subscribe(
      (response) => {
        this.dataSource.data = response;
        this.consultandoDatos = false; // Establece la variable como falsa después de recibir los datos
      },
      (error) => {
        console.error('Error al consultar los usuarios:', error);
        this.consultandoDatos = false; // Establece la variable como falsa en caso de error también
      }
    );
  }

  openEditModal(idUsuario: number,nombreUsuario:string ,idHorario:number ,telefono:string) {
    // Aquí abres el modal y le pasas el idUsuario
    const dialogRef = this.dialog.open(EditarUsuarioModalComponent, {
      data: { idUsuario: idUsuario,nombreUsuario:nombreUsuario,idHorario:idHorario,telefono:telefono }
    });
    // Puedes agregar un observador para manejar lo que ocurre cuando se cierra el modal
    dialogRef.afterClosed().subscribe(result => {
      // Aquí puedes manejar el resultado si es necesario
    });
  }
}
