import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; 
import { Observable } from 'rxjs';
import { environment } from '@environment/environment'; // Ajusta la ruta según la ubicación del archivo de entorno

@Injectable({
  providedIn: 'root',
})
export class ListaMatrixByIdService {
  
  private endpoint = '/comercial/getAllMatrixById';

  private apiUrl = `${environment.apiUrl}${this.endpoint}`;

  constructor(private http: HttpClient) {}

 
  getMatrix(id:number): Observable<any[]> {
    
    const accessToken = localStorage.getItem('token');

    // Crear el encabezado con el token
    const options = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };
     const requestData = { id:id  };
 
    return this.http.post<any[]>(this.apiUrl,requestData,options);
  }
}
