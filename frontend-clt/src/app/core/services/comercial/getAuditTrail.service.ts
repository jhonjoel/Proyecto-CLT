import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; 
//import { API_URL } from '@config/config';
import { Observable } from 'rxjs';
import { environment } from '@environment/environment'; // Ajusta la ruta según la ubicación del archivo de entorno
import * as moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class AuditTrailService {
  private endpoint = '/postByIdFecAuditoriaTrail';

  private apiUrl = `${environment.apiUrl}${this.endpoint}`;

  constructor(private http: HttpClient) {}


  getAuditTrail(idUsuario: number, fecha: Date): Observable<any[]> {
    const requestData = { idUsuario: idUsuario, Fecha:  moment.utc(fecha).format('YYYY-MM-DD').toString()  };
    return this.http.post<any[]>(this.apiUrl, requestData);
  }
}
