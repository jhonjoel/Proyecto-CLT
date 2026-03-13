import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Roles } from '@models/Roles';
//import { API_URL } from '@config/config';
import { environment } from '@environment/environment'; // Ajusta la ruta según la ubicación del archivo de entorno

@Injectable({
  providedIn: 'root',
})
export class RolesService {
  private endpoint = '/roles';
  private apiUrl = `${environment.apiUrl}${this.endpoint}`;

  constructor(private http: HttpClient) {}

  getRoles(): Observable<{ roles: Roles[] }> {
    return this.http.post<{ roles: Roles[] }>(this.apiUrl,{});
  }
 
}
