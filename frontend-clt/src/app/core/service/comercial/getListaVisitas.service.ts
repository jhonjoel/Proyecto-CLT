import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environment/environment';

@Injectable({
  providedIn: 'root',
})
export class VisitasService {
  private endpoint = '/visitas';
  private apiUrl = `${environment.apiUrl}${this.endpoint}`;

  constructor(private http: HttpClient) {}

  getVisitas(idUsuario: number, fecha: Date): Observable<any[]> {
    const requestData = { idUsuario: idUsuario, fecha: fecha };
    return this.http.post<any[]>(this.apiUrl, requestData);
  }
}
