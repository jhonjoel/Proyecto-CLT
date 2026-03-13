import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environment/environment';

@Injectable({
  providedIn: 'root',
})
export class ModulosService {
  private endpoint = '/modulos';
  private apiUrl = `${environment.apiUrl}${this.endpoint}`;

  constructor(private http: HttpClient) {}

  getModulos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
