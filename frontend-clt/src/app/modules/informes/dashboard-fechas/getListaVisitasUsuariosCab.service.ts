import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; 
import { Observable } from 'rxjs';
import { environment } from '@environment/environment'; // Ajusta la ruta según la ubicación del archivo de entorno

@Injectable({
  providedIn: 'root',
})
export class ListaUsuariosDashboardService {
  private endpoint = '/visitasDashboardTotalesFechas';
  private apiUrl = `${environment.apiUrl}${this.endpoint}`;
  constructor(private http: HttpClient) {}
  getListaVisitasUsuariosDashboard(fecha:Date):Observable<any[]>{
    const accessToken = localStorage.getItem('token');
    // Crear el encabezado con el token
    const options = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };
    const requestData = {fecha:fecha};
    return this.http.post<any[]>(this.apiUrl,requestData,options);
  }
}