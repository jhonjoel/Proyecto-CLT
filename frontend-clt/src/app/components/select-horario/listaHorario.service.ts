import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Horarios } from '@models/Horarios';
import { environment } from '@environment/environment'; // Ajusta la ruta según la ubicación del archivo de entorno

@Injectable({
  providedIn: 'root',
})
export class HorariosService {
  private endpoint = '/horarios';
  private apiUrl = `${environment.apiUrl}${this.endpoint}`;

  constructor(private http: HttpClient) {}

  getHorarios(): Observable<{ horarios: Horarios[] }> {
    return this.http.post<{ horarios: Horarios[] }>(this.apiUrl,{});
  }
 
}
