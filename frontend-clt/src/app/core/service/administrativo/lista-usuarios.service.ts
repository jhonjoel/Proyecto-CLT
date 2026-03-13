import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environment/environment';

@Injectable({
  providedIn: 'root',
})
export class ListaUsuariosService {
  private endpoint = '/vistas/listaUsuarios';
  private apiUrl = `${environment.apiUrl}${this.endpoint}`;

  constructor(private http: HttpClient) {}

  getListaUsuarios(): Observable<any[]> {
    const accessToken = localStorage.getItem('token');
    const options = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };
    return this.http.post<any[]>(this.apiUrl, options);
  }
}
