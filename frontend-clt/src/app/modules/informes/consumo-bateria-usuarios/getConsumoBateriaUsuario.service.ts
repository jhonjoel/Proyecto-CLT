import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; 
import { Observable } from 'rxjs';
import { environment } from '@environment/environment'; // Ajusta la ruta según la ubicación del archivo de entorno

@Injectable({
  providedIn: 'root',
})
export class ListaConsumoBateriaUsuarioService {
  
  private endpoint = '/consumoBateriaById';

  private apiUrl = `${environment.apiUrl}${this.endpoint}`;

  constructor(private http: HttpClient) {}

 
  getListaConsumoBateriaUsuario(fecha:Date,fecha2:Date ): Observable<any[]> {
    
    const accessToken = localStorage.getItem('token');

    // Crear el encabezado con el token
    const options = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };
    const requestData = { fecha:fecha,fecha2:fecha2  };

    return this.http.post<any[]>(this.apiUrl,requestData,options);
  }
}
