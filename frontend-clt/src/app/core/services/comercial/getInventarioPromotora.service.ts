import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; 
//import { API_URL } from '@config/config';
import { Observable } from 'rxjs';
import { environment } from '@environment/environment'; // Ajusta la ruta según la ubicación del archivo de entorno

@Injectable({
  providedIn: 'root',
})
export class InventarioService {
  private endpoint = '/getAllmovimientosByIdFecha';

  private apiUrl = `${environment.apiUrl}${this.endpoint}`;

  constructor(private http: HttpClient) {}


  getInventarioPromotora(  start: string, end: string): Observable<any[]> {
    const requestData = { dateStart: start, dateEnd: end };
    return this.http.post<any[]>(this.apiUrl, requestData);
  }
}
