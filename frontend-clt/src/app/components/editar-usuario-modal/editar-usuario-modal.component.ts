import { HttpClient } from '@angular/common/http';
import { Component, Inject, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '@environment/environment'; // Ajusta la ruta según la ubicación del archivo de entorno

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
import { SelectHorarioComponent } from '@components/select-horario/select-horario.component';
 
@Component({
  selector: 'app-editar-usuario-modal',
  standalone: true,
  imports: [MatFormFieldModule,MatDatepickerModule,MatProgressSpinnerModule,MatIconModule,
    MatInputModule,FormsModule,CommonModule,BreadcrumbComponent,MatButtonModule,SelectUsuarioComponent,MatChipsModule,
    MatButtonToggleModule,NgxMatTimepickerModule,SelectHorarioComponent,MatDialogModule],
  templateUrl: './editar-usuario-modal.component.html',
  styleUrl: './editar-usuario-modal.component.scss'
})
export class EditarUsuarioModalComponent {
  constructor(
    public dialogRef: MatDialogRef<EditarUsuarioModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { idUsuario: number, nombreUsuario: string, idHorario: number, telefono: string },
    private http: HttpClient,
    private _snackBar: MatSnackBar,


  ) {}
  private endpoint = '/update/updateUsuarios';
  procesando : boolean= false
  // Asegúrate de que el valor inicial de idHorarioSeleccionado sea el proporcionado en los datos
  @Input() idHorarioSeleccionado: number = this.data.idHorario;
  idHorarioAEnviar: number =this.data.idHorario; // Aquí configuras el idHorario que deseas enviar
  phoneNumber : string =this.data.telefono

  onNoClick(): void {
    this.dialogRef.close();
  }

  // Esta función actualiza el ID de horario en los datos cuando se selecciona uno nuevo
/*  onHorarioSeleccionado(idHorario: number) {
    this.data.idHorario = idHorario; // Actualiza el ID de horario en tu objeto de datos
    console.log(this.data.idHorario);
  }*/
  handleHorarioSeleccionado(idHorario: number) {
    console.log('ID de usuario seleccionado en OtroComponente:', idHorario);
    this.data.idHorario=idHorario
 }

 


 editarUsuario() {
  this.procesando = true;
  const accessToken = localStorage.getItem('token');
  // Crear el encabezado con el token
  const options = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };
  this.http
    .post<any>(`${environment.apiUrl}${this.endpoint}`, {
      idUsuario: this.data.idUsuario,
      idHorario: this.data.idHorario,
      telefono: this.phoneNumber,
    }, options)
    .subscribe(
      (response) => {
        this.procesando = false;
        const message = response.msg;
        // this.toastr.success('Acceso permitido', 'Éxito');
        this._snackBar.open(message, 'Cerrar', {
          duration: 3000,
        });
      },
      (error) => {
        this.procesando= false;
        this._snackBar.open(error, 'Cerrar', {
          duration: 3000,
        });
      }
    );
}
}
