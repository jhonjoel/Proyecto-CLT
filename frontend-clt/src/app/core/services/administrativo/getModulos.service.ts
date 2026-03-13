import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; 
//import { API_URL } from '@config/config';
import { environment } from '@environment/environment'; // Ajusta la ruta según la ubicación del archivo de entorno

import { Observable } from 'rxjs';

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
