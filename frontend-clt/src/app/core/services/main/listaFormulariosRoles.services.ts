import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormulariosRoles } from '@models/FormulariosRoles';
//import { API_URL } from '@config/config';
import { environment } from '@environment/environment'; // Ajusta la ruta según la ubicación del archivo de entorno

@Injectable({
  providedIn: 'root',
})
export class FormulariosRolesService {
  private endpoint = '/formulariosRoles';
  private apiUrl = `${environment.apiUrl}${this.endpoint}`;

  constructor(private http: HttpClient) {}

  getFormulariosRoles(IdRolUser :number): Observable<{ formulariosRoles: FormulariosRoles[] }> {
    return this.http.post<{ formulariosRoles: FormulariosRoles[] }>(this.apiUrl,{IdRolUser});
  }
 
}
