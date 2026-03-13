import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; 
//import { API_URL } from '@config/config';
import { Observable } from 'rxjs';
import { environment } from '@environment/environment'; // Ajusta la ruta según la ubicación del archivo de entorno

@Injectable({
  providedIn: 'root',
})
export class ActivityLogService {
  private endpoint = '/getActivityLogbyIdFecha';

  private apiUrl = `${environment.apiUrl}${this.endpoint}`;

  constructor(private http: HttpClient) {}


  getActivityLog( idUsuario:string,  start: string, end: string): Observable<any[]> {
    const requestData = { idUsuario:idUsuario, dateStart: start, dateEnd: end };
    return this.http.post<any[]>(this.apiUrl, requestData);
  }
}
