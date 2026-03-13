import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environment/environment';

@Injectable({
  providedIn: 'root',
})
export class ActivityLogService {
  private endpoint = '/getActivityLogbyIdFecha';
  private apiUrl = `${environment.apiUrl}${this.endpoint}`;

  constructor(private http: HttpClient) {}

  getActivityLog(idUsuario: string, start: string, end: string): Observable<any[]> {
    const requestData = { idUsuario, dateStart: start, dateEnd: end };
    return this.http.post<any[]>(this.apiUrl, requestData);
  }
}
