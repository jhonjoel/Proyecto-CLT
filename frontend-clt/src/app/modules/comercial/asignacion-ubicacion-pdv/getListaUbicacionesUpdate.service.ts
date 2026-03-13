import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; 
//import { API_URL } from '@config/config';
import { Observable } from 'rxjs';
import { environment } from '@environment/environment'; // Ajusta la ruta según la ubicación del archivo de entorno

@Injectable({
  providedIn: 'root',
})
export class ListaUbicacionesUpdateService {
  
  private endpoint = '/pendientesUbicacionesUpdate';

  private apiUrl = `${environment.apiUrl}${this.endpoint}`;

  constructor(private http: HttpClient) {}


  getListaUbicacionesUpdate(): Observable<any[]> {
    
    const accessToken = localStorage.getItem('token');

    // Crear el encabezado con el token
    const options = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };

    return this.http.post<any[]>(this.apiUrl,{},options);
  }
}
