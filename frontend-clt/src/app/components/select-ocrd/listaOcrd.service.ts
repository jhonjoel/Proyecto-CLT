import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ocrd } from '../select-ocrd/Ocrd';
//import { API_URL } from '@config/config';
import { environment } from '@environment/environment'; // Ajusta la ruta según la ubicación del archivo de entorno

@Injectable({
  providedIn: 'root',
})
export class OcrdService {
  private endpoint = '/vOcrdUbicaciones';
  private apiUrl = `${environment.apiUrl}${this.endpoint}`;

  constructor(private http: HttpClient) {}

  getOcrd(): Observable<{ ocrd: Ocrd[] }> {
    return this.http.post<{ ocrd: Ocrd[] }>(this.apiUrl,{});
  }
 
}
